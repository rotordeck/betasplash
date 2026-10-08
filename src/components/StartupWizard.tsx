import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Shuffle, Sparkles, X } from 'lucide-react';
import { FONT_CATALOG } from '../data/fontCatalog';
import { FONT_CATEGORIES } from '../data/fonts';
import { catalogFontOption as toFont } from './FontPicker';
import { SplashThumb } from './SplashThumb';
import { buttonGhost, buttonPrimary, cx, inputField } from './ui';
import type { RenderOptions } from '../utils/canvasRenderer';
import { fitWizardDesign, generateWizardDesigns } from '../utils/wizardDesigns';

export function StartupWizard({ initialCallsign = '', initialSubtitle = '', onChoose, onClose }: {
  initialCallsign?: string; initialSubtitle?: string;
  onChoose: (design: RenderOptions) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [callsign, setCallsign] = useState(initialCallsign);
  const [subtitle, setSubtitle] = useState(initialSubtitle);
  const [withSubtitle, setWithSubtitle] = useState(!!initialSubtitle);
  const [category, setCategory] = useState('racing');
  const [selected, setSelected] = useState(['Orbitron', 'Black Ops One', 'Silkscreen']);
  const [designs, setDesigns] = useState<RenderOptions[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  useEffect(() => {
    dialog.current?.showModal();
    return () => { generation.current++; dialog.current?.close(); };
  }, []);
  // Move focus to the new heading on step changes; on open, the text field keeps autofocus.
  const opened = useRef(false);
  useEffect(() => { if (opened.current) title.current?.focus(); opened.current = true; }, [step]);
  const toggleFont = (name: string) => setSelected(old => old.includes(name) ? old.filter(item => item !== name) : old.length < 6 ? [...old, name] : old);
  const generate = async () => {
    const current = ++generation.current;
    setBusy(true); setError('');
    const fonts = FONT_CATALOG.filter(font => selected.includes(font.name)).map(toFont);
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([
        Promise.all([...fonts.map(font => document.fonts.load(`${font.weight} 28px ${font.family}`).then(faces => {
          if (!faces.length) throw new Error('Font unavailable');
        })), document.fonts.load("700 10px 'Rajdhani'")]),
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Font load timed out')), 15000); }),
      ]);
      if (current !== generation.current) return;
      const ctx = document.createElement('canvas').getContext('2d')!;
      setDesigns(generateWizardDesigns(callsign, withSubtitle ? subtitle : '', fonts).map(design => fitWizardDesign(design, ctx)));
      setStep(2);
    } catch {
      if (current === generation.current) setError('Some fonts could not load. Check your connection and try again, or choose different fonts.');
    } finally {
      clearTimeout(timeout);
      if (current === generation.current) setBusy(false);
    }
  };
  const titles = ['Make it yours.', 'Find your type.', 'Pick a starting point.'];
  const descriptions = ['Start with the name you want to see in your goggles.', 'Pick one to six fonts. We’ll combine them with frames and text effects.', '42 ideas with your text and fonts. Choose one to keep editing.'];
  const steps = ['Your text', 'Your fonts', '42 designs'];
  return <dialog ref={dialog} aria-labelledby='wizard-title' aria-describedby='wizard-description' onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} className='wizard-dialog rounded-xl border border-line-strong bg-ground p-0 text-ink shadow-[0_24px_70px_rgb(0_0_0/0.5)]'>
    <div className='flex max-h-[90dvh] flex-col'>
      <header className='shrink-0 border-b border-line p-5 sm:px-8 sm:pt-7'>
        <div className='mb-5 flex items-center justify-between gap-3'>
          <span className='bs-eyebrow flex items-center gap-2.5 text-ink'><span className='h-1.5 w-1.5 rounded-full bg-lime' aria-hidden='true' />Betasplash starter</span>
          <button aria-label='Close wizard and open editor' disabled={busy} onClick={onClose} className='rounded-md p-2 text-muted transition hover:bg-panel hover:text-ink disabled:opacity-40'><X size={18} /></button>
        </div>
        <ol aria-label='Setup progress' className='mb-5 grid grid-cols-3 gap-3'>
          {steps.map((label, i) => <li key={label} aria-current={step === i ? 'step' : undefined} className='min-w-0'>
            <span className={cx('block h-1 rounded-full', i <= step ? 'bg-lime' : 'bg-line')} aria-hidden='true' />
            <span className={cx('bs-eyebrow mt-2 block truncate', step === i ? 'text-lime' : 'text-faint')}>{String(i + 1).padStart(2, '0')} {label}</span>
          </li>)}
        </ol>
        <h2 ref={title} tabIndex={-1} id='wizard-title' className='text-[clamp(30px,4vw,44px)] font-bold leading-[1.04] tracking-[-0.045em] outline-none focus-visible:outline-none'>{titles[step]}</h2>
        <p id='wizard-description' className='mt-2 text-[15px] text-muted'>{descriptions[step]}</p>
      </header>
      <div className='bs-scroll space-y-5 overflow-y-auto p-5 sm:px-8 sm:py-7'>
        {step === 0 && <form id='wizard-text' onSubmit={e => { e.preventDefault(); if (callsign.trim()) setStep(1); }} className='mx-auto max-w-xl space-y-6 py-4'>
          <label className='block text-[13px] font-semibold'>Your name, callsign or tag
            <input autoFocus autoCapitalize='off' spellCheck={false} required maxLength={28} value={callsign} onChange={e => setCallsign(e.target.value)} placeholder='e.g. SKY REAPER' className={cx(inputField, 'mt-2 p-4 text-xl font-semibold')} />
            <span className='mt-2 block text-xs font-normal text-muted'>Upper or lower case, it’s up to you. We size the text to fit.</span>
          </label>
          <label className='flex items-center gap-3 text-[13px]'><input type='checkbox' checked={withSubtitle} onChange={e => setWithSubtitle(e.target.checked)} className='h-4 w-4' /> Add a smaller second line</label>
          {withSubtitle && <label className='block text-[13px] font-semibold'>Second line <span className='font-normal text-muted'>(optional)</span>
            <input maxLength={48} value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder='e.g. FREESTYLE • ELRS' className={cx(inputField, 'mt-2 p-3')} />
          </label>}
        </form>}
        {step === 1 && <>
          <div role='group' aria-label='Font style' className='flex flex-wrap gap-2'>
            {FONT_CATEGORIES.filter(cat => cat.id !== 'all').map(cat => <button key={cat.id} aria-pressed={category === cat.id} onClick={() => setCategory(cat.id)} className={cx('rounded-full border px-3.5 py-1.5 text-xs font-semibold transition', category === cat.id ? 'border-lime bg-lime text-ground' : 'border-line text-muted hover:border-line-strong hover:text-ink')}>{cat.label}</button>)}
          </div>
          <div className='flex min-h-8 flex-wrap items-center gap-2 text-xs' aria-live='polite'>
            <span className='font-mono text-muted'>{selected.length}/6 selected</span>
            {selected.map(name => <button disabled={busy} key={name} onClick={() => toggleFont(name)} aria-label={`Remove ${name}`} className='inline-flex items-center gap-1 rounded-full border border-lime/50 bg-lime/10 px-2.5 py-1 text-lime transition hover:border-lime'>{name}<X size={12} aria-hidden='true' /></button>)}
          </div>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {FONT_CATALOG.filter(font => font.category === category).map(font => {
              const on = selected.includes(font.name);
              return <button key={font.name} disabled={busy || (!on && selected.length >= 6)} aria-pressed={on} onClick={() => toggleFont(font.name)} className={cx('min-w-0 rounded-[10px] border p-4 text-left transition disabled:opacity-40', on ? 'border-lime bg-lime/[0.07]' : 'border-line bg-panel hover:border-line-strong')}>
                <span className={cx('flex justify-between gap-2 text-xs font-semibold', on ? 'text-lime' : 'text-muted')}>{font.name}{on && <Check size={14} className='shrink-0' />}</span>
                <span className='my-4 block truncate text-2xl text-ink' style={{ fontFamily: `'${font.name}'`, fontWeight: font.weight }}>{callsign}</span>
                <span className='text-[11px] text-faint'>{font.tags.slice(0, 3).join(' · ')}</span>
              </button>;
            })}
          </div>
        </>}
        {step === 2 && <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {designs.map((design, i) => <button key={i} disabled={busy} aria-label={`Choose design ${i + 1}: ${design.font.name}, ${design.frameStyle}, ${design.textEffect}`} onClick={() => onChoose(design)} className='group rounded-[10px] border border-line bg-panel p-2 text-left transition hover:border-lime disabled:opacity-40'>
            <SplashThumb design={design} />
            <span className='flex justify-between gap-2 px-1.5 pb-1 pt-2.5 text-xs text-muted'><span className='truncate'><span className='font-mono text-faint'>{String(i + 1).padStart(2, '0')}</span> {design.font.name}</span><span className='shrink-0 font-semibold text-lime opacity-70 transition group-hover:opacity-100'>Customize →</span></span>
          </button>)}
        </div>}
        {error && <p role='alert' className='text-sm text-danger'>{error}</p>}
      </div>
      <footer className='flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-line bg-ground p-5 sm:px-8'>
        {step === 0 ? <button onClick={onClose} className='text-[13px] font-semibold text-muted transition hover:text-lime'>Skip to editor</button> : <button disabled={busy} onClick={() => { setError(''); setStep(step - 1); }} className={buttonGhost}><ArrowLeft size={15} /> Back</button>}
        {step === 0 && <button type='submit' form='wizard-text' disabled={!callsign.trim()} className={buttonPrimary}>Choose fonts <ArrowRight size={15} /></button>}
        {step === 1 && <button disabled={!selected.length || busy} onClick={() => void generate()} className={buttonPrimary}>{busy ? 'Loading fonts…' : 'Show my 42 designs'} <Sparkles size={15} /></button>}
        {step === 2 && <button disabled={busy} onClick={() => void generate()} className={buttonPrimary}><Shuffle size={15} />{busy ? 'Generating…' : 'Shuffle 42 more'}</button>}
      </footer>
    </div>
  </dialog>;
}
