import React from 'react';

/** Join class names, skipping falsy values. */
export const cx = (...names: Array<string | false | null | undefined>) => names.filter(Boolean).join(' ');

export const buttonPrimary =
  'inline-flex items-center justify-center gap-2 rounded-md bg-lime px-4 py-2.5 text-sm font-bold text-ground transition hover:bg-lime-hover disabled:cursor-not-allowed disabled:opacity-40';
export const buttonGhost =
  'inline-flex items-center justify-center gap-2 rounded-md border border-line-strong px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-lime hover:text-lime disabled:cursor-not-allowed disabled:opacity-40';
export const buttonLink = 'inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-lime';
export const inputField =
  'w-full rounded-md border border-line bg-well px-3 py-2.5 text-ink placeholder:text-faint outline-none transition focus:border-lime';

/** A numbered control group, styled like the steps on rotordeck.com. */
export function Section({ index, title, action, children }: {
  index: string; title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return <section className='border-b border-line px-5 py-6 last:border-b-0' aria-label={title}>
    <div className='mb-4 flex items-center gap-3'>
      <span className='bs-eyebrow text-lime'>{index}</span>
      <h3 className='text-[15px] font-bold tracking-tight text-ink'>{title}</h3>
      <span className='h-px flex-1 bg-line' aria-hidden='true' />
      {action}
    </div>
    <div className='space-y-4'>{children}</div>
  </section>;
}

export function FieldLabel({ children, value, htmlFor }: { children: React.ReactNode; value?: React.ReactNode; htmlFor?: string }) {
  return <div className='mb-2 flex items-baseline justify-between gap-3'>
    <label htmlFor={htmlFor} className='text-[13px] font-semibold text-ink'>{children}</label>
    {value !== undefined && <span className='font-mono text-xs text-lime'>{value}</span>}
  </div>;
}

/** Single-choice button group. Each option is a toggle button with aria-pressed. */
export function Segmented<T extends string | number>({ label, value, options, onChange, size = 'md' }: {
  label: string; value: T; onChange: (value: NoInfer<T>) => void; size?: 'sm' | 'md';
  options: ReadonlyArray<{ value: NoInfer<T>; label: React.ReactNode; title?: string }>;
}) {
  return <div role='group' aria-label={label} className='flex w-full rounded-md border border-line bg-well p-1'>
    {options.map(option => <button
      key={String(option.value)}
      type='button'
      title={option.title}
      aria-pressed={value === option.value}
      onClick={() => onChange(option.value)}
      className={cx(
        'flex flex-1 items-center justify-center gap-1.5 rounded-[4px] font-semibold transition',
        size === 'sm' ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-[13px]',
        value === option.value ? 'bg-lime text-ground' : 'text-muted hover:text-ink',
      )}
    >{option.label}</button>)}
  </div>;
}

/** A selectable card for visual options (effects, frames, emblems, presets). */
export function OptionCard({ selected, onClick, title, hint, children, label }: {
  selected: boolean; onClick: () => void; title: string; hint?: string; children?: React.ReactNode; label?: string;
}) {
  return <button
    type='button'
    aria-pressed={selected}
    aria-label={label}
    onClick={onClick}
    className={cx(
      'group flex min-w-0 flex-col gap-1 rounded-md border p-3 text-left transition',
      selected ? 'border-lime bg-lime/[0.07]' : 'border-line bg-panel-2 hover:border-line-strong',
    )}
  >
    {children}
    <span className={cx('truncate text-[13px] font-semibold', selected ? 'text-lime' : 'text-ink')}>{title}</span>
    {hint && <span className='truncate text-[11px] text-muted'>{hint}</span>}
  </button>;
}

/** An accessible on/off switch with a description. */
export function Switch({ checked, onChange, label, hint }: {
  checked: boolean; onChange: (checked: boolean) => void; label: string; hint?: string;
}) {
  return <label className='flex cursor-pointer items-start justify-between gap-4'>
    <span className='min-w-0'>
      <span className='block text-[13px] font-semibold text-ink'>{label}</span>
      {hint && <span className='mt-0.5 block text-xs leading-relaxed text-muted'>{hint}</span>}
    </span>
    <input type='checkbox' role='switch' checked={checked} onChange={e => onChange(e.target.checked)} className='peer sr-only' />
    <span aria-hidden='true' className={cx(
      'relative mt-0.5 h-6 w-11 shrink-0 rounded-full border transition peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lime',
      checked ? 'border-lime bg-lime' : 'border-line-strong bg-well',
    )}>
      <span className={cx('absolute top-0.5 h-[18px] w-[18px] rounded-full transition-all', checked ? 'left-[22px] bg-ground' : 'left-0.5 bg-muted')} />
    </span>
  </label>;
}

export function Slider({ label, value, display, min, max, step = 1, onChange, hint }: {
  label: string; value: number; display?: React.ReactNode; min: number; max: number; step?: number;
  onChange: (value: number) => void; hint?: string;
}) {
  const id = React.useId();
  return <div>
    <FieldLabel htmlFor={id} value={display ?? value}>{label}</FieldLabel>
    <input id={id} type='range' min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className='w-full cursor-pointer' />
    {hint && <p className='mt-1 text-xs text-muted'>{hint}</p>}
  </div>;
}
