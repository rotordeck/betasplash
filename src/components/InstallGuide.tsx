import React from 'react';

const STEPS: Array<[string, React.ReactNode]> = [
  ['Download the bitmap', <>Click <b className='text-ink'>Download .bmp</b>. You get a 288×72 file with only white, black and transparent green.</>],
  ['Connect your quad', <>Plug the flight controller into USB and open <b className='text-ink'>Betaflight Configurator</b>. Click Connect.</>],
  ['Open the Font Manager', <>Go to the <b className='text-ink'>OSD</b> tab and click <b className='text-ink'>Font Manager</b> at the bottom right.</>],
  ['Upload the logo', <>Click <b className='text-ink'>Select custom logo image</b>, choose your <code className='rounded border border-line bg-well px-1.5 py-0.5 font-mono text-[0.9em] text-ink'>.bmp</code>, then <b className='text-ink'>Upload Font</b>. Keep the FC powered until it finishes.</>],
  ['Power up', <>Plug in a battery. Your logo shows on the boot screen in your goggles.</>],
];

/** Installation steps, styled like the numbered steps on rotordeck.com/sticklink. */
export function InstallGuide() {
  return <section id='install' aria-labelledby='install-title' className='bs-container pb-6 pt-16'>
    <span className='bs-eyebrow text-lime'>Analog OSD · MAX7456</span>
    <h2 id='install-title' className='mt-3 text-[clamp(30px,4.5vw,48px)] font-bold leading-[1.04] tracking-[-0.045em]'>Put it on your quad.</h2>
    <p className='mt-4 max-w-[640px] text-[15px] leading-relaxed text-muted'>
      Betaflight stores the boot logo in the OSD font, so it uploads together with your font. Digital systems such as DJI, HDZero and Walksnail use their own logo settings.
    </p>
    <ol className='mt-8 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-5'>
      {STEPS.map(([title, body], i) => <li key={title} className='rounded-[10px] border border-line bg-panel p-5'>
        <span className='flex items-center gap-3 font-mono text-xs text-lime'>
          {String(i + 1).padStart(2, '0')}<span className='h-px flex-1 bg-line-strong' aria-hidden='true' />
        </span>
        <h3 className='mt-4 text-[17px] font-bold tracking-tight'>{title}</h3>
        <p className='mt-2 text-[13px] leading-relaxed text-muted'>{body}</p>
      </li>)}
    </ol>
  </section>;
}
