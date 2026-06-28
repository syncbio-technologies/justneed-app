import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';
import { API_BASE } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface VerifyEmailScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      password?: string;
      name?: string;
    };
  };
}

export default function VerifyEmailScreen({ navigation, route }: VerifyEmailScreenProps) {
  const { email, name, password } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  
  const input0Ref = useRef<TextInput>(null);
  const input1Ref = useRef<TextInput>(null);
  const input2Ref = useRef<TextInput>(null);
  const input3Ref = useRef<TextInput>(null);
  const input4Ref = useRef<TextInput>(null);
  const input5Ref = useRef<TextInput>(null);
  const { login } = useAuth();

  const getRef = (index: number) => {
    switch (index) {
      case 0: return input0Ref;
      case 1: return input1Ref;
      case 2: return input2Ref;
      case 3: return input3Ref;
      case 4: return input4Ref;
      case 5: return input5Ref;
      default: return input0Ref;
    }
  };

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      input0Ref.current?.focus();
    }, 500);
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      getRef(index + 1).current?.focus();
    }

    // Auto-submit when all 6 digits are filled
    const otpString = newOtp.join('');
    if (otpString.length === 6) {
      handleVerify(otpString);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      getRef(index - 1).current?.focus();
    }
  };

  const handleVerify = async (otpString?: string) => {
    const otpCode = otpString || otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/verify-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      // Success - user is created and we get token
      const { user: userData, token } = data;
      
      // Store token and user so AuthContext picks it up on next load
      const nameParts = (name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newUser = {
        id: userData.id,
        email: userData.email,
        firstName,
        lastName,
        isRecruiter: false,
        profile: {
          phone: '',
          address: '',
          profileImage: null,
          jobTitle: '',
          skills: '',
          preferredLocation: '',
          jobPreferences: '',
          resume: null,
          coverLetter: null,
        },
      };

      await AsyncStorage.setItem('@justneed_token', token);
      await AsyncStorage.setItem('@justneed_user', JSON.stringify(newUser));

      // Use login() to properly update AuthContext state so the app navigates automatically
      await login(userData.email, password || '');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      // Start cooldown timer
      setResendTimer(30);
      Alert.alert('Success', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Content Card */}
          <View style={styles.contentCard}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <TextInput
                ref={input0Ref}
                style={[styles.otpInput, otp[0] ? styles.otpInputFilled : null]}
                value={otp[0]}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), 0)}
                onKeyPress={(e) => handleKeyPress(e, 0)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
              <TextInput
                ref={input1Ref}
                style={[styles.otpInput, otp[1] ? styles.otpInputFilled : null]}
                value={otp[1]}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), 1)}
                onKeyPress={(e) => handleKeyPress(e, 1)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
              <TextInput
                ref={input2Ref}
                style={[styles.otpInput, otp[2] ? styles.otpInputFilled : null]}
                value={otp[2]}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), 2)}
                onKeyPress={(e) => handleKeyPress(e, 2)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
              <TextInput
                ref={input3Ref}
                style={[styles.otpInput, otp[3] ? styles.otpInputFilled : null]}
                value={otp[3]}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), 3)}
                onKeyPress={(e) => handleKeyPress(e, 3)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
              <TextInput
                ref={input4Ref}
                style={[styles.otpInput, otp[4] ? styles.otpInputFilled : null]}
                value={otp[4]}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), 4)}
                onKeyPress={(e) => handleKeyPress(e, 4)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
              <TextInput
                ref={input5Ref}
                style={[styles.otpInput, otp[5] ? styles.otpInputFilled : null]}
                value={otp[5]}
                onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), 5)}
                onKeyPress={(e) => handleKeyPress(e, 5)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                editable={!loading}
              />
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.verifyButton, loading && styles.buttonDisabled]}
              onPress={() => handleVerify()}
              disabled={loading || otp.join('').length !== 6}
              activeOpacity={0.8}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>

            {/* Resend Link */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {resendTimer > 0 ? (
                <Text style={styles.resendTimerText}>
                  Resend in {resendTimer}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendLoading}
                >
                  <Text style={styles.resendLink}>
                    {resendLoading ? 'Sending...' : 'Resend'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back to Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Note: In development mode, the OTP is also logged to the console.
          </Text>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  contentCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  emailText: {
    color: colors.primary,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.white,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight || '#EEF2FF',
  },
  verifyButton: {
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    ...typography.button,
    color: colors.white,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  resendText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  resendTimerText: {
    ...typography.bodySmall,
    color: colors.gray400,
  },
  resendLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  infoText: {
    ...typography.caption,
    color: colors.gray400,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

