import React from 'react';
import { View, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { Card } from './Card';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Skeleton } from './Skeleton';

/**
 * Feed/list representation of a job. This is the composite that demonstrates the
 * whole system working together (Card + Avatar + Badge + Text) and follows the
 * job-board patterns seen across Glassdoor / LinkedIn / Handshake on Mobbin:
 * logo + title + employer, location, salary, a "match" / "easy apply" pill row,
 * and a bookmark toggle.
 *
 * The props are a NORMALIZED view-model, deliberately decoupled from the raw
 * `jobs` table column names (headline, employer_name, municipality, …). Map at
 * the call site / in a selector so this component stays presentational and the
 * DB schema can evolve without touching UI. See `toJobCardModel` below for a
 * ready-made mapper from the API row shape.
 */
export interface JobCardModel {
  id: string;
  title: string;
  employer?: string;
  logoUrl?: string | null;
  location?: string;
  salary?: string;
  employmentType?: string;
  /** 0–100. Renders a tone-graded match pill when >= 1. */
  matchScore?: number;
  /** Shows the "Easy Apply" affordance. */
  easyApply?: boolean;
  /** ISO date or Date; renders "Closes in N days" / "Closing soon". */
  deadline?: string | Date | null;
}

export interface JobCardProps {
  job: JobCardModel;
  onPress?: (id: string) => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  /** Hide the bookmark control entirely (e.g. inside the Applications list). */
  showBookmark?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const matchTone = (score: number) =>
  score >= 75 ? 'success' : score >= 50 ? 'warning' : 'neutral';

const formatDeadline = (deadline?: string | Date | null): string | null => {
  if (!deadline) return null;
  const d = typeof deadline === 'string' ? new Date(deadline) : deadline;
  if (isNaN(d.getTime())) return null;
  const days = Math.ceil((d.getTime() - Date.now()) / 86_400_000);
  if (days < 0) return 'Closed';
  if (days === 0) return 'Closes today';
  if (days === 1) return 'Closes tomorrow';
  if (days <= 7) return `Closes in ${days} days`;
  return null; // far-off deadlines aren't worth the visual noise
};

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  onBookmark,
  isBookmarked = false,
  showBookmark = true,
  style,
  testID,
}) => {
  const deadlineText = formatDeadline(job.deadline);
  const hasMatch = typeof job.matchScore === 'number' && job.matchScore >= 1;

  // Build a single rich a11y label so the screen reader reads the card as one
  // coherent sentence instead of seven disjointed fragments.
  const a11yLabel = [
    job.title,
    job.employer && `at ${job.employer}`,
    job.location,
    job.salary,
    hasMatch && `${Math.round(job.matchScore!)} percent match`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Card
      variant="outlined"
      padding="lg"
      onPress={onPress ? () => onPress(job.id) : undefined}
      accessibilityLabel={a11yLabel}
      style={[styles.card, style]}
      testID={testID}
    >
      <View style={styles.header}>
        <Avatar uri={job.logoUrl} name={job.employer ?? job.title} size="md" />

        <View style={styles.headerText}>
          <Text variant="h2" numberOfLines={2}>
            {job.title}
          </Text>
          {job.employer ? (
            <Text variant="small" color="secondary" numberOfLines={1} style={styles.employer}>
              {job.employer}
            </Text>
          ) : null}
        </View>

        {showBookmark ? (
          <Pressable
            onPress={onBookmark ? () => onBookmark(job.id) : undefined}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Save job'}
            accessibilityState={{ selected: isBookmarked }}
            style={styles.bookmark}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isBookmarked ? colors.accent : colors.gray400}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Meta rows — each guarded so a missing field collapses cleanly. */}
      {(job.location || job.salary) ? (
        <View style={styles.metaRow}>
          {job.location ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text variant="small" color="secondary" numberOfLines={1} style={styles.metaText}>
                {job.location}
              </Text>
            </View>
          ) : null}
          {job.salary ? (
            <View style={styles.metaItem}>
              <Ionicons name="cash-outline" size={14} color={colors.textSecondary} />
              <Text variant="small" color="secondary" numberOfLines={1} style={styles.metaText}>
                {job.salary}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Pill row — only rendered if at least one pill exists. */}
      {(hasMatch || job.easyApply || job.employmentType || deadlineText) ? (
        <View style={styles.pillRow}>
          {hasMatch ? (
            <Badge
              label={`${Math.round(job.matchScore!)}% match`}
              tone={matchTone(job.matchScore!)}
              variant="soft"
              size="sm"
              icon="sparkles-outline"
            />
          ) : null}
          {job.easyApply ? (
            <Badge label="Easy Apply" tone="success" variant="soft" size="sm" icon="flash-outline" />
          ) : null}
          {job.employmentType ? (
            <Badge label={job.employmentType} tone="neutral" variant="outline" size="sm" />
          ) : null}
          {deadlineText ? (
            <Badge
              label={deadlineText}
              tone={deadlineText === 'Closed' ? 'danger' : 'warning'}
              variant="soft"
              size="sm"
              icon="time-outline"
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
};

/**
 * Loading placeholder sized to match JobCard so the feed doesn't reflow when
 * real data lands. Render a few of these while the jobs query is in flight.
 */
export const JobCardSkeleton: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <Card variant="outlined" padding="lg" style={[styles.card, style]}>
    <View style={styles.header}>
      <Skeleton circle height={44} />
      <View style={styles.headerText}>
        <Skeleton height={18} width="80%" style={{ marginBottom: spacing.sm }} />
        <Skeleton height={12} width="50%" />
      </View>
    </View>
    <View style={[styles.metaRow, { marginTop: spacing.lg }]}>
      <Skeleton height={12} width={120} />
      <Skeleton height={12} width={90} />
    </View>
    <View style={styles.pillRow}>
      <Skeleton height={22} width={88} radius={999} />
      <Skeleton height={22} width={76} radius={999} />
    </View>
  </Card>
);

/**
 * Maps a raw job row (from GET /jobs — see backend/src/routes/jobs.js) into the
 * presentational JobCardModel. Keeping this beside the component gives callers a
 * one-liner and keeps column-name knowledge out of screens.
 */
export const toJobCardModel = (row: any): JobCardModel => ({
  id: String(row.id),
  title: row.headline ?? row.title ?? 'Untitled role',
  employer: row.employer_name ?? row.employer ?? undefined,
  logoUrl: row.logo_url ?? null,
  location:
    [row.municipality, row.region].filter(Boolean).join(', ') || row.location || undefined,
  salary: row.salary_description ?? row.salary ?? undefined,
  employmentType: row.employment_type_label ?? row.type ?? undefined,
  matchScore: typeof row.match_score === 'number' ? row.match_score : undefined,
  easyApply: !!(row.application_url || row.application_email),
  deadline: row.application_deadline ?? null,
});

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  employer: {
    marginTop: 2,
  },
  bookmark: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  metaText: {
    flexShrink: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
