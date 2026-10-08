/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, Check, Dices, Download, Image as ImageIcon, Sparkles, TriangleAlert, Type, Wand2, X } from 'lucide-react';

import { StartupWizard } from './components/StartupWizard';
import { FontPicker, catalogFontOption } from './components/FontPicker';
import { PresetGallery } from './components/PresetGallery';
import { Preview, type Feed, type PreviewMode } from './components/Preview';
import { InstallGuide } from './components/InstallGuide';
import { ImageDrop } from './components/ImageDrop';
import { keyOutGreen } from './components/SplashThumb';
import {
  FieldLabel, OptionCard, Section, Segmented, Slider, Switch,
  buttonGhost, buttonLink, buttonPrimary, cx, inputField,
} from './components/ui';
import { FONT_CATALOG } from './data/fontCatalog';
import type { GoogleFontOption } from './data/fonts';
import { EMBLEMS, FRAME_STYLES, INSPIRATION_CALLSIGNS, INSPIRATION_SUBTITLES } from './data/presets';
import { auditBetaflightCanvas, createBetaflightBMP, downloadBMPFile, type ColorStats } from './utils/bmpGenerator';
import { renderBetaflightCanvas, type RenderOptions } from './utils/canvasRenderer';

type Tab = 'design' | 'presets' | 'image';
type TextEffect = NonNullable<RenderOptions['textEffect']>;
type KeyColor = 'green' | 'black' | 'white';

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

const EFFECTS: Array<{ id: TextEffect; name: string; hint: string }> = [
  { id: 'outline', name: 'Outline', hint: 'Black edge, reads on any sky' },
  { id: 'bevel', name: 'Bevel', hint: 'Chiselled, lit from above' },
  { id: 'shadow-3d', name: '3D block', hint: 'Extruded drop depth' },
  { id: 'none', name: 'Flat', hint: 'Solid letters only' },
];

const FRAME_HINTS: Record<string, string> = {
  none: 'Just the text', brackets: 'HUD corner brackets', rails: 'Lines above and below', hazard: 'Caution stripes',
  hex: 'Chamfered border', box: 'Thin outline', dots: 'Dotted 8-bit edge',
};

const BYTES = 62262;

export default function App() {
  const [showWizard, setShowWizard] = useState(true);
  const [wizardRestart, setWizardRestart] = useState(false);
  const [tab, setTab] = useState<Tab>('design');

  // Text and type
  const [callsign, setCallsign] = useState('SKY REAPER');
  const [subtitle, setSubtitle] = useState('6S FREESTYLE • ELRS 1W');
  const [selectedFont, setSelectedFont] = useState<GoogleFontOption>(
    catalogFontOption(FONT_CATALOG.find(f => f.name === 'Orbitron') || FONT_CATALOG[0]),
  );
  const [fontSize, setFontSize] = useState(28);
  const [subtitleSize, setSubtitleSize] = useState(11);
  const [letterSpacing, setLetterSpacing] = useState(2);
  const [textEffect, setTextEffect] = useState<TextEffect>('outline');
  const [outlineWidth, setOutlineWidth] = useState(2);
  const [isItalic, setIsItalic] = useState(false);

  // Emblem and frame
  const [emblem, setEmblem] = useState('quad');
  const [emblemPosition, setEmblemPosition] = useState<RenderOptions['emblemPosition']>('left');
  const [customEmblem, setCustomEmblem] = useState<HTMLImageElement | null>(null);
  const [emblemThreshold, setEmblemThreshold] = useState(128);
  const [emblemDithering, setEmblemDithering] = useState(false);
  const [emblemTransparentColor, setEmblemTransparentColor] = useState<KeyColor>('green');
  const [emblemClearBackground, setEmblemClearBackground] = useState(true);
  const [emblemInvert, setEmblemInvert] = useState(false);
  const [frameStyle, setFrameStyle] = useState<RenderOptions['frameStyle']>('brackets');

  // Palette
  const [colorMode, setColorMode] = useState<RenderOptions['colorMode']>('green_bg');
  const [invert, setInvert] = useState(false);

  // Full image conversion
  const [customImage, setCustomImage] = useState<HTMLImageElement | null>(null);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [imageThreshold, setImageThreshold] = useState(128);
  const [imageDithering, setImageDithering] = useState(false);
  const [imageFit, setImageFit] = useState<'contain' | 'cover' | 'stretch'>('contain');
  const [imageTransparentColor, setImageTransparentColor] = useState<KeyColor>('green');
  const [imageOuterMode, setImageOuterMode] = useState<'transparent' | 'black' | 'white'>('transparent');
  const [clearOuterBackground, setClearOuterBackground] = useState(true);
  const [imageScale, setImageScale] = useState(1);
  const [imageOffsetX, setImageOffsetX] = useState(0);

  // Preview and feedback
  const [previewMode, setPreviewMode] = useState<PreviewMode>('goggles');
  const [feed, setFeed] = useState<Feed>('camera');
  const [notice, setNotice] = useState('');
  const [stats, setStats] = useState<ColorStats>({ black: 0, white: 0, green: 0, invalid: 0, total: 288 * 72 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const osdCanvasRef = useRef<HTMLCanvasElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = (message: string) => {
    setNotice(message);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 3500);
  };

  // Any text or style edit returns from image mode to the text design.
  const editText = <T,>(setter: (value: T) => void) => (value: T) => { setter(value); setUseCustomImage(false); };

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderBetaflightCanvas(canvas, {
      callsign, subtitle, font: selectedFont, fontSize, subtitleSize, letterSpacing,
      emblem, customEmblem, emblemThreshold, emblemDithering, emblemTransparentColor, emblemClearBackground, emblemInvert,
      emblemPosition, frameStyle, colorMode, invert, textEffect, outlineWidth, italic: isItalic,
      useCustomImage, customImage, imageThreshold, dithering: imageDithering, imageFit, imageTransparentColor,
      imageOuterMode, clearOuterBackground, imageScale, imageOffsetX,
    });
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    setStats(auditBetaflightCanvas(ctx));
    // The goggles view shows #00FF00 as transparent, as the OSD does.
    const osd = osdCanvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (osd) {
      osd.clearRect(0, 0, 288, 72);
      osd.drawImage(canvas, 0, 0);
      keyOutGreen(osd);
    }
  }, [
    callsign, subtitle, selectedFont, fontSize, subtitleSize, letterSpacing,
    emblem, customEmblem, emblemThreshold, emblemDithering, emblemTransparentColor, emblemClearBackground, emblemInvert,
    emblemPosition, frameStyle, colorMode, invert, textEffect, outlineWidth, isItalic,
    useCustomImage, customImage, imageThreshold, imageDithering, imageFit, imageTransparentColor,
    imageOuterMode, clearOuterBackground, imageScale, imageOffsetX,
  ]);

  // Draw now, then again once the web fonts are available.
  useEffect(() => {
    let active = true;
    redraw();
    Promise.all([
      document.fonts.load(`${selectedFont.weight} ${fontSize}px ${selectedFont.family}`),
      document.fonts.load("700 11px 'Rajdhani'"),
    ]).then(() => { if (active) redraw(); }, () => { if (active) redraw(); });
    return () => { active = false; };
  }, [redraw, selectedFont, fontSize]);

  const applyDesign = (design: RenderOptions) => {
    setCallsign(design.callsign);
    setSubtitle(design.subtitle);
    setSelectedFont(design.font);
    setFontSize(design.fontSize);
    setSubtitleSize(design.subtitleSize);
    setLetterSpacing(design.letterSpacing);
    setEmblem(design.emblem);
    setEmblemPosition(design.emblemPosition);
    setFrameStyle(design.frameStyle);
    setColorMode(design.colorMode);
    setInvert(design.invert);
    setTextEffect(design.textEffect ?? 'none');
    setOutlineWidth(design.outlineWidth ?? 2);
    setIsItalic(design.italic ?? false);
    setUseCustomImage(false);
  };

  const chooseWizardDesign = (design: RenderOptions) => {
    applyDesign(design);
    setTab('design');
    setPreviewMode('goggles');
    setShowWizard(false);
  };

  const surpriseMe = () => {
    setCallsign(pick(INSPIRATION_CALLSIGNS));
    setSubtitle(Math.random() > 0.3 ? pick(INSPIRATION_SUBTITLES) : '');
    setSelectedFont(catalogFontOption(pick(FONT_CATALOG)));
    const icon = pick(EMBLEMS.filter(e => e.id !== 'none')).id;
    setEmblem(icon);
    setEmblemPosition(pick(['left', 'right', 'center', 'none'] as const));
    setFrameStyle(pick(FRAME_STYLES).id);
    setTextEffect(pick(['outline', 'shadow-3d', 'bevel'] as const));
    setIsItalic(Math.random() > 0.6);
    setUseCustomImage(false);
  };

  const fileStem = () => callsign.trim().replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'splash';

  const downloadBMP = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const name = `${fileStem()}_bf_splash.bmp`;
    downloadBMPFile(createBetaflightBMP(ctx, 288, 72), name);
    flash(`Saved ${name}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callsign]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const name = `${fileStem()}_preview.png`;
    const link = document.createElement('a');
    link.download = name;
    link.href = canvas.toDataURL('image/png');
    link.click();
    flash(`Saved ${name}`);
  };

  // Ctrl/Cmd+S downloads the bitmap.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !showWizard) { e.preventDefault(); downloadBMP(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [downloadBMP, showWizard]);

  const openWizard = () => { setWizardRestart(true); setShowWizard(true); };
  const ready = stats.invalid === 0;
  const pct = (n: number) => (n / stats.total) * 100;
  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'design', label: 'Design', icon: <Type className='h-4 w-4' aria-hidden='true' /> },
    { id: 'presets', label: 'Presets', icon: <Sparkles className='h-4 w-4' aria-hidden='true' /> },
    { id: 'image', label: 'Image', icon: <ImageIcon className='h-4 w-4' aria-hidden='true' /> },
  ];

  return <div className='bs-app text-ink'>
    {showWizard && <StartupWizard
      initialCallsign={wizardRestart ? callsign : ''} initialSubtitle={wizardRestart ? subtitle : ''}
      onChoose={chooseWizardDesign} onClose={() => setShowWizard(false)} />}

    {/* INTRO */}
    <section className='bs-hero bs-container pb-8 pt-10 sm:pt-14'>
      <span className='bs-eyebrow flex items-center gap-2.5 text-ink'>
        <span className='h-1.5 w-1.5 rounded-full bg-lime' aria-hidden='true' />Betaflight boot logo · 288 × 72
      </span>
      <div className='mt-5 flex flex-wrap items-end justify-between gap-x-10 gap-y-6'>
        <div className='max-w-[860px]'>
          <h1 className='text-[clamp(44px,7vw,84px)] font-bold leading-[0.98] tracking-[-0.055em]'>
            Betasplash<span className='text-lime'>.</span><br /><span className='text-lime'>Your name on every boot.</span>
          </h1>
          <p className='mt-5 max-w-[560px] text-base leading-relaxed text-muted'>
            Design the logo your goggles show when you plug in a pack. Type your callsign, pick a style, and download a bitmap that Betaflight accepts as it is.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <button type='button' onClick={openWizard} className={cx(buttonPrimary, 'px-5 py-3.5')}>
            <Wand2 className='h-4 w-4' aria-hidden='true' />Start with your name
          </button>
          <a href='#install' className={cx(buttonGhost, 'px-5 py-3.5')}>How to install <ArrowDown className='h-4 w-4' aria-hidden='true' /></a>
        </div>
      </div>
    </section>

    <main className='bs-workspace bs-container grid items-start gap-5 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]'>
      {/* PREVIEW + EXPORT */}
      <div className='bs-stage space-y-4 lg:sticky lg:top-4 lg:order-2'>
        <div className='bs-preview overflow-hidden rounded-[10px] border border-line bg-panel'>
          <Preview mode={previewMode} onMode={setPreviewMode} feed={feed} onFeed={setFeed} rawRef={canvasRef} osdRef={osdCanvasRef} />
        </div>

        <div className='bs-export rounded-[10px] border border-line bg-panel p-4 sm:p-5'>
          <div className='flex flex-wrap items-center gap-3'>
            <button type='button' onClick={downloadBMP} title='Download .bmp (Ctrl+S)' className={cx(buttonPrimary, 'flex-1 px-5 py-3.5 text-[15px] sm:flex-none')}>
              <Download className='h-4 w-4' aria-hidden='true' />Download .bmp
            </button>
            <button type='button' onClick={downloadPNG} className={cx(buttonGhost, 'py-3.5')} aria-label='Download preview PNG'>PNG</button>
            <p role='status' aria-live='polite' className={cx('flex min-w-0 items-center gap-2 text-[13px] sm:ml-auto', notice || ready ? 'text-lime' : 'text-danger')}>
              {notice ? <><Check className='h-4 w-4 shrink-0' aria-hidden='true' /><span className='truncate'>{notice}</span></>
                : ready ? <><Check className='h-4 w-4 shrink-0' aria-hidden='true' />Ready for Betaflight</>
                : <><TriangleAlert className='h-4 w-4 shrink-0' aria-hidden='true' />{stats.invalid} pixels outside the palette</>}
            </p>
          </div>

          <div className='mt-5'>
            <div className='flex h-2.5 overflow-hidden rounded-full border border-line-strong' aria-hidden='true'>
              <span className='bg-white' style={{ width: `${pct(stats.white)}%` }} />
              <span className='bg-black' style={{ width: `${pct(stats.black)}%` }} />
              <span className='bg-[#00ff00]/60' style={{ width: `${pct(stats.green)}%` }} />
            </div>
            <dl className='mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4'>
              <div className='flex items-center gap-2'><span className='h-2.5 w-2.5 rounded-sm border border-line-strong bg-white' aria-hidden='true' /><dt className='text-muted'>White</dt><dd className='ml-auto font-mono text-ink sm:ml-0'>{pct(stats.white).toFixed(1)}%</dd></div>
              <div className='flex items-center gap-2'><span className='h-2.5 w-2.5 rounded-sm border border-line-strong bg-black' aria-hidden='true' /><dt className='text-muted'>Black</dt><dd className='ml-auto font-mono text-ink sm:ml-0'>{pct(stats.black).toFixed(1)}%</dd></div>
              <div className='flex items-center gap-2'><span className='h-2.5 w-2.5 rounded-sm bg-[#00ff00]/60' aria-hidden='true' /><dt className='text-muted'>Transparent</dt><dd className='ml-auto font-mono text-ink sm:ml-0'>{pct(stats.green).toFixed(1)}%</dd></div>
              <div className='flex items-center gap-2'><dt className='text-muted'>File</dt><dd className='ml-auto font-mono text-ink sm:ml-0'>24-bit · {BYTES.toLocaleString('en')} B</dd></div>
            </dl>
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className='bs-controls overflow-hidden rounded-[10px] border border-line bg-panel lg:order-1'>
        <div role='tablist' aria-label='Editor' className='flex border-b border-line'>
          {tabs.map(t => <button key={t.id} type='button' role='tab' id={`tab-${t.id}`} aria-controls={`panel-${t.id}`} aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cx('flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3.5 text-[13px] font-semibold transition',
              tab === t.id ? 'border-lime text-lime' : 'border-transparent text-muted hover:text-ink')}>
            {t.icon}{t.label}
          </button>)}
        </div>

        {tab === 'design' && <div role='tabpanel' id='panel-design' aria-labelledby='tab-design'>
          {useCustomImage && <div className='flex items-center justify-between gap-3 border-b border-line bg-lime/[0.06] px-5 py-3 text-[13px]'>
            <span className='text-ink'>Showing your converted image.</span>
            <button type='button' onClick={() => setUseCustomImage(false)} className='font-semibold text-lime hover:underline'>Use text design</button>
          </div>}

          <Section index='01' title='Text' action={<button type='button' onClick={surpriseMe} className={buttonLink}><Dices className='h-3.5 w-3.5' aria-hidden='true' />Surprise me</button>}>
            <div>
              <FieldLabel htmlFor='bs-callsign'>Callsign</FieldLabel>
              <div className='flex gap-2'>
                <input id='bs-callsign' type='text' value={callsign} maxLength={28} spellCheck={false} autoComplete='off'
                  aria-label='Pilot callsign' placeholder='e.g. SKY REAPER'
                  onChange={e => editText(setCallsign)(e.target.value)} className={cx(inputField, 'text-base font-semibold')} />
                <button type='button' onClick={() => editText(setCallsign)(pick(INSPIRATION_CALLSIGNS))} title='Random callsign' aria-label='Random callsign'
                  className='shrink-0 rounded-md border border-line px-3 text-muted transition hover:border-lime hover:text-lime'>
                  <Dices className='h-4 w-4' aria-hidden='true' />
                </button>
              </div>
            </div>
            <div>
              <FieldLabel htmlFor='bs-subtitle' value={subtitle ? <button type='button' onClick={() => editText(setSubtitle)('')} className='inline-flex items-center gap-1 font-sans text-xs text-muted hover:text-lime'><X className='h-3 w-3' aria-hidden='true' />Clear</button> : undefined}>
                Second line <span className='font-normal text-muted'>(optional)</span>
              </FieldLabel>
              <input id='bs-subtitle' type='text' value={subtitle} maxLength={48} aria-label='Subtitle' placeholder='Quad, class or team'
                onChange={e => editText(setSubtitle)(e.target.value)} className={cx(inputField, 'text-[13px]')} />
            </div>
            <Slider label='Text size' value={fontSize} display={`${fontSize}px`} min={8} max={48} onChange={editText(setFontSize)}
              hint='Long names shrink automatically to fit.' />
          </Section>

          <Section index='02' title='Font' action={<span className='truncate text-xs text-lime'>{selectedFont.name}</span>}>
            <FontPicker sample={callsign} italic={isItalic} selected={selectedFont} onSelect={editText(setSelectedFont)} />
          </Section>

          <Section index='03' title='Style'>
            <div role='group' aria-label='Text effect' className='grid grid-cols-2 gap-2'>
              {EFFECTS.map(e => <OptionCard key={e.id} selected={textEffect === e.id} onClick={() => editText(setTextEffect)(e.id)} title={e.name} hint={e.hint} />)}
            </div>
            {textEffect !== 'none' && <div>
              <FieldLabel>{textEffect === 'shadow-3d' ? 'Depth' : 'Edge width'}</FieldLabel>
              <Segmented label='Edge width' size='sm' value={outlineWidth} onChange={editText(setOutlineWidth)}
                options={[1, 2, 3, 4].map(w => ({ value: w, label: `${w} px` }))} />
            </div>}
            <Switch checked={isItalic} onChange={editText(setIsItalic)} label='Slanted' hint='Leans the letters forward for a sense of speed.' />
          </Section>

          <Section index='04' title='Frame'>
            <div role='group' aria-label='Frame' className='grid grid-cols-2 gap-2'>
              {FRAME_STYLES.map(f => <OptionCard key={f.id} selected={frameStyle === f.id} onClick={() => editText(setFrameStyle)(f.id)}
                title={f.id === 'none' ? 'No frame' : f.name} hint={FRAME_HINTS[f.id]} />)}
            </div>
          </Section>

          <Section index='05' title='Emblem'>
            <div>
              <FieldLabel>Position</FieldLabel>
              <Segmented label='Emblem position' size='sm' value={emblem === 'none' ? 'none' : emblemPosition}
                onChange={pos => {
                  setEmblemPosition(pos);
                  if (pos !== 'none' && emblem === 'none') setEmblem('quad');
                  setUseCustomImage(false);
                }}
                options={[{ value: 'none', label: 'None' }, { value: 'left', label: 'Left' }, { value: 'center', label: 'Above' }, { value: 'right', label: 'Right' }]} />
            </div>
            {emblem !== 'none' && emblemPosition !== 'none' && <>
              <div role='group' aria-label='Emblem' className='grid grid-cols-2 gap-2'>
                {EMBLEMS.filter(e => e.id !== 'none').map(e => <OptionCard key={e.id} selected={emblem === e.id}
                  onClick={() => editText(setEmblem)(e.id)} title={e.name} hint={e.description} />)}
                {customEmblem && <OptionCard selected={emblem === 'custom'} onClick={() => editText(setEmblem)('custom')}
                  title='Your image' hint={`${customEmblem.naturalWidth}×${customEmblem.naturalHeight}px`} />}
              </div>
              <ImageDrop compact label='Use your own logo' loaded={customEmblem}
                onImage={img => { setCustomEmblem(img); setEmblem('custom'); setUseCustomImage(false); }} />
              {emblem === 'custom' && customEmblem && <div className='space-y-4 rounded-md border border-line bg-panel-2 p-4'>
                <Slider label='Threshold' value={emblemThreshold} min={0} max={255} onChange={setEmblemThreshold} hint='Where dark ends and light begins.' />
                <div>
                  <FieldLabel>Colors</FieldLabel>
                  <Segmented label='Emblem colors' size='sm' value={emblemTransparentColor} onChange={setEmblemTransparentColor} options={[
                    { value: 'green', label: 'White', title: 'White on transparent' },
                    { value: 'white', label: 'Black', title: 'Black on transparent' },
                    { value: 'black', label: 'Boxed', title: 'White on black' },
                  ]} />
                </div>
                <Switch checked={emblemDithering} onChange={setEmblemDithering} label='Dithering' hint='Dots for shades of grey.' />
                <Switch checked={emblemClearBackground} onChange={setEmblemClearBackground} label='Remove background' hint='Clears the solid area around the logo.' />
                <Switch checked={emblemInvert} onChange={setEmblemInvert} label='Invert' />
              </div>}
            </>}
          </Section>

          <Section index='06' title='Background'>
            <Segmented label='Background' value={colorMode} onChange={editText(setColorMode)} options={[
              { value: 'green_bg', label: 'Transparent' }, { value: 'black_bg', label: 'Black' }, { value: 'stencil_green', label: 'Cut-out' },
            ]} />
            <p className='text-xs leading-relaxed text-muted'>
              {colorMode === 'green_bg' ? 'The camera image shows around your logo.'
                : colorMode === 'black_bg' ? 'A solid black banner behind your logo.'
                : 'A black banner with see-through letters.'}
            </p>
            {colorMode !== 'stencil_green' && <Switch checked={invert} onChange={editText(setInvert)} label='Swap black and white'
              hint='Dark letters with a light edge.' />}
          </Section>
        </div>}

        {tab === 'presets' && <div role='tabpanel' id='panel-presets' aria-labelledby='tab-presets'>
          <PresetGallery callsign={callsign} subtitle={subtitle} onApply={design => { applyDesign(design); setTab('design'); flash('Preset applied'); }} />
        </div>}

        {tab === 'image' && <div role='tabpanel' id='panel-image' aria-labelledby='tab-image'>
          <Section index='01' title='Your image'>
            <p className='text-[13px] leading-relaxed text-muted'>
              Turn a team logo or artwork into a boot logo. It is scaled to 288×72 and reduced to white, black and transparent. Wide, high-contrast images work best.
            </p>
            <ImageDrop label='Choose an image' loaded={customImage} onImage={img => { setCustomImage(img); setUseCustomImage(true); }} />
            {customImage && <Switch checked={useCustomImage} onChange={setUseCustomImage} label='Use this image' hint='Off shows your text design again.' />}
          </Section>

          {customImage && <>
            <Section index='02' title='Placement'>
              <div>
                <FieldLabel>Fit</FieldLabel>
                <Segmented label='Fit' size='sm' value={imageFit} onChange={setImageFit} options={[
                  { value: 'contain', label: 'Contain' }, { value: 'cover', label: 'Cover' }, { value: 'stretch', label: 'Stretch' },
                ]} />
              </div>
              <Slider label='Size' value={imageScale} display={`${Math.round(imageScale * 100)}%`} min={0.4} max={1.8} step={0.05} onChange={setImageScale} />
              <div>
                <Slider label='Horizontal position' value={imageOffsetX} display={imageOffsetX > 0 ? `+${imageOffsetX}` : imageOffsetX} min={-100} max={100} onChange={setImageOffsetX} />
                {imageOffsetX !== 0 && <button type='button' onClick={() => setImageOffsetX(0)} className={cx(buttonLink, 'mt-1')}>Center</button>}
              </div>
            </Section>

            <Section index='03' title='Conversion'>
              <Slider label='Threshold' value={imageThreshold} min={0} max={255} onChange={setImageThreshold} hint='Where dark ends and light begins.' />
              <Switch checked={imageDithering} onChange={setImageDithering} label='Dithering' hint='Dots for gradients and photos.' />
              <div>
                <FieldLabel>Transparent areas</FieldLabel>
                <Segmented label='Transparent areas' size='sm' value={imageTransparentColor} onChange={setImageTransparentColor} options={[
                  { value: 'green', label: 'Dark', title: 'Dark areas become transparent' },
                  { value: 'white', label: 'Light', title: 'Light areas become transparent' },
                  { value: 'black', label: 'None', title: 'Keep black and white' },
                ]} />
              </div>
              <div>
                <FieldLabel>Empty edges</FieldLabel>
                <Segmented label='Empty edges' size='sm' value={imageOuterMode} onChange={setImageOuterMode} options={[
                  { value: 'transparent', label: 'Transparent' }, { value: 'black', label: 'Black' }, { value: 'white', label: 'White' },
                ]} />
              </div>
              <Switch checked={clearOuterBackground} onChange={setClearOuterBackground} label='Remove background' hint='Clears solid color that touches the edges.' />
              <Switch checked={invert} onChange={setInvert} label='Invert' hint='Swap dark and light.' />
            </Section>
          </>}
        </div>}
      </div>
    </main>

    <InstallGuide />
  </div>;
}
