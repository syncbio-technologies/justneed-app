import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { hp } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';

export default function GetStartedScreen({ navigation }: any) {
  const { markSeenGetStarted } = useAuth();

  const goToWelcome = async () => {
    try {
      if (markSeenGetStarted) await markSeenGetStarted();
    } catch (e) {
      console.warn('Failed to mark seen-getstarted:', e);
    }
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <TouchableOpacity onPress={goToWelcome} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.illustrationWrap}>
        <Image
          source={require('../../assets/onboarding-hero.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.welcome}>Welcome To</Text>
        <Text style={styles.appName}>JustNeed App</Text>
        <Text style={styles.description}>
          JustNeed is the platform that helps everyone find their next
          opportunity — swipe, match, and get hired by employers who want your
          skills.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={goToWelcome}
          activeOpacity={0.85}
          style={styles.nextButton}
        >
          <Ionicons name="arrow-forward" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerSide: {
    width: 24,
    height: 24,
  },
  skip: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '500',
    opacity: 0.9,
  },
  illustrationWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: hp(34),
  },
  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  welcome: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '500',
    opacity: 0.9,
  },
  appName: {
    fontSize: 28,
    color: colors.white,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.85,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  nextButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
