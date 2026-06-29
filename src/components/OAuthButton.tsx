import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';

interface OAuthButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const OAuthButton: React.FC<OAuthButtonProps> = ({
  provider,
  onPress,
  loading = false,
  disabled = false,
}) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          label: 'Continue with Google',
          icon: 'logo-google',
          backgroundColor: colors.surface,
          borderColor: colors.gray200,
          textColor: colors.text,
        };
      case 'apple':
        return {
          label: 'Continue with Apple',
          icon: 'logo-apple',
          backgroundColor: colors.black,
          borderColor: colors.black,
          textColor: colors.white,
        };
      case 'facebook':
        return {
          label: 'Continue with Facebook',
          icon: 'logo-facebook',
          backgroundColor: '#1877f2',
          borderColor: '#1877f2',
          textColor: colors.white,
        };
      default:
        return {
          label: 'Continue',
          icon: 'logo-google',
          backgroundColor: colors.surface,
          borderColor: colors.gray200,
          textColor: colors.text,
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={config.textColor} size="small" />
        ) : (
          <Ionicons name={config.icon as any} size={18} color={config.textColor} />
        )}
        <Text style={[styles.label, { color: config.textColor }]}>
          {loading ? 'Signing in...' : config.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.sm,
    borderWidth: 1.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  label: {
    ...typography.button,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
});
