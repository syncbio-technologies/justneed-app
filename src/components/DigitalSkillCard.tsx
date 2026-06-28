import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { colors } from '../constants/colors';
import { shadows } from '../constants/shadows';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';

/**
 * DigitalSkillCard - A flippable digital ID card component
 * 
 * Features:
 * - 3D flip animation on tap
 * - Front side: User profile, skills, score, and verification badge
 * - Back side: QR code for verification, logo, and validity information
 * - Landscape orientation (rotated 90 degrees)
 * - Responsive design based on screen width
 * 
 * Usage:
 * <DigitalSkillCard
 *   name="John Doe"
 *   avatarUrl="https://..."
 *   score={87}
 *   skills={['React', 'TypeScript', 'Node.js']}
 *   issued="01 Jan 2026"
 *   expires="01 Jan 2027"
 *   qrValue="https://verify.com/user123"
 *   tier="ELITE"
 *   brand="JustNeed"
 * />
 */

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;
const cardHeight = cardWidth * 1.625; // Landscape aspect ratio for rotated card

interface SkillCardProps {
  name: string;
  avatarUrl: string;
  score: number;
  skills: string[];
  issued: string;
  expires: string;
  qrValue: string;
  tier: string;
  brand: string;
  onPress?: () => void;
}

export const DigitalSkillCard: React.FC<SkillCardProps> = ({
  name,
  avatarUrl,
  score,
  skills,
  issued,
  expires,
  qrValue,
  tier,
  brand,
  onPress,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(flipAnimation, {
        toValue: 0,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnimation, {
        toValue: 180,
        friction: 8,
        tension: 10,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

    // Convert skills array to SkillData format for top 5 display
  const topSkills = skills.slice(0, 5).map((skill, index) => ({
    id: `skill_${index}`,
    name: skill,
    score: Math.max(75, score - (index * 5)), // Simulate decreasing scores
    category: 'technical',
    verified: index < 3, // First 3 skills are verified
    certificationLevel: index === 0 ? 'expert' : index === 1 ? 'advanced' : 'intermediate'
  }));

  // Generate student ID from name and score
  const generateStudentId = () => {
    const nameHash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const baseId = (nameHash + score) * 1000;
    return baseId.toString().slice(0, 8);
  };

  const studentId = generateStudentId();

  const renderUserInitials = () => {
    const initials = name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <View style={styles.initialsContainer}>
        <Text style={styles.initialsText}>{initials}</Text>
      </View>
    );
    };

      const getVerificationLevel = () => {
        if (score >= 90) return 'certified';
        if (score >= 75) return 'verified';
        return 'basic';
      };
    
      const getVerificationBadgeColor = () => {
        const level = getVerificationLevel();
        switch (level) {
          case 'certified': return colors.success;
          case 'verified': return colors.primary;
          default: return colors.gray500;
        }
      };
    
  return (
    <TouchableOpacity style={styles.container} onPress={flipCard} activeOpacity={0.95}>
      <View style={styles.card}>
        {/* Front Side */}
        <Animated.View style={[styles.cardFace, styles.cardFront, frontAnimatedStyle]}>
          {/* Rotated Content Container - Rotates 90 degrees clockwise */}
          <View style={styles.rotatedContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>JN</Text>
              </View>
              <Text style={styles.brandName}>{brand || 'JustNeed'}</Text>
            </View>
            
            <View style={styles.idSection}>
              <Text style={styles.cardType}>Digital Skills ID</Text>
              <Text style={styles.idLabel}>{studentId}</Text>
              {/* <Text style={styles.validityLabel}>{tier}</Text> */}
            </View>
          </View>

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            {/* Left Side - User Info */}
            <View style={styles.leftSection}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                  <View style={styles.profileImageContainer}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
                    ) : (
                      renderUserInitials()
                    )}
                  </View>
                  
                  
                  <View style={styles.profileInfo}>
                    <Text style={styles.userName}>{name}</Text>
                    {/* Job Title */}
                    <Text style={styles.jobTitle}>Full Stack Developer</Text>
                    <View style={styles.headerRight}>
                      <View style={[styles.verificationBadge, { backgroundColor: getVerificationBadgeColor() }]}>
                        <Text style={styles.verificationText}>
                          {getVerificationLevel().toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
        
                </View>
              
              {/* Name in single line */}
              {/* <Text style={styles.fullName}>{name}</Text> */}
              
              {/* Top 5 Skills */}
              <View style={styles.skillsSection}>
                <Text style={styles.skillsTitle}>Top Skills</Text>
                  <View style={styles.skillsGrid}>
                    {topSkills.map((skill, index) => (
                      <View key={skill.id} style={styles.skillChip}>
                        <Text style={styles.skillName}>{skill.name}</Text>
                        <Text style={styles.skillScore}>{skill.score}%</Text>
                        {skill.verified && (
                          <Ionicons 
                            name="checkmark-circle" 
                            size={10} 
                            color={colors.success} 
                            style={styles.skillVerifiedIcon}
                          />
                        )}
                      </View>
                    ))}
                  </View>
              </View>
            </View>

            {/* Right Side - Job Info & Verification */}
            <View style={styles.rightSection}>

              {/* Score Display */}
              <View style={styles.scoreDisplay}>
                <Text style={styles.scoreNumber}>{score}</Text>
                <Text style={styles.scoreLabel}>SCORE</Text>
              </View>

              
              {/* Verification Badge */}
              {/* <View style={styles.verificationBadge}>
                <View style={styles.verificationInner}>
                  <Text style={styles.verifiedByText}>VERIFIED BY</Text>
                  <View style={styles.verificationLogo}>
                    <Text style={styles.verificationLogoText}>JN</Text>
                  </View>
                  <Text style={styles.verificationBrand}>{brand || 'JustNeed'}</Text>
                  <Text style={styles.memberText}>LAS MED</Text>
                </View>
              </View> */}

              {/* Valid Period */}
              <View style={styles.validPeriodSection}>
                <Text style={styles.validPeriodLabel}>Valid Period</Text>
                <Text style={styles.validPeriodText}>{issued} - {expires}</Text>
              </View>

            </View>
          </View>
        </View>
        </Animated.View>

        {/* Back Side */}
        <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
          <View style={styles.rotatedContent}>
            {/* Header Section */}
            <View style={styles.horizontalBrandSection}>
              <Text style={styles.horizontalBrandText}></Text>
            </View>
            {/* <View style={styles.verticalBrandSection}>
              <Text style={styles.verticalBrandText}></Text>
            </View> */}
            {/* <View style={styles.header}>
              <View style={styles.logoSection}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>JN</Text>
                </View>
                <Text style={styles.brandName}>{brand || 'JustNeed'}</Text>
              </View>
              
              <View style={styles.idSection}>
                <Text style={styles.cardType}>Digital Skills ID</Text>
                <Text style={styles.idLabel}>{studentId}</Text>
              </View>
            </View> */}

            {/* Back Content - QR Code Centered */}
            <View style={styles.backContent}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrValue || `https://justneed.com/verify/${studentId}`}
                  size={180}
                  backgroundColor="transparent"
                  color={colors.black}
                />
              </View>
              
              <View style={styles.backInfo}>
                <Text style={styles.backInfoTitle}>Scan to Verify</Text>
                <Text style={styles.backInfoText}>
                  This digital skills card is verified by {brand || 'JustNeed'}
                </Text>
                {/* <Text style={styles.backInfoText}>
                  Valid: {issued} - {expires}
                </Text> */}
              </View>

              {/* Verification Badge */}
              {/* <View style={styles.backBadge}>
                <Ionicons name="shield-checkmark" size={20} color={getVerificationBadgeColor()} />
                <Text style={[styles.backBadgeText, { color: getVerificationBadgeColor() }]}>
                  {getVerificationLevel().toUpperCase()}
                </Text>
              </View> */}
            </View>
          </View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  cardFace: {
    width: cardWidth,
    height: cardHeight,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray300,
    ...shadows.lg,
    overflow: 'hidden',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    // Front face styles
  },
  cardBack: {
    // Back face is rotated 180 degrees initially
  },
  
  // Rotated Content Container - Rotates 90 degrees clockwise
  rotatedContent: {
    width: cardHeight, // Swap dimensions for rotation
    height: cardWidth,
    position: 'absolute',
    left: (cardWidth - cardHeight) / 2,
    top: (cardHeight - cardWidth) / 2,
    transform: [{ rotate: '90deg' }], // 90 degrees clockwise rotation
    padding: 20,
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 24,
    height: 24,
    // backgroundColor: '#00BCD4', // Cyan color like Mecenat
    backgroundColor: colors.black,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 24,
    color: colors.black,
    fontWeight: '300',
    letterSpacing: 1,
  },
    cardType: {
    ...typography.caption,
    marginTop: 2,
    fontSize: 9,
    color: colors.gray500,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'right',
  },
  idSection: {
    alignItems: 'flex-end',
  },
  idLabel: {
    fontSize: 10,
    color: colors.gray600,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  validityLabel: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '600',
    marginTop: 2,
  },

  // Main Content Styles
  mainContent: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    paddingRight: 20,
  },
   headerRight: {
    alignItems: 'flex-start',
  },
  verificationBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 1,
    borderRadius: borderRadius.sm,
  },
  verificationText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  profileImageContainer: {
    marginRight: spacing.md,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 0,
    borderColor: colors.gray200,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    ...typography.h4,
    color: colors.gray600,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    ...typography.h3,
    color: colors.black,
    fontWeight: '700',
    marginBottom: 5,
  },
  verifiedIcon: {
    marginLeft: spacing.xs,
  },

  // Score Display Styles
  scoreDisplay: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 15,
    alignSelf: 'flex-end',
  },
  scoreNumber: {
    fontSize: 24,
    color: colors.white,
    fontWeight: '900',
    letterSpacing: 1.5,
    lineHeight: 28,
  },
  scoreLabel: {
    fontSize: 8,
    color: colors.white,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: -2,
  },
  
  // Name Style (single line)
  fullName: {
    fontSize: 18,
    color: colors.black,
    fontWeight: '600',
    marginBottom: 15,
  },
  
  // Skills Section Styles (moved to left)
skillsSection: {
    marginBottom: spacing.md,
    paddingTop:10,
  },
  skillsTitle: {
    ...typography.caption,
    color: colors.gray700,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginRight: spacing.xs,
    marginBottom: spacing.xs
  },
  skillName: {
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '600',
    marginRight: 4,
  },
  skillScore: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  skillVerifiedIcon: {
    marginLeft: 4,
  },

  // Right Section Styles
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flex: 0.6,
  },
  
  // Job Title Style (moved to right)
  jobTitle: {
    fontSize: 12,
    color: colors.gray700,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'left',
  },
  
  // Valid Period Styles (moved to right)
  validPeriodSection: {
    marginBottom: 0,
    alignItems: 'flex-end',
  },
  validPeriodLabel: {
    fontSize: 9,
    color: colors.gray500,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    textAlign: 'right',
  },
  validPeriodText: {
    fontSize: 11,
    color: colors.gray700,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'right',
  },

  // Back Side Styles
  backContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    paddingTop:50,
  },
  qrContainer: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    ...shadows.md,
  },
  backInfo: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backInfoTitle: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  backInfoText: {
    fontSize: 11,
    color: colors.gray600,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 10,
  },
  backBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  backBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: 0.5,
  },

    // Vertical Brand Section (Right Side)
  // verticalBrandSection: {
  //   position: 'absolute',
  //   right: 0,
  //   top: 0,
  //   bottom: 0,
  //   width: 40,
  //   backgroundColor: colors.black,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   zIndex: 10,
  // },
  // verticalBrandText: {
  //   fontSize: 24,
  //   color: colors.white,
  //   fontWeight: '900',
  //   letterSpacing: 8,
  //   transform: [{ rotate: '180deg' }],
  // },

  // Horizontal Brand Section (Top)
  horizontalBrandSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  horizontalBrandText: {
    fontSize: 20,
    color: colors.white,
    fontWeight: '900',
    letterSpacing: 8,
  },

});