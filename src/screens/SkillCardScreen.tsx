import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DigitalSkillCard } from '../components/DigitalSkillCard';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { hp } from '../utils/responsive';
import { typography } from '../constants/typography';

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

export default function SkillCardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [skillData, setSkillData] = useState<UserSkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    loadUserSkillProfile();
  }, [user]);

  const loadUserSkillProfile = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      // Simulated delay to mimic network request
      await new Promise(resolve => setTimeout(resolve, 500));

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
    } catch (error) {
      console.error('Error loading skill profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const userName = skillData?.name || 'User';
      const userSkills = skillData?.skills.slice(0, 3).join(', ') || 'Professional Skills';
      
      const result = await Share.share({
        message: `Check out ${userName}'s digital skill card on JustNeed! 
        
🎯 ${skillData?.score}% Match Score
💼 ${skillData?.tier} Professional
🚀 Top Skills: ${userSkills}

Download JustNeed and find your dream job today!`,
        title: `${userName}'s JustNeed Skill Card`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share skill card');
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Skill Card',
      'Save your digital skill card to your device wallet or photo gallery.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save to Photos', onPress: () => Alert.alert('Coming Soon', 'Photo save feature will be available soon!') },
        { text: 'Add to Wallet', onPress: () => Alert.alert('Coming Soon', 'Wallet integration coming soon!') },
      ]
    );
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Digital Skill Card</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardSection}>
          {/* <Text style={styles.sectionTitle}>Your Professional Skill Card</Text> */}
          {/* <Text style={styles.sectionSubtitle}>
            Showcase your expertise with our AI-powered digital skill card
          </Text> */}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your skill card...</Text>
            </View>
          ) : skillData ? (
            <DigitalSkillCard
              name={skillData.name}
              avatarUrl={skillData.avatarUrl}
              score={skillData.score}
              skills={skillData.skills}
              issued={skillData.issued}
              expires={skillData.expires}
              qrValue={skillData.qrValue}
              tier={skillData.tier}
              brand={skillData.brand}
              onPress={handleFlip}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Unable to load skill card</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
  },
  shareButton: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  cardSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    height: hp(36),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.gray600,
  },
  errorContainer: {
    height: hp(36),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  tapHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  featuresSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionsSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
    marginLeft: spacing.xs,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  infoSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
});