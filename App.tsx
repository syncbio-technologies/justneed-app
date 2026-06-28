import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Fraunces_700Bold,
  Fraunces_900Black,
} from '@expo-google-fonts/fraunces';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import SwipeScreen from './src/screens/SwipeScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import PinnedScreen from './src/screens/PinnedScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SkillsTabScreen from './src/screens/SkillsTabScreen';
import JobDetailsScreen from './src/screens/JobDetailsScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerifyOtpScreen from './src/screens/VerifyOtpScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import SkillCardScreen from './src/screens/SkillCardScreen';
import GetStartedScreen from './src/screens/GetStarted';
import WelcomeScreen from './src/screens/WelcomeScreen';
import ResumeUploadScreen from './src/screens/ResumeUploadScreen';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';

import { colors } from './src/constants/colors';
import { spacing } from './src/constants/spacing';

import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingScreen } from './src/components/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* -------------------------------- */
/* Bottom Tab Navigator             */
/* -------------------------------- */
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarLabelPosition: 'below-icon',

        tabBarIcon: ({ focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          let iconColor = focused ? '#C9A84C' : '#555555';

          switch (route.name) {
            case 'Swipe':
              iconName = 'home';
              break;

            case 'Pinned':
              iconName = 'heart';
              break;

            case 'Applications':
              iconName = 'checkmark-circle';
              break;

            case 'Skills':
              iconName = 'card';
              break;

            case 'Profile':
              iconName = 'person-circle';
              break;

            default:
              iconName = 'help-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={focused ? 28 : 24}
              color={iconColor}
            />
          );
        },

        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 80,
          backgroundColor: '#111111',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 12,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
        },

        tabBarItemStyle: {
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: spacing.xs,
        },

        tabBarActiveTintColor: '#C9A84C',
        tabBarInactiveTintColor: '#555555',
      })}
    >
      <Tab.Screen name="Swipe" component={SwipeScreen} />
      <Tab.Screen name="Pinned" component={PinnedScreen} />
      <Tab.Screen name="Applications" component={ApplicationsScreen} />
      <Tab.Screen name="Skills" component={SkillsTabScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* -------------------------------- */
/* App Navigator                    */
/* -------------------------------- */
function AppNavigator() {
  const { user, isLoading } = useAuth();

  const [showResumeUpload, setShowResumeUpload] =
    useState<boolean | null>(null);

  const [isFirstLaunch, setIsFirstLaunch] =
    useState<boolean | null>(null);

  /* -------------------------------- */
  /* First Install Check              */
  /* -------------------------------- */
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const alreadyLaunched = await AsyncStorage.getItem(
          '@already_launched'
        );

        if (alreadyLaunched === null) {
          // First time install
          await AsyncStorage.setItem(
            '@already_launched',
            'true'
          );

          setIsFirstLaunch(true);
        } else {
          // App opened before
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.log('First launch check error:', error);
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  /* -------------------------------- */
  /* Reset First Launch on Login      */
  /* -------------------------------- */
  useEffect(() => {
    if (user && isFirstLaunch) {
      setIsFirstLaunch(false);
    }
  }, [user, isFirstLaunch]);

  /* -------------------------------- */
  /* Resume Upload Check              */
  /* -------------------------------- */
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      setShowResumeUpload(false);
      return;
    }

    // Show loading while checking storage
    setShowResumeUpload(null);

    let cancelled = false;

    (async () => {
      try {
        const val = await AsyncStorage.getItem(
          '@resume_pending'
        );

        if (!cancelled) {
          setShowResumeUpload(val === 'true');
        }
      } catch {
        if (!cancelled) {
          setShowResumeUpload(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, isLoading]);

  /* -------------------------------- */
  /* Loading                          */
  /* -------------------------------- */
  if (
    isLoading ||
    showResumeUpload === null ||
    isFirstLaunch === null
  ) {
    return <LoadingScreen />;
  }

  /* -------------------------------- */
  /* Navigator                        */
  /* -------------------------------- */
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {showResumeUpload ? (
            <>
              <Stack.Screen
                name="ResumeUpload"
                component={ResumeUploadScreen}
              />

              <Stack.Screen
                name="Main"
                component={TabNavigator}
              />

              <Stack.Screen
                name="JobDetails"
                component={JobDetailsScreen}
              />

              <Stack.Screen
                name="SkillCard"
                component={SkillCardScreen}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Main"
                component={TabNavigator}
              />

              <Stack.Screen
                name="JobDetails"
                component={JobDetailsScreen}
              />

              <Stack.Screen
                name="SkillCard"
                component={SkillCardScreen}
              />
            </>
          )}
        </>
      ) : (
        <>
          {/* -------------------------------- */}
          {/* FIRST INSTALL                    */}
          {/* -------------------------------- */}
          {isFirstLaunch ? (
            <>
              <Stack.Screen
                name="GetStarted"
                component={GetStartedScreen}
              />

              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
              />

              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
              />

              <Stack.Screen
                name="Login"
                component={LoginScreen}
              />
            </>
          ) : (
            <>
              {/* -------------------------------- */}
              {/* AFTER LOGOUT                     */}
              {/* -------------------------------- */}

              <Stack.Screen
                name="Login"
                component={LoginScreen}
              />

              <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
              />

              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
              />
            </>
          )}

          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />

          <Stack.Screen
            name="VerifyOtp"
            component={VerifyOtpScreen}
          />

          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

/* -------------------------------- */
/* Root App                         */
/* -------------------------------- */
export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    Fraunces_700Bold,
    Fraunces_900Black,
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <FavoritesProvider>
            <NavigationContainer>
              <StatusBar style="light" />
              <AppNavigator />
            </NavigationContainer>
          </FavoritesProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}