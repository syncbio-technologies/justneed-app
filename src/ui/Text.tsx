import React from 'react';
import {
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
  StyleProp,
} from 'react-native';
import { typography } from '../constants/typography';
import { colors } from '../constants/colors';

/**
 * Typography primitive. Every piece of text in the app should render through
 * <Text> so that the type scale, color tokens and dynamic-type scaling stay
 * consistent. Raw <RNText> in screens is a smell.
 *
 * - `variant` maps to a token in constants/typography (display, h1, h2, body…)
 * - `color` accepts a semantic token OR a raw hex string for one-offs
 * - Honors RN accessibility (it's a screen-reader element by default)
 */

export type TextVariant = keyof typeof typography;

export type TextColorToken =
  | 'default'
  | 'secondary'
  | 'muted'
  | 'inverse'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

const COLOR_TOKENS: Record<TextColorToken, string> = {
  default: colors.text,
  secondary: colors.textSecondary,
  muted: colors.muted,
  inverse: colors.white,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  /** Semantic token (`'secondary'`) or any raw color string (`'#fff'`). */
  color?: TextColorToken | (string & {});
  align?: TextStyle['textAlign'];
  /** Override the variant's weight without redefining the whole style. */
  weight?: '400' | '600' | '700';
  style?: StyleProp<TextStyle>;
}

const resolveColor = (color?: TextProps['color']): string | undefined => {
  if (!color) return undefined;
  return (COLOR_TOKENS as Record<string, string>)[color] ?? color;
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'default',
  align,
  weight,
  style,
  children,
  ...rest
}) => {
  return (
    <RNText
      // Cap accessibility scaling so huge OS font sizes don't shatter layouts,
      // while still respecting users who bump text up for readability.
      maxFontSizeMultiplier={1.6}
      style={[
        typography[variant],
        { color: resolveColor(color) },
        align ? { textAlign: align } : null,
        weight ? { fontWeight: weight } : null,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
};
