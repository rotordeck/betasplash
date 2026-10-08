import React, { useEffect, useRef } from 'react';
import { renderBetaflightCanvas, type RenderOptions } from '../utils/canvasRenderer';

/** Turn the Betaflight transparency key (#00FF00) into real transparency. */
export function keyOutGreen(ctx: CanvasRenderingContext2D) {
  const pixels = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = pixels.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] === 0 && data[i + 1] === 255 && data[i + 2] === 0) data[i + 3] = 0;
  }
  ctx.putImageData(pixels, 0, 0);
}

/** A small rendered splash on the simulated camera feed. Redraws once its font has loaded. */
export function SplashThumb({ design }: { design: RenderOptions }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let active = true;
    const draw = () => {
      if (!active || !canvas.current) return;
      renderBetaflightCanvas(canvas.current, design);
      const ctx = canvas.current.getContext('2d', { willReadFrequently: true });
      if (ctx) keyOutGreen(ctx);
    };
    draw();
    Promise.all([
      document.fonts.load(`${design.font.weight} 28px ${design.font.family}`),
      design.subtitle ? document.fonts.load("700 10px 'Rajdhani'") : null,
    ]).then(draw, draw);
    return () => { active = false; };
  }, [design]);
  return <div className='bs-feed relative overflow-hidden rounded-[5px] px-3 py-3'>
    <canvas ref={canvas} width={288} height={72} className='relative z-[1] block h-auto w-full' style={{ imageRendering: 'pixelated' }} />
  </div>;
}
