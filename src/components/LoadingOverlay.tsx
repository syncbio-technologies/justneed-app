import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  visible, 
  message = 'Loading...' 
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 150,
  },
  message: {
    ...typography.body,
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
});