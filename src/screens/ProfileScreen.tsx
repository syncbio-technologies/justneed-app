  import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { InputField } from '../components/InputField';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useGoogleAuth } from '../services/googleAuthService';
import { jobService } from '../services/jobService';
import { colors } from '../constants/colors';
import { spacing, borderRadius } from '../constants/spacing';
import { contentMaxWidth } from '../utils/responsive';
import { typography } from '../constants/typography';
import { shadows } from '../constants/shadows';

const MAX_DOC_BYTES = 100 * 1024; // 100 KB limit for resume/cover letter

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { signOut } = useGoogleAuth();
  const navigation = useNavigation<any>();

  // Modal visibility states
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [showJobPreferencesModal, setShowJobPreferencesModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [coverLetterEditContent, setCoverLetterEditContent] = useState('');
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generationWarning, setGenerationWarning] = useState<string | null>(null);
  const [lastJobDescription, setLastJobDescription] = useState<string>('');

  // Personal Information (for modal)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Job Preferences (for modal)
  const [jobTitle, setJobTitle] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [jobPreferences, setJobPreferences] = useState('');

  // Resume & Cover Letter
  const [resume, setResume] = useState(user?.profile?.resume || null);
  const [coverLetter, setCoverLetter] = useState(user?.profile?.coverLetter || null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Keep resume and coverLetter in sync with user data
  useEffect(() => {
    console.log('[ProfileScreen] User changed, syncing resume/coverLetter');
    if (user?.profile?.resume) {
      setResume(user.profile.resume);
    }
    if (user?.profile?.coverLetter) {
      setCoverLetter(user.profile.coverLetter);
    }
  }, [user]);

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Open Personal Info Modal
  const openPersonalInfoModal = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setPhone(user?.profile?.phone || '');
    setAddress(user?.profile?.address || '');
    setProfileImage(user?.profile?.profileImage || null);
    setShowPersonalInfoModal(true);
  };

  // Open Job Preferences Modal
  const openJobPreferencesModal = () => {
    setJobTitle(user?.profile?.jobTitle || '');
    setSkills(user?.profile?.skills || '');
    setLocation(user?.profile?.preferredLocation || '');
    setJobPreferences(user?.profile?.jobPreferences || '');
    setShowJobPreferencesModal(true);
  };

  // Handle Image Upload
  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  };

  // Save Personal Information
  const handleSavePersonalInfo = async () => {
    setLoading(true);
    try {
      await updateProfile({
        firstName,
        lastName,
        phone,
        address,
        profileImage,
      });
      Alert.alert('Success', 'Personal information updated successfully!');
      setShowPersonalInfoModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  // Save Job Preferences
  const handleSaveJobPreferences = async () => {
    setLoading(true);
    try {
      await updateProfile({
        jobTitle,
        skills,
        preferredLocation: location,
        jobPreferences,
      });
      Alert.alert('Success', 'Job preferences updated successfully!');
      setShowJobPreferencesModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update job preferences');
    } finally {
      setLoading(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      Alert.alert('Success', 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePasswordModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please check your old password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resume Upload with loading state
  const handleResumeUpload = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        console.log('Selected file:', file.name, file.size, file.mimeType);

        if (file.size && file.size > MAX_DOC_BYTES) {
          setResumeError('File too large. Please select a resume under 100 KB.');
          return;
        }
        setResumeError(null);

        const newResume = {
          name: file.name,
          uri: file.uri,
          size: file.size,
          mimeType: file.mimeType || 'application/pdf',
        };
        setResume(newResume);

        // Auto-save resume with loading feedback
        console.log('Calling updateProfile with resume...');
        await updateProfile({ resume: newResume });
        console.log('Resume update completed');
        Alert.alert('Success', 'Resume uploaded successfully!');
      } else {
        console.log('Document picker was canceled');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      Alert.alert('Error', 'Failed to upload resume');
    } finally {
      setLoading(false);
    }
  };

  // Handle Cover Letter Upload with loading state
  const handleCoverLetterUpload = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        console.log('Selected cover letter:', file.name, file.size, file.mimeType);

        if (file.size && file.size > MAX_DOC_BYTES) {
          setCoverError('File too large. Please select a cover letter under 100 KB.');
          return;
        }
        setCoverError(null);

        const newCoverLetter = {
          name: file.name,
          uri: file.uri,
          size: file.size,
          mimeType: file.mimeType || 'application/pdf',
        };
        setCoverLetter(newCoverLetter);

        // Auto-save cover letter with loading feedback
        console.log('Calling updateProfile with coverLetter...');
        await updateProfile({ coverLetter: newCoverLetter });
        console.log('Cover letter update completed');
        Alert.alert('Success', 'Cover letter uploaded successfully!');
      } else {
        console.log('Document picker was canceled');
      }
    } catch (error) {
      console.error('Cover letter upload error:', error);
      Alert.alert('Error', 'Failed to upload cover letter');
    } finally {
      setLoading(false);
    }
  };

  // Handle Cover Letter Generation
  const handleGenerateCoverLetter = () => {
    setJobDescriptionInput('');
    setGenerationWarning(null);
    setShowAIGeneratorModal(true);
  };

  const handleConfirmGenerateCoverLetter = async () => {
    const trimmed = jobDescriptionInput.trim();

    if (!trimmed) {
      Alert.alert('Missing Info', 'Please paste a job description before generating.');
      return;
    }

    if (trimmed.length < 50) {
      Alert.alert('Too Short', 'Please provide a more detailed job description (at least 50 characters) so the AI can tailor your letter.');
      return;
    }

    try {
      setLoading(true);
      setGenerationWarning(null);

      const data = await jobService.generateCoverLetter(trimmed);

      if (data.success && data.text) {
        if (data.warning) {
          setGenerationWarning(data.warning);
        }

        setLastJobDescription(trimmed);

        const generatedFile = {
          name: 'AI_Cover_Letter.txt',
          uri: 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.text),
          size: data.text.length,
          mimeType: 'text/plain',
          content: data.text,
        };

        setCoverLetter(generatedFile);
        await updateProfile({ coverLetter: generatedFile });
        setShowAIGeneratorModal(false);

        Alert.alert(
          '✓ Cover Letter Ready',
          data.warning
            ? 'A fallback template was used because the AI was temporarily unavailable. You can edit it anytime.'
            : 'Your cover letter has been generated and saved. Tap the edit icon to review or tweak it.'
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to generate cover letter. Please try again.');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Regenerate cover letter with the same job description from the preview modal
  const handleRegenerateCoverLetter = async () => {
    if (!lastJobDescription) {
      setShowPreviewModal(false);
      handleGenerateCoverLetter();
      return;
    }

    Alert.alert(
      'Regenerate Cover Letter',
      'This will overwrite your current cover letter with a freshly generated one using the same job description.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              setLoading(true);
              const data = await jobService.generateCoverLetter(lastJobDescription);

              if (data.success && data.text) {
                const updatedFile = {
                  name: 'AI_Cover_Letter.txt',
                  uri: 'data:text/plain;charset=utf-8,' + encodeURIComponent(data.text),
                  size: data.text.length,
                  mimeType: 'text/plain',
                  content: data.text,
                };
                setCoverLetter(updatedFile);
                setCoverLetterEditContent(data.text);
                await updateProfile({ coverLetter: updatedFile });
                Alert.alert('Done', 'A fresh cover letter has been generated.');
              } else {
                Alert.alert('Error', data.error || 'Failed to regenerate cover letter.');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenPreviewModal = () => {
    if (coverLetter?.content) {
      setCoverLetterEditContent(coverLetter.content);
      setShowPreviewModal(true);
    } else {
      Alert.alert('Notice', 'Only AI-generated cover letters can be edited directly in the app.');
    }
  };

  const handleSaveEditedCoverLetter = async () => {
    if (!coverLetterEditContent.trim()) {
      Alert.alert('Error', 'Cover letter cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      const updatedFile = {
        name: 'AI_Cover_Letter.txt',
        uri: 'data:text/plain;charset=utf-8,' + encodeURIComponent(coverLetterEditContent),
        size: coverLetterEditContent.length,
        mimeType: 'text/plain',
        content: coverLetterEditContent,
      };

      setCoverLetter(updatedFile);
      await updateProfile({ coverLetter: updatedFile });
      Alert.alert('Success', 'Cover letter updated successfully!');
      setShowPreviewModal(false);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save cover letter.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Logout
  const performLogout = async () => {
    try {
      console.log('Logging out...');
      const callback = Platform.OS === 'web' ? undefined : signOut;
      await logout(callback);
      console.log('Logout successful');
      // Navigation is handled automatically by AppNavigator when user becomes null
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Alert is a no-op on web; logout immediately
      performLogout();
      return;
    }
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: performLogout },
    ]);
  };

  // Navigation is handled automatically by AppNavigator when user becomes null after logout

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Picture */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profile?.profileImage ? (
              <Image source={{ uri: user.profile.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* A. Personal Information - Display Only */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <TouchableOpacity onPress={openPersonalInfoModal} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <InfoRow label="Name" value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Not set'} />
            <InfoRow label="Email" value={user?.email || 'Not set'} />
            <InfoRow label="Phone" value={user?.profile?.phone || 'Not set'} />
            <InfoRow label="Address" value={user?.profile?.address || 'Not set'} />
          </View>
        </View>

        {/* B. Job Preferences - Display Only */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Job Preferences</Text>
            <TouchableOpacity onPress={openJobPreferencesModal} style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <InfoRow label="Job Title" value={user?.profile?.jobTitle || 'Not set'} />
            <InfoRow label="Skills" value={Array.isArray(user?.profile?.skills) ? user?.profile?.skills.join(', ') : (user?.profile?.skills || 'Not set')} />
            <InfoRow label="Location" value={user?.profile?.preferredLocation || 'Not set'} />
            <InfoRow label="Preferences" value={user?.profile?.jobPreferences || 'Not set'} />
          </View>
        </View>

        {/* C. Resume Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resume</Text>
          <View style={styles.card}>
            {resume ? (
              <View style={styles.uploadedFileContainer}>
                <View style={styles.fileInfo}>
                  <Ionicons name="document-text" size={24} color={colors.primary} />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{resume.name}</Text>
                    <Text style={styles.fileSize}>{(resume.size / 1024).toFixed(2)} KB</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={async () => {
                    setResume(null);
                    try {
                      await updateProfile({ resume: null });
                    } catch (e) {
                      console.error('Failed to remove resume', e);
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={handleResumeUpload}>
                <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                <Text style={styles.uploadButtonText}>Upload Resume</Text>
                <Text style={styles.uploadButtonSubtext}>PDF, DOC, or DOCX</Text>
              </TouchableOpacity>
            )}
            <View style={styles.limitRow}>
              <Text style={styles.uploadLimitText}>Max 100 KB • PDF, DOC, or DOCX</Text>
              {resumeError && <Text style={styles.errorText}>{resumeError}</Text>}
            </View>
          </View>
        </View>

        {/* D. Cover Letter Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cover Letter</Text>
          </View>
          <View style={styles.card}>
            {coverLetter ? (
              <View style={styles.clFileCard}>
                <View style={styles.clFileIconBox}>
                  <Ionicons name="document-text" size={22} color="#fff" />
                </View>
                <View style={styles.clFileDetails}>
                  <Text style={styles.clFileName} numberOfLines={1}>{coverLetter.name}</Text>
                  <Text style={styles.clFileMeta}>
                    {(coverLetter.size / 1024).toFixed(1)} KB
                    {coverLetter?.content ? '  ·  AI Generated' : ''}
                  </Text>
                </View>
                <View style={styles.clFileActions}>
                  {coverLetter?.content && (
                    <TouchableOpacity onPress={handleOpenPreviewModal} style={styles.clActionBtn}>
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.clActionBtn, styles.clDeleteBtn]}
                    onPress={async () => {
                      setCoverLetter(null);
                      try {
                        await updateProfile({ coverLetter: null });
                      } catch (e) {
                        console.error('Failed to remove cover letter', e);
                      }
                    }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.uploadOptions}>
                <TouchableOpacity style={styles.uploadButton} onPress={handleCoverLetterUpload}>
                  <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Upload Cover Letter</Text>
                  <Text style={styles.uploadButtonSubtext}>PDF, DOC, or DOCX</Text>
                </TouchableOpacity>
                <Text style={styles.orText}>OR</Text>
                <TouchableOpacity style={styles.aiButton} onPress={handleGenerateCoverLetter}>
                  <Ionicons name="sparkles" size={22} color={colors.accent} />
                  <Text style={styles.aiButtonText}>Generate with AI Agent</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.limitRow}>
              <Text style={styles.uploadLimitText}>Max 100 KB • PDF, DOC, or DOCX</Text>
              {coverError && <Text style={styles.errorText}>{coverError}</Text>}
            </View>
          </View>
        </View>

        {/* F. Change Password Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.changePasswordCard}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.changePasswordContent}>
              <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
              <View style={styles.changePasswordText}>
                <Text style={styles.changePasswordTitle}>Change Password</Text>
                <Text style={styles.changePasswordDescription}>Update your account password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.actionsSection}>
          <PrimaryButton title="Logout" onPress={handleLogout} variant="outline" />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Personal Information Modal */}
      <Modal
        visible={showPersonalInfoModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPersonalInfoModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPersonalInfoModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Personal Information</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Profile Picture Upload */}
            <View style={styles.modalProfileSection}>
              <TouchableOpacity onPress={handleImageUpload} style={styles.modalAvatarContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.modalAvatarImage} />
                ) : (
                  <View style={styles.modalAvatar}>
                    <Text style={styles.avatarText}>
                      {firstName[0]?.toUpperCase() || lastName[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                <View style={styles.editAvatarButton}>
                  <Ionicons name="camera" size={16} color={colors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.uploadText}>Tap to change photo</Text>
            </View>

            <InputField label="First Name" value={firstName} onChangeText={setFirstName} placeholder="John" />
            <InputField label="Last Name" value={lastName} onChangeText={setLastName} placeholder="Doe" />
            <InputField
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
            />
            <InputField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="123 Main St, San Francisco, CA 94102"
              multiline
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <PrimaryButton title="Save Changes" onPress={handleSavePersonalInfo} loading={loading} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Job Preferences Modal */}
      <Modal
        visible={showJobPreferencesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowJobPreferencesModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowJobPreferencesModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Job Preferences</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <InputField
              label="Job Title"
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="Software Engineer"
            />
            <InputField
              label="Skills"
              value={skills}
              onChangeText={setSkills}
              placeholder="React, Node.js, TypeScript, etc."
              multiline
            />
            <InputField
              label="Preferred Location"
              value={location}
              onChangeText={setLocation}
              placeholder="San Francisco, CA"
            />
            <InputField
              label="Job Preferences"
              value={jobPreferences}
              onChangeText={setJobPreferences}
              placeholder="Remote, Full-time, Flexible hours"
              multiline
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <PrimaryButton title="Save Changes" onPress={handleSaveJobPreferences} loading={loading} />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePasswordModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChangePasswordModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowChangePasswordModal(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <InputField
              label="Old Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="Enter old password"
              secureTextEntry
            />
            <InputField
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              secureTextEntry
            />
            <InputField
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <PrimaryButton title="Change Password" onPress={handleChangePassword} loading={loading} />
          </View>
        </SafeAreaView>
      </Modal>

       {/* AI Cover Letter Generator Modal */}
<Modal
  visible={showAIGeneratorModal}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setShowAIGeneratorModal(false)}
>
  <SafeAreaView style={styles.aiModalContainer} edges={['top']}>
    {/* Simplified Header - Removed redundant central icon */}
    <View style={styles.aiModalHeader}>
      <TouchableOpacity onPress={() => setShowAIGeneratorModal(false)} style={styles.aiCloseButton}>
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>
      {/* Central icon/text removed from here */}
      <View style={{ width: 38 }} /> 
    </View>

    <ScrollView
      style={styles.aiModalScroll}
      contentContainerStyle={styles.aiModalScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Hero Section - Removed duplicated logic */}
      <View style={styles.aiHeroSection}>
        <View style={styles.aiHeroIconRing}>
          <View style={styles.aiHeroIconInner}>
            <Ionicons name="document-text" size={30} color="#fff" />
          </View>
        </View>
        <Text style={styles.aiHeroTitle}>Generate Cover Letter</Text>
        <Text style={styles.aiHeroSubtitle}>
          Paste a job description and get a tailored, professional cover letter crafted to your profile in seconds.
        </Text>
      </View>

            {/* Profile Context Strip */}
            <View style={styles.aiContextStrip}>
              <Text style={styles.aiContextLabel}>USING YOUR PROFILE</Text>
              <View style={styles.aiProfileRow}>
                <View style={styles.aiProfileChip}>
                  <Ionicons name="briefcase-outline" size={13} color={colors.primary} />
                  <Text style={styles.aiProfileChipText} numberOfLines={1}>
                    {user?.profile?.jobTitle || 'Job Title'}
                  </Text>
                </View>
                <View style={styles.aiProfileChip}>
                  <Ionicons name="code-slash-outline" size={13} color={colors.primary} />
                  <Text style={styles.aiProfileChipText} numberOfLines={1}>
                    {Array.isArray(user?.profile?.skills)
                      ? user?.profile?.skills.slice(0, 2).join(', ')
                      : (user?.profile?.skills?.split(',').slice(0, 2).join(', ') || 'Skills')}
                  </Text>
                </View>
                <View style={styles.aiProfileChip}>
                  <Ionicons name="person-outline" size={13} color={colors.primary} />
                  <Text style={styles.aiProfileChipText} numberOfLines={1}>
                    {user?.firstName || 'Your Name'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Text Area */}
            <View style={styles.aiTextAreaWrapper}>
              <View style={styles.aiTextAreaHeader}>
                <View style={styles.aiTextAreaLabelRow}>
                  <View style={styles.aiTextAreaLabelDot} />
                  <Text style={styles.aiTextAreaLabel}>JOB DESCRIPTION</Text>
                </View>
                <Text style={[
                  styles.aiCharCount,
                  jobDescriptionInput.trim().length > 0 && jobDescriptionInput.trim().length < 50
                    ? styles.aiCharCountWarn
                    : jobDescriptionInput.length > 4500
                    ? styles.aiCharCountWarn
                    : null,
                ]}>
                  {jobDescriptionInput.length} / 5000
                </Text>
              </View>

              <InputField
                value={jobDescriptionInput}
                onChangeText={setJobDescriptionInput}
                placeholder="Paste the job description here — role, requirements, responsibilities…"
                multiline
                style={styles.aiTextAreaInput}
              />

              {jobDescriptionInput.trim().length > 0 && jobDescriptionInput.trim().length < 50 && (
                <View style={styles.aiValidationRow}>
                  <Ionicons name="alert-circle-outline" size={13} color="#F59E0B" />
                  <Text style={styles.aiValidationText}>
                    {50 - jobDescriptionInput.trim().length} more characters needed for best results
                  </Text>
                </View>
              )}
            </View>

            {/* Feature pills */}
            <View style={styles.aiFeatureRow}>
              <View style={styles.aiFeaturePill}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.aiFeaturePillText}>Tailored to role</Text>
              </View>
              <View style={styles.aiFeaturePill}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.aiFeaturePillText}>Uses your profile</Text>
              </View>
              <View style={styles.aiFeaturePill}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.aiFeaturePillText}>Editable after</Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.aiModalFooter}>
            <TouchableOpacity
              style={[
                styles.aiGenerateButton,
                (loading || jobDescriptionInput.trim().length < 50) && styles.aiGenerateButtonDisabled,
              ]}
              onPress={handleConfirmGenerateCoverLetter}
              disabled={loading || jobDescriptionInput.trim().length < 50}
              activeOpacity={0.85}
            >
              {loading ? (
                <View style={styles.aiGeneratingRow}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.aiGenerateButtonText}>Crafting your letter…</Text>
                </View>
              ) : (
                <View style={styles.aiGeneratingRow}>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.aiGenerateButtonText}>Generate Cover Letter</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.aiFooterNote}>⚡ Ready in under 10 seconds · Saved automatically</Text>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Preview/Edit Cover Letter Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPreviewModal(false)}
      >
        <SafeAreaView style={styles.editorModalContainer} edges={['top']}>
          {/* Editor Header */}
          <View style={styles.editorModalHeader}>
            <TouchableOpacity onPress={() => setShowPreviewModal(false)} style={styles.editorCloseBtn}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.editorHeaderCenter}>
              <Text style={styles.editorModalTitle}>Edit Cover Letter</Text>
              <View style={styles.editorLiveBadge}>
                <View style={styles.editorLiveDot} />
                <Text style={styles.editorLiveBadgeText}>Draft</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegenerateCoverLetter}
              style={[styles.editorRegenerateBtn, loading && styles.editorRegenerateBtnDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={14} color="#fff" />
                  <Text style={styles.editorRegenerateBtnText}>Regenerate</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Stats Bar */}
          <View style={styles.editorStatsBar}>
            <View style={styles.editorStatItem}>
              <Ionicons name="text-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.editorStatText}>
                {coverLetterEditContent.trim().split(/\s+/).filter(Boolean).length} words
              </Text>
            </View>
            <View style={styles.editorStatDivider} />
            <View style={styles.editorStatItem}>
              <Ionicons name="checkmark-circle-outline" size={13} color="#10B981" />
              <Text style={[styles.editorStatText, { color: '#10B981' }]}>Professional tone</Text>
            </View>
            <View style={styles.editorStatDivider} />
            <View style={styles.editorStatItem}>
              <Ionicons name="save-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.editorStatText}>Auto-saved</Text>
            </View>
          </View>

          <ScrollView
            style={styles.editorScroll}
            contentContainerStyle={styles.editorScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {generationWarning && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning-outline" size={16} color="#B45309" />
                <Text style={styles.warningBannerText}>{generationWarning}</Text>
              </View>
            )}

            {/* Writing Area */}
            <View style={styles.editorCard}>

              <InputField
                value={coverLetterEditContent}
                onChangeText={setCoverLetterEditContent}
                multiline
                placeholder="Start writing your cover letter…"
                style={styles.coverLetterEditor}
              />
            </View>

            {/* Tips Card */}
            <View style={styles.editorTipsCard}>
              <Text style={styles.editorTipsTitle}>✍️ Writing Tips</Text>
              <Text style={styles.editorTipItem}>• Keep it under 400 words for best results</Text>
              <Text style={styles.editorTipItem}>• Mention specific skills from the job posting</Text>
              <Text style={styles.editorTipItem}>• End with a clear call to action</Text>
            </View>
          </ScrollView>

          <View style={styles.editorFooter}>
            <PrimaryButton title="Save Changes" onPress={handleSaveEditedCoverLetter} loading={loading} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// InfoRow Component for displaying read-only information
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    // Cap content width on tablets so form fields don't stretch full-bleed.
    // No-op on phones (contentMaxWidth equals screen width).
    width: '100%',
    maxWidth: contentMaxWidth,
    alignSelf: 'center',
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    ...shadows.md,
  },
  avatarText: {
    ...typography.h1,
    color: colors.white,
  },
  userName: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  infoRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
  },
  uploadOptions: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  uploadButton: {
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
    width: '100%',
  },
  uploadButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  uploadButtonSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  uploadLimitText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  limitRow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    gap: 4,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: 2,
  },
  orText: {
    ...typography.body,
    color: colors.textSecondary,
    marginVertical: spacing.md,
    fontWeight: '600',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.accent + '15',
    borderRadius: borderRadius.lg,
    width: '100%',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  aiButtonText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  uploadedFileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  fileSize: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changePasswordCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
  },
  changePasswordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  changePasswordText: {
    flex: 1,
  },
  changePasswordTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  changePasswordDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionsSection: {
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
    paddingBottom: 110,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  modalContent: {
    flex: 1,
    padding: spacing.md,
  },
  modalFooter: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  modalProfileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  modalAvatarContainer: {
    position: 'relative',
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  modalAvatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    ...shadows.md,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  uploadText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  // AI Generator Modal styles
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.accent + '12',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  aiBannerText: {
    ...typography.bodySmall,
    color: colors.accent,
    flex: 1,
    lineHeight: 18,
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  charCountText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  charCountError: {
    color: colors.error,
  },
  tipText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  // ── Premium AI Modal ──────────────────────────────────────────
  aiModalContainer: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  aiModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: '#FAFBFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF4',
  },
  aiCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EAECF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHeaderCenter: {
    alignItems: 'center',
  },
  aiHeaderIconCenter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '14',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '25',
  },
  aiHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  aiHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
  },
  aiModalScroll: {
    flex: 1,
  },
  aiModalScrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 16,
  },
  // Hero
  aiHeroSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  aiHeroIconRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: colors.primary + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
  },
  aiHeroIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  aiHeroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  aiHeroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  // Context strip
  aiContextStrip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiContextLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  // Profile chips
  aiProfileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  aiProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary + '10',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primary + '25',
  },
  aiProfileChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    maxWidth: 90,
  },
  // Text area card
  aiTextAreaWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EAECF4',
  },
  aiTextAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTextAreaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiTextAreaLabelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  aiTextAreaLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1.0,
  },
  aiCharCount: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  aiCharCountWarn: {
    color: '#F59E0B',
  },
  aiTextAreaInput: {
    minHeight: 300,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
    borderWidth: 0,
    padding: 0,
  },
  aiValidationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  aiValidationText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  // Feature pills
  aiFeatureRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  aiFeaturePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  aiFeaturePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  // Footer
  aiModalFooter: {
    paddingHorizontal: spacing.md,
    paddingTop: 14,
    paddingBottom: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EAECF4',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  aiGenerateButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  aiGenerateButtonDisabled: {
    backgroundColor: colors.gray200,
    shadowOpacity: 0,
    elevation: 0,
  },
  aiGeneratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiGenerateButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  aiFooterNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Warning banner for fallback cover letters
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  warningBannerText: {
    ...typography.caption,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
  // Regenerate button in modal header
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regenerateButtonText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: '600',
  },
  // ── Editor Modal ──────────────────────────────────────────────
  editorModalContainer: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  editorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF4',
    backgroundColor: '#fff',
  },
  editorHeaderCenter: {
    alignItems: 'center',
    gap: 4,
  },
  editorLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  editorLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  editorLiveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  editorCloseBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  editorRegenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  editorRegenerateBtnDisabled: {
    opacity: 0.65,
  },
  editorRegenerateBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  // Stats Bar
  editorStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF4',
    gap: 12,
  },
  editorStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editorStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  editorStatDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#DDDFE8',
  },
  editorScroll: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },
  editorScrollContent: {
    padding: spacing.md,
    paddingBottom: 120,
  },
  editorCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EAECF4',
  },
  editorCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: spacing.md,
  },
  editorIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  editorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.1,
  },
  editorSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  editorDivider: {
    height: 1,
    backgroundColor: '#F0F2F8',
    marginBottom: spacing.md,
  },
  coverLetterEditor: {
    minHeight: 480,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 26,
    color: colors.text,
    paddingTop: 0,
    borderWidth: 0,
  },
  editorBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  editorWordCount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  editorHint: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  // Tips card in editor
  editorTipsCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  editorTipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  editorTipItem: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 20,
    fontWeight: '500',
  },
  editorFooter: {
    padding: spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EAECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  // Cover Letter File Card
  clFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDE3F8',
    gap: 12,
  },
  clFileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  clFileDetails: {
    flex: 1,
  },
  clFileName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  clFileMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  clFileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  clActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clDeleteBtn: {
    backgroundColor: colors.error + '12',
  },
});