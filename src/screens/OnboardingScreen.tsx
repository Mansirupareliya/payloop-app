import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to PayLoop',
    description: 'The easiest way to track, manage, and stay on top of all your recurring bills.',
    icon: 'briefcase',
    color: '#018ABE',
  },
  {
    id: '2',
    title: 'Track Every Bill',
    description: 'See all your upcoming, paid, and overdue bills in one clean dashboard.',
    icon: 'list',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'Never Miss a Payment',
    description: 'Get timely reminders before your due dates so you never pay a late fee again.',
    icon: 'bell',
    color: '#F59E0B',
  },
  {
    id: '4',
    title: 'Smart Analytics',
    description: 'Understand your spending habits with beautiful charts and insights.',
    icon: 'pie-chart',
    color: '#8B5CF6',
  },
];

export const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const { completeOnboarding } = useAuthStore();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const skip = () => {
    completeOnboarding();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={skip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <FlatList
          data={SLIDES}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                <Feather name={item.icon as any} size={80} color={item.color} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                style={[styles.dot, { width: dotWidth, opacity }]}
                key={i.toString()}
              />
            );
          })}
        </View>

        {/* Next / Get Started Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={scrollToNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          {currentIndex !== SLIDES.length - 1 && (
            <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Bright light theme
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    alignItems: 'flex-end',
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  sliderContainer: {
    flex: 3,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  paginator: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#018ABE',
    marginHorizontal: 4,
  },
  nextBtn: {
    flexDirection: 'row',
    backgroundColor: '#018ABE', // Primary brand color
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#018ABE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
