/**
 * Justneed UI kit — the single import surface for shared components.
 *
 *   import { Button, Card, JobCard, EmptyState } from '../ui';
 *
 * Anything exported here is considered stable and reusable. Screen-specific,
 * one-off components should stay in `src/components`, not here.
 */

// Primitives
export { Text } from './Text';
export type { TextProps, TextVariant, TextColorToken } from './Text';

export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button';

export { Card } from './Card';
export type { CardProps, CardVariant } from './Card';

export { Badge } from './Badge';
export type { BadgeProps, BadgeTone, BadgeVariant } from './Badge';

export { Avatar } from './Avatar';
export type { AvatarProps, AvatarSize } from './Avatar';

// Feedback / state
export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { Skeleton, SkeletonText } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { ErrorState } from './ErrorState';
export type { ErrorStateProps } from './ErrorState';

// Domain
export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

export { JobCard, JobCardSkeleton, toJobCardModel } from './JobCard';
export type { JobCardProps, JobCardModel } from './JobCard';

// Layout
export { Screen } from './Screen';
export type { ScreenProps } from './Screen';
