import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing } from '../constants/spacing';

const { height } = Dimensions.get('window');

// Custom animated loading dots component
const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;
  const dot4 = useRef(new Animated.Value(0.3)).current;
  const dot5 = useRef(new Animated.Value(0.3)).current;
  const dot6 = useRef(new Animated.Value(0.3)).current;
  const dot7 = useRef(new Animated.Value(0.3)).current;
  const dot8 = useRef(new Animated.Value(0.3)).current;

  const dots = [dot1, dot2, dot3, dot4, dot5, dot6, dot7, dot8];

  useEffect(() => {
    const animateDots = () => {
      const animations = dots.map((dot, index) => 
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.loop(
        Animated.stagger(100, animations),
        { iterations: -1 }
      ).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.dotsContainer}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            {
              opacity: dot,
              transform: [{
                rotate: `${index * 45}deg`
              }]
            }
          ]}
        />
      ))}
    </View>
  );
};

export const LoadingScreen: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const spinnerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Show spinner after logo animation
      Animated.timing(spinnerOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoClip}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.appName}>JustNeed</Text>
        </Animated.View>

        {/* Loading Spinner */}
        <Animated.View 
          style={[
            styles.spinnerContainer,
            { opacity: spinnerOpacity }
          ]}
        >
          <LoadingDots />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl * 2,
  },
  // Visible bounds — sets where the logo appears on screen.
  logoClip: {
    width: 140,
    height: 140,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  // Rendered oversized so the PNG's white rounded frame falls outside the
  // clipping bounds and only the inner mark is visible against indigo.
  logoImage: {
    width: 220,
    height: 220,
  },
  appName: {
    ...typography.h1,
    color: colors.white,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  spinnerContainer: {
    position: 'absolute',
    bottom: height * 0.15,
  },
  dotsContainer: {
    width: 40,
    height: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.white,
    top: 2,
  },
});