import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';
import { API_BASE } from '../config/api';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params as { email: string };
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (newPassword.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return 'Password must contain letters and numbers';
    }
    if (newPassword !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const handleReset = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Error', error);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Reset failed');
      }

      Alert.alert('Success', 'Password reset successfully!', [
        {
          text: 'Login',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your new password</Text>

        <View style={styles.form}>

          <InputField
            label="New Password"
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            isPassword
            autoCapitalize="none"
          />
          <InputField
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            autoCapitalize="none"
          />

          <PrimaryButton
            title={loading ? 'Resetting...' : 'Reset Password'}
            onPress={handleReset}
            loading={loading}
            disabled={loading}
          />

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: spacing.md,
  },
  backLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  backText: {
    ...typography.caption,
    color: colors.primary,
  },
});

