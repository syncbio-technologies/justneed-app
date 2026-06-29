import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchFilterProps {
  onSearch: (filters: any) => void;
  onClose: () => void;
  visible: boolean;
}

// Common skill suggestions for quick-tap chips
const SKILL_SUGGESTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'SQL',
  'Java', 'TypeScript', 'AWS', 'Docker', 'Excel',
];

export default function SearchFilter({ onSearch, onClose, visible }: SearchFilterProps) {
  const [location, setLocation] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const addSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleSkillInputSubmit = () => {
    if (skillInput.trim()) addSkill(skillInput);
  };

  const handleApply = () => {
    const filters: any = {};
    if (location.trim()) filters.location = location.trim();
    if (selectedSkills.length > 0) filters.skills = selectedSkills.join(',');
    onSearch(filters);
    onClose();
  };

  const handleClear = () => {
    setLocation('');
    setSkillInput('');
    setSelectedSkills([]);
    onSearch({});
    onClose();
  };

  const activeFilterCount = (location ? 1 : 0) + (selectedSkills.length > 0 ? 1 : 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Jobs</Text>
              {activeFilterCount > 0 && (
                <Text style={styles.activeCount}>
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Location */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location-outline" size={18} color="#6C5CE7" />
                <Text style={styles.sectionTitle}>Location</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="City, municipality or region…"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={setLocation}
                returnKeyType="done"
              />
            </View>

            {/* Skills */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flash-outline" size={18} color="#6C5CE7" />
                <Text style={styles.sectionTitle}>Skills</Text>
              </View>

              {/* Skill input */}
              <View style={styles.skillInputRow}>
                <TextInput
                  style={styles.skillInput}
                  placeholder="Type a skill and press Add…"
                  placeholderTextColor="#9CA3AF"
                  value={skillInput}
                  onChangeText={setSkillInput}
                  onSubmitEditing={handleSkillInputSubmit}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.addBtn, !skillInput.trim() && styles.addBtnDisabled]}
                  onPress={handleSkillInputSubmit}
                  disabled={!skillInput.trim()}
                >
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Selected skill tags */}
              {selectedSkills.length > 0 && (
                <View style={styles.chipRow}>
                  {selectedSkills.map((skill) => (
                    <View key={skill} style={styles.selectedChip}>
                      <Text style={styles.selectedChipText}>{skill}</Text>
                      <TouchableOpacity onPress={() => removeSkill(skill)} style={styles.chipRemove}>
                        <Ionicons name="close" size={13} color="#6C5CE7" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Quick-add suggestions */}
              <Text style={styles.suggestLabel}>Quick add</Text>
              <View style={styles.chipRow}>
                {SKILL_SUGGESTIONS.filter((s) => !selectedSkills.includes(s)).map((skill) => (
                  <TouchableOpacity
                    key={skill}
                    style={styles.suggestionChip}
                    onPress={() => addSkill(skill)}
                  >
                    <Text style={styles.suggestionChipText}>+ {skill}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                Apply{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  activeCount: {
    fontSize: 13,
    color: '#6C5CE7',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  section: {
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  skillInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  skillInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  addBtn: {
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  addBtnDisabled: {
    backgroundColor: '#C4B5FD',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 4,
  },
  selectedChipText: {
    color: '#6C5CE7',
    fontWeight: '600',
    fontSize: 13,
  },
  chipRemove: {
    padding: 2,
  },
  suggestLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 0,
  },
  suggestionChip: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  suggestionChipText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#6C5CE7',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#6C5CE7',
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#6C5CE7',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});