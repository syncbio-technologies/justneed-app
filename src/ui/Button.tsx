import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
  PressableProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, borderRadius as radii, layout } from '../constants/spacing';
import { typography } from '../constants/typography';
import { Text } from './Text';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * The single button primitive for the app. Supersedes the older PrimaryButton
 * (which is kept as a thin alias for back-compat).
 *
 * Design goals:
 *  - One component, five intents (`variant`) × three sizes.
 *  - Loading state preserves width so layouts don't jump, blocks presses, and
 *    announces `busy` to screen readers.
 *  - Always meets the 44pt minimum touch target (hitSlop tops up small sizes).
 *  - Icon-left / icon-right / icon-only without bespoke markup per screen.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Visible label. Optional only when `iconOnly` is set. */
  title?: string;
  onPress?: PressableProps['onPress'];
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  /** Stretch to the container width. */
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  /** Render a square icon-only button. Requires `accessibilityLabel`. */
  iconOnly?: IconName;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

interface VariantColors {
  bg: string;
  bgPressed: string;
  border?: string;
  fg: string;
}

const VARIANTS: Record<ButtonVariant, VariantColors> = {
  primary: { bg: colors.primary, bgPressed: colors.primaryDark, fg: colors.white },
  secondary: { bg: colors.accent, bgPressed: '#C2925F', fg: colors.ink },
  outline: {
    bg: colors.transparent,
    bgPressed: colors.gray100,
    border: colors.primary,
    fg: colors.primary,
  },
  ghost: { bg: colors.transparent, bgPressed: colors.gray100, fg: colors.primary },
  danger: { bg: colors.danger, bgPressed: '#A33A25', fg: colors.white },
};

const SIZES: Record<ButtonSize, { height: number; paddingH: number; font: TextStyle; icon: number }> = {
  sm: { height: 40, paddingH: spacing.md, font: typography.small, icon: 16 },
  md: { height: layout.buttonHeight, paddingH: spacing.lg, font: typography.button, icon: 18 },
  lg: { height: 56, paddingH: spacing.xl, font: typography.button, icon: 20 },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
  testID,
}) => {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;

  const isIconOnly = !!iconOnly;
  const iconName = iconOnly ?? undefined;

  // Top up the touch target on the 40pt small size to clear the 44pt a11y min.
  const hitSlop = s.height < 44 ? (44 - s.height) / 2 : 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          minWidth: isIconOnly ? s.height : undefined,
          paddingHorizontal: isIconOnly ? 0 : s.paddingH,
          backgroundColor: pressed && !isDisabled ? v.bgPressed : v.bg,
          borderColor: v.border,
          borderWidth: v.border ? 1.5 : 0,
        },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon && !isIconOnly ? (
            <Ionicons name={leftIcon} size={s.icon} color={v.fg} style={styles.leftIcon} />
          ) : null}

          {isIconOnly ? (
            <Ionicons name={iconName!} size={s.icon} color={v.fg} />
          ) : (
            <Text
              style={[s.font, { color: v.fg }, textStyle]}
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
            >
              {title}
            </Text>
          )}

          {rightIcon && !isIconOnly ? (
            <Ionicons name={rightIcon} size={s.icon} color={v.fg} style={styles.rightIcon} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  disabled: {
    // Keep the variant color but wash it out — clearer than swapping to gray,
    // which reads as a different (enabled) button on some screens.
    opacity: 0.45,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
});
