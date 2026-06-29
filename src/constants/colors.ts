// Justneed — DARK redesign palette (navy + gold). See REDESIGN.md §1.
// Dark "swipe-to-apply" direction. New `dark.*` tokens are the source of truth
// for migrated screens; legacy semantic keys are remapped to dark equivalents
// so the shared UI kit and any not-yet-polished screen render dark and cohesive.

// ── Dark redesign tokens (preferred for new/migrated UI) ──────────────
export const dark = {
  bg: '#0E1022', // app background (near-black navy)
  bgDeep: '#0B0D1C', // canvas / behind cards
  surface: '#1B1F3B', // card surface
  surfaceElev: '#23284C', // raised / stacked card
  surfaceSubtle: 'rgba(255,255,255,0.05)', // chips, inputs, soft fills
  border: 'rgba(255,255,255,0.07)', // hairline borders

  gold: '#D4A574', // primary accent / CTA
  goldSoft: '#E0B98A', // gold text on dark
  goldDark: '#C2925F',
  goldTint: 'rgba(212,165,116,0.12)', // icon tiles / soft gold fills

  textPrimary: '#F4F2EE', // headings / body
  textSecondary: '#9AA0B8', // sub-labels
  textMuted: '#6B7194', // captions / meta

  match: '#58C9A2', // match score / success (teal-green)
  matchSoft: '#7FD6B7', // match text on dark
  matchTrack: 'rgba(255,255,255,0.10)', // match-ring remainder

  danger: '#E0648A', // skip / reject (rose)
  dangerSoft: '#EC8AA8',

  tabInactive: '#5A6080',
} as const;

export const gradients = {
  // Swipe card (Option B · Editorial) surface.
  card: ['#20254A', '#161A33'] as const,
  // Onboarding / radial-ish hero (RN has no radial; use a steep linear).
  hero: ['#1A1F40', '#0E1022'] as const,
  heroDeep: ['#23284C', '#0E1022', '#0B0D1C'] as const,
  gold: ['#E0B98A', '#D4A574', '#C2925F'] as const,
};

// Match-score → color band (REDESIGN.md §4).
export const matchColor = (score?: number): string =>
  score == null ? dark.textMuted : score >= 85 ? dark.match : score >= 70 ? dark.gold : dark.textMuted;

export const colors = {
  // ── Dark tokens surfaced on the main object too ──
  bg: dark.bg,
  bgDeep: dark.bgDeep,
  surface: dark.surface,
  surfaceElev: dark.surfaceElev,
  surfaceSubtle: dark.surfaceSubtle,
  border: dark.border,
  gold: dark.gold,
  goldSoft: dark.goldSoft,
  goldDark: dark.goldDark,
  goldTint: dark.goldTint,
  textPrimary: dark.textPrimary,
  textMuted: dark.textMuted,
  match: dark.match,
  matchSoft: dark.matchSoft,
  matchTrack: dark.matchTrack,
  tabInactive: dark.tabInactive,

  // ── Brand anchors (kept) ──
  indigo: '#1B1F3B',
  indigoElev: dark.surfaceElev,
  // `ink` was the darkest TEXT color in the light theme → on dark it must be
  // light so all that body text stays readable. (palette.ink stays dark for
  // the SkillIdHero inner disc.)
  ink: dark.textPrimary,

  // ── Legacy semantic keys → remapped to DARK so the whole app shifts ──
  primary: dark.gold, // primary CTA is now GOLD on dark
  primaryDark: dark.goldDark,
  primaryLight: dark.goldTint,

  accent: dark.gold,
  accentDark: dark.goldDark,

  success: dark.match,
  error: dark.danger,
  warning: dark.gold,
  info: dark.match,
  danger: dark.danger,

  // Neutrals remapped to the dark ramp (dark → light)
  white: '#FFFFFF',
  black: '#000000',
  gray50: dark.surface,
  gray100: dark.surfaceElev,
  gray200: 'rgba(255,255,255,0.10)',
  gray300: 'rgba(255,255,255,0.16)',
  gray400: dark.textMuted,
  gray500: dark.textSecondary,
  gray600: '#7E84A0',
  gray700: '#9AA0B8',
  gray800: '#C7CBDD',
  gray900: dark.textPrimary,

  // Surfaces
  background: dark.bg,
  card: dark.surface,
  line: dark.border,

  // Text
  text: dark.textPrimary,
  textSecondary: dark.textSecondary,

  // Misc
  cream: dark.textPrimary, // legacy "cream" usages were light text/bg on light;
  // mapped to primary text so they read on dark. Migrate off `cream` per screen.
  muted: dark.textSecondary,
  slate: dark.textSecondary,
  mutedBlue: dark.textMuted,
  teal: dark.match,
  tealBright: dark.matchSoft,
  emerald: dark.match,
  tintIndigo: dark.surfaceSubtle,
  tintIndigoLine: dark.border,
  cream2: dark.surfaceElev,
  cream3: dark.surfaceElev,
  cream4: dark.border,
  indigo700: '#252B47',
  indigoBlue: '#232A60',
  indigoMid: '#5560A8',

  transparent: 'transparent',
  overlay: 'rgba(8, 10, 24, 0.72)',
};

// Back-compat: some modules (e.g. SkillIdHero) import { palette } and reference
// brand keys. Keep them resolvable on the dark theme.
export const palette = {
  ...dark,
  indigo: '#1B1F3B',
  indigoElev: dark.surfaceElev,
  indigoBlueHi: '#2A3270',
  indigoMid: '#5560A8',
  teal: dark.match,
  tealBright: dark.matchSoft,
  ink: '#0B0D1C',
};
