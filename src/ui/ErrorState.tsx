import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { EmptyState } from './EmptyState';

/**
 * Error state with a retry affordance. This is intentionally a thin
 * specialization of <EmptyState> so the failure UI looks like a sibling of the
 * empty UI rather than a jarring red screen.
 *
 * Pair it with the data-fetching pattern:
 *   if (error) return <ErrorState onRetry={refetch} />
 *
 * `message` should be human-readable. Don't pipe raw exception strings here —
 * map them in the service layer first.
 */
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retrying?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = "We couldn't load this right now. Please check your connection and try again.",
  onRetry,
  retryLabel = 'Try again',
  retrying = false,
  style,
}) => (
  <EmptyState
    icon="cloud-offline-outline"
    tone="accent"
    title={title}
    description={message}
    action={onRetry ? { label: retryLabel, onPress: onRetry, loading: retrying } : undefined}
    style={style}
  />
);
