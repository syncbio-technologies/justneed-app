import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../constants/colors';
import { spacing, borderRadius, layout } from '../constants/spacing';
import { typography } from '../constants/typography';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    if (disabled) return styles.disabled;
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'outline':
        return styles.outline;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'outline':
        return styles.outlineText;
      default:
        return styles.text;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: layout.buttonHeight,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.accent,
  },
  outline: {
    backgroundColor: colors.transparent,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.gray300,
  },
  text: {
    ...typography.button,
    color: colors.white,
  },
  outlineText: {
    ...typography.button,
    color: colors.primary,
  },
});