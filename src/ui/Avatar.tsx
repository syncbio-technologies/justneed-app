import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { colors } from '../constants/colors';
import { borderRadius as radii } from '../constants/spacing';
import { Text } from './Text';

/**
 * Avatar for a person or company. Designed to NEVER render an empty box:
 *  - if `uri` loads → image
 *  - if `uri` is missing OR fails to load → initials on a tinted background
 *  - if there's no name either → a neutral placeholder glyph color
 *
 * The image-error fallback is the important edge case: remote logos 404 all the
 * time, and a broken-image icon looks unprofessional in a feed.
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

const SIZE_MAP: Record<Exclude<AvatarSize, number>, number> = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
  xl: 72,
};

export interface AvatarProps {
  uri?: string | null;
  /** Used to derive initials and the screen-reader label. */
  name?: string;
  size?: AvatarSize;
  shape?: 'circle' | 'rounded';
  /** Background for the initials fallback. Defaults to brand indigo. */
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

const getInitials = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  shape = 'rounded',
  backgroundColor = colors.primary,
  style,
}) => {
  const [failed, setFailed] = useState(false);

  const dimension = typeof size === 'number' ? size : SIZE_MAP[size];
  const radius = shape === 'circle' ? dimension / 2 : radii.md;
  const initials = getInitials(name);

  const base: StyleProp<ViewStyle> = {
    width: dimension,
    height: dimension,
    borderRadius: radius,
  };

  const showImage = uri && !failed;
  const label = name ? `${name} avatar` : 'avatar';

  return (
    <View
      style={[styles.container, base, !showImage && { backgroundColor }, style]}
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {showImage ? (
        <Image
          source={{ uri: uri! }}
          style={[base, styles.image as ImageStyle]}
          onError={() => setFailed(true)}
          resizeMode="cover"
        />
      ) : (
        <Text
          // Scale initials to ~40% of the avatar; never let OS font scaling
          // blow them out of the circle.
          style={{ fontSize: Math.round(dimension * 0.4), lineHeight: Math.round(dimension * 0.4) + 2 }}
          color="inverse"
          weight="700"
          maxFontSizeMultiplier={1}
          allowFontScaling={false}
        >
          {initials || '•'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
});
