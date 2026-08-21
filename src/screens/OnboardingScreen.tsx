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
import { useAuthStore } from '../store/authStore';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to PayLoop',
    description: 'The easiest way to track, manage, and stay on top of all your recurring bills.',
    icon: 'briefcase',
  },
  {
    id: '2',
    title: 'Track Every Bill',
    description: 'See all your upcoming, paid, and overdue bills in one clean dashboard.',
    icon: 'list',
  },
  {
    id: '3',
    title: 'Never Miss a Payment',
    description: 'Get timely reminders before your due dates so you never pay a late fee again.',
    icon: 'bell',
  },
  {
    id: '4',
    title: 'Smart Analytics',
    description: 'Understand your spending habits with beautiful charts and insights.',
    icon: 'pie-chart',
  },
];

export const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);
  const { completeOnboarding } = useAuthStore();

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <FlatList
          data={SLIDES}
          renderItem={({ item, index }) => (
            <View style={styles.slide}>
              <View style={styles.iconContainer}>
                <Feather name={item.icon as any} size={72} color={Colors.deepNavy} />
              </View>
              <View style={styles.slideNumRow}>
                <Text style={styles.slideNum}>{index + 1}</Text>
                <Text style={styles.slideNumTotal}>/{SLIDES.length}</Text>
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
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 28, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.2, 1, 0.2],
              extrapolate: 'clamp',
            });
            return <Animated.View style={[styles.dot, { width: dotWidth, opacity }]} key={i.toString()} />;
          })}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={scrollToNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          {currentIndex !== SLIDES.length - 1 && (
            <Feather name="arrow-right" size={20} color={Colors.accent} style={{ marginLeft: 8 }} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
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
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  slideNumRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  slideNum: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.deepNavy,
  },
  slideNumTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
    marginLeft: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 23,
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  paginator: {
    flexDirection: 'row',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.deepNavy,
  },
  nextBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.deepNavy,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    color: Colors.accent,
    fontSize: 17,
    fontWeight: '700',
  },
});
