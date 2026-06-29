import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { colors } from '../constants/colors';
import { shadows } from '../constants/shadows';
import { spacing } from '../constants/spacing';

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
}

const SkillCard: React.FC<SkillCardProps> = ({
  name,
  avatarUrl,
  score,
  skills,
  issued,
  expires,
  qrValue,
  tier,
  brand,
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
      
      return initials;
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
          <ExpoLinearGradient
            colors={['#1A1F4E', '#232A60', '#2A3270']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            {/* Rotated Content Wrapper */}
            <View style={styles.rotatedContentWrapper}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.brandText}>JUSTNEED.AI</Text>
                <View style={styles.verifiedBadge}>
                  <Svg width={10} height={10} viewBox="0 0 10 10">
                    <Path
                      d="M2 5l2 2 4-4"
                      stroke="#D4A574"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </Svg>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              </View>

              {/* Body */}
              <View style={styles.body}>
                {/* Avatar */}
                <View style={styles.avatar}>
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.avatarInitials}>
                      {renderUserInitials()}
                    </Text>
                  )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.nameText} numberOfLines={1}>{name}</Text>
                  <Text style={styles.roleText} numberOfLines={1}>
                    {tier || 'Senior'} · {issued ? new Date(issued).getFullYear() : '2024'}
                  </Text>
                  <View style={styles.skillsRow}>
                    {topSkills.map((skill) => (
                      <View key={skill.id} style={styles.skillPill}>
                        {skill.verified && (
                          <Svg width={9} height={9} viewBox="0 0 10 10" style={{ marginRight: 4 }}>
                            <Path
                              d="M2 5l2 2 4-4"
                              stroke="#6FB7A8"
                              strokeWidth={1.8}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                            />
                          </Svg>
                        )}
                        <Text style={styles.skillPillText} numberOfLines={1}>{skill.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Score Ring */}
                <View style={styles.scoreRingContainer}>
                  <Svg width={96} height={96} viewBox="0 0 80 80">
                    {/* Track */}
                    <Circle
                      cx={40}
                      cy={40}
                      r={34}
                      stroke="rgba(248,244,237,0.18)"
                      strokeWidth={6}
                      fill="none"
                    />
                    {/* Arc */}
                    <G rotation={-90} originX={40} originY={40}>
                      <Circle
                        cx={40}
                        cy={40}
                        r={34}
                        stroke="#D4A574"
                        strokeWidth={6}
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={2 * Math.PI * 34 * (1 - score / 100)}
                        strokeLinecap="round"
                      />
                    </G>
                  </Svg>
                  <View style={styles.scoreNumberContainer}>
                    <Text style={styles.scoreNumberText}>{score}</Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.cardIdText}>JN-{studentId}</Text>
                <View style={styles.availabilityRow}>
                  <View style={styles.availabilityDot} />
                  <Text style={styles.availabilityText}>Open to offers</Text>
                </View>
              </View>
            </View>
          </ExpoLinearGradient>
        </Animated.View>

        {/* Back Side */}
        <Animated.View style={[styles.cardFace, styles.cardBack, backAnimatedStyle]}>
          <View style={styles.rotatedContentWrapper}>
            <View style={styles.backContainer}>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={qrValue || `https://justneed.ai/profile/JN-${studentId}`}
                  size={170}
                  color="#1B1F3B"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <View style={styles.backContent}>
                <Text style={styles.backEyebrow}>VERIFIED IDENTITY</Text>
                <Text style={styles.backCardId}>JN-{studentId}</Text>
                <Text style={styles.backMessage}>
                  Scan to view the live profile and verified skills.
                </Text>
                <Text style={styles.backBrand}>justneed.ai</Text>
              </View>
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
    marginVertical: 50,
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
    borderRadius: 14,
    borderWidth: 0,
    ...shadows.lg,
    overflow: 'hidden',
    position: 'absolute',
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    // Front face styles
  },
  cardBack: {
    backgroundColor: '#F8F4ED',
  },
  
  gradientBackground: {
    flex: 1,
  },
  
  // Rotated Content Wrapper - Rotates 90 degrees clockwise
  rotatedContentWrapper: {
    width: cardHeight,
    height: cardWidth,
    position: 'absolute',
    left: (cardWidth - cardHeight) / 2,
    top: (cardHeight - cardWidth) / 2,
    transform: [{ rotate: '90deg' }],
    padding: 20,
    justifyContent: 'space-between',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4A574',
    letterSpacing: 1.3,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212,165,116,0.18)',
    borderColor: 'rgba(212,165,116,0.32)',
    borderWidth: 1,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4A574',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  
  // Body
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2A3052',
    borderWidth: 2,
    borderColor: 'rgba(212,165,116,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8F4ED',
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8F4ED',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(248,244,237,0.85)',
    marginBottom: 10,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  skillPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(248,244,237,0.15)',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(248,244,237,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 5,
    marginBottom: 5,
  },
  skillPillText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#F8F4ED',
  },
  
  // Score Ring
  scoreRingContainer: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scoreNumberContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumberText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F8F4ED',
    letterSpacing: -1,
  },
  
  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardIdText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#D4A574',
    fontFamily: 'monospace',
    letterSpacing: 0.6,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(248,244,237,0.85)',
    marginLeft: 6,
  },
  
  // Back Side
  backContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8F4ED',
    borderRadius: 14,
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  qrWrapper: {
    backgroundColor: colors.surface,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D9D5CC',
  },
  backContent: {
    flex: 1,
    gap: 4,
  },
  backEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A8854E',
    letterSpacing: 1.5,
  },
  backCardId: {
    fontSize: 14,
    fontWeight: '400',
    color: '#1B1F3B',
    fontFamily: 'monospace',
    letterSpacing: 0.6,
    marginVertical: 4,
  },
  backMessage: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B6F85',
    marginVertical: 4,
  },
  backBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B1F3B',
    marginTop: 6,
  },
});

export default SkillCard;