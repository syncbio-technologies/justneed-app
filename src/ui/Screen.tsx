import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
  RefreshControlProps,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { layout } from '../constants/spacing';
import { contentMaxWidth, isTablet } from '../utils/responsive';

/**
 * Page-level wrapper that bakes in the things every screen needs and screens
 * keep re-implementing inconsistently:
 *  - safe-area insets (notches / home indicators)
 *  - the standard background + horizontal screen padding
 *  - a tablet/large-web max content width, centered (so cards don't stretch to
 *    700pt) — the responsive win you get for free by adopting this
 *  - optional scrolling with pull-to-refresh wired through
 *
 * Non-scrolling screens (e.g. a FlatList that scrolls itself) should pass
 * `scroll={false}` and render the list as the child.
 */
export interface ScreenProps {
  children: React.ReactNode;
  /** Wrap children in a ScrollView. Default true. Set false for FlatList screens. */
  scroll?: boolean;
  /** Apply standard horizontal screen padding. Default true. */
  padded?: boolean;
  backgroundColor?: string;
  edges?: readonly Edge[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, 'refreshControl' | 'contentContainerStyle' | 'style'>;
  testID?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = true,
  padded = true,
  backgroundColor = colors.background,
  edges = ['top', 'left', 'right'],
  refreshControl,
  style,
  contentContainerStyle,
  scrollProps,
  testID,
}) => {
  const innerStyle: StyleProp<ViewStyle> = [
    styles.inner,
    padded && { paddingHorizontal: layout.screenPadding },
    // Center + cap width on tablets/large screens; full-bleed on phones.
    isTablet && { maxWidth: contentMaxWidth, alignSelf: 'center', width: '100%' },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }, style]} edges={edges} testID={testID}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, innerStyle, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, innerStyle, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
