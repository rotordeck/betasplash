# Betasplash

A static Betaflight OSD boot logo editor with text, presets, custom emblems, image
conversion, and BMP/PNG export. Published at https://rotordeck.com/betasplash/.

## Look and layout

The UI follows the Rotordeck design language: dark olive ground, lime accent,
monospace eyebrows, tight bold headings. Colors are Tailwind theme tokens in
`src/index.css` (`ground`, `panel`, `line`, `ink`, `muted`, `lime`, …) that read
Rotordeck's shared CSS variables (`--ground`, `--lime`, …) when embedded and fall
back to the same values standalone. Don't use raw hex colors or Tailwind's
default palette in components. The bitmap palette (white, black, `#00FF00`)
lives in the renderer and is independent of the UI colors.

The page is a short intro, then the editor: controls on the left (Design,
Presets, Image), with the preview and download on the right. The preview stays
in view while you scroll on desktop. Design is split into numbered steps: text,
font, style, frame, emblem, background. Presets apply a style to your own text.
The preview has three views: Goggles (an analog boot screen with camera, dark or
bright sky), Bitmap (the exact export) and Tiles (the 12×18 px OSD character
cells). Below the editor, an install guide explains Betaflight Configurator's Font
Manager. Ctrl/Cmd+S downloads the BMP.

## Rotordeck integration

`../rotordeck/scripts/integrate-betasplash.py` builds this source with
`/betasplash/` as the base. It only adapts `index.html` (title, header, footer,
canonical URL) and expects `<body>` and the `<title>`/`og:title` text exactly as
written here. Change them in both places. `App.tsx` is built unchanged. Keep page
containers on `.bs-container` so they line up with the Rotordeck header.

## Run and deploy

- `npm install`
- `npm run dev` — local development on port 3001.
- `npm run build` — produces the static site in `dist/`.
- Upload the contents of `dist/` to any static host. No Node server, API route,
  API key, or environment variables are needed by the deployed site.
- `npm start` — preview the built site locally.
- `npm test` — unit tests (run `npm run build` first; one test inspects `dist/`).
- `npm run lint` — type-check.

## Fonts

The site includes a metadata snapshot of 40 deliberately varied families:
racing, cyberpunk, pixel, military/stencil, and clean/condensed styles. Browse by
name or tags and preview your callsign. Tags combine our curated styles with
Google's category/style metadata.

Font binaries are not bundled. `src/data/fontFaces.css` declares public WOFF2
files on Google's servers. The browser downloads a font once a preview uses it,
and caches it. The catalog works without an API key, but font downloads require
internet access. The font list in the editor previews all 40 families with your
callsign.

### Optional maintainer refresh

Edit `scripts/font-selection.json` to curate the selection. Put a Google Fonts
API key in the ignored `.env.local`, then run `npm run fonts:refresh`. This
updates the checked-in metadata snapshot. The key is only used by the refresh
script and is never included in the site. Font family names remain unchanged.

## Custom emblems

Under **05 Emblem**, click or drop a logo to place it left, right or above your
callsign. Threshold, dithering, inversion, colors and background removal reuse
the Image tab's conversion engine. The full image and the custom emblem keep
separate images and conversion settings.

## Startup wizard

On opening the app, enter a callsign and an optional smaller line, choose one to
six fonts, and generate 42 splash previews. The gallery combines centered text with frames,
text effects, and backgrounds without emblems or images, while keeping your text and selected
fonts. Text sizes are fitted to the available space. Selecting a thumbnail
copies its settings into the editor. Use Back, Shuffle 42 more, or Skip to
editor. **Start with your name** in the intro reopens the wizard with your current text.
Font loading errors leave the wizard open so you can retry or change fonts.

## Frequently asked questions

### How do I change the Betaflight boot logo?

Design it on [rotordeck.com/betasplash](https://rotordeck.com/betasplash/), download the 288×72 BMP and load it in Betaflight Configurator's Font Manager as the logo. The page has an install guide below the editor.

### Can I put my callsign on the OSD start screen?

Yes, that's what Betasplash is for: type your callsign, pick a font, style, frame and emblem, and check it in the goggles preview before you export.

### Can I turn my own image into a Betaflight OSD logo?

Yes. Import an image and Betasplash converts it to the OSD's three colours (white, black and transparent) at 288×72, the exact size the logo needs.

## More free FPV tools from Rotordeck

- [Sticklink](https://rotordeck.com/sticklink/): live stick and telemetry overlays for OBS, straight from an EdgeTX radio
- [Stickbeats](https://rotordeck.com/stickbeats/): free EdgeTX sound themes and voice packs, with a mixer to record your own
- [OSD Fonts](https://rotordeck.com/osd-fonts/): 278 retro fonts and a font editor for the Betaflight analog OSD
- [bf](https://rotordeck.com/bf/): configure Betaflight from the command line, for humans and AI agents
- [Rotordeck skills](https://github.com/rotordeck/skills): Agent Skills that teach Claude Code and other agents to set up Betaflight

All of them in one place: the [Rotordeck Toy Box](https://rotordeck.com/toybox/).

## License

Apache License 2.0. See `LICENSE`. Fonts used in the artwork load from Google Fonts under their own licenses.
