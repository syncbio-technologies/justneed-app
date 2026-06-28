import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SkillCard from '../components/SkillCard';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { hp } from '../utils/responsive';
import { typography } from '../constants/typography';

/**
 * SkillsTabScreen - Modern skill profile display with 3D flipping card
 * 
 * Features:
 * - Fetches user profile data from backend
 * - Displays 3D flipping skill card with live user data
 * - Modern gradient background and clean layout
 * - Loading and error states
 * - Pull-to-refresh functionality
 */

interface UserSkillData {
  name: string;
  avatarUrl: string;
  score: number;
  skills: string[];
  issued: string;
  expires: string;
  qrValue: string;
  tier: string;
  brand: string;
}

export default function SkillsTabScreen({ navigation }: any) {
  const { user } = useAuth();
  const [skillData, setSkillData] = useState<UserSkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user skill profile from backend
   * 
   * TODO: Replace this with your actual backend call:
   * - REST API: const response = await fetch(`${API_BASE}/users/${user.id}/skills`);
   * - Firebase: const doc = await db.collection('users').doc(user.id).get();
   * - GraphQL: const result = await apolloClient.query({ query: GET_USER_SKILLS });
   * 
   * Expected response structure:
   * {
   *   name: string,
   *   avatarUrl: string,
   *   score: number (0-100),
   *   skills: string[],
   *   issued: string (date format),
   *   expires: string (date format),
   *   qrValue: string (URL for QR code),
   *   tier: string,
   *   brand: string
   * }
   */
  const fetchUserSkillProfile = async () => {
    try {
      setError(null);
      
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // MOCK DATA - Replace with actual API call
      // Example REST API call:
      // const response = await fetch(`${API_BASE}/users/${user.id}/skills`, {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();

      // Simulated delay to mimic network request
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockData: UserSkillData = {
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.email?.split('@')[0] || 'User',
        avatarUrl: user.profile?.profileImage 
          ? typeof user.profile.profileImage === 'string' 
            ? user.profile.profileImage 
            : 'https://i.pravatar.cc/150'
          : 'https://i.pravatar.cc/150',
        score: 87,
        skills: ['React Native', 'TypeScript', 'Firebase', 'REST APIs', 'UI/UX Design'],
        issued: '01 Jan 2026',
        expires: '01 Jan 2027',
        qrValue: `https://justneed.app/verify/${user.id}`,
        tier: 'ELITE',
        brand: 'JUSTNEED',
      };

      setSkillData(mockData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load skill profile';
      setError(errorMessage);
      console.error('Error fetching skill profile:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserSkillProfile();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserSkillProfile();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Background - Light gray solid color */}
      <View style={styles.gradientBackground} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        {/* Header Section */}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital Skill Card</Text>
        </View>

        {/* <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Your Skill Profile</Text>
              <Text style={styles.headerSubtitle}>
                Tap the card to verify your credentials
              </Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.digitalCardButton}
                onPress={() => navigation.navigate('SkillCard')}
              >
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <Text style={styles.digitalCardText}>View Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View> */}

        {/* Main Content */}
        <View style={styles.contentSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading your profile...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Unable to Load Profile</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Text style={styles.errorHint}>Pull down to refresh</Text>
            </View>
          ) : skillData ? (
            <>
              {/* Skill Card */}
              <View style={styles.cardContainer}>
                <SkillCard
                  name={skillData.name}
                  avatarUrl={skillData.avatarUrl}
                  score={skillData.score}
                  skills={skillData.skills}
                  issued={skillData.issued}
                  expires={skillData.expires}
                  qrValue={skillData.qrValue}
                  tier={skillData.tier}
                  brand={skillData.brand}
                />
              </View>

            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Light gray background
  },

  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F5F5F5', // Light gray
    zIndex: 0,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl, // Reduced from xxxl
    zIndex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    gap:10
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },

  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm, // Further reduced
    paddingBottom: spacing.md, // Further reduced
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  headerText: {
    flex: 1,
  },

  headerButtons: {
    gap: spacing.xs,
  },

  digitalCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  digitalCardText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },

  // headerTitle: {
  //   ...typography.h2,
  //   color: colors.text, // Changed from white to dark text for light background
  //   marginBottom: spacing.xs,
  // },

  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary, // Changed from gray400 to textSecondary for better contrast
  },

  contentSection: {
    paddingHorizontal: spacing.sm, // Reduced from lg
    flex: 1, // Added flex to take available space
  },

  loadingContainer: {
    height: hp(48),
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },

  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  errorContainer: {
    height: hp(36),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },

  errorTitle: {
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },

  errorMessage: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  errorHint: {
    ...typography.bodySmall,
    color: colors.gray400,
    fontStyle: 'italic',
  },

  cardContainer: {
    alignItems: 'center',
    marginBottom: spacing.md, // Further reduced
    paddingVertical: spacing.xxxl, // Minimal padding
    paddingHorizontal: 4, // Minimal horizontal padding
  },

  infoSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },

  infoCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },

  infoValue: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  infoDescription: {
    ...typography.bodySmall,
    color: colors.gray400,
    fontSize: 11,
  },

  skillsListSection: {
    marginBottom: spacing.xl,
  },

  skillsListTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },

  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  skillTag: {
    backgroundColor: colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },

  skillTagText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },

  validitySection: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
  },

  validityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  validityLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  validityValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },

  validityDivider: {
    height: 1,
    backgroundColor: colors.gray200,
  },
});
