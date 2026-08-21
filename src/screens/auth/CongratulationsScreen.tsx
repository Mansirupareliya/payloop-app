import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { Colors } from '../../constants/colors';

type CongratulationsNav = StackNavigationProp<AuthStackParamList, 'Congratulations'>;

export const CongratulationsScreen = () => {
  const navigation = useNavigation<CongratulationsNav>();
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.deepNavy} />

      <View style={styles.circleTL} />
      <View style={styles.circleBR} />
      <View style={styles.circleMid} />

      <Animated.View
        style={[
          styles.content,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] },
        ]}
      >
        <View style={styles.iconRing}>
          <View style={styles.iconInner}>
            <Feather name="check" size={48} color={Colors.deepNavy} />
          </View>
        </View>

        <Text style={styles.title}>Account Created!</Text>
        <Text style={styles.subtitle}>
          Your PayLoop account has been{'\n'}successfully set up
        </Text>

        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillText}>Redirecting to login...</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circleTL: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -100,
    left: -80,
  },
  circleBR: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -120,
    right: -90,
  },
  circleMid: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.accent,
    top: '30%',
    right: -100,
    opacity: 0.08,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 10,
  },
  iconRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.surface,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textOnDarkMuted,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: 40,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(200,241,53,0.12)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(200,241,53,0.25)',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  pillText: {
    color: Colors.textOnDarkMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
