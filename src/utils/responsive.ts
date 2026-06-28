import { Dimensions } from 'react-native';

// Reference device: iPhone X (375 × 812). The design spec was authored at
// this width, so values map 1:1 on iPhone X / 11 / 12 / 13 / 14.

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

export const SMALL_PHONE_MAX = 360; // iPhone SE 1st gen, Galaxy J5
export const TABLET_MIN = 768;

export const isSmallPhone = SCREEN_W < SMALL_PHONE_MAX;
export const isTablet = SCREEN_W >= TABLET_MIN;
export const screenWidth = SCREEN_W;
export const screenHeight = SCREEN_H;

// Linear scale based on screen width. Use for layout (paddings, fixed widths).
export const scale = (size: number) => (SCREEN_W / BASE_WIDTH) * size;

// Linear scale based on screen height. Use for vertical-only dimensions
// (hero illustrations, banners) that should breathe with screen height.
export const verticalScale = (size: number) => (SCREEN_H / BASE_HEIGHT) * size;

// Damped scale. Text and icons feel wrong at full linear scale on tablets
// (a 16pt body becomes 32pt on a 768pt-wide tablet — too big). factor
// controls how much of the linear delta is applied (0 = no scaling,
// 1 = full linear). 0.5 is the standard react-native-size-matters default.
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Width / height percentage of the screen.
export const wp = (percent: number) => (SCREEN_W * percent) / 100;
export const hp = (percent: number) => (SCREEN_H * percent) / 100;

// Clamp a scaled value between min and max — useful for fonts/spacing on
// tablets where you want a ceiling.
export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Convenience: scale with a tablet ceiling. Caps growth on wide screens
// while still shrinking on small phones.
export const scaleCapped = (size: number, maxMultiplier = 1.2) => {
  const scaled = moderateScale(size);
  const ceiling = size * maxMultiplier;
  return Math.min(scaled, ceiling);
};

// Max content width for full-bleed screens (Swipe, Profile) when running on
// tablets — prevents 700pt-wide cards. Phones use full width.
export const contentMaxWidth = isTablet ? 520 : SCREEN_W;
