import { fitTextSize } from './textSizing';
import { GoogleFontOption } from '../data/fonts';
import { enforceStrict3Colors } from './bmpGenerator';

export interface RenderOptions {
  callsign: string;
  subtitle: string;
  font: GoogleFontOption;
  fontSize: number;
  subtitleSize: number;
  letterSpacing: number;
  emblem: string;
  customEmblem?: HTMLImageElement | null;
  emblemThreshold?: number;
  emblemDithering?: boolean;
  emblemTransparentColor?: 'green' | 'black' | 'white';
  emblemClearBackground?: boolean;
  emblemInvert?: boolean;
  emblemPosition: 'left' | 'right' | 'center' | 'none';
  frameStyle: 'brackets' | 'rails' | 'hazard' | 'hex' | 'box' | 'dots' | 'none';
  colorMode: 'green_bg' | 'black_bg' | 'stencil_green';
  invert: boolean;
  
  // Text & Visual Effects
  textEffect?: 'none' | 'outline' | 'shadow-3d' | 'bevel';
  outlineWidth?: number;
  italic?: boolean;

  // Custom image overlay / import
  useCustomImage?: boolean;
  customImage?: HTMLImageElement | null;
  imageThreshold?: number;
  dithering?: boolean;
  imageFit?: 'contain' | 'cover' | 'stretch';
  imageTransparentColor?: 'green' | 'black' | 'white';
  imageOuterMode?: 'transparent' | 'black' | 'white';
  clearOuterBackground?: boolean;
  imageScale?: number;
  imageOffsetX?: number;
}

/**
 * Draws the vector emblem at given center (cx, cy) and radius r
 */
function drawEmblem(
  ctx: CanvasRenderingContext2D,
  emblem: string,
  cx: number,
  cy: number,
  r: number,
  fgColor: string,
  outlineColor: string,
  hasOutline = false,
  outlineWidth = 2
) {
  ctx.save();

  // If outline is requested, render a thick background stroke first
  if (hasOutline) {
    ctx.save();
    ctx.strokeStyle = outlineColor;
    ctx.fillStyle = outlineColor;
    ctx.lineWidth = outlineWidth * 2 + 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawEmblemGeometry(ctx, emblem, cx, cy, outlineColor, outlineColor);
    ctx.restore();
  }

  // Draw main emblem
  ctx.strokeStyle = fgColor;
  ctx.fillStyle = fgColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  drawEmblemGeometry(ctx, emblem, cx, cy, fgColor, outlineColor);

  ctx.restore();
}

/**
 * Geometry definitions for all pilot emblems
 */
function drawEmblemGeometry(
  ctx: CanvasRenderingContext2D,
  emblem: string,
  cx: number,
  cy: number,
  color: string,
  accentColor: string
) {
  if (emblem === 'quad') {
    // Top view racing drone
    ctx.fillRect(cx - 5, cy - 7, 10, 14);
    
    // Arms (X shape)
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 16);
    ctx.lineTo(cx + 16, cy + 16);
    ctx.moveTo(cx + 16, cy - 16);
    ctx.lineTo(cx - 16, cy + 16);
    ctx.stroke();

    // 4 Motors
    const motorRadius = 4;
    const motors = [
      { x: cx - 16, y: cy - 16 },
      { x: cx + 16, y: cy - 16 },
      { x: cx - 16, y: cy + 16 },
      { x: cx + 16, y: cy + 16 },
    ];
    motors.forEach(m => {
      ctx.beginPath();
      ctx.arc(m.x, m.y, motorRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // FPV camera lens front
    ctx.fillRect(cx - 3, cy - 11, 6, 4);
  } else if (emblem === 'propeller') {
    // Tri-blade propeller
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -11, 4.5, 11, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (emblem === 'crosshair') {
    // HUD targeting reticle
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.stroke();

    // Cross lines
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy); ctx.lineTo(cx - 8, cy);
    ctx.moveTo(cx + 8, cy); ctx.lineTo(cx + 18, cy);
    ctx.moveTo(cx, cy - 18); ctx.lineTo(cx, cy - 8);
    ctx.moveTo(cx, cy + 8); ctx.lineTo(cx, cy + 18);
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (emblem === 'wings') {
    // Pilot supersonic wings
    ctx.beginPath();
    ctx.moveTo(cx, cy + 12);
    ctx.lineTo(cx - 6, cy + 2);
    ctx.lineTo(cx - 6, cy - 8);
    ctx.lineTo(cx + 6, cy - 8);
    ctx.lineTo(cx + 6, cy + 2);
    ctx.closePath();
    ctx.fill();

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 6);
    ctx.lineTo(cx - 20, cy - 14);
    ctx.lineTo(cx - 15, cy - 3);
    ctx.lineTo(cx - 22, cy - 2);
    ctx.lineTo(cx - 12, cy + 4);
    ctx.lineTo(cx - 6, cy + 3);
    ctx.closePath();
    ctx.fill();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(cx + 7, cy - 6);
    ctx.lineTo(cx + 20, cy - 14);
    ctx.lineTo(cx + 15, cy - 3);
    ctx.lineTo(cx + 22, cy - 2);
    ctx.lineTo(cx + 12, cy + 4);
    ctx.lineTo(cx + 6, cy + 3);
    ctx.closePath();
    ctx.fill();
  } else if (emblem === 'goggles') {
    // FPV Goggles
    ctx.beginPath();
    ctx.roundRect(cx - 18, cy - 7, 16, 14, [3]);
    ctx.roundRect(cx + 2, cy - 7, 16, 14, [3]);
    ctx.fill();

    // Bridge
    ctx.fillRect(cx - 4, cy - 3, 8, 4);

    // Antennas
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 7);
    ctx.lineTo(cx - 16, cy - 18);
    ctx.moveTo(cx + 12, cy - 7);
    ctx.lineTo(cx + 16, cy - 18);
    ctx.stroke();

    ctx.fillRect(cx - 18, cy - 20, 4, 4);
    ctx.fillRect(cx + 14, cy - 20, 4, 4);
  } else if (emblem === 'lightning') {
    // High voltage bolt
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 18);
    ctx.lineTo(cx - 10, cy - 2);
    ctx.lineTo(cx - 1, cy - 2);
    ctx.lineTo(cx - 4, cy + 18);
    ctx.lineTo(cx + 10, cy);
    ctx.lineTo(cx + 1, cy);
    ctx.closePath();
    ctx.fill();
  } else if (emblem === 'skull') {
    // Cyber Skull
    ctx.beginPath();
    ctx.arc(cx, cy - 4, 12, Math.PI, 0);
    ctx.lineTo(cx + 8, cy + 4);
    ctx.lineTo(cx + 5, cy + 12);
    ctx.lineTo(cx - 5, cy + 12);
    ctx.lineTo(cx - 8, cy + 4);
    ctx.closePath();
    ctx.fill();

    const eyeColor = color === '#FFFFFF' ? '#000000' : '#FFFFFF';
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(cx - 4.5, cy - 2, 3, 0, Math.PI * 2);
    ctx.arc(cx + 4.5, cy - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = eyeColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy + 8); ctx.lineTo(cx - 2, cy + 12);
    ctx.moveTo(cx + 2, cy + 8); ctx.lineTo(cx + 2, cy + 12);
    ctx.stroke();
  } else if (emblem === 'radio') {
    // ELRS Radio waves
    ctx.beginPath();
    ctx.fillRect(cx - 1.5, cy - 8, 3, 20);
    ctx.fillRect(cx - 6, cy + 10, 12, 4);
    
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 7, -Math.PI * 0.7, -Math.PI * 0.3);
    ctx.arc(cx, cy - 6, 14, -Math.PI * 0.7, -Math.PI * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy - 6, 7, Math.PI * 0.3, Math.PI * 0.7);
    ctx.arc(cx, cy - 6, 14, Math.PI * 0.3, Math.PI * 0.7);
    ctx.stroke();
  }
}

/**
 * Draws text with outline, 3D shadow, or bevel effect
 */
function drawStyledText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fgColor: string,
  outlineColor: string,
  effect: 'none' | 'outline' | 'shadow-3d' | 'bevel',
  outlineWidth: number,
  italic: boolean
) {
  ctx.save();

  if (italic) {
    // Aerodynamic forward italic slant
    ctx.translate(x, y);
    ctx.transform(1, 0, -0.22, 1, 0, 0);
    ctx.translate(-x, -y);
  }

  if (effect === 'outline') {
    // High-contrast solid stroke
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth * 2;
    ctx.lineJoin = 'miter';
    ctx.miterLimit = 2;
    ctx.strokeText(text, x, y);

    // Multi-pass offset for crisp, solid pixel corners
    for (let dx = -outlineWidth; dx <= outlineWidth; dx++) {
      for (let dy = -outlineWidth; dy <= outlineWidth; dy++) {
        if (Math.abs(dx) + Math.abs(dy) <= outlineWidth + 1) {
          ctx.strokeText(text, x + dx, y + dy);
        }
      }
    }

    // Main fill
    ctx.fillStyle = fgColor;
    ctx.fillText(text, x, y);
  } else if (effect === 'shadow-3d') {
    // 3D block extruded shadow
    ctx.fillStyle = outlineColor;
    const depth = Math.max(2, outlineWidth);
    for (let d = depth; d >= 1; d--) {
      ctx.fillText(text, x + d, y + d);
    }
    // Main fill
    ctx.fillStyle = fgColor;
    ctx.fillText(text, x, y);
  } else if (effect === 'bevel') {
    // Beveled 3D look: bottom-right dark shadow, top-left bright highlight
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x + 2, y + 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(text, x - 1, y - 1);
    
    // Thin border
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 1.5;
    ctx.strokeText(text, x, y);

    // Face fill
    ctx.fillStyle = fgColor;
    ctx.fillText(text, x, y);
  } else {
    // Simple fill
    ctx.fillStyle = fgColor;
    ctx.fillText(text, x, y);
  }

  ctx.restore();
}

/**
 * Draws HUD / Decorative Frame Borders
 */
function drawFrame(ctx: CanvasRenderingContext2D, style: string, w: number, h: number, color: string) {
  if (style === 'none') return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  const pad = 3;

  if (style === 'brackets') {
    const bLen = 14;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(pad, pad + bLen); ctx.lineTo(pad, pad); ctx.lineTo(pad + bLen, pad);
    // Top-Right
    ctx.moveTo(w - pad - bLen, pad); ctx.lineTo(w - pad, pad); ctx.lineTo(w - pad, pad + bLen);
    // Bottom-Left
    ctx.moveTo(pad, h - pad - bLen); ctx.lineTo(pad, h - pad); ctx.lineTo(pad + bLen, h - pad);
    // Bottom-Right
    ctx.moveTo(w - pad - bLen, h - pad); ctx.lineTo(w - pad, h - pad); ctx.lineTo(w - pad, h - pad - bLen);
    ctx.stroke();

    // Center tick notches
    ctx.fillRect(w / 2 - 12, pad, 24, 2);
    ctx.fillRect(w / 2 - 12, h - pad - 2, 24, 2);
  } else if (style === 'rails') {
    ctx.fillRect(pad, pad, w - pad * 2, 2);
    ctx.fillRect(pad, h - pad - 2, w - pad * 2, 2);

    ctx.fillRect(pad, pad, 4, 8);
    ctx.fillRect(w - pad - 4, pad, 4, 8);
    ctx.fillRect(pad, h - pad - 8, 4, 8);
    ctx.fillRect(w - pad - 4, h - pad - 8, 4, 8);

    ctx.fillRect(40, pad + 3, 20, 1.5);
    ctx.fillRect(w - 60, pad + 3, 20, 1.5);
    ctx.fillRect(40, h - pad - 4.5, 20, 1.5);
    ctx.fillRect(w - 60, h - pad - 4.5, 20, 1.5);
  } else if (style === 'hazard') {
    const stripeW = 8;
    for (let x = pad; x < pad + 32; x += stripeW) {
      ctx.beginPath();
      ctx.moveTo(x, pad);
      ctx.lineTo(x + 4, pad);
      ctx.lineTo(x, h - pad);
      ctx.lineTo(x - 4, h - pad);
      ctx.closePath();
      ctx.fill();
    }
    for (let x = w - pad - 32; x < w - pad; x += stripeW) {
      ctx.beginPath();
      ctx.moveTo(x, pad);
      ctx.lineTo(x + 4, pad);
      ctx.lineTo(x, h - pad);
      ctx.lineTo(x - 4, h - pad);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillRect(pad + 32, pad, w - pad * 2 - 64, 1.5);
    ctx.fillRect(pad + 32, h - pad - 1.5, w - pad * 2 - 64, 1.5);
  } else if (style === 'hex') {
    const cut = 10;
    ctx.beginPath();
    ctx.moveTo(pad + cut, pad);
    ctx.lineTo(w - pad - cut, pad);
    ctx.lineTo(w - pad, pad + cut);
    ctx.lineTo(w - pad, h - pad - cut);
    ctx.lineTo(w - pad - cut, h - pad);
    ctx.lineTo(pad + cut, h - pad);
    ctx.lineTo(pad, h - pad - cut);
    ctx.lineTo(pad, pad + cut);
    ctx.closePath();
    ctx.stroke();
  } else if (style === 'box') {
    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);
  } else if (style === 'dots') {
    for (let x = pad; x < w - pad; x += 6) {
      ctx.fillRect(x, pad, 2, 2);
      ctx.fillRect(x, h - pad - 2, 2, 2);
    }
    for (let y = pad; y < h - pad; y += 6) {
      ctx.fillRect(pad, y, 2, 2);
      ctx.fillRect(w - pad - 2, y, 2, 2);
    }
  }

  ctx.restore();
}

/**
 * Main rendering routine for the 288x72 canvas
 */
export function renderBetaflightCanvas(
  canvas: HTMLCanvasElement,
  options: RenderOptions
) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const width = 288;
  const height = 72;

  // Set colors based on colorMode and invert
  let bgColor = '#00FF00'; // Green (transparent) default
  let fgColor = '#FFFFFF'; // White foreground
  let outlineColor = '#000000'; // Black outline

  if (options.colorMode === 'green_bg') {
    bgColor = '#00FF00'; // Transparent green
    fgColor = options.invert ? '#000000' : '#FFFFFF';
    outlineColor = options.invert ? '#FFFFFF' : '#000000';
  } else if (options.colorMode === 'black_bg') {
    bgColor = '#000000'; // Solid black background
    fgColor = options.invert ? '#00FF00' : '#FFFFFF';
    outlineColor = options.invert ? '#FFFFFF' : '#00FF00';
  } else if (options.colorMode === 'stencil_green') {
    bgColor = '#000000'; // Solid black badge
    fgColor = '#00FF00'; // Green text cutouts (see-through)
    outlineColor = '#FFFFFF';
  }

  // 1. Fill Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // If user provided a custom image to convert
  if (options.useCustomImage && options.customImage) {
    renderCustomImageMode(ctx, options, width, height);
    enforceStrict3Colors(ctx, width, height);
    return;
  }

  // 2. Draw Frame (if selected)
  drawFrame(ctx, options.frameStyle, width, height, fgColor);

  // 3. Layout Dimensions & Positions
  const hasEmblem = options.emblem !== 'none';
  const emblemRadius = 18;
  let emblemX = 38;
  const emblemY = 36;

  let textStartX = 144; // Center default
  let textAlign: CanvasTextAlign = 'center';

  const textEffect = options.textEffect ?? 'none';
  const outlineWidth = options.outlineWidth ?? 2;
  const isItalic = options.italic ?? false;

  const drawSelectedEmblem = (...args: Parameters<typeof drawEmblem>) => {
    if (options.emblem !== 'custom' || !options.customEmblem) {
      drawEmblem(...args);
      return;
    }
    const [, , cx, cy, radius] = args;
    const size = radius * 2;
    const tile = document.createElement('canvas');
    tile.width = size;
    tile.height = size;
    const tileCtx = tile.getContext('2d');
    if (!tileCtx) return;
    renderCustomImageMode(tileCtx, {
      ...options,
      customImage: options.customEmblem,
      imageThreshold: options.emblemThreshold ?? 128,
      dithering: options.emblemDithering ?? false,
      imageTransparentColor: options.emblemTransparentColor ?? 'green',
      clearOuterBackground: options.emblemClearBackground ?? true,
      invert: options.emblemInvert ?? false,
      imageFit: 'contain',
      imageScale: 1,
      imageOffsetX: 0,
      imageOuterMode: 'transparent',
    }, size, size);
    const pixels = tileCtx.getImageData(0, 0, size, size);
    for (let i = 0; i < pixels.data.length; i += 4) {
      if (pixels.data[i] === 0 && pixels.data[i + 1] === 255 && pixels.data[i + 2] === 0) {
        pixels.data[i + 3] = 0;
      }
    }
    tileCtx.putImageData(pixels, 0, 0);
    ctx.drawImage(tile, cx - radius, cy - radius);
  };

  if (hasEmblem) {
    if (options.emblemPosition === 'left') {
      emblemX = 38;
      textStartX = 166;
      textAlign = 'center';
      drawSelectedEmblem(
        ctx,
        options.emblem,
        emblemX,
        emblemY,
        emblemRadius,
        fgColor,
        outlineColor,
        textEffect !== 'none',
        outlineWidth
      );
    } else if (options.emblemPosition === 'right') {
      emblemX = width - 38;
      textStartX = 122;
      textAlign = 'center';
      drawSelectedEmblem(
        ctx,
        options.emblem,
        emblemX,
        emblemY,
        emblemRadius,
        fgColor,
        outlineColor,
        textEffect !== 'none',
        outlineWidth
      );
    } else if (options.emblemPosition === 'center') {
      emblemX = width / 2;
      drawSelectedEmblem(
        ctx,
        options.emblem,
        emblemX,
        20,
        14,
        fgColor,
        outlineColor,
        textEffect !== 'none',
        outlineWidth
      );
    }
  }

  // 4. Draw Callsign Typography
  ctx.save();
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'middle';
  
  const textWidth = hasEmblem && ['left', 'right'].includes(options.emblemPosition) ? 188 : 246;
  const fittedSize = fitTextSize(ctx, options.callsign, options.fontSize, options.font.family, options.font.weight, textWidth, isItalic, outlineWidth);
  const callsignFont = `${options.font.weight} ${fittedSize}px ${options.font.family}`;
  ctx.font = callsignFont;

  const hasSub = options.subtitle.trim().length > 0;
  let callsignY = hasSub ? 28 : 36;
  let subtitleY = 53;

  if (hasEmblem && options.emblemPosition === 'center') {
    callsignY = 44;
    subtitleY = 60;
  }

  // Draw Primary Callsign with Outline / Bevel / 3D Shadow
  drawStyledText(
    ctx,
    options.callsign,
    textStartX,
    callsignY,
    fgColor,
    outlineColor,
    textEffect,
    outlineWidth,
    isItalic
  );

  // 5. Draw Subtitle / Pilot Specs (if present)
  if (hasSub) {
    ctx.save();
    const fittedSubtitleSize = fitTextSize(ctx, options.subtitle, options.subtitleSize, "'Rajdhani', 'Share Tech Mono', sans-serif", '700', textWidth, isItalic, 1);
    ctx.font = `700 ${fittedSubtitleSize}px 'Rajdhani', 'Share Tech Mono', sans-serif`;
    ctx.textAlign = textAlign;
    ctx.textBaseline = 'middle';

    const subText = options.subtitle;

    if (textEffect === 'outline' || textEffect === 'bevel' || textEffect === 'shadow-3d') {
      drawStyledText(
        ctx,
        subText,
        textStartX,
        subtitleY,
        fgColor,
        outlineColor,
        'outline',
        1,
        isItalic
      );
    } else {
      ctx.fillStyle = fgColor;
      ctx.fillText(subText, textStartX, subtitleY);
    }
    ctx.restore();
  }

  ctx.restore();

  // 6. Strict quantization: enforce 100% Betaflight 3-color palette
  enforceStrict3Colors(ctx, width, height);
}

/**
 * Flood-fills any background colors connected to the canvas borders into Pure Green (#00FF00)
 * so that any outer margins/pillarboxes/boxes become 100% transparent in Betaflight OSD.
 */
function floodFillBordersToGreen(
  data: Uint8ClampedArray,
  width: number,
  height: number
) {
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const startColors = new Set<string>();

  // Collect all outer perimeter pixels
  for (let x = 0; x < width; x++) {
    queue.push(0 * width + x); // top
    queue.push((height - 1) * width + x); // bottom
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width + 0); // left
    queue.push(y * width + (width - 1)); // right
  }

  // Find non-green colors present along the outer edge
  for (const idx of queue) {
    const p = idx * 4;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    if (!(r === 0 && g === 255 && b === 0)) {
      startColors.add(`${r},${g},${b}`);
    }
  }

  if (startColors.size === 0) return;

  let head = 0;
  const fillQueue: number[] = [];
  for (const idx of queue) {
    if (visited[idx]) continue;
    const p = idx * 4;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    if (startColors.has(`${r},${g},${b}`)) {
      visited[idx] = 1;
      fillQueue.push(idx);
    }
  }

  while (head < fillQueue.length) {
    const curr = fillQueue[head++];
    const p = curr * 4;

    // Convert pixel to Pure Green (#00FF00 - Transparent in Betaflight)
    data[p] = 0;
    data[p + 1] = 255;
    data[p + 2] = 0;
    data[p + 3] = 255;

    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1,
    ];

    for (const n of neighbors) {
      if (n >= 0 && !visited[n]) {
        const np = n * 4;
        const nr = data[np], ng = data[np + 1], nb = data[np + 2];
        if (startColors.has(`${nr},${ng},${nb}`)) {
          visited[n] = 1;
          fillQueue.push(n);
        }
      }
    }
  }
}

/**
 * Handles image import mode with thresholding, dithering, and outer side transparency
 */
function renderCustomImageMode(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
  width: number,
  height: number
) {
  const img = options.customImage;
  if (!img) return;

  const threshold = options.imageThreshold ?? 128;
  const dithering = options.dithering ?? false;
  const outerMode = options.imageOuterMode ?? 'transparent';
  const clearOuter = options.clearOuterBackground ?? true;
  const imgScale = options.imageScale ?? 1.0;
  const offsetX = options.imageOffsetX ?? 0;

  // 1. Calculate placement
  let dx = 0, dy = 0, dw = width, dh = height;
  if (options.imageFit === 'contain') {
    const baseScale = Math.min(width / img.width, height / img.height) * imgScale;
    dw = Math.max(1, Math.round(img.width * baseScale));
    dh = Math.max(1, Math.round(img.height * baseScale));
    dx = Math.round((width - dw) / 2 + offsetX);
    dy = Math.round((height - dh) / 2);
  } else if (options.imageFit === 'cover') {
    const baseScale = Math.max(width / img.width, height / img.height) * imgScale;
    dw = Math.max(1, Math.round(img.width * baseScale));
    dh = Math.max(1, Math.round(img.height * baseScale));
    dx = Math.round((width - dw) / 2 + offsetX);
    dy = Math.round((height - dh) / 2);
  } else {
    // stretch
    dw = width;
    dh = height;
    dx = 0;
    dy = 0;
  }

  // 2. Offscreen render for exact image dimensions
  const offCanvas = document.createElement('canvas');
  offCanvas.width = dw;
  offCanvas.height = dh;
  const offCtx = offCanvas.getContext('2d');
  if (!offCtx) return;

  offCtx.drawImage(img, 0, 0, dw, dh);
  const imgData = offCtx.getImageData(0, 0, dw, dh);
  const data = imgData.data;

  // 3. Grayscale luminance
  const grays = new Float32Array(dw * dh);
  for (let i = 0; i < grays.length; i++) {
    const idx = i * 4;
    grays[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  // 4. Floyd-Steinberg Dithering
  if (dithering) {
    for (let y = 0; y < dh; y++) {
      for (let x = 0; x < dw; x++) {
        const i = y * dw + x;
        const oldVal = grays[i];
        const newVal = oldVal > threshold ? 255 : 0;
        grays[i] = newVal;
        const error = oldVal - newVal;

        if (x + 1 < dw) grays[y * dw + (x + 1)] += (error * 7) / 16;
        if (y + 1 < dh) {
          if (x - 1 >= 0) grays[(y + 1) * dw + (x - 1)] += (error * 3) / 16;
          grays[(y + 1) * dw + x] += (error * 5) / 16;
          if (x + 1 < dw) grays[(y + 1) * dw + (x + 1)] += (error * 1) / 16;
        }
      }
    }
  }

  // 5. Initialize full 288x72 canvas buffer
  const outData = ctx.createImageData(width, height);
  const out = outData.data;

  // Initialize the entire 288x72 canvas buffer with the outer side color!
  // By default (outerMode === 'transparent'), fill with Pure Green (#00FF00)
  // so the outer sides are 100% transparent in Betaflight!
  let outerR = 0, outerG = 255, outerB = 0;
  if (outerMode === 'black') {
    outerR = 0; outerG = 0; outerB = 0;
  } else if (outerMode === 'white') {
    outerR = 255; outerG = 255; outerB = 255;
  }

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    out[idx] = outerR;
    out[idx + 1] = outerG;
    out[idx + 2] = outerB;
    out[idx + 3] = 255;
  }

  // 6. Draw image pixels into canvas buffer
  const transparentTarget = options.imageTransparentColor ?? 'green';

  for (let y = 0; y < dh; y++) {
    const targetY = dy + y;
    if (targetY < 0 || targetY >= height) continue;

    for (let x = 0; x < dw; x++) {
      const targetX = dx + x;
      if (targetX < 0 || targetX >= width) continue;

      const srcI = y * dw + x;
      const val = dithering ? (grays[srcI] > 127 ? 255 : 0) : (grays[srcI] > threshold ? 255 : 0);
      const isBright = options.invert ? val === 0 : val === 255;
      const destIdx = (targetY * width + targetX) * 4;
      const sourceIdx = srcI * 4;
      // Preserve existing transparency before luminance quantization. Pure green is
      // the Betaflight key; treating it as bright gray can erase an imported logo.
      if (data[sourceIdx + 3] < 128 ||
          (data[sourceIdx] === 0 && data[sourceIdx + 1] === 255 && data[sourceIdx + 2] === 0)) {
        out[destIdx] = 0; out[destIdx + 1] = 255; out[destIdx + 2] = 0;
        continue;
      }

      if (transparentTarget === 'green') {
        if (isBright) {
          out[destIdx] = 255; out[destIdx + 1] = 255; out[destIdx + 2] = 255; // White
        } else {
          out[destIdx] = 0; out[destIdx + 1] = 255; out[destIdx + 2] = 0; // Pure Green
        }
      } else if (transparentTarget === 'black') {
        if (isBright) {
          out[destIdx] = 255; out[destIdx + 1] = 255; out[destIdx + 2] = 255;
        } else {
          out[destIdx] = 0; out[destIdx + 1] = 0; out[destIdx + 2] = 0;
        }
      } else {
        // white transparent
        if (isBright) {
          out[destIdx] = 0; out[destIdx + 1] = 255; out[destIdx + 2] = 0;
        } else {
          out[destIdx] = 0; out[destIdx + 1] = 0; out[destIdx + 2] = 0;
        }
      }
    }
  }

  // 7. If clearOuterBackground is true, flood fill any background connected to borders into Green (#00FF00)
  if (clearOuter) {
    floodFillBordersToGreen(out, width, height);
  }

  ctx.putImageData(outData, 0, 0);
}
