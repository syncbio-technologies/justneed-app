 import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

interface ApplyModalProps {
  visible: boolean;
  jobTitle: string;
  onClose: () => void;
  onSend: () => void;
}

const ApplyModal = ({ visible, jobTitle, onClose, onSend }: ApplyModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>

          <Text style={styles.title}>Apply for Job</Text>
          <Text style={styles.jobTitle}>{jobTitle}</Text>

          <Text style={styles.description}>
            Your Skill Card and profile will be shared with the recruiter.
          </Text>

          <View style={styles.actions}>
            
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyBtn} onPress={onSend}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>

          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.6)', // navy overlay
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '85%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,

    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B1220',
    marginBottom: 8,
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A', // navy blue highlight
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    lineHeight: 20,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  cancelText: {
    color: '#334155',
    fontWeight: '600',
  },

  applyBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1E3A8A', // main navy button
    marginLeft: 8,
    alignItems: 'center',
  },

  applyText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ApplyModal;