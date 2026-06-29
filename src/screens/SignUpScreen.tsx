  import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const emailRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);
  const confirmRef = React.useRef<TextInput>(null);

  const { signup, loginWithGoogle } = useAuth();

  useEffect(() => {
    runValidation(name, email, password, confirmPassword);
  }, [name, email, password, confirmPassword]);

  const runValidation = (
    n: string,
    e: string,
    p: string,
    cp: string,
  ) => {
    const next: typeof errors = {};
    if (!n.trim()) next.name = 'This field is required';
    const trimEmail = e.trim().toLowerCase();
    if (!trimEmail) next.email = 'This field is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) next.email = 'Enter a valid email';
    if (!p) next.password = 'This field is required';
    else if (p.length < 8) next.password = 'At least 8 characters';
    else if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) next.password = 'Use letters and numbers';
    if (!cp) next.confirmPassword = 'This field is required';
    else if (p !== cp) next.confirmPassword = 'Passwords do not match';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignUp = async () => {
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!runValidation(name, email, password, confirmPassword)) return;
    setServerError(null);
    setLoading(true);
    try {
      await signup(email.trim().toLowerCase(), password, name.trim());
      await AsyncStorage.setItem('@resume_pending', 'true');
      // Navigate immediately — Alert gets lost if the stack re-renders before user taps OK
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login', params: { newAccount: true } }],
      });
    } catch (error: any) {
      const message = error?.message || 'Please try again.';
      setServerError(message);
      Alert.alert('Sign Up Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      await AsyncStorage.setItem('@resume_pending', 'true');
      await loginWithGoogle();
    } catch (error: any) {
      if (error?.message !== 'Sign-in cancelled') {
        Alert.alert('Google Sign Up Failed', error.message || 'Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const buttonDisabled = loading || Object.keys(errors).length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Heading */}
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join Search to find your next opportunity</Text>

          {/* Full name */}
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              style={[styles.input, touched.name && errors.name ? styles.inputErr : null]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={(t) => { setName(t); setTouched((p) => ({ ...p, name: true })); }}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              editable={!loading}
              textContentType="name"
            />
            {touched.name && errors.name ? <Text style={styles.errText}>{errors.name}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              ref={emailRef}
              style={[styles.input, touched.email && errors.email ? styles.inputErr : null]}
              placeholder="your.email@example.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={(t) => { setEmail(t); setTouched((p) => ({ ...p, email: true })); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              editable={!loading}
              textContentType="emailAddress"
              autoComplete="email"
            />
            {touched.email && errors.email ? <Text style={styles.errText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputRow, touched.password && errors.password ? styles.inputErr : null]}>
              <TextInput
                ref={passwordRef}
                style={styles.inputInner}
                placeholder="Create a strong password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={(t) => { setPassword(t); setTouched((p) => ({ ...p, password: true })); }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                editable={!loading}
                textContentType="newPassword"
                autoComplete="new-password"
              />
              <TouchableOpacity style={styles.eye} onPress={() => setShowPassword((v) => !v)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.ink} />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password ? <Text style={styles.errText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm password */}
          <View style={styles.field}>
            <Text style={styles.label}>Confirm password</Text>
            <View style={[styles.inputRow, touched.confirmPassword && errors.confirmPassword ? styles.inputErr : null]}>
              <TextInput
                ref={confirmRef}
                style={styles.inputInner}
                placeholder="Re-enter your password"
                placeholderTextColor={colors.muted}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setTouched((p) => ({ ...p, confirmPassword: true })); }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                editable={!loading}
                textContentType="password"
                autoComplete="password"
              />
              <TouchableOpacity style={styles.eye} onPress={() => setShowConfirmPassword((v) => !v)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.ink} />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword ? (
              <Text style={styles.errText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {serverError ? <Text style={styles.serverErr}>{serverError}</Text> : null}

          {/* Create account button */}
          <Pressable
            style={({ pressed }) => [
              styles.createBtn,
              buttonDisabled && styles.createBtnDisabled,
              pressed && !buttonDisabled && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}
            onPress={handleSignUp}
            disabled={buttonDisabled}
          >
            <Text style={styles.createBtnText}>
              {loading ? 'Creating account...' : 'Create account'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google button — full width */}
          <TouchableOpacity
            style={[styles.googleBtn, (loading || googleLoading) && styles.googleBtnDisabled]}
            onPress={handleGoogleSignUp}
            disabled={loading || googleLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-google" size={18} color="#000000" />
            <Text style={styles.googleBtnText}>
              {googleLoading ? 'Connecting...' : 'Google'}
            </Text>
          </TouchableOpacity>

          {/* Sign in link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signinRow}>
            <Text style={styles.signinText}>
              Already have an account?{' '}
              <Text style={styles.signinLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  flex: {
    flex: 1,
  },

  backBtn: {
    marginTop: 23,
    marginLeft: 20,
    width: 38,
    height: 38,
    justifyContent: 'center',
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: 32,
    letterSpacing: 0.2,
  },

  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontFamily: 'Inter_400Regular',
  },

  inputRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingLeft: 16,
    paddingRight: 10,
    backgroundColor: colors.surface,
  },
  inputInner: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  eye: {
    padding: 6,
  },
  inputErr: {
    borderColor: colors.danger,
  },
  errText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 5,
  },
  serverErr: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Per spec section 9 — Button.Primary: GOLD bg, INDIGO text 700.
  createBtn: {
    width: '100%',
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.indigo,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.1,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: '500',
    fontFamily: 'Inter_400Regular',
  },

  googleBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  googleBtnDisabled: {
    opacity: 0.5,
  },
  googleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    fontFamily: 'Inter_700Bold',
  },

  signinRow: {
    marginTop: 28,
    alignItems: 'center',
  },
  signinText: {
    fontSize: 14,
    color: colors.muted,
    fontFamily: 'Inter_400Regular',
  },
  signinLink: {
    color: colors.indigo,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
});