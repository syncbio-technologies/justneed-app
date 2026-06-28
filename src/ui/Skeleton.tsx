import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleProp,
  ViewStyle,
  DimensionValue,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { colors } from '../constants/colors';
import { borderRadius as radii, spacing } from '../constants/spacing';

/**
 * Shimmering placeholder for content that is still loading. Skeletons should
 * mirror the SHAPE of the real content (same sizes/rows) so the layout doesn't
 * jump when data arrives — that perceived stability is the whole point.
 *
 * Respects "Reduce Motion": the pulse is disabled for users who opt out.
 */
export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  /** Render as a circle (avatars). Overrides radius. */
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  radius = radii.sm,
  circle = false,
  style,
}) => {
  const pulse = useRef(new Animated.Value(0.5)).current;
  const reduceMotion = useRef(false);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      reduceMotion.current = enabled;
      if (enabled) {
        pulse.setValue(0.7);
        return;
      }
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(pulse, {
            toValue: 0.5,
            duration: 700,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ])
      );
      loop.start();
    });

    return () => loop?.stop();
  }, [pulse]);

  const resolvedRadius = circle
    ? typeof height === 'number'
      ? height / 2
      : 9999
    : radius;

  return (
    <Animated.View
      // Skeletons are decorative; hide them from the screen reader, which
      // should hear the parent's busy/loading state instead.
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width: circle ? height : width,
          height,
          borderRadius: resolvedRadius,
          backgroundColor: colors.gray200,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
};

/** Convenience: a stack of text-line skeletons with the last line shortened. */
export const SkeletonText: React.FC<{
  lines?: number;
  lineHeight?: number;
  gap?: number;
  lastLineWidth?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}> = ({ lines = 3, lineHeight = 12, gap = spacing.sm, lastLineWidth = '60%', style }) => (
  <Animated.View style={style}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={lineHeight}
        width={i === lines - 1 ? lastLineWidth : '100%'}
        style={{ marginBottom: i === lines - 1 ? 0 : gap }}
      />
    ))}
  </Animated.View>
);
