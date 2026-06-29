import { TextStyle } from 'react-native';
import { scaleCapped } from '../utils/responsive';

// Justneed DARK redesign type system (REDESIGN.md §1).
// Display = Plus Jakarta Sans (600/700/800) for titles, logo, big numbers.
// UI / body = Inter (400/700).

const REGULAR = 'Inter_400Regular';
const BOLD = 'Inter_700Bold';
const DISPLAY = 'PlusJakartaSans_800ExtraBold';
const DISPLAY_BOLD = 'PlusJakartaSans_700Bold';
const DISPLAY_SEMI = 'PlusJakartaSans_600SemiBold';

export const fontFamily = {
  regular: REGULAR,
  bold: BOLD,
  display: DISPLAY,
  displayBold: DISPLAY_BOLD,
  displaySemi: DISPLAY_SEMI,
  // Back-compat aliases (LoginScreen etc. referenced serif/serifBlack).
  serif: DISPLAY_BOLD,
  serifBlack: DISPLAY,
} as const;

const sized = (fontSize: number, lineHeight: number) => ({
  fontSize: scaleCapped(fontSize),
  lineHeight: scaleCapped(lineHeight),
});

export const typography: Record<string, TextStyle> = {
  // ── Display (Plus Jakarta Sans) ──
  display: { fontFamily: DISPLAY, ...sized(34, 38), fontWeight: '800', letterSpacing: -0.8 },
  hero: { fontFamily: DISPLAY, ...sized(30, 36), fontWeight: '800', letterSpacing: -0.7 },
  h1: { fontFamily: DISPLAY_BOLD, ...sized(26, 30), fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontFamily: DISPLAY_BOLD, ...sized(18, 23), fontWeight: '700', letterSpacing: -0.3 },
  score: { fontFamily: DISPLAY, ...sized(30, 32), fontWeight: '800', letterSpacing: -0.5 },

  // ── UI / body (Inter) ──
  body: { fontFamily: REGULAR, ...sized(15, 22), fontWeight: '400' },
  small: { fontFamily: REGULAR, ...sized(13, 18), fontWeight: '400' },
  pill: { fontFamily: REGULAR, ...sized(11, 14), fontWeight: '400' },

  // ── Legacy aliases (keep existing screens compiling) ──
  h3: { fontFamily: DISPLAY_BOLD, ...sized(18, 22), fontWeight: '700' },
  h4: { fontFamily: DISPLAY_SEMI, ...sized(16, 22), fontWeight: '600' },
  bodySmall: { fontFamily: REGULAR, ...sized(13, 18), fontWeight: '400' },
  caption: { fontFamily: REGULAR, ...sized(11, 14), fontWeight: '400' },
  button: { fontFamily: BOLD, ...sized(15, 20), fontWeight: '700' },
  eyebrow: { fontFamily: BOLD, ...sized(11, 14), fontWeight: '700', letterSpacing: 1.2 },
};
