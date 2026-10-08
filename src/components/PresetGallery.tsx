import React, { useMemo } from 'react';
import { PILOT_GOOGLE_FONTS } from '../data/fonts';
import { SPLASH_PRESETS, type SplashPreset } from '../data/presets';
import type { RenderOptions } from '../utils/canvasRenderer';
import { SplashThumb } from './SplashThumb';

/** A preset's look applied to the pilot's own text. Uploaded emblems are left out of thumbnails. */
export function presetDesign(preset: SplashPreset, callsign: string, subtitle: string): RenderOptions {
  return {
    callsign: callsign.trim() ? callsign : preset.callsign,
    subtitle: callsign.trim() ? subtitle : preset.subtitle,
    font: PILOT_GOOGLE_FONTS.find(f => f.id === preset.fontId) || PILOT_GOOGLE_FONTS[0],
    fontSize: preset.fontSize, subtitleSize: 11, letterSpacing: preset.letterSpacing,
    emblem: preset.emblem, emblemPosition: preset.emblemPosition, frameStyle: preset.frameStyle,
    colorMode: preset.colorMode, invert: preset.invert,
    textEffect: preset.textEffect ?? 'outline', outlineWidth: preset.outlineWidth ?? 2, italic: preset.italic ?? false,
    useCustomImage: false,
  };
}

export function PresetGallery({ callsign, subtitle, onApply }: {
  callsign: string; subtitle: string; onApply: (design: RenderOptions) => void;
}) {
  const designs = useMemo(() => SPLASH_PRESETS.map(p => ({ preset: p, design: presetDesign(p, callsign, subtitle) })), [callsign, subtitle]);
  return <div className='px-5 py-6'>
    <p className='mb-4 text-[13px] leading-relaxed text-muted'>Each style uses your text. Pick one, then fine-tune it in Design.</p>
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
      {designs.map(({ preset, design }) => <button key={preset.id} type='button' onClick={() => onApply(design)}
        aria-label={`Apply preset ${preset.name}`}
        className='group rounded-md border border-line bg-panel-2 p-2 text-left transition hover:border-lime'>
        <SplashThumb design={design} />
        <span className='flex items-center justify-between gap-2 px-1 pb-0.5 pt-2'>
          <span className='truncate text-[13px] font-semibold text-ink group-hover:text-lime'>{preset.name}</span>
          <span className='bs-eyebrow shrink-0 text-faint'>{preset.category}</span>
        </span>
      </button>)}
    </div>
  </div>;
}
