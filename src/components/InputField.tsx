import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextInputProps, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, borderRadius, layout } from '../constants/spacing';
import { typography } from '../constants/typography';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
  icon?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  icon,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer, 
        focused && styles.inputContainerFocused, 
        error && styles.inputContainerError,
        props.multiline && styles.inputContainerMultiline
      ]}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={18}
            color={colors.gray500}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input, 
            icon && styles.inputWithIcon,
            props.multiline && styles.inputMultiline,
            style,
            Platform.OS === 'web' ? { outlineStyle: 'none' } as any : {}
          ]}
          placeholderTextColor={colors.gray400}
          secureTextEntry={isPassword && !showPassword}
          underlineColorAndroid="transparent"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={colors.gray500}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    paddingHorizontal: spacing.md,
    minHeight: layout.inputHeight,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: spacing.md,
  },
  inputWithIcon: {
    paddingLeft: spacing.sm,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  eyeIcon: {
    padding: spacing.sm,
    marginRight: -spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});