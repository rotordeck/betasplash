/**
 * Betaflight OSD Splash Screen BMP Generator
 * 
 * Strict specifications for Betaflight:
 * - Resolution: Exactly 288 x 72 pixels
 * - Color Palette: ONLY 3 colors:
 *     - Black: RGB(0, 0, 0)
 *     - White: RGB(255, 255, 255)
 *     - Green: RGB(0, 255, 0) -> Interpreted as TRANSPARENT by Betaflight OSD
 * - File format: 24-bit Windows Bitmap (.BMP) uncompressed, bottom-up
 * - File size: Exactly 62,262 bytes (54 header bytes + 62,208 pixel bytes)
 */

export interface ColorStats {
  black: number;
  white: number;
  green: number;
  invalid: number;
  total: number;
}

export type BetaflightColor = 'white' | 'black' | 'green';

/**
 * Quantizes an RGB color to one of the 3 allowed Betaflight colors:
 * Black (0,0,0), White (255,255,255), Green (0,255,0)
 */
export function quantizeToBetaflight(
  r: number,
  g: number,
  b: number,
  transparencyMode: 'green_bg' | 'black_bg' | 'white_bg' = 'green_bg',
  threshold = 128
): [number, number, number] {
  // If pixel is already distinctly green
  if (g > 150 && g > r * 1.5 && g > b * 1.5) {
    return [0, 255, 0];
  }

  // Calculate luminance
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;

  if (transparencyMode === 'green_bg') {
    // Standard Betaflight splash: dark/black or transparent background, bright white text
    if (lum > threshold) {
      return [255, 255, 255];
    } else {
      return [0, 255, 0]; // Background transparent green
    }
  } else if (transparencyMode === 'white_bg') {
    if (lum > threshold) {
      return [255, 255, 255];
    } else {
      return [0, 0, 0];
    }
  } else {
    // black_bg
    if (lum > threshold) {
      return [255, 255, 255];
    } else {
      return [0, 0, 0];
    }
  }
}

/**
 * Verifies that all pixels in an ImageData strictly match the 3 Betaflight colors
 */
export function auditBetaflightCanvas(ctx: CanvasRenderingContext2D, width = 288, height = 72): ColorStats {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const stats: ColorStats = { black: 0, white: 0, green: 0, invalid: 0, total: width * height };

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r === 0 && g === 0 && b === 0) {
      stats.black++;
    } else if (r === 255 && g === 255 && b === 255) {
      stats.white++;
    } else if (r === 0 && g === 255 && b === 0) {
      stats.green++;
    } else {
      stats.invalid++;
    }
  }

  return stats;
}

/**
 * Strictly clamps and enforces pure 3-color palette on a canvas
 */
export function enforceStrict3Colors(
  ctx: CanvasRenderingContext2D,
  width = 288,
  height = 72
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if close to pure green
    if (g > 180 && r < 80 && b < 80) {
      data[i] = 0;
      data[i + 1] = 255;
      data[i + 2] = 0;
    } else {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      if (gray > 127) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      } else {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      }
    }
    data[i + 3] = 255; // solid alpha
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Generates a 24-bit Windows BMP ArrayBuffer strictly matching Betaflight specifications
 */
export function createBetaflightBMP(ctx: CanvasRenderingContext2D, width = 288, height = 72): ArrayBuffer {
  // First ensure pixels are strictly 3-color
  enforceStrict3Colors(ctx, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const rowSize = Math.floor((24 * width + 31) / 32) * 4; // 864 bytes for 288px
  const pixelArraySize = rowSize * height; // 62208 bytes
  const fileSize = 54 + pixelArraySize; // 62262 bytes

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // --- BITMAPFILEHEADER (14 bytes) ---
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4D); // 'M'
  view.setUint32(2, fileSize, true); // Total file size
  view.setUint16(6, 0, true); // Reserved
  view.setUint16(8, 0, true); // Reserved
  view.setUint32(10, 54, true); // Offset to pixel data

  // --- BITMAPINFOHEADER (40 bytes) ---
  view.setUint32(14, 40, true); // Header size
  view.setInt32(18, width, true); // Image width
  view.setInt32(22, height, true); // Image height (positive = bottom-up)
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // Bits per pixel (24-bit RGB)
  view.setUint32(30, 0, true); // Compression (0 = BI_RGB uncompressed)
  view.setUint32(34, pixelArraySize, true); // Image size
  view.setInt32(38, 2835, true); // Horizontal resolution: 72 DPI (2835 pixels/meter)
  view.setInt32(42, 2835, true); // Vertical resolution: 72 DPI (2835 pixels/meter)
  view.setUint32(46, 0, true); // Colors in color table
  view.setUint32(50, 0, true); // Important color count

  // --- PIXEL DATA (BGR, Bottom-Up) ---
  let offset = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const srcOffset = (y * width + x) * 4;
      const r = imgData.data[srcOffset];
      const g = imgData.data[srcOffset + 1];
      const b = imgData.data[srcOffset + 2];

      // Exact clamp to one of the 3 colors
      let finalR = 0;
      let finalG = 0;
      let finalB = 0;

      if (r === 0 && g === 255 && b === 0) {
        // Transparent green
        finalG = 255;
      } else if (r === 255 && g === 255 && b === 255) {
        // White
        finalR = 255;
        finalG = 255;
        finalB = 255;
      } else {
        // Black
        finalR = 0;
        finalG = 0;
        finalB = 0;
      }

      // Write BGR
      view.setUint8(offset++, finalB);
      view.setUint8(offset++, finalG);
      view.setUint8(offset++, finalR);
    }
  }

  return buffer;
}

/**
 * Triggers browser download for the BMP file
 */
export function downloadBMPFile(buffer: ArrayBuffer, filename = 'splash.bmp') {
  const blob = new Blob([buffer], { type: 'image/bmp' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
