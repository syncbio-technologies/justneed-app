import AsyncStorage from '@react-native-async-storage/async-storage';
import { nativeGoogleSignOut } from './nativeGoogleAuth';

const GOOGLE_TOKEN_KEY = '@justneed_google_token';

export const useGoogleAuth = () => {
  const signOut = async () => {
    try {
      await nativeGoogleSignOut();
    } catch (error) {
      console.log('Google signOut error (non-critical):', error);
    } finally {
      await AsyncStorage.removeItem(GOOGLE_TOKEN_KEY);
    }
  };

  return { signOut };
};
