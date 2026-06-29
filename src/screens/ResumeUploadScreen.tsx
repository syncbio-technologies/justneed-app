import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';  // Use legacy import
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_DOC_BYTES = 100 * 1024; // 100 KB

export default function ResumeUploadScreen({ navigation }: any) {
  const { updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSkip = async () => {
    await AsyncStorage.removeItem('@resume_pending');
    navigation.replace('Main');
  };

  const handleResumeUpload = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];

        if (asset.size && asset.size > MAX_DOC_BYTES) {
          Alert.alert('Error', 'File too large. Please select a resume under 100 KB.');
          return;
        }

        // Convert to base64 using legacy API (no deprecation warning)
        const base64Content = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create a data URI so AuthContext doesn't try to re-read the file
        const mimeType = asset.mimeType || 'application/pdf';
        const dataUri = `data:${mimeType};base64,${base64Content}`;

        const newResume = {
          name: asset.name,
          uri: dataUri,  // Data URI instead of file:// URI
          size: asset.size || 0,
          mimeType: mimeType,
          base64: base64Content,
        };

        await updateProfile({ resume: newResume });
        await AsyncStorage.removeItem('@resume_pending');
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      Alert.alert('Error', 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="document-text" size={80} color={colors.primary} style={styles.icon} />

        <Text style={styles.title}>Upload your Resume</Text>
        <Text style={styles.subtitle}>
          Adding your resume helps us match you with the perfect opportunities.
        </Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleResumeUpload}
          disabled={loading}
        >
          <Text style={styles.uploadButtonText}>
            {loading ? 'Uploading...' : 'Upload PDF/DOCX'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>I'll do this later</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  uploadButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
});
