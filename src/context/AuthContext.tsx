import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
 import * as FileSystem from 'expo-file-system/legacy';
import { AuthContextType, User, UserProfile, UploadedFile } from '../types';
import { API_BASE } from '../config/api';
import { isLocalUri, inferMimeType } from '../services/uploadService';
import { handleApiError, getErrorMessage } from '../services/errorHandler';
import Constants from 'expo-constants';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut as firebaseSignOut,
  getRedirectResult,
} from 'firebase/auth';
import { getFirebaseAuthInstance } from '../services/firebaseInit';
import {
  configureNativeGoogleSignin,
  nativeGoogleSignIn,
} from '../services/nativeGoogleAuth';

type GoogleResult = {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  idToken: string;
};

// Expo Go cannot register custom URL schemes used by the Google OAuth redirect,
// so the dev client is required for native sign-in. Detection uses both
// appOwnership and executionEnvironment to cover SDKs where one is unreliable.
const isExpoGo =
  (Constants as any).appOwnership === 'expo' ||
  (Constants as any).executionEnvironment === 'storeClient';

const buildUserPayload = (firebaseUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}) => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL,
});

const performGoogleSignOut = async () => {
  await firebaseSignOut(getFirebaseAuthInstance());
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@justneed_user';
const TOKEN_KEY = '@justneed_token';
const GOOGLE_TOKEN_KEY = '@justneed_google_token';

// On web (AsyncStorage -> localStorage with ~5MB quota), strip large data URIs before saving
// Optimized to reduce storage size and improve performance
const compactUserForWeb = (user: User): User => {
  if (Platform.OS !== 'web') return user;
  const clone: User = JSON.parse(JSON.stringify(user));
  const stripDoc = (doc?: UploadedFile | null): UploadedFile | null => {
    if (!doc) return doc ?? null;
    // Reduce threshold for better performance and storage efficiency
    if (doc.uri && doc.uri.startsWith('data:') && doc.uri.length > 100_000) {
      return { name: doc.name, uri: null as any, size: doc.size ?? 0, mimeType: doc.mimeType };
    }
    return doc;
  };
  if (clone.profile) {
    clone.profile.resume = stripDoc(clone.profile.resume);
    clone.profile.coverLetter = stripDoc(clone.profile.coverLetter);
    const img = clone.profile.profileImage as any;
    // Reduce threshold for profile images too
    if (typeof img === 'string' && img.startsWith('data:') && img.length > 100_000) {
      clone.profile.profileImage = null;
    }
  }
  return clone;
};

const BASE64_ENCODING = (FileSystem as any).EncodingType?.Base64 ?? 'base64';

// Compute byte length of a data URI (or return 0 if not data URI)
const dataUriByteLength = (dataUri?: string | null) => {
  if (!dataUri) return 0;
  const parts = dataUri.split(',');
  if (parts.length < 2) return 0;
  const base64 = parts[1];
  return Math.floor((base64.length * 3) / 4);
};

// Convert a blob: URI (web) to data URI
const blobUriToDataUri = async (uri: string, mimeType: string): Promise<string> => {
  const res = await fetch(uri);
  const blob = await res.blob();
  const reader = new FileReader();
  return await new Promise((resolve, reject) => {
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.readAsDataURL(blob);
  });
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure the native Google Sign-In SDK once on mount. Web is skipped —
  // it uses Firebase's signInWithPopup below. The SDK reads webClientId from
  // EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID so Firebase accepts the id_token it returns.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    try {
      configureNativeGoogleSignin();
    } catch (error) {
      console.error('[Auth] Failed to configure native Google Sign-In:', error);
    }
  }, []);

  const performGoogleSignIn = async (): Promise<GoogleResult> => {
    const webAuth = getFirebaseAuthInstance();

    // Web: Firebase popup.
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(webAuth, provider);
      const idToken = await result.user.getIdToken();
      return { user: buildUserPayload(result.user), idToken };
    }

    if (isExpoGo) {
      throw new Error(
        'Google sign-in is not supported in Expo Go. Build and run the dev client (`npx expo run:android` / `run:ios`).'
      );
    }

    // Native: use the Google Sign-In SDK so the OS account picker (with the
    // device's already-signed-in Google accounts) is shown instead of Chrome.
    const { idToken: googleIdToken } = await nativeGoogleSignIn();

    const credential = GoogleAuthProvider.credential(googleIdToken);
    const userCredential = await signInWithCredential(webAuth, credential);
    const firebaseIdToken = await userCredential.user.getIdToken();
    return { user: buildUserPayload(userCredential.user), idToken: firebaseIdToken };
  };

  useEffect(() => {
    const init = async () => {
      try {
        if (Platform.OS === 'web') {
          const result = await getRedirectResult(getFirebaseAuthInstance());
          if (result) console.log('[Auth] Redirect sign-in result received');
        }
      } catch (error) {
        console.error('[Auth] Init error:', error);
      } finally {
        await loadUser();
      }
    };
    init();
  }, []);

  // Debug: log user state transitions to track logout/login
  useEffect(() => {
    console.log('[Auth] user state changed:', user ? user.email : 'null');
  }, [user]);

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);

        console.log('[loadUser] Loaded from storage - resume:', parsed.profile?.resume?.uri ? 'present' : 'null');
        console.log('[loadUser] Loaded from storage - coverLetter:', parsed.profile?.coverLetter?.uri ? 'present' : 'null');

        // Sanitize old cached resume/coverLetter objects that lacked URLs
        const sanitizeDoc = (doc?: UploadedFile | null) => {
          if (!doc) return null;
          if (!doc.uri) return null;

          const isHttp = doc.uri.startsWith('http');
          const isDataWithPayload = doc.uri.startsWith('data:') && doc.uri.length > 30;
          const hasSize = !!doc.size && doc.size > 0;

          return (isHttp || isDataWithPayload || hasSize) ? doc : null;
        };

        const sanitizedProfile = {
          ...parsed.profile,
          resume: sanitizeDoc(parsed.profile?.resume),
          coverLetter: sanitizeDoc(parsed.profile?.coverLetter),
        };
        setUser({ ...parsed, profile: sanitizedProfile });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, isRecruiter: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData;

        if (contentType?.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error('[Auth] Non-JSON response from login:', text.substring(0, 200));
          errorData = { error: 'Server returned invalid response. Check your API URL and backend connection.' };
        }
        throw new Error(errorData.error || 'Login failed');
      }

      const { user: userData, token } = await response.json();

      // Optimized: Fetch profile data in parallel with token storage
      const [profileResponse] = await Promise.all([
        fetch(`${API_BASE}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        AsyncStorage.setItem(TOKEN_KEY, token)
      ]);

      let profileData = {};
      if (profileResponse.ok) {
        profileData = await profileResponse.json();
      }

      const resumeUri = (profileData as any).resumeUrl || (profileData as any).resumeBase64 || '';
      const coverUri = (profileData as any).coverLetterUrl || (profileData as any).coverLetterBase64 || '';
      const resumeName = (profileData as any).profile?.resumeName || 'Resume';
      const coverName = (profileData as any).profile?.coverLetterName || 'Cover Letter';
      const profileImageUri = (profileData as any).profileImageUrl || (profileData as any).profileImageBase64 || null;

      const resumeSize = resumeUri ? dataUriByteLength(resumeUri) : 0;
      const coverSize = coverUri ? dataUriByteLength(coverUri) : 0;

      // Only set resume/coverLetter if we have a valid URI
      const newResume = resumeUri ? { uri: resumeUri, name: resumeName, size: resumeSize } : null;
      const newCoverLetter = coverUri ? { uri: coverUri, name: coverName, size: coverSize } : null;

      const newUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.full_name?.split(' ')[0] || '',
        lastName: userData.full_name?.split(' ').slice(1).join(' ') || '',
        isRecruiter,
        profile: {
          phone: (profileData as any).phone || '',
          address: (profileData as any).profile?.address || '',
          profileImage: profileImageUri || null,
          jobTitle: (profileData as any).profile?.jobTitle || '',
          skills: (profileData as any).profile?.skills || '',
          preferredLocation: (profileData as any).profile?.preferredLocation || '',
          jobPreferences: (profileData as any).profile?.jobPreferences || '',
          resume: newResume,
          coverLetter: newCoverLetter,
        },
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(compactUserForWeb(newUser)));
      await AsyncStorage.setItem(TOKEN_KEY, token);
      setUser(newUser);
    } catch (error) {
      console.error('[Auth] Login error:', getErrorMessage(error));
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string, isRecruiter: boolean = false) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName: name }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let error;

        if (contentType?.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          console.error('[Auth] Non-JSON response from signup:', text.substring(0, 200));
          error = { error: 'Server returned invalid response. Check your API URL and backend connection.' };
        }
        throw new Error(error.error || 'Signup failed');
      }

      const { user: userData, token } = await response.json();

      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newUser: User = {
        id: userData.id,
        email: userData.email,
        firstName,
        lastName,
        isRecruiter,
        profile: {
          phone: '',
          address: '',
          profileImage: null,
          jobTitle: '',
          skills: '',
          preferredLocation: '',
          jobPreferences: '',
          resume: null,
          coverLetter: null,
        },
      };

      // Do NOT auto-login after standard signup. We want the user to manually login.
      // await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(compactUserForWeb(newUser)));
      // await AsyncStorage.setItem(TOKEN_KEY, token);
      // setUser(newUser);
    } catch (error) {
      console.error('[Auth] Signup error:', getErrorMessage(error));
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      console.log('[Auth] Starting Google sign-in with Firebase...');

      // Use the helper function to perform Google sign-in
      const { user: firebaseUser, idToken } = await performGoogleSignIn();
      
      console.log('[Auth] Firebase sign-in successful:', firebaseUser.email);
      console.log('[Auth] ID Token length:', idToken.length);
      console.log('[Auth] ID Token preview:', idToken.substring(0, 50) + '...');

      await AsyncStorage.setItem(GOOGLE_TOKEN_KEY, idToken);

      // Backend: check if user exists → sign in, or create new user
      console.log('[Auth] Sending token to backend at:', `${API_BASE}/auth/google`);
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      console.log('[Auth] Backend response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let error;
        if (contentType?.includes('application/json')) {
          error = await response.json();
        } else {
          const text = await response.text();
          console.error('[Auth] Non-JSON response from Google login:', text.substring(0, 200));
          error = { error: 'Server returned invalid response.' };
        }
        console.error('[Auth] Backend error response:', error);
        throw new Error(error.error || 'Google login failed');
      }

      const { user: userData, token, isNewUser } = await response.json();
      console.log('[Auth] User status:', isNewUser ? 'New user created' : 'Existing user signed in');

      // Fetch profile in parallel with storing token
      const [profileResponse] = await Promise.all([
        fetch(`${API_BASE}/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        AsyncStorage.setItem(TOKEN_KEY, token),
      ]);

      let profileData: any = {};
      if (profileResponse.ok) {
        profileData = await profileResponse.json();
      }

      const resumeUri = profileData.resumeUrl || profileData.resumeBase64 || '';
      const coverUri = profileData.coverLetterUrl || profileData.coverLetterBase64 || '';
      const resumeSize = resumeUri ? dataUriByteLength(resumeUri) : 0;
      const coverSize = coverUri ? dataUriByteLength(coverUri) : 0;

      const nameParts = (userData.full_name || firebaseUser.displayName || '').trim().split(' ');

      const newUser: User = {
        id: userData.id,
        email: userData.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        isRecruiter: false,
        profile: {
          phone: profileData.phone || '',
          address: profileData.profile?.address || '',
          profileImage: profileData.profileImageUrl || profileData.profileImageBase64 || firebaseUser.photoURL || null,
          jobTitle: profileData.profile?.jobTitle || '',
          skills: profileData.profile?.skills || '',
          preferredLocation: profileData.profile?.preferredLocation || '',
          jobPreferences: profileData.profile?.jobPreferences || '',
          resume: resumeUri ? { uri: resumeUri, name: profileData.profile?.resumeName || 'Resume', size: resumeSize } : null,
          coverLetter: coverUri ? { uri: coverUri, name: profileData.profile?.coverLetterName || 'Cover Letter', size: coverSize } : null,
        },
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(compactUserForWeb(newUser)));
      setUser(newUser);

      console.log('[Auth] Google login complete — navigating to main app');
    } catch (error: any) {
      // Log the raw cause; getErrorMessage rewrites generic Errors to "Server
      // error" which hides things like "Sign-in cancelled by user".
      console.error('[Auth] Google login error:', error?.message || error);
      throw error;
    }
  };

  const logout = async (callback?: () => Promise<void>) => {
    try {
      console.log('[Auth] Starting logout process...');

      // Sign out from Google/Firebase
      try {
        await performGoogleSignOut();
        console.log('[Auth] Google/Firebase sign-out successful');
      } catch (error) {
        console.warn('[Auth] Google/Firebase sign-out warning:', error);
      }

      // Execute any additional callback if provided
      if (callback) {
        console.log('[Auth] Executing logout callback...');
        await callback();
      }

      // Now clear all storage items
      console.log('[Auth] Clearing storage keys...');
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(GOOGLE_TOKEN_KEY)
      ]);

    } catch (error) {
      console.error('Logout error (storage/callback):', error);
      // continue to clear in-memory user even if storage fails
    } finally {
      console.log('[Auth] Setting user to null (logout complete)');
      setUser(null);

      // On web, also hard-refresh to clear any persisted state in react-navigation
      if (Platform.OS === 'web') {
        setTimeout(() => {
          console.log('[Auth] Reloading page for web logout');
          window.location.reload();
        }, 100); // Small delay to ensure state update completes
      }
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile> & { firstName?: string; lastName?: string }) => {
    try {
      if (!user) return;

      const { firstName, lastName, resume, coverLetter, profileImage, ...otherProfileFields } = profileData;

      // Upload helpers with performance optimizations
      const maybeUploadDoc = async (file?: UploadedFile | null) => {
        console.log('[maybeUploadDoc] Processing file:', file?.name, file?.uri);
        if (file === undefined) return undefined; // caller didn't touch this field
        if (file === null) return { uploadedFile: null, url: null, base64: null } as const;

        const isLocal = isLocalUri(file.uri);
        console.log('[maybeUploadDoc] Is local file:', isLocal, 'URI:', file.uri);

        if (!isLocal) {
          console.log('[maybeUploadDoc] Not a local file, handling blob/data/remote');
          if (file.uri.startsWith('blob:')) {
            const mimeType = file.mimeType || inferMimeType(file.name);
            const dataUri = await blobUriToDataUri(file.uri, mimeType);
            return { uploadedFile: { ...file, uri: dataUri, mimeType }, url: dataUri, base64: dataUri } as const;
          }
          // data: or http(s): already usable
          return { uploadedFile: file, url: file.uri, base64: file.uri } as const;
        }

        console.log('[maybeUploadDoc] Reading file as base64...');
        const mimeType = file.mimeType || inferMimeType(file.name);

        // Use InteractionManager to defer heavy operations on React Native
        if (Platform.OS !== 'web') {
          const { InteractionManager } = require('react-native');
          await new Promise(resolve => InteractionManager.runAfterInteractions(resolve));
        }

        const base64 = await FileSystem.readAsStringAsync(file.uri, { encoding: BASE64_ENCODING as any });
        console.log('[maybeUploadDoc] Base64 length:', base64.length);
        const dataUri = `data:${mimeType};base64,${base64}`;
        console.log('[maybeUploadDoc] Created data URI, length:', dataUri.length);
        return { uploadedFile: { ...file, uri: dataUri, mimeType }, url: dataUri, base64: dataUri } as const;
      };

      const maybeUploadImage = async (uri?: string | null) => {
        if (uri === undefined) return undefined;
        if (uri === null) return { uri: null, base64: null } as const;
        if (!isLocalUri(uri)) {
          if (uri.startsWith('blob:')) {
            const dataUri = await blobUriToDataUri(uri, 'image/jpeg');
            return { uri: dataUri, base64: dataUri } as const;
          }
          return { uri, base64: uri } as const;
        }

        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: BASE64_ENCODING as any });
        const dataUri = `data:image/jpeg;base64,${base64}`;
        return { uri: dataUri, base64: dataUri } as const;
      };

      const [resumeUpload, coverUpload, profileImageUpload] = await Promise.all([
        maybeUploadDoc(resume),
        maybeUploadDoc(coverLetter),
        maybeUploadImage(profileImage),
      ]);

      const updatedUser = {
        ...user,
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        profile: {
          ...user.profile,
          ...(resumeUpload !== undefined ? { resume: resumeUpload?.uploadedFile || null } : {}),
          ...(resume !== undefined ? { resumeName: resume?.name ?? null } : {}),
          ...(coverUpload !== undefined ? { coverLetter: coverUpload?.uploadedFile || null } : {}),
          ...(coverLetter !== undefined ? { coverLetterName: coverLetter?.name ?? null } : {}),
          ...(profileImageUpload !== undefined ? { profileImage: profileImageUpload?.uri || null } : {}),
          ...otherProfileFields,
        }
      };

      // Save to backend
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        const fullName = firstName && lastName ? `${firstName} ${lastName}` : undefined;

        // Normalize array fields to avoid PG type errors on text[] columns
        const skillsPayload = Array.isArray(otherProfileFields.skills) ? otherProfileFields.skills : undefined;
        const preferredLocationsPayload = Array.isArray((otherProfileFields as any).preferredLocations)
          ? (otherProfileFields as any).preferredLocations
          : undefined;
        const preferredJobTypesPayload = Array.isArray((otherProfileFields as any).preferredJobTypes)
          ? (otherProfileFields as any).preferredJobTypes
          : undefined;

        const patchResponse = await fetch(`${API_BASE}/profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName,
            phone: otherProfileFields.phone,
            profileImageUrl: profileImageUpload?.uri ?? (profileImage === null ? null : undefined),
            profileImageBase64: profileImageUpload?.base64 ?? (profileImage === null ? null : undefined),
            resumeUrl: resumeUpload?.url ?? (resume === null ? null : undefined),
            resumeBase64: resumeUpload?.base64 ?? (resume === null ? null : undefined),
            resumeName: resume === undefined ? undefined : resume?.name ?? null,
            coverLetterUrl: coverUpload?.url ?? (coverLetter === null ? null : undefined),
            coverLetterBase64: coverUpload?.base64 ?? (coverLetter === null ? null : undefined),
            coverLetterName: coverLetter === undefined ? undefined : coverLetter?.name ?? null,
            // Add other profile fields
            address: otherProfileFields.address,
            jobTitle: otherProfileFields.jobTitle,
            skills: skillsPayload,
            preferredLocations: preferredLocationsPayload,
            preferredJobTypes: preferredJobTypesPayload,
            preferredLocation: otherProfileFields.preferredLocation,
            jobPreferences: otherProfileFields.jobPreferences,
          }),
        });

        if (!patchResponse.ok) {
          const text = await patchResponse.text();
          console.error('Profile update failed:', patchResponse.status, text);
          // Don't throw here - we still want to save to local storage
          // The user can retry uploading
        } else {
          console.log('Profile updated successfully on backend');
        }
      } else {
        console.warn('No token found, skipping backend update');
      }

      // Save to local storage (even if backend update failed, keep local state)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(compactUserForWeb(updatedUser)));
      setUser(updatedUser);
      console.log('Profile saved to local storage');
    } catch (error) {
      console.error('[Auth] Update profile error:', getErrorMessage(error));
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      signup,
      logout,
      loginWithGoogle,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};