import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Job } from '../types';
import { colors, dark, gradients, matchColor } from '../constants/colors';
import { fontFamily } from '../constants/typography';

interface SwipeCardProps {
  job: Job;
  onFavouriteToggle?: (jobId: string, isFavourite: boolean) => void;
  onPress?: () => void;
  onExpandChange?: (isExpanded: boolean) => void;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ─── Conic match ring (RN has no conic-gradient → SVG arc) ──────────────
const MatchRing: React.FC<{ score: number; size?: number }> = ({ score, size = 64 }) => {
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const color = matchColor(score);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={dark.matchTrack} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c * (1 - pct)}`}
          // start the arc at 12 o'clock
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {/* inner navy disc with the % */}
      <View style={[styles.ringInner, { width: size - 14, height: size - 14, borderRadius: (size - 14) / 2 }]}>
        <Text style={[styles.ringPct, { color }]}>{Math.round(score)}</Text>
      </View>
    </View>
  );
};

const matchLabel = (s: number) => (s >= 85 ? 'Strong match' : s >= 70 ? 'Good match' : 'Possible match');

export const SwipeCard: React.FC<SwipeCardProps> = ({ job, onFavouriteToggle, onPress }) => {
  const { width, height } = useWindowDimensions();
  const CARD_WIDTH = Math.min(width * 0.9, 460);
  const CARD_HEIGHT = Math.min(Math.max(height * 0.62, 460), 680);

  const [isFavourite, setIsFavourite] = useState(job.isBookmarked || false);
  const [logoError, setLogoError] = useState(false);

  const entrance = useRef(new Animated.Value(0)).current;
  const favScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(entrance, { toValue: 1, tension: 55, friction: 9, useNativeDriver: true }).start();
  }, []);

  if (!job.title || !job.company) return null;

  const toggleFav = () => {
    const next = !isFavourite;
    setIsFavourite(next);
    onFavouriteToggle?.(job.id, next);
    Animated.sequence([
      Animated.timing(favScale, { toValue: 1.3, duration: 110, useNativeDriver: true }),
      Animated.spring(favScale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start();
  };

  const score = job.matchScore ?? 0;
  const hasMatch = score >= 1;
  const reason =
    (Array.isArray(job.matchReasons) && job.matchReasons[0]) ||
    'Your profile lines up with this role.';

  const cleanDomain = job.company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
  const logoUrl = `https://logo.clearbit.com/${cleanDomain}`;
  const eyebrow = [job.company, job.location].filter(Boolean).join('  ·  ').toUpperCase();

  const facts: { icon: IconName; label: string }[] = [];
  if (job.location) facts.push({ icon: 'location-outline', label: job.location });
  if (job.salary) facts.push({ icon: 'cash-outline', label: job.salary });
  facts.push({ icon: 'briefcase-outline', label: job.type || 'Full-time' });
  if (job.workMode) facts.push({ icon: 'navigate-outline', label: job.workMode });

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: CARD_WIDTH, height: CARD_HEIGHT },
        {
          opacity: entrance,
          transform: [
            { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
            { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={gradients.card as unknown as string[]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={styles.card}
      >
        <TouchableOpacity activeOpacity={0.95} onPress={onPress} style={styles.inner}>
          {/* top: logo tile + bookmark */}
          <View style={styles.topRow}>
            <View style={styles.logoTile}>
              {!logoError ? (
                <Image
                  source={{ uri: logoUrl }}
                  style={styles.logoImg}
                  onError={() => setLogoError(true)}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.logoInitial}>{job.company[0]?.toUpperCase()}</Text>
              )}
            </View>
            <Animated.View style={{ transform: [{ scale: favScale }] }}>
              <TouchableOpacity onPress={toggleFav} style={styles.bookmarkBtn} hitSlop={8} activeOpacity={0.8}>
                <Ionicons
                  name={isFavourite ? 'bookmark' : 'bookmark-outline'}
                  size={20}
                  color={isFavourite ? colors.gold : colors.textMuted}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* eyebrow + title */}
          <Text style={styles.eyebrow} numberOfLines={1}>{eyebrow}</Text>
          <Text style={styles.title} numberOfLines={3}>{job.title}</Text>

          {/* match block */}
          {hasMatch ? (
            <View style={styles.matchRow}>
              <MatchRing score={score} />
              <View style={styles.matchText}>
                <Text style={[styles.matchLabel, { color: matchColor(score) }]}>{matchLabel(score)}</Text>
                <Text style={styles.matchReason} numberOfLines={2}>{reason}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.divider} />

          {/* facts */}
          <View style={styles.facts}>
            {facts.map((f, i) => (
              <View style={styles.factRow} key={i}>
                <View style={styles.factIcon}>
                  <Ionicons name={f.icon} size={15} color={colors.gold} />
                </View>
                <Text style={styles.factText} numberOfLines={1}>{f.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.flexSpacer} />

          {/* swipe-up hint */}
          <View style={styles.hintRow}>
            <Text style={styles.hintText}>Swipe up for full description</Text>
            <Ionicons name="arrow-up" size={13} color={colors.textMuted} />
          </View>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 16,
  },
  card: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: dark.border,
    overflow: 'hidden',
  },
  inner: {
    flex: 1,
    padding: 22,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  logoTile: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: { width: '78%', height: '78%' },
  logoInitial: { fontSize: 24, fontFamily: fontFamily.display, color: dark.surface },
  bookmarkBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: dark.surfaceSubtle,
    borderWidth: 1,
    borderColor: dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 1.3,
    color: colors.goldSoft,
    marginBottom: 10,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: -0.8,
    color: colors.textPrimary,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 22,
  },
  ringInner: {
    position: 'absolute',
    backgroundColor: dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: { fontFamily: fontFamily.display, fontSize: 19, letterSpacing: -0.5 },
  matchText: { flex: 1 },
  matchLabel: { fontFamily: fontFamily.displayBold, fontSize: 15, marginBottom: 3 },
  matchReason: { fontFamily: fontFamily.regular, fontSize: 12.5, color: colors.textSecondary, lineHeight: 18 },
  divider: { height: 1, backgroundColor: dark.border, marginTop: 22 },
  facts: { marginTop: 18, gap: 13 },
  factRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  factIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: dark.goldTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factText: { flex: 1, fontFamily: fontFamily.regular, fontSize: 14, color: colors.textPrimary },
  flexSpacer: { flex: 1, minHeight: 12 },
  hintRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  hintText: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.textMuted, letterSpacing: 0.2 },
});
