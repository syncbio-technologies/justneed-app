import { ViewStyle } from 'react-native';

// Justneed.ai elevation — see design spec section 3.
// Per spec, only the Skill ID card and modals use shadow; everything else is
// flat. Existing sm/md/lg/xl tokens kept as toned-down legacy values so we
// can incrementally remove unwanted shadows in later phases.

const INDIGO = '#1B1F3B';

export const shadows: Record<string, ViewStyle> = {
  // Spec card / modal elevation
  card: {
    shadowColor: INDIGO,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },

  // Legacy tokens (kept so existing screens compile; values softened to
  // match flat-design spec — Phase 4 will remove these from non-card UI).
  sm: {
    shadowColor: INDIGO,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: INDIGO,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  lg: {
    shadowColor: INDIGO,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  xl: {
    shadowColor: INDIGO,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};
