import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

interface DividerProps {
  text?: string;
  color?: string;
}

export const Divider: React.FC<DividerProps> = ({ text = 'OR', color = colors.gray300 }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{text}</Text>
      <View style={[styles.line, { backgroundColor: color }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
