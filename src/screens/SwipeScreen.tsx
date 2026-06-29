import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SwipeCard } from '../components/SwipeCard';
import SearchFilter from '../components/SearchFilter';
import { Job } from '../types';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useGoogleAuth } from '../services/googleAuthService';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography, fontFamily } from '../constants/typography';
import { shadows } from '../constants/shadows';
import justNeedLogo from '../../assets/logo.png';
import ApplyModal from '../components/ApplyModal';

const SWIPE_THRESHOLD_RATIO = 0.25;

// ─── Dark redesign tokens (mapped to constants/colors — REDESIGN.md §1) ─────
const DARK_BG = colors.bg;
const DARK_SURFACE = colors.surface;
const DARK_ELEVATED = colors.surfaceElev;
const GOLD_RICH = colors.gold;
const GOLD_SOFT = colors.goldTint;
const GOLD_BORDER = colors.border;
const GOLD_GLOW = 'rgba(212,165,116,0.18)';
const TEXT_PRIMARY = colors.textPrimary;
const TEXT_SECONDARY = colors.textSecondary;
const TEXT_TERTIARY = colors.textMuted;
const DIVIDER = colors.border;
const GREEN_ACCENT = colors.match;
const RED_ACCENT = colors.danger;

export default function SwipeScreen({ navigation }: any) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [lastSwipedJob, setLastSwipedJob] = useState<{ job: Job; direction: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, logout } = useAuth();
  const { addFavorite, removeFavorite } = useFavorites();
  const { signOut } = useGoogleAuth();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const SWIPE_THRESHOLD = windowWidth * SWIPE_THRESHOLD_RATIO;

  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Button press animations
  const skipScale = useRef(new Animated.Value(1)).current;
  const acceptScale = useRef(new Animated.Value(1)).current;
  const undoScale = useRef(new Animated.Value(1)).current;

  // Header entrance
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 420,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (user) {
      loadJobs();
    } else {
      setJobs([]);
      setCurrentIndex(0);
      setLastSwipedJob(null);
      setFilters({});
      setSearchQuery('');
      setLoading(false);
    }
  }, [filters, user]);

  const loadJobs = async (reset: boolean = false) => {
    if (!user) {
      console.warn('Cannot load jobs: User not logged in');
      return;
    }
    try {
      setLoading(true);
      if (reset) setCurrentIndex(0);
      const availableJobs = await jobService.getJobs(filters);
      setJobs(availableJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.search || '');
    setCurrentIndex(0);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    const { state, translationX, translationY } = event.nativeEvent;
    if (state === State.END) {
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);
      if (absX > absY && absX > SWIPE_THRESHOLD) {
        forceSwipe(translationX > 0 ? 'right' : 'left');
      } else {
        resetPosition();
      }
    }
  };

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? windowWidth * 1.5 : -(windowWidth * 1.5);
    Animated.parallel([
      Animated.timing(position, { toValue: { x, y: 0 }, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = async (direction: 'left' | 'right') => {
    const nextIndex = currentIndex + 1;
    if (currentIndex >= jobs.length) {
      position.setValue({ x: 0, y: 0 });
      opacity.setValue(1);
      return;
    }
    const currentJob = jobs[currentIndex];
    setLastSwipedJob({ job: currentJob, direction });
    if (direction === 'right') {
      await applyToCurrentJob();
    } else {
      await skipCurrentJob();
    }
    position.setValue({ x: 0, y: 0 });
    opacity.setValue(1);
    setIsCardExpanded(false);
    setCurrentIndex(nextIndex);
  };

  const handleUndo = () => {
    if (lastSwipedJob && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setLastSwipedJob(null);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const animateBtn = (anim: Animated.Value, cb: () => void) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0.88, duration: 90, useNativeDriver: true }),
      Animated.spring(anim, { toValue: 1, friction: 4, tension: 140, useNativeDriver: true }),
    ]).start(cb);
  };

  const handleSkip = () => animateBtn(skipScale, () => forceSwipe('left'));
  const handleAccept = () => animateBtn(acceptScale, () => forceSwipe('right'));
  const handleUndoBtn = () => animateBtn(undoScale, handleUndo);

  const applyToCurrentJob = async () => {
    if (currentIndex >= jobs.length) return;
    const currentJob = jobs[currentIndex];
    if (!currentJob) return;
    if (!user) { Alert.alert('Error', 'User not found. Please log in again.'); return; }
    setSelectedJob(currentJob);
    setModalVisible(true);
  };

  const skipCurrentJob = async () => {
    if (currentIndex >= jobs.length) return;
    const currentJob = jobs[currentIndex];
    if (!currentJob) return;
    try { await jobService.markJobAsSwiped(currentJob.id); } catch (_) { }
  };

  const handleFilter = () => setShowFilters(true);
  const handleCardExpandChange = (expanded: boolean) => setIsCardExpanded(expanded);

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        const callback = Platform.OS === 'web' ? undefined : signOut;
        await logout(callback);
      } catch (error) {
        Alert.alert('Error', 'Failed to logout');
      }
    };
    if (Platform.OS === 'web') { await performLogout(); return; }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: performLogout, style: 'destructive' },
    ]);
  };

  const handleFinalConfirmApply = async () => {
    if (!selectedJob || !user) return;
    try {
      const result = await jobService.applyWithSkillCard(selectedJob.id, selectedJob.title);
      if (result.success) {
        Alert.alert('Success', 'Application sent to Recruiter email!');
        setModalVisible(false);
      } else {
        Alert.alert('Error', result.message || 'Failed to send application.');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please try again.');
    }
  };

  const renderCards = () => {
    if (!user) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconRing}>
            <Ionicons name="log-in-outline" size={44} color={GOLD_RICH} />
          </View>
          <Text style={styles.emptyTitle}>Welcome to JustNeed</Text>
          <Text style={styles.emptyText}>Please log in to browse and apply to jobs.</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
            <Text style={styles.refreshText}>Log In</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading jobs…</Text>
        </View>
      );
    }

    if (currentIndex >= jobs.length) {
      const hasFilters = Object.keys(filters).some(key => filters[key]);
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconRing}>
            <Ionicons name="checkmark-circle-outline" size={44} color={GOLD_RICH} />
          </View>
          <Text style={styles.emptyTitle}>{hasFilters ? 'No Jobs Found' : 'No More Jobs!'}</Text>
          <Text style={styles.emptyText}>
            {hasFilters ? 'Try adjusting your filters or search terms.' : "You've reviewed all available positions."}
          </Text>
          {hasFilters ? (
            <TouchableOpacity style={styles.refreshButton} onPress={() => handleSearch({})} activeOpacity={0.8}>
              <Text style={styles.refreshText}>Clear Filters</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.refreshButton} onPress={() => loadJobs(true)} activeOpacity={0.8}>
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    const cardsToShow = Math.min(3, jobs.length - currentIndex);
    const visibleJobs = jobs.slice(currentIndex, currentIndex + cardsToShow);

    return visibleJobs.map((job: Job, index: number) => {
      const isTopCard = index === 0;
      const scale = 1 - (index * 0.02);
      const translateY = index * 12;

      if (isTopCard) {
        const acceptOpacity = position.x.interpolate({
          inputRange: [0, windowWidth * 0.5],
          outputRange: [0, 0.35],
          extrapolate: 'clamp',
        });
        const rejectOpacity = position.x.interpolate({
          inputRange: [-(windowWidth * 0.5), 0],
          outputRange: [0.35, 0],
          extrapolate: 'clamp',
        });

        return (
          <PanGestureHandler
            key={job.id}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
            activeOffsetX={[-15, 15]}
            failOffsetY={[-20, 20]}
          >
            <Animated.View
              style={[
                styles.cardContainer,
                {
                  width: windowWidth * 0.9,
                  transform: [
                    { translateX: position.x },
                    { translateY: 0 },
                    {
                      rotate: position.x.interpolate({
                        inputRange: [-windowWidth, 0, windowWidth],
                        outputRange: ['-30deg', '0deg', '30deg'],
                      }),
                    },
                    { scale },
                    { translateY },
                  ],
                  opacity,
                  zIndex: 1000 - index,
                },
              ]}
            >
              <SwipeCard
                job={job}
                onFavouriteToggle={async (jobId, isFav) => {
                  if (!user) return;
                  try {
                    if (isFav) { await jobService.addToFavourites(user.id, job); addFavorite(job); }
                    else { await jobService.removeFromFavourites(user.id, jobId); removeFavorite(jobId); }
                  } catch (err) { console.error('Error toggling favourite:', err); }
                }}
                onExpandChange={handleCardExpandChange}
              />

              {/* Apply overlay */}
              <Animated.View style={[styles.swipeOverlay, styles.acceptOverlay, { opacity: acceptOpacity }]}>
                <View style={styles.swipeLabel}>
                  <Ionicons name="checkmark-circle" size={56} color={GREEN_ACCENT} />
                  <Text style={styles.swipeLabelText}>APPLY</Text>
                </View>
              </Animated.View>

              {/* Skip overlay */}
              <Animated.View style={[styles.swipeOverlay, styles.rejectOverlay, { opacity: rejectOpacity }]}>
                <View style={styles.swipeLabel}>
                  <Ionicons name="close-circle" size={56} color={RED_ACCENT} />
                  <Text style={styles.swipeLabelText}>SKIP</Text>
                </View>
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>
        );
      }

      return (
        <View
          key={job.id}
          style={[
            styles.cardContainer,
            {
              width: windowWidth * 0.9,
              transform: [{ scale }, { translateY }],
              zIndex: 1000 - index,
            },
          ]}
        >
          <SwipeCard
            job={job}
            onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
          />
        </View>
      );
    }).reverse();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

        {/* ─── TOP BAR ─── */}
        <Animated.View
          style={[
            styles.topBar,
            {
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
            },
          ]}
        >
          {/* Left: Premium Wordmark with Original Logo */}
          <View style={styles.leftSection}>
            <View style={styles.logoClip}>
              <Image source={justNeedLogo} style={styles.logo} resizeMode="contain" />
            </View>
            {/* Wordmark & Slogan */}
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandWordmark}>justneed</Text>
              <Text style={styles.brandSlogan}>Find • Match • Grow</Text>
            </View>
          </View>

          {/* Right: Action icons */}
          <View style={styles.rightSection}>
            <TouchableOpacity style={styles.modernIconButton} onPress={handleFilter} activeOpacity={0.75}>
              <Ionicons name="funnel-outline" size={20} color={GOLD_RICH} />
              {Object.keys(filters).length > 0 && <View style={styles.filterDot} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modernIconButton} onPress={handleLogout} activeOpacity={0.75}>
              <Ionicons name="log-out-outline" size={20} color={GOLD_RICH} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Subtle top-bar bottom shimmer line */}
        <View style={styles.topBarSeparator} />

        {/* ─── CARDS ─── */}
        <View style={styles.cardsContainer}>{renderCards()}</View>

        {/* ─── ACTION BUTTONS ─── */}
        {currentIndex < jobs.length && (
          <View style={styles.actionsContainer}>
            {/* Undo */}
            {lastSwipedJob && currentIndex > 0 && (
              <Animated.View style={{ transform: [{ scale: undoScale }] }}>
                <TouchableOpacity style={[styles.actionButton, styles.undoButton]} onPress={handleUndoBtn} activeOpacity={0.8}>
                  <Ionicons name="arrow-undo" size={18} color={GOLD_RICH} />
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Skip */}
            <Animated.View style={{ transform: [{ scale: skipScale }] }}>
              <TouchableOpacity style={[styles.actionButton, styles.skipButton]} onPress={handleSkip} activeOpacity={0.8}>
                <Ionicons name="close" size={24} color={RED_ACCENT} />
              </TouchableOpacity>
            </Animated.View>

            {/* Accept / Apply */}
            <Animated.View style={{ transform: [{ scale: acceptScale }] }}>
              <TouchableOpacity style={[styles.actionButton, styles.acceptButton]} onPress={handleAccept} activeOpacity={0.85}>
                <Ionicons name="checkmark" size={26} color={DARK_BG} />
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        <SearchFilter visible={showFilters} onClose={() => setShowFilters(false)} onSearch={handleSearch} />

        <ApplyModal
          visible={isModalVisible}
          jobTitle={selectedJob?.title || ''}
          onClose={() => setModalVisible(false)}
          onSend={handleFinalConfirmApply}
        />

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },

  // ── TOP BAR ──────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: DARK_SURFACE,
    // Glassmorphism edge
    borderBottomWidth: 0,
    // Top shadow cast downward
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  topBarSeparator: {
    height: 0.5,
    backgroundColor: 'rgba(201,168,76,0.18)',
    // Subtle gold line beneath header
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  logoClip: {
    width: 42,
    height: 42,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 66,
    height: 66,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  brandWordmark: {
    fontFamily: fontFamily.displayBold,
    fontSize: 20,
    color: TEXT_PRIMARY,
    letterSpacing: -0.4,
  },
  brandSlogan: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modernIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GOLD_SOFT,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: GOLD_BORDER,
    // Soft shadow
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  filterDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GOLD_RICH,
    borderWidth: 1.5,
    borderColor: DARK_SURFACE,
  },

  // ── CARDS ────────────────────────────────────────────────────────────────
  cardsContainer: {
    flex: 0.85,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  cardContainer: {
    position: 'absolute',
    top: spacing.xl,
  },

  // ── ACTION BUTTONS ───────────────────────────────────────────────────────
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: 22,
    zIndex: 3000,
    elevation: 10,
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    // Shared shadow
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  skipButton: {
    backgroundColor: DARK_ELEVATED,
    borderColor: 'rgba(224,100,138,0.45)',
  },
  undoButton: {
    backgroundColor: DARK_ELEVATED,
  },
  acceptButton: {
    backgroundColor: GOLD_RICH, // gold-filled primary CTA
    width: 58,
    height: 58,
    borderRadius: 29,
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
    borderColor: GOLD_RICH,
    borderWidth: 1,
  },

  // ── EMPTY / LOADING STATES ───────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: 12,
  },
  emptyIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: GOLD_SOFT,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  refreshButton: {
    marginTop: 4,
    backgroundColor: GOLD_RICH,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: GOLD_RICH,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 16,
    elevation: 8,
  },
  refreshText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: 0.2,
  },

  // ── SWIPE OVERLAYS ───────────────────────────────────────────────────────
  swipeOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  acceptOverlay: {
    backgroundColor: 'rgba(88,201,162,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(88,201,162,0.5)',
    borderRadius: 28,
  },
  rejectOverlay: {
    backgroundColor: 'rgba(224,100,138,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(224,100,138,0.5)',
    borderRadius: 28,
  },
  swipeLabel: {
    alignItems: 'center',
    gap: 8,
  },
  swipeLabelText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 3,
  },

  // kept for legacy reference
  iconButton: { padding: 8 },
});
