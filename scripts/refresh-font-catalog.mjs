import { readFile, writeFile } from 'node:fs/promises';
import dotenv from 'dotenv';

// Maintainer-only refresh. The generated catalog contains public metadata, never the key.
dotenv.config({ path: ['.env.local', '.env'], quiet: true });
const selection = JSON.parse(await readFile(new URL('./font-selection.json', import.meta.url), 'utf8'));
let data;
if (process.argv[2]) {
  data = JSON.parse(await readFile(process.argv[2], 'utf8'));
} else {
  if (!process.env.GOOGLE_FONTS_API_KEY) throw new Error('Set GOOGLE_FONTS_API_KEY in .env.local to refresh the snapshot.');
  const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?capability=FAMILY_TAGS&capability=WOFF2', {
    headers: { 'X-Goog-Api-Key': process.env.GOOGLE_FONTS_API_KEY }, signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Catalog refresh failed: HTTP ${response.status}`);
  data = await response.json();
}
const upstream = new Map(data.items.map(font => [font.family, font]));
const fonts = selection.map(choice => {
  const font = upstream.get(choice.name);
  if (!font) throw new Error(`Missing family: ${choice.name}`);
  const variant = font.files[choice.weight] ? choice.weight : 'regular';
  const url = new URL(font.files[variant]);
  if (url.hostname !== 'fonts.gstatic.com') throw new Error('Unexpected font host');
  url.protocol = 'https:';
  const googleTags = (font.tags || []).flatMap(tag => (tag.name || tag.tag || '').split('/').filter(Boolean).map(tag => tag.toLowerCase()));
  return { ...choice, weight: variant === 'regular' ? '400' : variant, tags: [...new Set([...choice.tags, font.category, ...googleTags])], url: url.toString() };
});
await writeFile(new URL('../src/data/fontCatalog.json', import.meta.url), JSON.stringify(fonts, null, 2) + '\n');
const css = '/* Public Google font URLs; files load only when a family is used. */\n' + fonts.map(font => `@font-face { font-family: '${font.name}'; font-style: normal; font-weight: ${font.weight}; font-display: swap; src: url('${font.url}') format('woff2'); }`).join('\n') + '\n';
await writeFile(new URL('../src/data/fontFaces.css', import.meta.url), css);
console.log(`Saved ${fonts.length} font families. No font files or API keys included.`);
