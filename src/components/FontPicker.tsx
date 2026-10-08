import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { FONT_CATALOG, type CatalogFont } from '../data/fontCatalog';
import { FONT_CATEGORIES, type GoogleFontOption } from '../data/fonts';
import { cx, inputField } from './ui';

export const catalogFontOption = (font: CatalogFont): GoogleFontOption => ({
  id: `font-${font.name}`, name: font.name, family: `'${font.name}', sans-serif`,
  weight: font.weight, category: font.category, tag: font.tags[0], description: font.tags.join(', '),
});

/** The family name a font option renders with, e.g. "Orbitron". */
export const familyName = (font: GoogleFontOption) => font.family.match(/'([^']+)'/)?.[1] ?? font.name;

/**
 * One list of the 40 curated fonts, previewed with the pilot's own text.
 * Font files come from fontFaces.css and download only once a preview renders.
 */
export function FontPicker({ sample, italic, selected, onSelect }: {
  sample: string; italic: boolean; selected: GoogleFontOption; onSelect: (font: GoogleFontOption) => void;
}) {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const current = familyName(selected);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONT_CATALOG.filter(font => (category === 'all' || font.category === category)
      && (!q || `${font.name} ${font.tags.join(' ')}`.toLowerCase().includes(q)));
  }, [category, query]);
  return <div className='space-y-3'>
    <div className='relative'>
      <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint' aria-hidden='true' />
      <input type='search' aria-label='Search fonts by name or style' placeholder='Search fonts or styles…' value={query}
        onChange={e => setQuery(e.target.value)} className={cx(inputField, 'pl-9 text-[13px]')} />
    </div>
    <div role='group' aria-label='Font style' className='flex flex-wrap gap-1.5'>
      {FONT_CATEGORIES.map(cat => <button key={cat.id} type='button' aria-pressed={category === cat.id} onClick={() => setCategory(cat.id)}
        className={cx('rounded-full border px-3 py-1 text-xs font-semibold transition',
          category === cat.id ? 'border-lime bg-lime text-ground' : 'border-line text-muted hover:border-line-strong hover:text-ink')}>
        {cat.id === 'all' ? 'All' : cat.label}
      </button>)}
    </div>
    <div role='listbox' aria-label='Fonts' className='bs-scroll max-h-[340px] space-y-1.5 overflow-y-auto rounded-md border border-line bg-well p-1.5'>
      {results.map(font => {
        const active = font.name === current;
        return <button key={font.name} type='button' role='option' aria-selected={active} onClick={() => onSelect(catalogFontOption(font))}
          className={cx('block w-full rounded-[5px] border px-3 py-2.5 text-left transition',
            active ? 'border-lime bg-lime/[0.07]' : 'border-transparent hover:border-line-strong hover:bg-panel-2')}>
          <span className='flex items-baseline justify-between gap-3'>
            <span className={cx('text-xs font-semibold', active ? 'text-lime' : 'text-muted')}>{font.name}</span>
            <span className='truncate text-[11px] text-faint'>{font.tags.slice(0, 2).join(' · ')}</span>
          </span>
          <span className={cx('mt-1 block truncate text-[22px] leading-tight text-ink', italic && 'italic')}
            style={{ fontFamily: `'${font.name}'`, fontWeight: font.weight }}>{sample.trim() || 'CALLSIGN'}</span>
        </button>;
      })}
      {!results.length && <p className='px-3 py-6 text-center text-xs text-muted'>No fonts match. Try another style or search.</p>}
    </div>
    <p className='text-xs text-muted' aria-live='polite'>{results.length} of {FONT_CATALOG.length} fonts · from Google Fonts</p>
  </div>;
}
