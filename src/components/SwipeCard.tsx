import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../types';
import { parseJobDescription } from '../utils/formatDescription';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';
import { shadows } from '../constants/shadows';

interface SwipeCardProps {
  job: Job;
  onFavouriteToggle?: (jobId: string, isFavourite: boolean) => void;
  onPress?: () => void;
  onExpandChange?: (isExpanded: boolean) => void;
}

// ─── Premium Design Tokens ──────────────────────────────────────────────────
const DARK_BG       = '#0A0A0A';
const DARK_SURFACE  = '#111111';
const DARK_SURFACE2 = '#181818';
const DARK_ELEVATED = '#1C1C1C';
const GOLD          = colors.gold;           // keep existing gold reference
const GOLD_RICH     = '#C9A84C';             // slightly warmer / deeper
const GOLD_SOFT     = 'rgba(201,168,76,0.12)';
const GOLD_GLOW     = 'rgba(201,168,76,0.22)';
const GOLD_BORDER   = 'rgba(201,168,76,0.28)';
const GOLD_SHIMMER  = 'rgba(255,220,120,0.55)';
const TEXT_PRIMARY  = '#F5F5F5';
const TEXT_SECONDARY= '#8A8A8E';
const TEXT_TERTIARY = '#5A5A5E';
const GREEN_ACCENT  = '#22C55E';
const RED_ACCENT    = '#EF4444';
const DIVIDER       = 'rgba(255,255,255,0.06)';

export const SwipeCard: React.FC<SwipeCardProps> = ({
  job,
  onFavouriteToggle,
  onPress,
  onExpandChange,
}) => {
  const { width, height } = useWindowDimensions();
  const CARD_WIDTH  = Math.min(width * 0.9, 520);
  const CARD_HEIGHT = Math.min(Math.max(height * 0.65, 480), 720);

  const [isExpanded, setIsExpanded]   = useState(false);
  const [isFavourite, setIsFavourite] = useState(job.isBookmarked || false);
  const [logoError, setLogoError]     = useState(false);

  // Entrance animation
  const entranceAnim = useRef(new Animated.Value(0)).current;

  // Favourite animations
  const scaleAnim     = useRef(new Animated.Value(0)).current;
  const opacityAnim   = useRef(new Animated.Value(0)).current;
  const translateYAnim= useRef(new Animated.Value(0)).current;

  // Fav button pulse
  const favScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 55,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!job.title || !job.company) return null;

  const handleFavouriteToggle = () => {
    const next = !isFavourite;
    setIsFavourite(next);
    onFavouriteToggle?.(job.id, next);

    // Micro-interaction: button scale bounce
    Animated.sequence([
      Animated.timing(favScale, { toValue: 1.35, duration: 120, useNativeDriver: true }),
      Animated.spring(favScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();

    if (next) {
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);
      translateYAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
        Animated.timing(translateYAnim, { toValue: -50, duration: 800, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    }
  };

  const handleExpandToggle = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    onExpandChange?.(next);
  };

  const descriptionPreview = job.description?.substring(0, 120) ?? '';
  const hasMoreDescription  = (job.description?.length ?? 0) > 120;
  const descriptionSections = parseJobDescription(job.description ?? '');

  const getDeadlineWarning = () => {
    if (!job.postedDate) return null;
    const deadline = new Date(job.postedDate);
    deadline.setDate(deadline.getDate() + 30);
    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 7 && daysLeft > 0) return `${daysLeft} days left`;
    return null;
  };
  const deadlineWarning = getDeadlineWarning();

  const workModeIcon =
    job.workMode === 'Remote'   ? 'wifi-outline'     :
    job.workMode === 'On-site'  ? 'business-outline' : 'laptop-outline';

  const COMPANY_BANNERS = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
    'https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=800&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&q=80',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
    'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&q=80',
  ];

  const getBannerImage = (companyName: string) => {
    const sum = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return COMPANY_BANNERS[sum % COMPANY_BANNERS.length];
  };

  const cleanDomain = job.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  const logoUrl = `https://logo.clearbit.com/${cleanDomain}`;

  return (
    <Animated.View
      style={[
        styles.goldWrapper,
        { width: CARD_WIDTH, height: CARD_HEIGHT },
        {
          opacity: entranceAnim,
          transform: [
            { scale: entranceAnim.interpolate({ inputRange: [0,1], outputRange: [0.94, 1] }) },
            { translateY: entranceAnim.interpolate({ inputRange: [0,1], outputRange: [28, 0] }) },
          ],
        },
      ]}
    >
      {/* Outer ambient glow ring */}
      <View style={styles.outerGlow} pointerEvents="none" />

      <View style={styles.card}>
        {/* ─── SHIMMER TOP EDGE ─── */}
        <View style={styles.shimmerEdge} pointerEvents="none" />

        {/* ─── BANNER ─── */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: getBannerImage(job.company) }}
            style={styles.bannerImage}
            resizeMode="cover"
          />

          {/* Cinematic gradient overlay */}
          <View style={styles.bannerOverlay} pointerEvents="none" />
          {/* Bottom fade to card surface */}
          <View style={styles.bannerBottomFade} pointerEvents="none" />

          {/* Top-right actions */}
          <View style={styles.topRightActions}>
            {job.matchScore != null && job.matchScore > 0 && (
              <View style={styles.matchBoxOverlay}>
                <Text style={styles.matchBoxScore}>{job.matchScore}%</Text>
                <Text style={styles.matchBoxLabel}>Match</Text>
                <Ionicons name="trending-up" size={14} color={GREEN_ACCENT} style={{ marginTop: 2 }} />
              </View>
            )}

            <Animated.View style={{ transform: [{ scale: favScale }] }}>
              <TouchableOpacity style={styles.bannerFavBtn} onPress={handleFavouriteToggle} activeOpacity={0.8}>
                <Ionicons
                  name={isFavourite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={GOLD_RICH}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Floating company logo */}
          <View style={styles.logoOverlayBox}>
            {!logoError ? (
              <Image
                source={{ uri: logoUrl }}
                style={styles.logoImage}
                onError={() => setLogoError(true)}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.companyInitialLarge}>{job.company[0]}</Text>
            )}
          </View>
        </View>

        {/* ─── HEADER CONTENT ─── */}
        <View style={styles.headerContentContainer}>
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              {job.matchScore != null && job.matchScore > 80 && (
                <View style={styles.topMatchBadge}>
                  <Ionicons name="star" size={11} color={GOLD_RICH} />
                  <Text style={styles.topMatchText}>Top Match</Text>
                </View>
              )}
              <Text style={styles.newJobTitle} numberOfLines={1}>{job.title}</Text>
              <Text style={styles.newCompanyName}>
                {job.company}{job.location ? ` · ${job.location}` : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── SCROLLABLE BODY ─── */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Badges */}
          <View style={styles.badges}>
            {job.matchScore != null && job.matchScore > 50 && (
              <View style={[styles.badge, styles.badgeMatch]}>
                <Ionicons name="sparkles" size={10} color={GOLD_RICH} />
                <Text style={styles.badgeText}>{job.matchScore}% match</Text>
              </View>
            )}
            {!!deadlineWarning && (
              <View style={[styles.badge, styles.badgeUrgent]}>
                <Ionicons name="alert-circle-outline" size={10} color={RED_ACCENT} />
                <Text style={[styles.badgeText, { color: RED_ACCENT }]}>{deadlineWarning}</Text>
              </View>
            )}
            <View style={[styles.badge, styles.badgeDefault]}>
              <Ionicons name="briefcase-outline" size={10} color={GOLD_RICH} />
              <Text style={styles.badgeText}>{job.type || 'Full-time'}</Text>
            </View>
            <View style={[styles.badge, styles.badgeDefault]}>
              <Ionicons name={workModeIcon} size={10} color={GOLD_RICH} />
              <Text style={styles.badgeText}>{job.workMode || 'On-site'}</Text>
            </View>
          </View>

          {/* Info rows */}
          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconDot}>
                <Ionicons name="location-outline" size={12} color={GOLD_RICH} />
              </View>
              <Text style={styles.infoText}>{job.location || 'Location not specified'}</Text>
            </View>
            {(job.experienceRequired || job.experienceYears) && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconDot}>
                  <Ionicons name="briefcase-outline" size={12} color={GOLD_RICH} />
                </View>
                <Text style={styles.infoText}>
                  {job.experienceYears ? `${job.experienceYears}+ years experience` : 'Experience required'}
                </Text>
              </View>
            )}
            {job.salary && (
              <View style={styles.infoRow}>
                <View style={styles.infoIconDot}>
                  <Ionicons name="cash-outline" size={12} color={GOLD_RICH} />
                </View>
                <Text style={styles.infoText}>{job.salary}</Text>
              </View>
            )}
          </View>

          <View style={styles.hairline} />

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>About the role</Text>
            {isExpanded ? (
              descriptionSections.map((s, i) => (
                <Text key={i} style={styles.descText}>{s.content}</Text>
              ))
            ) : (
              <Text style={styles.descText}>
                {descriptionPreview}{hasMoreDescription ? '…' : ''}
              </Text>
            )}
            {hasMoreDescription && (
              <TouchableOpacity style={styles.readMoreBtn} onPress={handleExpandToggle} activeOpacity={0.7}>
                <Text style={styles.readMoreText}>{isExpanded ? 'Read less' : 'Read more'}</Text>
                <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={13} color={GOLD_RICH} />
              </TouchableOpacity>
            )}
          </View>

          {/* Requirements */}
          {job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 && (
            <View style={styles.reqSection}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              {job.requirements.map((req, i) => {
                const text =
                  typeof req === 'string'
                    ? req
                    : (req as any)?.label || (req as any)?.name || JSON.stringify(req);
                if (typeof text !== 'string') return null;
                return (
                  <View key={i} style={styles.reqRow}>
                    <View style={styles.reqCheckDot}>
                      <Ionicons name="checkmark" size={9} color={GOLD_RICH} />
                    </View>
                    <Text style={styles.reqText}>{text}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>


        {/* ─── HEART OVERLAY ─── */}
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            styles.heartOverlay,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }, { translateY: translateYAnim }],
            },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={120} color={RED_ACCENT} />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Outer gold border wrapper — now gradient-illusion via borderColor layering
  goldWrapper: {
    borderRadius: 24,
    padding: 1.5,
    backgroundColor: GOLD_RICH,
    // Deep layered shadow stack for 3D depth
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 18,
  },
  outerGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 30,
    backgroundColor: 'transparent',
    // Secondary ambient shadow layer
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 0,
  },
  card: {
    flex: 1,
    backgroundColor: DARK_BG,
    borderRadius: 22,
    overflow: 'hidden',
    // Subtle inner highlight at top edge
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 0.5,
  },
  shimmerEdge: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,220,130,0.35)',
    zIndex: 20,
  },

  // ── BANNER ──────────────────────────────────────────────────────────────
  bannerContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,4,6,0.32)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  bannerBottomFade: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 70,
    // Simulate gradient from transparent to dark surface
    backgroundColor: 'transparent',
    // React Native workaround: layered via opacity
  },

  topRightActions: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  matchBoxOverlay: {
    backgroundColor: 'rgba(10,10,10,0.72)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: GOLD_BORDER,
    // Glassmorphism feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  matchBoxScore: {
    fontSize: 17,
    fontWeight: '700',
    color: GREEN_ACCENT,
    letterSpacing: -0.3,
  },
  matchBoxLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    marginTop: 1,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bannerFavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10,10,10,0.72)',
    borderWidth: 1,
    borderColor: GOLD_RICH,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 4,
  },
  logoOverlayBox: {
    position: 'absolute',
    bottom: -22,
    left: 16,
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DARK_BG,
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 10,
  },
  companyInitialLarge: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },
  logoImage: {
    width: '84%',
    height: '84%',
    borderRadius: 13,
  },

  // ── HEADER BELOW BANNER ─────────────────────────────────────────────────
  headerContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 12,
    backgroundColor: DARK_BG,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleLeft: {
    flex: 1,
    paddingRight: 12,
  },
  topMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: GOLD_SOFT,
    borderWidth: 0.5,
    borderColor: GOLD_BORDER,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginBottom: 9,
    gap: 4,
  },
  topMatchText: {
    fontSize: 10,
    fontWeight: '600',
    color: GOLD_RICH,
    letterSpacing: 0.2,
  },
  newJobTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 5,
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  newCompanyName: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  // ── BODY ─────────────────────────────────────────────────────────────────
  scrollView: { flex: 1, backgroundColor: DARK_BG },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },

  // Badges
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  badgeDefault: {
    backgroundColor: GOLD_SOFT,
    borderColor: GOLD_BORDER,
  },
  badgeMatch: {
    backgroundColor: GOLD_SOFT,
    borderColor: GOLD_BORDER,
  },
  badgeUrgent: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderColor: 'rgba(239,68,68,0.28)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: GOLD_RICH,
    letterSpacing: 0.1,
  },

  // Info rows
  infoRows: {
    marginBottom: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  infoIconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: GOLD_SOFT,
    borderWidth: 0.5,
    borderColor: GOLD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.05,
  },

  hairline: {
    height: 0.5,
    backgroundColor: DIVIDER,
    marginBottom: 14,
  },

  // Description
  descSection: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  descText: {
    fontSize: 13.5,
    color: TEXT_SECONDARY,
    lineHeight: 21,
    letterSpacing: 0.05,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: 12,
    color: GOLD_RICH,
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  // Requirements
  reqSection: { marginBottom: 10 },
  reqRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 7,
  },
  reqCheckDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GOLD_SOFT,
    borderWidth: 0.5,
    borderColor: GOLD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  reqText: {
    fontSize: 12.5,
    color: TEXT_SECONDARY,
    flex: 1,
    lineHeight: 19,
    letterSpacing: 0.05,
  },


  // Heart overlay
  heartOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
  },
});
