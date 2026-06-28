import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Application } from '../types';
import { jobService } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import { API_BASE } from '../config/api';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import {
  Screen,
  Text,
  Card,
  Avatar,
  Badge,
  StatusBadge,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
} from '../ui';

const TOKEN_KEY = '@justneed_token';

const STATUS_OPTIONS: Application['status'][] = [
  'Applied',
  'Under Review',
  'Interview',
  'Accepted',
  'Rejected',
];

export default function ApplicationsScreen({ navigation }: any) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      loadApplications();
    }, [user])
  );

  const loadApplications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setError(false);
      const apps = await jobService.getApplications(user.id);
      setApplications(
        apps.sort(
          (a, b) =>
            new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        )
      );
    } catch (e) {
      console.error('Error loading applications:', e);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const updateStatus = async (appId: string, newStatus: Application['status']) => {
    // Optimistic update — reflect the change instantly, reconcile on response.
    const previous = applications;
    setApplications((apps) =>
      apps.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    try {
      const res = await fetch(`${API_BASE}/applications/${appId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem(TOKEN_KEY)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
    } catch (e) {
      console.error('Error updating status:', e);
      setApplications(previous); // roll back
      Alert.alert('Update failed', "We couldn't update the status. Please try again.");
    }
  };

  const promptStatus = (item: Application) => {
    Alert.alert('Update Status', 'Choose application status', [
      ...STATUS_OPTIONS.map((s) => ({
        text: s,
        onPress: () => updateStatus(item.id, s),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const renderCard = ({ item }: { item: Application }) => (
    <Card
      variant="outlined"
      onPress={() =>
        navigation.navigate('JobDetails', {
          jobId: item.jobId,
          isApplied: true,
          appliedDate: new Date(item.appliedDate).toISOString(),
        })
      }
      accessibilityLabel={`${item.job.title} at ${item.job.company}, status ${item.status}`}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Avatar name={item.job.company} size="md" />
        <View style={styles.cardInfo}>
          <Text variant="h2" numberOfLines={1}>
            {item.job.title}
          </Text>
          <Text variant="small" color="secondary" numberOfLines={1}>
            {item.job.company}
          </Text>
        </View>
        <Button
          iconOnly="create-outline"
          variant="ghost"
          size="sm"
          accessibilityLabel="Update application status"
          onPress={() => promptStatus(item)}
        />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
          <Text variant="small" color="secondary" style={styles.dateText}>
            Applied {formatDate(new Date(item.appliedDate))}
          </Text>
        </View>
        <StatusBadge status={item.status} size="sm" />
      </View>
    </Card>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="h1">My Applications</Text>
      {applications.length > 0 ? (
        <Badge label={String(applications.length)} tone="accent" variant="soft" />
      ) : null}
    </View>
  );

  // --- Loading: skeletons shaped like the real cards (no layout jump) ---
  if (loading) {
    return (
      <Screen scroll={false}>
        {renderHeader()}
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} variant="outlined" style={styles.card}>
            <View style={styles.cardHeader}>
              <Skeleton circle height={44} />
              <View style={styles.cardInfo}>
                <Skeleton height={18} width="70%" style={{ marginBottom: spacing.sm }} />
                <Skeleton height={12} width="40%" />
              </View>
            </View>
            <View style={[styles.cardFooter, { marginTop: spacing.lg }]}>
              <Skeleton height={12} width={120} />
              <Skeleton height={22} width={90} radius={999} />
            </View>
          </Card>
        ))}
      </Screen>
    );
  }

  // --- Error ---
  if (error && applications.length === 0) {
    return (
      <Screen scroll={false}>
        {renderHeader()}
        <ErrorState
          message="We couldn't load your applications. Pull to refresh or try again."
          onRetry={() => {
            setLoading(true);
            loadApplications();
          }}
        />
      </Screen>
    );
  }

  // --- Empty + data (FlatList handles both) ---
  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.headerPadded}>{renderHeader()}</View>
      <FlatList
        data={applications}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          applications.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            title="No applications yet"
            description="Start swiping to apply for jobs — they'll show up here so you can track every step."
            action={{ label: 'Find jobs', onPress: () => navigation.navigate('Swipe') }}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerPadded: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    marginLeft: 2,
  },
});
