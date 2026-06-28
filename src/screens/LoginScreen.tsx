import React, { useState, useEffect, useRef } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { colors, gradients } from '../constants/colors';
import { fontFamily } from '../constants/typography';
import { SkillIdHero } from '../components/SkillIdHero';

const STORAGE_KEY_LAST_EMAIL = '@justneed_last_email';

export default function LoginScreen({ navigation, route }: any) {
  const newAccount = route?.params?.newAccount ?? false;
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const passwordRef = useRef<TextInput>(null);
  const { login, loginWithGoogle } = useAuth();

  useEffect(() => {
    runValidation(email, password);
  }, [email, password]);

  useEffect(() => {
    (async () => {
      const savedEmail = await AsyncStorage.getItem(STORAGE_KEY_LAST_EMAIL);
      if (savedEmail) setEmail(savedEmail);
    })();
  }, []);

  const runValidation = (maybeEmail = email, maybePassword = password) => {
    const next: typeof errors = {};
    const trimmed = maybeEmail.trim().toLowerCase();
    if (!trimmed) next.email = 'This field is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) next.email = 'Enter a valid email address';
    if (!maybePassword) next.password = 'This field is required';
    setErrors(next);
    return { nextErrors: next, trimmedEmail: trimmed };
  };

  const buttonDisabled = loading || Object.keys(errors).length > 0;

  const handleLogin = async () => {
    setTouched({ email: true, password: true });
    const { nextErrors, trimmedEmail } = runValidation();
    if (Object.keys(nextErrors).length > 0) return;
    setServerError(null);
    setLoading(true);
    try {
      await login(trimmedEmail, password, false);
      await AsyncStorage.setItem(STORAGE_KEY_LAST_EMAIL, trimmedEmail);
    } catch (error: any) {
      const message = error?.message || 'Please check your credentials and try again.';
      setServerError(message);
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error: any) {
      if (error?.message !== 'Sign-in cancelled') {
        Alert.alert('Google Login Failed', error.message || 'Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* ── Indigo brand hero ─────────────────────────────── */}
          <LinearGradient
            colors={gradients.heroDeep as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.hero, { paddingTop: insets.top + 24 }]}
          >
            <View style={styles.wordmarkRow}>
              <View style={styles.wordmarkDot} />
              <Text style={styles.wordmark}>justneed</Text>
            </View>

            <SkillIdHero width={260} style={styles.heroGraphic} />

            <Text style={styles.heroTitle}>Your next job is</Text>
            <Text style={[styles.heroTitle, styles.heroTitleGold]}>
              just a swipe away.
            </Text>
            <Text style={styles.heroSub}>
              AI matches you to roles that fit. Swipe right to apply — finding work finally feels effortless.
            </Text>
          </LinearGradient>

          {/* ── Form card (lifts over the hero) ───────────────── */}
          <View style={[styles.formCard, { paddingBottom: insets.bottom + 28 }]}>
            {newAccount && (
              <View style={styles.successBanner}>
                <Ionicons name="checkmark-circle" size={18} color={colors.emerald} />
                <Text style={styles.successText}>Account created! Please sign in.</Text>
              </View>
            )}

            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue your job search</Text>

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[styles.input, touched.email && errors.email ? styles.inputErr : null]}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.mutedBlue}
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
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotText}>Forgot?</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.inputRow, touched.password && errors.password ? styles.inputErr : null]}>
                <TextInput
                  ref={passwordRef}
                  style={styles.inputInner}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.mutedBlue}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setTouched((p) => ({ ...p, password: true })); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!loading}
                  textContentType="password"
                  autoComplete="password"
                />
                <TouchableOpacity style={styles.eye} onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={colors.slate}
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password ? <Text style={styles.errText}>{errors.password}</Text> : null}
            </View>

            {serverError ? <Text style={styles.serverErr}>{serverError}</Text> : null}

            {/* Sign in — gold CTA */}
            <Pressable
              style={({ pressed }) => [
                styles.signInBtn,
                buttonDisabled && styles.signInBtnDisabled,
                pressed && !buttonDisabled && { opacity: 0.9, transform: [{ scale: 0.98 }] },
              ]}
              onPress={handleLogin}
              disabled={buttonDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: buttonDisabled, busy: loading }}
            >
              <Text style={styles.signInBtnText}>{loading ? 'Signing in…' : 'Sign in'}</Text>
              {!loading ? (
                <Ionicons name="arrow-forward" size={18} color={colors.indigo} style={styles.signInIcon} />
              ) : null}
            </Pressable>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={[styles.socialBtn, (loading || googleLoading) && styles.btnDisabled]}
                onPress={handleGoogleLogin}
                disabled={loading || googleLoading}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
              >
                <Ionicons name="logo-google" size={18} color="#EA4335" />
                <Text style={styles.socialBtnText}>{googleLoading ? 'Connecting…' : 'Google'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialBtn, styles.socialBtnDisabled]}
                disabled
                activeOpacity={1}
                accessibilityRole="button"
                accessibilityLabel="LinkedIn, coming soon"
              >
                <Ionicons name="logo-linkedin" size={18} color="#0A66C2" />
                <Text style={styles.socialBtnText}>LinkedIn</Text>
              </TouchableOpacity>
            </View>

            {/* Sign up */}
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={styles.signupRow}>
              <Text style={styles.signupText}>
                Don't have an account? <Text style={styles.signupLink}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.indigo },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, backgroundColor: colors.cream },

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 56,
    alignItems: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  wordmarkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  wordmark: {
    fontSize: 17,
    color: '#FFFFFF',
    fontFamily: fontFamily.bold,
    letterSpacing: 0.3,
  },
  heroGraphic: {
    marginTop: 6,
    marginBottom: 18,
  },
  heroTitle: {
    fontFamily: fontFamily.serifBlack,
    fontSize: 27,
    lineHeight: 32,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroTitleGold: {
    color: colors.gold,
  },
  heroSub: {
    marginTop: 12,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.mutedBlue,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Form card
  formCard: {
    flex: 1,
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontFamily: fontFamily.serif,
    fontSize: 26,
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.slate,
    fontFamily: fontFamily.regular,
    lineHeight: 22,
    marginBottom: 26,
  },
  field: { marginBottom: 18 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13.5,
    color: colors.ink,
    fontFamily: fontFamily.bold,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13.5,
    color: colors.goldDeep,
    fontFamily: fontFamily.bold,
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
    fontFamily: fontFamily.regular,
  },
  inputRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 10,
    backgroundColor: colors.white,
  },
  inputInner: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    fontFamily: fontFamily.regular,
    padding: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  eye: { padding: 6 },
  inputErr: { borderColor: colors.danger },
  errText: { fontSize: 12, color: colors.danger, marginTop: 5, fontFamily: fontFamily.regular },
  serverErr: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: fontFamily.regular,
  },

  // Gold CTA (Button.Primary: GOLD bg, INDIGO text)
  signInBtn: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  signInBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  signInBtnText: {
    fontSize: 16,
    color: colors.indigo,
    fontFamily: fontFamily.bold,
    letterSpacing: 0.1,
  },
  signInIcon: { marginLeft: 8 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.cream4 },
  dividerLabel: { fontSize: 12.5, color: colors.muted, fontFamily: fontFamily.regular },

  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  socialBtnDisabled: { opacity: 0.55 },
  socialBtnText: { fontSize: 15, color: colors.ink, fontFamily: fontFamily.bold },
  btnDisabled: { opacity: 0.5 },

  signupRow: { marginTop: 26, alignItems: 'center' },
  signupText: { fontSize: 14, color: colors.slate, fontFamily: fontFamily.regular },
  signupLink: { color: colors.goldDeep, fontFamily: fontFamily.bold },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#D8EEE9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 22,
  },
  successText: { fontSize: 14, color: '#0F5132', flexShrink: 1, fontFamily: fontFamily.regular },
});
