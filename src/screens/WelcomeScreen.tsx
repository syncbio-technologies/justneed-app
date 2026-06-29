import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';

export default function WelcomeScreen({ navigation }: any) {
  const handleApplicant = () => {
    navigation.navigate('SignUp', { userType: 'applicant' });
  };

  const handleRecruiter = () => {
    navigation.navigate('SignUp', { userType: 'recruiter' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backBtn} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Join as an applicant or recruiter</Text>
          <Text style={styles.subtitle}>
            Choose your account type to get started with your job search journey
          </Text>
        </View>

        {/* Cards Section */}
        <View style={styles.cardsContainer}>
          {/* Applicant Card */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={handleApplicant}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person-outline" size={32} color="#2563EB" />
            </View>
            <Text style={styles.cardTitle}>I'm an applicant</Text>
            <Text style={styles.cardSubtitle}>
              Looking for job opportunities
            </Text>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={16} color="#2563EB" />
            </View>
          </Pressable>

          {/* Recruiter Card - Disabled */}
          <View style={[styles.card, styles.cardDisabled]}>
            <View style={[styles.iconContainer, styles.iconDisabled]}>
              <Ionicons name="briefcase-outline" size={32} color="#9CA3AF" />
            </View>
            <Text style={[styles.cardTitle, styles.textDisabled]}>I'm a recruiter</Text>
            <Text style={[styles.cardSubtitle, styles.textDisabled]}>
              Hiring for my company
            </Text>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  backBtn: {
    marginTop: 8,
    marginLeft: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  header: {
    marginBottom: 48,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 12,
    lineHeight: 36,
  },

  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 22,
    letterSpacing: 0.2,
  },

  cardsContainer: {
    gap: 16,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
    
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    
    // Android shadow
    elevation: 2,
  },

  cardPressed: {
    borderColor: '#2563EB',
    backgroundColor: '#F0F7FF',
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.3,
  },

  cardSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },

  checkCircle: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2563EB',
  },

  cardDisabled: {
    opacity: 0.6,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },

  iconDisabled: {
    backgroundColor: '#F3F4F6',
  },

  textDisabled: {
    color: '#9CA3AF',
  },

  comingSoonBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    letterSpacing: 0.3,
  },

  footer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    alignItems: 'center',
  },

  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },

  footerLink: {
    color: '#2563EB',
    fontWeight: '700',
  },
});