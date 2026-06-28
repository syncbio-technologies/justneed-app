import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ViewProps,
  PressableProps,
} from 'react-native';
import { colors } from '../constants/colors';
import { spacing, borderRadius as radii } from '../constants/spacing';
import { shadows } from '../constants/shadows';

/**
 * Surface container. Three elevation variants matching the design spec:
 *  - `elevated`  → white + soft shadow (the default content card)
 *  - `outlined`  → white + hairline border, no shadow (flat-design lists)
 *  - `flat`      → tinted surface, no border/shadow (nested groupings)
 *
 * Pass `onPress` to make the whole card a button — it then renders a Pressable
 * with the correct accessibility role and a subtle press state, instead of
 * every screen wrapping cards in their own TouchableOpacity.
 */
export type CardVariant = 'elevated' | 'outlined' | 'flat';

type SpacingToken = keyof typeof spacing;

interface BaseProps {
  variant?: CardVariant;
  /** Inner padding: a spacing token (`'lg'`) or raw number. Default `'lg'`. */
  padding?: SpacingToken | number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface CardProps extends BaseProps, Omit<ViewProps, 'style'> {
  onPress?: PressableProps['onPress'];
  /** Required when `onPress` is set, for screen-reader users. */
  accessibilityLabel?: string;
  disabled?: boolean;
  testID?: string;
}

const VARIANT_STYLE: Record<CardVariant, ViewStyle> = {
  elevated: { backgroundColor: colors.card, ...shadows.card },
  outlined: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  flat: { backgroundColor: colors.gray100 },
};

const resolvePadding = (p: BaseProps['padding']): number =>
  typeof p === 'number' ? p : spacing[p ?? 'lg'];

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'lg',
  radius = radii.lg,
  style,
  children,
  onPress,
  accessibilityLabel,
  disabled,
  testID,
  ...rest
}) => {
  const composed: StyleProp<ViewStyle> = [
    styles.base,
    VARIANT_STYLE[variant],
    { padding: resolvePadding(padding), borderRadius: radius },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !!disabled }}
        // Android ripple + iOS opacity press feedback.
        android_ripple={{ color: colors.gray200 }}
        style={({ pressed }) => [composed, pressed && styles.pressed, disabled && styles.disabled]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={composed} testID={testID} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
