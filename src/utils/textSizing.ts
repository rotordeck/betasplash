/** Fit the actual typed glyphs, including room for slant and text effects. */
export function fitTextSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maximum: number,
  family: string,
  weight: string,
  availableWidth: number,
  italic = false,
  outlineWidth = 0,
): number {
  const budget = Math.max(1, availableWidth - outlineWidth * 2 - 4);
  const measure = (size: number) => {
    ctx.font = `${weight} ${size}px ${family}`;
    const metrics = ctx.measureText(text);
    const glyphWidth = Math.max(metrics.width, (metrics.actualBoundingBoxLeft || 0) + (metrics.actualBoundingBoxRight || 0));
    return glyphWidth + (italic ? size * 0.22 : 0);
  };
  let size = Math.min(maximum, Math.max(1, Math.floor(maximum * budget / Math.max(1, measure(maximum)))));
  while (size > 1 && measure(size) > budget) size--;
  return size;
}
