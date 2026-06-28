import { scaleCapped } from '../utils/responsive';

// Justneed.ai spacing + radii — see design spec section 3.
// 4-point grid, capped-scaled so paddings breathe on tablets without growing
// out of control. Buttons/inputs keep a 48pt minimum touch target on phones.

const s = scaleCapped;

export const spacing = {
  xs: s(4),
  sm: s(8),
  md: s(12),
  lg: s(16),
  xl: s(24),
  '2xl': s(32),
  '3xl': s(48),
  // legacy aliases
  xxl: s(32),
  xxxl: s(48),
};

// Border radii: NOT scaled. The visual feel of a 6px radius vs an 8px radius
// is the same regardless of screen size; scaling them just looks wrong.
export const borderRadius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  xxl: 20,
  full: 9999,
  // legacy alias
  round: 9999,
};

export const layout = {
  screenPadding: s(16),
  cardPadding: s(16),
  // touch targets: never go below 48pt on phones (a11y requirement)
  buttonHeight: Math.max(48, s(48)),
  inputHeight: Math.max(48, s(48)),
  iconSize: s(20),
  iconSizeLarge: s(28),
};
