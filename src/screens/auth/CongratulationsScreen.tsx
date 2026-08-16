import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';

type CongratulationsNav = StackNavigationProp<AuthStackParamList, 'Congratulations'>;

export const CongratulationsScreen = () => {
  const navigation = useNavigation<CongratulationsNav>();

  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    // Pop-in animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-redirect to Login after 3 seconds
    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}
      >
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <FontAwesome5 name="check" size={48} color="#0f766e" />
        </View>

        <Text style={styles.title}>Congratulations!</Text>
        <Text style={styles.subtitle}>Your profile has been{'\n'}successfully created</Text>

        <View style={styles.redirectNote}>
          <Text style={styles.redirectText}>Redirecting to login...</Text>
        </View>
      </Animated.View>

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTopLeft]} />
      <View style={[styles.circle, styles.circleBottomRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0f2f1',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 48,
  },
  redirectNote: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  redirectText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circleTopLeft: {
    width: 250,
    height: 250,
    top: -80,
    left: -80,
  },
  circleBottomRight: {
    width: 300,
    height: 300,
    bottom: -100,
    right: -100,
  },
});
