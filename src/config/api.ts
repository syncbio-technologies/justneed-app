import { Platform } from 'react-native';
import { getPublicEnv } from './env';

// Get API URL from environment variables
// Falls back to localhost if not configured
const getApiBase = (): string => {
  try {
    // Try to get from environment variables first
    const envUrl = getPublicEnv('EXPO_PUBLIC_API_URL');

    if (envUrl) {
      console.log('[API Config] Using API URL from env:', envUrl);
      return envUrl;
    }

    console.warn('[API Config] No API URL in environment. Using default fallback.');

    // If running in an Android Emulator, localhost doesn't point to the host machine.
    // 10.0.2.2 is the special alias to your host loopback interface.
    if (Platform.OS === 'android') {
      return 'http://192.168.1.3:3000';
    }

    // Fallback for iOS simulator and web
    return 'http://localhost:3000';
  } catch (error) {
    console.error('[API Config] Error reading API URL:', error);
    return 'http://localhost:3000';
  }
};

export const API_BASE = getApiBase();

// Log API configuration on app start (development only)
if (__DEV__) {
  console.log('[API Config] API_BASE:', API_BASE);
  console.log('[API Config] Environment:', {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  });
}