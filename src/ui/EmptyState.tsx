import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { spacing, borderRadius as radii } from '../constants/spacing';
import { Text } from './Text';
import { Button } from './Button';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Canonical empty state: icon + title + supporting copy + optional actions.
 * Use it any time a list/section has nothing to show — onboarding-empty,
 * filtered-to-zero, "you're all caught up", etc. A good empty state always
 * tells the user WHY it's empty and WHAT to do next, so `description` and an
 * `action` are strongly encouraged.
 */
export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description?: string;
  /** Primary call-to-action. */
  action?: { label: string; onPress: () => void; loading?: boolean };
  /** Optional lower-emphasis secondary action. */
  secondaryAction?: { label: string; onPress: () => void };
  /** Tint for the icon circle. Defaults to a neutral gray. */
  tone?: 'neutral' | 'primary' | 'accent';
  style?: StyleProp<ViewStyle>;
}

const TONE: Record<NonNullable<EmptyStateProps['tone']>, { bg: string; fg: string }> = {
  neutral: { bg: colors.gray100, fg: colors.gray400 },
  primary: { bg: colors.primaryLight, fg: colors.primary },
  accent: { bg: colors.accent + '1F', fg: colors.accent },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  description,
  action,
  secondaryAction,
  tone = 'neutral',
  style,
}) => {
  const t = TONE[tone];
  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="summary"
      accessible
      accessibilityLabel={description ? `${title}. ${description}` : title}
    >
      <View style={[styles.iconCircle, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={36} color={t.fg} />
      </View>

      <Text variant="h2" align="center" style={styles.title}>
        {title}
      </Text>

      {description ? (
        <Text variant="body" color="secondary" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}

      {action ? (
        <Button
          title={action.label}
          onPress={action.onPress}
          loading={action.loading}
          style={styles.action}
        />
      ) : null}

      {secondaryAction ? (
        <Button
          title={secondaryAction.label}
          onPress={secondaryAction.onPress}
          variant="ghost"
          size="sm"
          style={styles.secondary}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.sm,
  },
  description: {
    maxWidth: 320,
    marginBottom: spacing.xl,
  },
  action: {
    minWidth: 200,
  },
  secondary: {
    marginTop: spacing.sm,
  },
});
