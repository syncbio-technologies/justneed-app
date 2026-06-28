import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Job } from '../types';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { typography } from '../constants/typography';
import { shadows } from '../constants/shadows';

export default function PinnedScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { favorites, setFavorites, removeFavorite } = useFavorites();

  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }, [user])
  );

  const loadFavourites = async () => {
    if (!user) return;
    
    try {
      const jobs = await jobService.getFavourites(user.id);
      const sortedJobs = jobs.sort((a, b) => {
        const dateA = a.postedDate instanceof Date ? a.postedDate : new Date(a.postedDate);
        const dateB = b.postedDate instanceof Date ? b.postedDate : new Date(b.postedDate);
        return dateB.getTime() - dateA.getTime();
      });
      setFavorites(sortedJobs);
    } catch (error) {
      console.error('Error loading favourites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFavourites();
  };

  const handleRemoveFavourite = async (jobId: string) => {
    if (!user) return;
    
    try {
      await jobService.removeFromFavourites(user.id, jobId);
      removeFavorite(jobId);
    } catch (error) {
      console.error('Error removing favourite:', error);
    }
  };

  const renderJobCard = ({ item }: { item: Job }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.companyBadge}>
          <Text style={styles.companyInitial}>{item.company[0]}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.jobTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.company}>{item.company}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favouriteButton}
          onPress={() => handleRemoveFavourite(item.id)}
        >
          <Ionicons name="heart" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>

        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Ionicons name="briefcase" size={14} color={colors.primary} />
            <Text style={styles.badgeText}>{item.type}</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons 
              name={
                item.workMode === 'Remote' ? 'wifi' : 
                item.workMode === 'On-site' ? 'business' : 
                'laptop'
              } 
              size={14} 
              color={colors.primary}
            />
            <Text style={styles.badgeText}>{item.workMode}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={async () => {
            if (!user) return;
            try {
              await jobService.applyToJob(user.id, item);
              Alert.alert('Success', 'Application submitted!');
              loadFavourites();
            } catch (error) {
              Alert.alert('Error', 'Failed to apply');
            }
          }}
        >
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Apply</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            Share.share({
              message: `Check out this job: ${item.title} at ${item.company}\n${item.location}`,
            });
          }}
        >
          <Ionicons name="share-social-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color={colors.gray300} />
      <Text style={styles.emptyTitle}>No Favourites Yet</Text>
      <Text style={styles.emptyText}>
        Mark jobs as favourite while swiping to save them for later
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favourites</Text>
        {favorites.length > 0 && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{favorites.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={favorites}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          favorites.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  counterBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 32,
    alignItems: 'center',
  },
  counterText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  companyBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  companyInitial: {
    ...typography.h4,
    color: colors.white,
    fontWeight: '700',
  },
  cardInfo: {
    flex: 1,
  },
  jobTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: 4,
  },
  company: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  favouriteButton: {
    padding: spacing.xs,
  },
  cardDetails: {
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  badgeText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});