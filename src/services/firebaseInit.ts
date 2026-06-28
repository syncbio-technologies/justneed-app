import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { Platform } from 'react-native';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
// @ts-ignore — getReactNativePersistence is exported at runtime but not in the .d.ts on web builds.
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const getFirebaseApp = (): FirebaseApp => {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

const app = getFirebaseApp();

// Initialize Auth once with AsyncStorage persistence on native. Web uses its
// own IndexedDB persistence via getAuth(). initializeAuth throws if called
// twice, so guard with a try/catch fallback to getAuth().
let firebaseAuth: Auth;
try {
  firebaseAuth =
    Platform.OS === 'web'
      ? getAuth(app)
      : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
} catch {
  firebaseAuth = getAuth(app);
}

export const getFirebaseAuthInstance = (): Auth => firebaseAuth;

export default app;
