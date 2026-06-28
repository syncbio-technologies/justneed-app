import React from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { Text } from './Text';

/**
 * Loading spinner. Use `fill` for a centered full-area loading state (e.g. the
 * first paint of a screen) and the inline form for buttons/rows.
 */
export interface SpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  /** Center the spinner in a flex-filling container. */
  fill?: boolean;
  /** Optional caption rendered under the spinner. */
  label?: string;
  style?: StyleProp<ViewStyle>;
  /** Screen-reader announcement. Defaults to label or "Loading". */
  accessibilityLabel?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'small',
  color = colors.primary,
  fill = false,
  label,
  style,
  accessibilityLabel,
}) => {
  return (
    <View
      style={[fill && styles.fill, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? label ?? 'Loading'}
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator size={size} color={color} />
      {label ? (
        <Text variant="small" color="secondary" align="center" style={styles.label}>
          {label}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  label: {
    marginTop: spacing.md,
  },
});
