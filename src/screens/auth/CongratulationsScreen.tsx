import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';

type CongratulationsNav = StackNavigationProp<AuthStackParamList, 'Congratulations'>;

const C = {
  deepNavy:  '#001B48',
  darkBlue:  '#02457A',
  primary:   '#018ABE',
  lightBlue: '#97CADB',
  paleBlue:  '#D6E8EE',
  white:     '#FFFFFF',
};

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
      <StatusBar barStyle="light-content" backgroundColor={C.deepNavy} />

      {/* Decorative circles */}
      <View style={styles.circleTL} />
      <View style={styles.circleBR} />
      <View style={styles.circleMid} />

      <Animated.View
        style={[
          styles.content,
          { opacity: opacityAnim, transform: [{ scale: scaleAnim }, { translateY: slideAnim }] },
        ]}
      >
        {/* Check icon */}
        <View style={styles.iconRing}>
          <View style={styles.iconInner}>
            <Feather name="check" size={48} color={C.primary} />
          </View>
        </View>

        <Text style={styles.title}>Congratulations! 🎉</Text>
        <Text style={styles.subtitle}>
          Your PayLoop account has been{'\n'}successfully created
        </Text>

        {/* Redirect pill */}
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
    backgroundColor: C.deepNavy,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circleTL: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: C.darkBlue,
    top: -100,
    left: -80,
    opacity: 0.5,
  },
  circleBR: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: C.darkBlue,
    bottom: -120,
    right: -90,
    opacity: 0.5,
  },
  circleMid: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: C.primary,
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
    borderColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  iconInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: C.white,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: C.lightBlue,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: 40,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(1, 138, 190, 0.18)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(151, 202, 219, 0.3)',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.primary,
  },
  pillText: {
    color: C.lightBlue,
    fontSize: 13,
    fontWeight: '500',
  },
});
