import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getPublicEnv } from '../config/env';

let configured = false;

export const configureNativeGoogleSignin = (): void => {
  if (Platform.OS === 'web' || configured) return;

  const webClientId = getPublicEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
  if (!webClientId) {
    throw new Error(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is required for native Google Sign-In. Add it to your .env.'
    );
  }

  const iosClientId = getPublicEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID');

  GoogleSignin.configure({
    webClientId,
    ...(iosClientId ? { iosClientId } : {}),
    offlineAccess: false,
  });

  configured = true;
};

export type NativeGoogleSignInResult = {
  idToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    photo: string | null;
  };
};

export const nativeGoogleSignIn = async (): Promise<NativeGoogleSignInResult> => {
  configureNativeGoogleSignin();

  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  }

  const response = await GoogleSignin.signIn();

  if (response.type === 'cancelled') {
    throw new Error('Sign-in cancelled by user');
  }

  const { idToken, user } = response.data;
  if (!idToken) {
    throw new Error(
      'Google sign-in did not return an idToken. Verify the webClientId and (on Android) the SHA-1 fingerprint registered in Google Cloud Console.'
    );
  }

  return {
    idToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      photo: user.photo,
    },
  };
};

export const nativeGoogleSignOut = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  configureNativeGoogleSignin();

  try {
    await GoogleSignin.signOut();
  } catch {
    // Already signed out — non-fatal.
  }

  try {
    await GoogleSignin.revokeAccess();
  } catch {
    // No active grant to revoke — non-fatal.
  }
};
