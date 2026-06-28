import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../config/api';
import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';

const TOKEN_KEY = '@justneed_token';

export default function EnhancedProfileScreen({ navigation }: any) {
  const [profile, setProfile] = useState<any>({});
  const [editing, setEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProfile(data);
      setSkills(data.skills || []);
      setLocations(data.preferredLocations || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      await fetch(`${API_BASE}/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...profile,
          skills,
          preferredLocations: locations
        })
      });
      Alert.alert('Success', 'Profile updated');
      setEditing(false);
      loadProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addLocation = () => {
    if (newLocation.trim()) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => editing ? saveProfile() : setEditing(true)}>
          <Ionicons name={editing ? "checkmark" : "create"} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <Text style={styles.label}>Name:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={profile.fullName}
                onChangeText={(text) => setProfile({...profile, fullName: text})}
              />
            ) : (
              <Text style={styles.value}>{profile.fullName || 'Not set'}</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color={colors.primary} />
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={styles.label}>Phone:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) => setProfile({...profile, phone: text})}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{profile.phone || 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagsContainer}>
            {skills.map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
                {editing && (
                  <TouchableOpacity onPress={() => removeSkill(index)}>
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {editing && (
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Add skill"
                value={newSkill}
                onChangeText={setNewSkill}
              />
              <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                <Ionicons name="add" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Preferred Locations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferred Locations</Text>
          <View style={styles.tagsContainer}>
            {locations.map((loc, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{loc}</Text>
                {editing && (
                  <TouchableOpacity onPress={() => removeLocation(index)}>
                    <Ionicons name="close-circle" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
          {editing && (
            <View style={styles.addRow}>
              <TextInput
                style={styles.addInput}
                placeholder="Add location"
                value={newLocation}
                onChangeText={setNewLocation}
              />
              <TouchableOpacity style={styles.addButton} onPress={addLocation}>
                <Ionicons name="add" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase" size={20} color={colors.primary} />
            <Text style={styles.label}>Years:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={profile.yearsOfExperience?.toString()}
                onChangeText={(text) => setProfile({...profile, yearsOfExperience: parseInt(text) || 0})}
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.value}>{profile.yearsOfExperience || 0} years</Text>
            )}
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="school" size={20} color={colors.primary} />
            <Text style={styles.label}>Education:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={profile.educationLevel}
                onChangeText={(text) => setProfile({...profile, educationLevel: text})}
              />
            ) : (
              <Text style={styles.value}>{profile.educationLevel || 'Not set'}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    width: 80,
  },
  value: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  input: {
    ...typography.body,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  tagText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  addRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
