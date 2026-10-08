export interface GoogleFontOption {
  id: string;
  name: string;
  family: string;
  category: string;
  tag: string;
  weight: string;
  letterSpacing?: string;
  description: string;
}

export const PILOT_GOOGLE_FONTS: GoogleFontOption[] = [
  // --- RACING & SPEED ---
  {
    id: 'faster-one',
    name: 'Faster One',
    family: "'Faster One', cursive",
    category: 'racing',
    tag: 'MAX SPEED',
    weight: '400',
    description: 'Horizontal speed trails depicting extreme velocity and drift.'
  },
  {
    id: 'tourney',
    name: 'Tourney Slanted',
    family: "'Tourney', sans-serif",
    category: 'racing',
    tag: 'COMPETITIVE',
    weight: '900',
    letterSpacing: '1px',
    description: 'Bold angled championship racing aesthetic with high-impact stroke.'
  },
  {
    id: 'russo-one',
    name: 'Russo One',
    family: "'Russo One', sans-serif",
    category: 'racing',
    tag: 'HEAVY BLOCK',
    weight: '400',
    description: 'Heavy aeronautics block typography with aerodynamic bevels.'
  },
  {
    id: 'bruno-ace-sc',
    name: 'Bruno Ace SC',
    family: "'Bruno Ace SC', cursive",
    category: 'racing',
    tag: 'SUPERSONIC',
    weight: '400',
    letterSpacing: '2px',
    description: 'Clean supersonic aerospace caps with sharp corner cuts.'
  },

  // --- CYBERPUNK & SCI-FI ---
  {
    id: 'orbitron',
    name: 'Orbitron 900',
    family: "'Orbitron', sans-serif",
    category: 'cyberpunk',
    tag: 'CYBER HUD',
    weight: '900',
    letterSpacing: '1.5px',
    description: 'The definitive futuristic telemetry and digital cockpit display font.'
  },
  {
    id: 'michroma',
    name: 'Michroma',
    family: "'Michroma', sans-serif",
    category: 'cyberpunk',
    tag: 'AEROSPACE',
    weight: '400',
    letterSpacing: '2px',
    description: 'Ultra-wide aeronautical cockpit gauge style with massive horizontal presence.'
  },
  {
    id: 'audiowide',
    name: 'Audiowide',
    family: "'Audiowide', cursive",
    category: 'cyberpunk',
    tag: 'SYNTH HUD',
    weight: '400',
    letterSpacing: '1px',
    description: 'Angular sci-fi HUD lettering with tech cuts and rounded corners.'
  },
  {
    id: 'goldman',
    name: 'Goldman Bold',
    family: "'Goldman', cursive",
    category: 'cyberpunk',
    tag: 'ROBOTICS',
    weight: '700',
    letterSpacing: '1px',
    description: 'Heavy tactical drone avionics styling with sharp geometric incisions.'
  },

  // --- RETRO PIXEL & ARCADE ---
  {
    id: 'press-start',
    name: 'Press Start 2P',
    family: "'Press Start 2P', monospace",
    category: 'pixel',
    tag: '8-BIT CLASSIC',
    weight: '400',
    letterSpacing: '-1px',
    description: 'Pure 1980s arcade gaming bitmap font, legendary for analog FPV OSDs.'
  },
  {
    id: 'silkscreen',
    name: 'Silkscreen Bold',
    family: "'Silkscreen', monospace",
    category: 'pixel',
    tag: 'CRISP PIXEL',
    weight: '700',
    letterSpacing: '0px',
    description: 'Razor-sharp micro-pixel font engineered for ultra legibility at 72px.'
  },
  {
    id: 'vt323',
    name: 'VT323 Terminal',
    family: "'VT323', monospace",
    category: 'pixel',
    tag: 'CRT TELEMETRY',
    weight: '400',
    letterSpacing: '1px',
    description: 'Monochrome CRT terminal phosphor screen font from the golden age.'
  },
  {
    id: 'share-tech-mono',
    name: 'Share Tech Mono',
    family: "'Share Tech Mono', monospace",
    category: 'pixel',
    tag: 'HACKER MONO',
    weight: '400',
    letterSpacing: '1px',
    description: 'Military hacker telemetry monospace with high-contrast character widths.'
  },

  // --- MILITARY & TACTICAL ---
  {
    id: 'black-ops-one',
    name: 'Black Ops One',
    family: "'Black Ops One', cursive",
    category: 'military',
    tag: 'STENCIL ARMOR',
    weight: '400',
    letterSpacing: '2px',
    description: 'Combat stencil lettering with armored plate cutaways.'
  },
  {
    id: 'chakra-petch',
    name: 'Chakra Petch',
    family: "'Chakra Petch', sans-serif",
    category: 'military',
    tag: 'COMBAT DRONE',
    weight: '700',
    letterSpacing: '1px',
    description: 'Aggressive 45-degree chamfered cuts modeled after combat UAV telemetry.'
  },
  {
    id: 'teko',
    name: 'Teko Bold',
    family: "'Teko', sans-serif",
    category: 'military',
    tag: 'TALL CONDENSED',
    weight: '700',
    letterSpacing: '1px',
    description: 'Ultra tall condensed tactical banner font with commanding presence.'
  },
  {
    id: 'anton',
    name: 'Anton',
    family: "'Anton', sans-serif",
    category: 'military',
    tag: 'MAX IMPACT',
    weight: '400',
    letterSpacing: '1px',
    description: 'Maximum black-weight impact poster typography for instant visibility.'
  },

  // --- CLEAN AERO & INDUSTRIAL ---
  {
    id: 'oxanium',
    name: 'Oxanium ExtraBold',
    family: "'Oxanium', cursive",
    category: 'clean',
    tag: 'HEX TECH',
    weight: '800',
    letterSpacing: '1px',
    description: 'Hexagonal corner chamfers engineered specifically for tech hardware.'
  },
  {
    id: 'rajdhani',
    name: 'Rajdhani Bold',
    family: "'Rajdhani', sans-serif",
    category: 'clean',
    tag: 'AERO SQUARED',
    weight: '700',
    letterSpacing: '1.5px',
    description: 'Squared-off aerodynamic flight display font with sleek proportions.'
  },
  {
    id: 'syne',
    name: 'Syne ExtraBold',
    family: "'Syne', sans-serif",
    category: 'clean',
    tag: 'MODERN RACER',
    weight: '800',
    letterSpacing: '0.5px',
    description: 'Contemporary avant-garde racing team typography.'
  },
  {
    id: 'righteous',
    name: 'Righteous',
    family: "'Righteous', cursive",
    category: 'clean',
    tag: 'RETRO FUTURE',
    weight: '400',
    letterSpacing: '1px',
    description: 'Curved streamlined Art Deco meets cyber aero aerodynamics.'
  }
];

export const FONT_CATEGORIES = [
  { id: 'all', label: 'All Fonts' },
  { id: 'racing', label: 'Racing & Speed' },
  { id: 'cyberpunk', label: 'Cyber & Sci-Fi' },
  { id: 'pixel', label: 'Retro 8-Bit' },
  { id: 'military', label: 'Military Tactical' },
  { id: 'clean', label: 'Clean Aero' },
] as const;
