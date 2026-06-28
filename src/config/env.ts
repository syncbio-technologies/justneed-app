// Expo replaces `process.env.EXPO_PUBLIC_*` references statically at build time,
// so we must reference each key by its literal name rather than a dynamic lookup.
const PUBLIC_ENV: Record<string, string | undefined> = {
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
};

export const getPublicEnv = (key: string): string | undefined => {
  const value = PUBLIC_ENV[key];
  return value && value.length > 0 ? value : undefined;
};

export const getRequiredPublicEnv = (key: string): string => {
  const value = getPublicEnv(key);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Set it in your .env file and restart the Metro bundler with cache cleared.`
    );
  }
  return value;
};
