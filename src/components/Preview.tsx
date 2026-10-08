import React from 'react';
import { Glasses, Grid3x3, Image as ImageIcon } from 'lucide-react';
import { Segmented, cx } from './ui';

export type PreviewMode = 'goggles' | 'bitmap' | 'tiles';
export type Feed = 'camera' | 'dark' | 'bright';

/**
 * Live preview. Goggles shows the logo as it boots on an analog OSD (30×16
 * characters, the logo spans 24 of them), Bitmap shows the exact exported pixels,
 * and Tiles overlays the 12×18 px character cells the logo is stored in.
 */
export function Preview({ mode, onMode, feed, onFeed, rawRef, osdRef }: {
  mode: PreviewMode; onMode: (mode: PreviewMode) => void;
  feed: Feed; onFeed: (feed: Feed) => void;
  rawRef: React.RefObject<HTMLCanvasElement | null>; osdRef: React.RefObject<HTMLCanvasElement | null>;
}) {
  return <div>
    <div className='flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3'>
      <div className='w-full sm:w-auto sm:min-w-[330px]'>
        <Segmented label='Preview' size='sm' value={mode} onChange={onMode} options={[
          { value: 'goggles', label: <><Glasses className='h-3.5 w-3.5' aria-hidden='true' />Goggles</> },
          { value: 'bitmap', label: <><ImageIcon className='h-3.5 w-3.5' aria-hidden='true' />Bitmap</> },
          { value: 'tiles', label: <><Grid3x3 className='h-3.5 w-3.5' aria-hidden='true' />Tiles</> },
        ]} />
      </div>
      {mode === 'goggles' && <div className='flex items-center gap-2'>
        <span className='bs-eyebrow text-faint'>Sky</span>
        <div className='w-[190px]'>
          <Segmented label='Camera background' size='sm' value={feed} onChange={onFeed} options={[
            { value: 'camera', label: 'Camera' }, { value: 'dark', label: 'Dark' }, { value: 'bright', label: 'Bright' },
          ]} />
        </div>
      </div>}
    </div>

    <div className='p-4 sm:p-6'>
      {/* Goggles: logo placed like the Betaflight boot screen on a 4:3 analog feed. */}
      <div className={cx('bs-feed relative mx-auto aspect-[4/3] w-full max-w-[min(100%,83vh,747px)] overflow-hidden rounded-md border border-line', mode !== 'goggles' && 'hidden')} data-feed={feed}>
        <canvas ref={osdRef} aria-label='OSD splash preview' width={288} height={72}
          className='absolute left-[10%] top-[14%] z-[1] h-auto w-[80%]' style={{ imageRendering: 'pixelated' }} />
        <div className='bs-osd-text absolute left-[10%] top-[44%] z-[1]' aria-hidden='true'>
          <div className='mb-[0.6em]'>V4.5.1</div>
          <div>MENU:THR MID</div>
          <div className='pl-[5ch]'>+ YAW LEFT</div>
          <div className='pl-[5ch]'>+ PITCH UP</div>
        </div>
      </div>

      {/* Bitmap and tiles: the exact 288×72 export, pixel for pixel. */}
      <div className={cx(mode === 'goggles' && 'hidden')}>
        <div className='relative overflow-hidden rounded-md border border-line bg-black'>
          <canvas ref={rawRef} aria-label='Raw splash bitmap' width={288} height={72}
            className='block aspect-[4/1] h-auto w-full' style={{ imageRendering: 'pixelated' }} />
          {mode === 'tiles' && <div aria-hidden='true' className='pointer-events-none absolute inset-0' style={{
            backgroundImage: 'linear-gradient(to right, rgb(195 244 92 / 0.55) 1px, transparent 1px), linear-gradient(to bottom, rgb(195 244 92 / 0.55) 1px, transparent 1px)',
            backgroundSize: `${100 / 24}% ${100 / 4}%`,
          }} />}
        </div>
        <div className='mt-2 flex justify-between font-mono text-[11px] text-faint'>
          <span>0</span>
          <span>{mode === 'tiles' ? '24 × 4 characters of 12 × 18 px' : '288 × 72 px · green is transparent'}</span>
          <span>288</span>
        </div>
      </div>
    </div>
  </div>;
}
