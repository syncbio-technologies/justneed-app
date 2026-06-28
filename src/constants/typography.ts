import { TextStyle } from 'react-native';
import { scaleCapped } from '../utils/responsive';

// Justneed.ai type scale — see design spec section 2.
// One family (Inter), two weights (400, 700), seven tokens.
//
// Sizes use scaleCapped so text shrinks ~5-10% on iPhone SE and grows up to
// 20% on Pro Max / small tablets, then plateaus. Without this, body text
// looks oversized on large screens and cramped on small ones.

const REGULAR = 'Inter_400Regular';
const BOLD = 'Inter_700Bold';
// Fraunces serif — justneed.ai uses it for display headings. Gives the
// editorial, premium "verified identity" feel. Falls back to system serif if
// the font fails to load.
const SERIF = 'Fraunces_700Bold';
const SERIF_BLACK = 'Fraunces_900Black';

export const fontFamily = {
  regular: REGULAR,
  bold: BOLD,
  serif: SERIF,
  serifBlack: SERIF_BLACK,
} as const;

// scale fontSize + lineHeight together so vertical rhythm stays intact
const sized = (fontSize: number, lineHeight: number) => ({
  fontSize: scaleCapped(fontSize),
  lineHeight: scaleCapped(lineHeight),
});

export const typography: Record<string, TextStyle> = {
  // --- Spec tokens (preferred) ---
  // display + h1 use Fraunces serif (brand display face); body/UI stays Inter.
  display: { fontFamily: SERIF_BLACK, ...sized(34, 38), fontWeight: '900', letterSpacing: -0.5 },
  h1: { fontFamily: SERIF, ...sized(26, 30), fontWeight: '700', letterSpacing: -0.3 },
  h2: { fontFamily: BOLD, ...sized(18, 22), fontWeight: '700' },
  // Serif display variant for hero copy on dark surfaces.
  hero: { fontFamily: SERIF_BLACK, ...sized(30, 36), fontWeight: '900', letterSpacing: -0.5 },
  body: { fontFamily: REGULAR, ...sized(15, 22), fontWeight: '400' },
  small: { fontFamily: REGULAR, ...sized(13, 18), fontWeight: '400' },
  pill: { fontFamily: REGULAR, ...sized(11, 14), fontWeight: '400' },
  score: { fontFamily: BOLD, ...sized(32, 32), fontWeight: '700' },

  // --- Legacy aliases (so existing screens keep compiling) ---
  h3: { fontFamily: BOLD, ...sized(18, 22), fontWeight: '700' },
  h4: { fontFamily: BOLD, ...sized(16, 22), fontWeight: '700' },
  bodySmall: { fontFamily: REGULAR, ...sized(13, 18), fontWeight: '400' },
  caption: { fontFamily: REGULAR, ...sized(11, 14), fontWeight: '400' },
  button: { fontFamily: BOLD, ...sized(15, 20), fontWeight: '700' },
};
