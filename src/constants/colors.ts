// Justneed.ai palette — values verified against the live justneed.ai stylesheet.
// Saturn (indigo) / Jupiter (gold) / Moon (cream) / Mercury (teal·verified).
//
// Existing semantic keys (primary, accent, background, text, etc.) are
// preserved and remapped to spec colors so existing screens shift palette
// without code changes.

export const palette = {
  // Indigo (Saturn) — brand primary + dark surfaces
  indigo: '#1B1F3B',
  indigoElev: '#2A3052', // card surface / pill background
  indigo700: '#252B47',
  indigoBlue: '#232A60', // bluer indigo used in hero gradients
  indigoBlueHi: '#2A3270',
  indigoMid: '#5560A8', // decorative mid-indigo (orbits, accents)

  // Gold (Jupiter) — accent
  gold: '#D4A574',
  goldSoft: '#E8CCA8',
  goldDark: '#C29360',
  goldDeep: '#9D7340',

  // Cream (Moon) — light surfaces
  cream: '#F8F4ED',
  cream2: '#F1ECDF',
  cream3: '#F0E9DC',
  cream4: '#E8E0D0',

  // Teal / verified (Mercury)
  teal: '#6FB7A8',
  tealBright: '#5EEAD4',
  emerald: '#10B981',

  // Light indigo tints (badge surfaces on cream)
  tintIndigo: '#EFF1FA',
  tintIndigoLine: '#DDE0F2',

  // Neutrals / text
  ink: '#0E1126',
  slate: '#5A6376',
  mutedBlue: '#94A0B8',
  muted: '#6B6F85',
  line: '#D9D5CC',
  danger: '#C2462E',
} as const;

export const gradients = {
  // Hero / login / card. Mirror to 225deg when I18nManager.isRTL is true.
  hero: ['#2A3270', '#1B1F3B'] as const,
  heroDeep: ['#232A60', '#1B1F3B', '#0E1126'] as const,
  // Gold sheen for primary buttons / verified badges.
  gold: ['#E8CCA8', '#D4A574', '#C29360'] as const,
};

export const colors = {
  // --- Spec tokens (preferred for new code) ---
  indigo: palette.indigo,
  indigoElev: palette.indigoElev,
  indigo700: palette.indigo700,
  indigoBlue: palette.indigoBlue,
  indigoMid: palette.indigoMid,

  gold: palette.gold,
  goldSoft: palette.goldSoft,
  goldDark: palette.goldDark,
  goldDeep: palette.goldDeep,

  cream: palette.cream,
  cream2: palette.cream2,
  cream3: palette.cream3,
  cream4: palette.cream4,

  teal: palette.teal,
  tealBright: palette.tealBright,
  emerald: palette.emerald,

  tintIndigo: palette.tintIndigo,
  tintIndigoLine: palette.tintIndigoLine,

  ink: palette.ink,
  slate: palette.slate,
  mutedBlue: palette.mutedBlue,
  muted: palette.muted,
  line: palette.line,
  danger: palette.danger,

  // --- Legacy semantic keys remapped to spec ---
  primary: palette.indigo,
  primaryDark: '#0E1126',
  // Light tint of primary — used as a soft surface behind primary-colored
  // text (badges, action buttons). MUST be a light value so dark indigo
  // text stays readable on it.
  primaryLight: palette.tintIndigo,

  accent: palette.gold,
  accentDark: palette.goldDark,

  success: palette.emerald,
  error: palette.danger,
  warning: '#D89B5B', // score-mid band
  info: palette.teal,

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray50: palette.cream,
  gray100: palette.cream2,
  gray200: palette.line,
  gray300: '#C3BEB3',
  gray400: '#9B9789',
  gray500: palette.muted,
  gray600: '#55586B',
  gray700: '#3A3F5C',
  gray800: palette.indigoElev,
  gray900: palette.ink,

  // Surfaces
  background: palette.cream,
  card: '#FFFFFF',

  // Text
  text: palette.ink,
  textSecondary: palette.slate,

  // Misc
  transparent: 'transparent',
  overlay: 'rgba(14, 17, 38, 0.6)',
};
