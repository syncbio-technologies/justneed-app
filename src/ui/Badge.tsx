import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, borderRadius as radii } from '../constants/spacing';
import { Text } from './Text';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Compact status/label pill. The `tone` carries meaning (success/danger/…),
 * the `variant` carries emphasis (soft/solid/outline). Keeping those two axes
 * separate is what makes the badge reusable across the whole app instead of
 * inventing a new colored pill per screen.
 */
export type BadgeTone =
  | 'neutral'
  | 'primary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type BadgeVariant = 'soft' | 'solid' | 'outline';

export interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

const TONE_COLOR: Record<BadgeTone, string> = {
  neutral: colors.gray500,
  primary: colors.primary,
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  info: colors.info,
};

// `solid` needs a readable text color. Accent (gold) and warning are light, so
// they get ink text; everything else gets white.
const SOLID_TEXT: Partial<Record<BadgeTone, string>> = {
  accent: colors.ink,
  warning: colors.ink,
};

export const Badge: React.FC<BadgeProps> = ({
  label,
  tone = 'neutral',
  variant = 'soft',
  size = 'md',
  icon,
  style,
}) => {
  const toneColor = TONE_COLOR[tone];

  const container: ViewStyle =
    variant === 'solid'
      ? { backgroundColor: toneColor }
      : variant === 'outline'
      ? { backgroundColor: colors.transparent, borderWidth: 1, borderColor: toneColor }
      : { backgroundColor: toneColor + '1F' }; // ~12% tint

  const textColor =
    variant === 'solid' ? SOLID_TEXT[tone] ?? colors.white : toneColor;

  const sizing = size === 'sm' ? styles.sm : styles.md;
  const iconSize = size === 'sm' ? 11 : 13;

  return (
    <View style={[styles.base, sizing, container, style]}>
      {icon ? (
        <Ionicons name={icon} size={iconSize} color={textColor} style={styles.icon} />
      ) : null}
      <Text
        variant="pill"
        weight="700"
        style={{ color: textColor }}
        numberOfLines={1}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.full,
  },
  sm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  icon: {
    marginRight: 4,
  },
});
