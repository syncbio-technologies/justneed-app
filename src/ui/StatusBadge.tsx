import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, BadgeTone } from './Badge';
import { Application } from '../types';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Domain-specific wrapper over <Badge> that maps an application status to the
 * right tone, label and icon in ONE place. Previously every screen reimplemented
 * this switch (see the old ApplicationsScreen.getStatusColor) — centralizing it
 * means the status vocabulary can never drift between screens.
 *
 * Handles both the canonical PascalCase statuses ('Applied', 'Under Review', …)
 * and the legacy lowercase ones ('pending', 'reviewing', …) that still exist in
 * the type union.
 */
type AppStatus = Application['status'];

interface StatusMeta {
  label: string;
  tone: BadgeTone;
  icon: IconName;
}

const STATUS_MAP: Record<string, StatusMeta> = {
  applied: { label: 'Applied', tone: 'primary', icon: 'paper-plane-outline' },
  pending: { label: 'Applied', tone: 'primary', icon: 'paper-plane-outline' },
  'under review': { label: 'Under Review', tone: 'info', icon: 'eye-outline' },
  reviewing: { label: 'Under Review', tone: 'info', icon: 'eye-outline' },
  interview: { label: 'Interview', tone: 'warning', icon: 'calendar-outline' },
  accepted: { label: 'Accepted', tone: 'success', icon: 'checkmark-circle-outline' },
  rejected: { label: 'Rejected', tone: 'danger', icon: 'close-circle-outline' },
};

const FALLBACK: StatusMeta = { label: 'Unknown', tone: 'neutral', icon: 'help-circle-outline' };

export interface StatusBadgeProps {
  status: AppStatus | string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  style,
}) => {
  const meta = STATUS_MAP[String(status).toLowerCase()] ?? FALLBACK;
  return (
    <Badge
      label={meta.label}
      tone={meta.tone}
      variant="soft"
      size={size}
      icon={showIcon ? meta.icon : undefined}
      style={style}
    />
  );
};
