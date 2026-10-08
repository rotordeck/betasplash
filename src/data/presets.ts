export interface SplashPreset {
  id: string;
  name: string;
  category: string;
  callsign: string;
  subtitle: string;
  fontId: string;
  fontSize: number;
  letterSpacing: number;
  emblem: string;
  emblemPosition: 'left' | 'right' | 'center' | 'none';
  frameStyle: 'brackets' | 'rails' | 'hazard' | 'hex' | 'box' | 'dots' | 'none';
  colorMode: 'green_bg' | 'black_bg' | 'stencil_green';
  invert: boolean;
  textEffect?: 'none' | 'outline' | 'shadow-3d' | 'bevel';
  outlineWidth?: number;
  italic?: boolean;
}

export const SPLASH_PRESETS: SplashPreset[] = [
  {
    id: 'apex-racer',
    name: 'Apex Velocity 3D',
    category: 'Racing',
    callsign: 'APEX RACER',
    subtitle: '6S FREESTYLE // 180 KM/H',
    fontId: 'faster-one',
    fontSize: 32,
    letterSpacing: 2,
    emblem: 'propeller',
    emblemPosition: 'left',
    frameStyle: 'rails',
    colorMode: 'green_bg',
    invert: false,
    textEffect: 'shadow-3d',
    outlineWidth: 2,
    italic: true,
  },
  {
    id: 'cyber-hud',
    name: 'Cyber HUD Bevel',
    category: 'Cyberpunk',
    callsign: 'NIGHTHAWK',
    subtitle: 'VTX: 5.8G // CH:R8 • 1000Hz',
    fontId: 'orbitron',
    fontSize: 27,
    letterSpacing: 3,
    emblem: 'crosshair',
    emblemPosition: 'left',
    frameStyle: 'brackets',
    colorMode: 'green_bg',
    invert: false,
    textEffect: 'bevel',
    outlineWidth: 2,
    italic: false,
  },
  {
    id: 'retro-arcade',
    name: '8-Bit Pixel Arcade',
    category: 'Pixel',
    callsign: 'RETRO 99',
    subtitle: 'INSERT COIN • 1UP READY',
    fontId: 'press-start',
    fontSize: 20,
    letterSpacing: 1,
    emblem: 'quad',
    emblemPosition: 'left',
    frameStyle: 'dots',
    colorMode: 'green_bg',
    invert: false,
    textEffect: 'shadow-3d',
    outlineWidth: 2,
    italic: false,
  },
  {
    id: 'military-recon',
    name: 'Ghost Stencil Outline',
    category: 'Military',
    callsign: 'GHOST-01',
    subtitle: 'SYSTEM ARMED • BATT 100%',
    fontId: 'black-ops-one',
    fontSize: 30,
    letterSpacing: 2,
    emblem: 'skull',
    emblemPosition: 'left',
    frameStyle: 'hazard',
    colorMode: 'green_bg',
    invert: false,
    textEffect: 'outline',
    outlineWidth: 2,
    italic: false,
  },
  {
    id: 'stealth-wing',
    name: 'Aero Interceptor Slant',
    category: 'Clean',
    callsign: 'VORTEX FPV',
    subtitle: 'BF 4.5.1 // MOTOR DSHOT600',
    fontId: 'michroma',
    fontSize: 23,
    letterSpacing: 3,
    emblem: 'wings',
    emblemPosition: 'left',
    frameStyle: 'hex',
    colorMode: 'green_bg',
    invert: false,
    textEffect: 'outline',
    outlineWidth: 2,
    italic: true,
  },
  {
    id: 'high-voltage',
    name: 'High Voltage 3D Bolt',
    category: 'Aggressive',
    callsign: 'VOLTAGE 6S',
    subtitle: '2207 1950KV • FULL THROTTLE',
    fontId: 'chakra-petch',
    fontSize: 30,
    letterSpacing: 1,
    emblem: 'lightning',
    emblemPosition: 'left',
    frameStyle: 'brackets',
    colorMode: 'green_bg',
    invert: false,
    textEffect: 'bevel',
    outlineWidth: 2,
    italic: true,
  },
  {
    id: 'goggles-view',
    name: 'FPV Pilot Division',
    category: 'Clean',
    callsign: 'SKY REAPER',
    subtitle: 'ELRS 2.4G • PACK VOLTS: 25.2V',
    fontId: 'oxanium',
    fontSize: 27,
    letterSpacing: 2,
    emblem: 'goggles',
    emblemPosition: 'left',
    frameStyle: 'box',
    colorMode: 'green_bg',
    invert: false,
    textEffect: 'outline',
    outlineWidth: 2,
    italic: false,
  }
];

export const INSPIRATION_CALLSIGNS = [
  'BETAFLIGHT', 'SKY REAPER', 'NIGHTHAWK', 'CYBER ROTOR',
  'APEX RACER', 'VIPER-01', 'PHANTOM FPV', 'RED SQUADRON',
  'HYPERDRIVE', 'VORTEX 5"', 'GHOST WING', 'TITAN-X',
  'DRIFT KING', 'BLACKOUT', 'THUNDERBIRD', 'ROTOR RIOT',
  'PROP KILLER', 'SHADOW RACER', 'AERO CYBORG', 'OVERDRIVE'
];

export const INSPIRATION_SUBTITLES = [
  'v4.5.1 READY • F722',
  '6S FREESTYLE • ELRS 1W',
  'VTX 5.8G // RACE CH:8',
  'SYSTEM ARMED • BATT 100%',
  'PILOT 04 // 2500KV',
  'INSERT COIN // LVL 99',
  'ARMED & DANGEROUS',
  'ELRS 1000Hz • 250mW',
  'SPEED DEMON // 190 KM/H',
  'BANDO BASHING DIVISION',
  'PACK VOLTS: 25.2V • 6S',
  'HD ZERO // 720P 60FPS'
];

export interface EmblemDef {
  id: string;
  name: string;
  description: string;
}

export const EMBLEMS: EmblemDef[] = [
  { id: 'quad', name: 'Quadcopter', description: '4-rotor racing drone outline' },
  { id: 'propeller', name: 'Tri-Prop', description: 'Tri-blade high-pitch propeller' },
  { id: 'crosshair', name: 'HUD Reticle', description: 'Targeting lock crosshair' },
  { id: 'wings', name: 'Aero Wings', description: 'Supersonic pilot wings badge' },
  { id: 'goggles', name: 'FPV Goggles', description: 'Analog/Digital goggles silhouette' },
  { id: 'lightning', name: 'Voltage Bolt', description: 'High-voltage lightning strike' },
  { id: 'skull', name: 'Cyber Skull', description: 'Aggressive pilot cyber skull' },
  { id: 'radio', name: 'ELRS Radio', description: 'RF transmission signal waves' },
  { id: 'none', name: 'No Icon', description: 'Text-only layout' },
];

export const FRAME_STYLES = [
  { id: 'none', name: 'Seamless None', desc: 'Floating logo over camera feed' },
  { id: 'brackets', name: 'HUD Brackets', desc: 'Military HUD corner angle brackets' },
  { id: 'rails', name: 'Speed Rails', desc: 'Dual horizontal technical meter lines' },
  { id: 'hazard', name: 'Hazard Stripes', desc: 'Caution angle stripes along edges' },
  { id: 'hex', name: 'Hex Shield', desc: 'Hexagonal chamfered border' },
  { id: 'box', name: 'Crisp Box', desc: 'Thin high-contrast frame' },
  { id: 'dots', name: 'Pixel Border', desc: 'Retro 8-bit dotted perimeter' },
] as const;
