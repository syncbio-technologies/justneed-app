import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';
import { API_BASE } from '../config/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState('');
  const navigation = useNavigation();

  const validateEmail = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return 'Email is required';
    if (!trimmed.includes('@') || !trimmed.includes('.')) return 'Please enter a valid email';
    return '';
  };

  const handleSendOTP = async () => {
    const error = validateEmail(email);
    if (error) {
      setErrors(error);
      return;
    }

    setLoading(true);
    setErrors('');

    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password-init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      Alert.alert('Success', data.message, [
        {
          text: 'Continue',
          onPress: () => navigation.navigate('VerifyOtp' as never, { email: email.trim().toLowerCase(), type: 'forgot-password' }),
        },
      ]);
    } catch (error: any) {
      const message = error.message || 'Something went wrong. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset code</Text>
          </View>

          <View style={styles.formCard}>
            <InputField
              label="Email"
              placeholder="your@email.com"
              value={email}
              error={errors}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <PrimaryButton
              title={loading ? 'Sending...' : 'Send Reset Code'}
              onPress={handleSendOTP}
              loading={loading}
              disabled={!email.trim()}
            />

            <View style={styles.backLink}>
              <Text style={styles.backText} onPress={() => navigation.goBack()}>
                ← Back to Login
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    ...typography.caption,
    color: colors.primary,
  },
});

