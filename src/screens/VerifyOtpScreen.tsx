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
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';
import { API_BASE } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyOtpScreen() {
  const route = useRoute();
  const { email, type } = route.params as { email: string; type: 'signup' | 'forgot-password' };
  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const { login } = useAuth();

  const getRef = (index: number) => inputRefs.current[index];

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    if (newOtp[index] && index < 5) {
      getRef(index + 1)?.focus();
    }

    if (newOtp.join('').length === 6) {
      handleVerify();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      getRef(index - 1)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const endpoint = type === 'signup' ? '/auth/verify-signup' : '/auth/verify-forgot-password';
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (type === 'signup') {
        // Handle signup success (get token, login)
        const { user: userData, token } = data;
        
        await AsyncStorage.setItem('@justneed_token', token);
        // Note: AuthContext login would handle this better, but for now navigate
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        // Forgot password - go to reset password
        navigation.navigate('ResetPassword' as never, { email });
      }
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

      setResendTimer(30);
      Alert.alert('Success', 'New code sent to your email.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend code.');
    } finally {
      setResendLoading(false);
    }
  };

  const title = type === 'signup' ? 'Verify Email' : 'Enter Reset Code';
  const subtitle = type === 'signup' ? `Enter the 6-digit code sent to ${email}` : `Enter the 6-digit reset code sent to ${email}`;

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
          <View style={styles.header}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  style={[styles.otpInput, digit ? styles.filled : null]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify Code'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't get the code? </Text>
              {resendTimer > 0 ? (
                <Text style={styles.timerText}>{resendTimer}s</Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                  <Text style={styles.resendLink}>{resendLoading ? 'Sending...' : 'Resend'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: spacing.lg,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  filled: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  resendText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  timerText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  resendLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 12,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
});

