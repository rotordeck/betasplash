import React, { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { cx } from './ui';

/** Load a user file as an image. The object URL is revoked once decoded. */
export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Unreadable image')); };
    img.src = url;
  });
}

/** Click or drop an image. Reports a friendly error for files the browser cannot decode. */
export function ImageDrop({ label, loaded, onImage, compact = false }: {
  label: string; loaded?: HTMLImageElement | null; onImage: (img: HTMLImageElement) => void; compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const accept = async (file?: File) => {
    if (!file) return;
    setError('');
    try { onImage(await loadImageFile(file)); }
    catch { setError('Could not open this image. Try a PNG, JPG, SVG or BMP file.'); }
  };
  return <div>
    <input ref={input} type='file' accept='image/*' aria-label={label} className='sr-only' tabIndex={-1}
      onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; void accept(file); }} />
    <button
      type='button'
      onClick={() => input.current?.click()}
      onDragOver={e => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={e => { e.preventDefault(); setOver(false); void accept(e.dataTransfer.files?.[0]); }}
      className={cx(
        'flex w-full items-center gap-3 rounded-md border border-dashed text-left transition',
        compact ? 'px-3 py-3' : 'px-4 py-5',
        over ? 'border-lime bg-lime/10' : 'border-line-strong bg-well hover:border-lime',
      )}
    >
      <ImagePlus className='h-5 w-5 shrink-0 text-lime' aria-hidden='true' />
      <span className='min-w-0'>
        <span className='block text-[13px] font-semibold text-ink'>{loaded ? 'Replace image' : label}</span>
        <span className='block truncate text-xs text-muted'>
          {loaded ? `Loaded: ${loaded.naturalWidth}×${loaded.naturalHeight}px` : 'Click or drop a PNG, JPG, SVG or BMP'}
        </span>
      </span>
    </button>
    {error && <p role='alert' className='mt-2 text-xs text-danger'>{error}</p>}
  </div>;
}
