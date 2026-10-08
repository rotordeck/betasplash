import { fitTextSize } from './textSizing';
import type { GoogleFontOption } from '../data/fonts';
import { FRAME_STYLES } from '../data/presets';
import type { RenderOptions } from './canvasRenderer';

export function generateWizardDesigns(callsign: string, subtitle: string, fonts: GoogleFontOption[], random = Math.random): RenderOptions[] {
  if (!callsign.trim() || !fonts.length) throw new Error('A name and at least one font are required.');
  const pick = <T,>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  const effects = ['none', 'outline', 'shadow-3d', 'bevel'] as const;
  const offset = Math.floor(random() * FRAME_STYLES.length);
  const designs = Array.from({ length: 42 }, (_, i): RenderOptions => ({
    callsign: callsign.trim(), subtitle: subtitle.trim(), font: fonts[i % fonts.length],
    fontSize: subtitle.trim() ? pick([34, 36, 38, 40]) : pick([38, 42, 46, 48]), subtitleSize: 10,
    letterSpacing: 0, emblem: 'none',
    emblemPosition: 'none',
    frameStyle: FRAME_STYLES[(i + offset) % FRAME_STYLES.length].id,
    colorMode: i % 5 === 0 ? 'black_bg' : 'green_bg', invert: false,
    textEffect: effects[Math.floor(i / 7) % effects.length], outlineWidth: pick([1, 2]),
    italic: random() > 0.65, useCustomImage: false,
  }));
  // Six variants per frame, balanced selected fonts, then shuffle the gallery.
  for (let i = designs.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [designs[i], designs[j]] = [designs[j], designs[i]];
  }
  return designs;
}

export function fitWizardDesign(design: RenderOptions, ctx: CanvasRenderingContext2D): RenderOptions {
  const width = 246;
  return { ...design,
    fontSize: fitTextSize(ctx, design.callsign, design.fontSize, design.font.family, design.font.weight, width, design.italic, design.outlineWidth),
    subtitleSize: fitTextSize(ctx, design.subtitle, design.subtitleSize, "'Rajdhani'", '700', width, design.italic, 1),
  };
}
