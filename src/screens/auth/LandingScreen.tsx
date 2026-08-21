import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');
type Nav = StackNavigationProp<AuthStackParamList, 'Landing'>;

const SLIDES = [
  {
    id: '1', num: '01',
    title: 'Welcome to\nPayLoop',
    desc: 'The easiest way to track, manage, and stay on top of all your recurring bills.',
    icon: 'briefcase' as const,
  },
  {
    id: '2', num: '02',
    title: 'Track Every\nBill',
    desc: 'See upcoming, paid, and overdue bills in one clean, beautiful dashboard.',
    icon: 'list' as const,
  },
  {
    id: '3', num: '03',
    title: 'Never Miss a\nPayment',
    desc: 'Smart reminders keep you ahead of every due date — zero late fees, forever.',
    icon: 'bell' as const,
  },
  {
    id: '4', num: '04',
    title: 'Spend\nSmarter',
    desc: 'Beautiful analytics reveal your spending habits and help you save more money.',
    icon: 'pie-chart' as const,
  },
];

// ── Per-slide animated component ──────────────────────────────────────────────
function OnboardSlide({
  item,
  index,
  isFocused,
}: {
  item: typeof SLIDES[0];
  index: number;
  isFocused: boolean;
}) {
  const iconScale   = useRef(new Animated.Value(0.3)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const badgeOp     = useRef(new Animated.Value(0)).current;
  const titleY      = useRef(new Animated.Value(28)).current;
  const titleOp     = useRef(new Animated.Value(0)).current;
  const descOp      = useRef(new Animated.Value(0)).current;
  const cardScale   = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!isFocused) return;

    // Reset before re-animating (handles swipe-back)
    iconScale.setValue(0.3);
    iconOpacity.setValue(0);
    badgeOp.setValue(0);
    titleY.setValue(28);
    titleOp.setValue(0);
    descOp.setValue(0);
    cardScale.setValue(0.88);

    Animated.sequence([
      // Card scales up
      Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
      // Icon pops in with bounce
      Animated.parallel([
        Animated.spring(iconScale,   { toValue: 1, tension: 70, friction: 6, useNativeDriver: true }),
        Animated.timing(iconOpacity, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(badgeOp,     { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      // Title slides up
      Animated.parallel([
        Animated.spring(titleY, { toValue: 0, tension: 75, friction: 13, useNativeDriver: true }),
        Animated.timing(titleOp,{ toValue: 1, duration: 340, useNativeDriver: true }),
      ]),
      // Description fades in
      Animated.timing(descOp, { toValue: 1, duration: 380, useNativeDriver: true }),
    ]).start();
  }, [isFocused]);

  return (
    <View style={styles.slide}>
      {/* Dark illustration card */}
      <Animated.View style={[styles.illustCard, { transform: [{ scale: cardScale }] }]}>
        <View style={styles.illustDecor1} />
        <View style={styles.illustDecor2} />

        <Animated.View style={[styles.illustIconCircle, {
          opacity: iconOpacity,
          transform: [{ scale: iconScale }],
        }]}>
          <Feather name={item.icon} size={64} color={Colors.deepNavy} />
        </Animated.View>

        <Animated.View style={[styles.numBadge, { opacity: badgeOp }]}>
          <Text style={styles.numBadgeText}>{item.num}</Text>
        </Animated.View>
      </Animated.View>

      {/* Counter */}
      <Text style={styles.slideCounter}>{index + 1} / {SLIDES.length}</Text>

      {/* Title */}
      <Animated.Text style={[styles.slideTitle, {
        opacity: titleOp,
        transform: [{ translateY: titleY }],
      }]}>
        {item.title}
      </Animated.Text>

      {/* Description */}
      <Animated.Text style={[styles.slideDesc, { opacity: descOp }]}>
        {item.desc}
      </Animated.Text>
    </View>
  );
}

// ── Main LandingScreen ────────────────────────────────────────────────────────
export const LandingScreen = () => {
  const navigation = useNavigation<Nav>();
  const { completeOnboarding } = useAuthStore();

  const [showLanding, setShowLanding] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const listRef    = useRef<FlatList>(null);
  const scrollX    = useRef(new Animated.Value(0)).current;

  // ── Transition: slides → landing ──
  const slidesFade = useRef(new Animated.Value(1)).current;

  // ── Landing entrance animations ──
  const heroOp     = useRef(new Animated.Value(0)).current;
  const heroY      = useRef(new Animated.Value(32)).current;
  const pill1Op    = useRef(new Animated.Value(0)).current;
  const pill1X     = useRef(new Animated.Value(28)).current;
  const pill2Op    = useRef(new Animated.Value(0)).current;
  const pill2X     = useRef(new Animated.Value(-28)).current;
  const pill3Op    = useRef(new Animated.Value(0)).current;
  const pill3X     = useRef(new Animated.Value(28)).current;
  const cardY      = useRef(new Animated.Value(64)).current;
  const cardOp     = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOp    = useRef(new Animated.Value(0.4)).current;

  const startLandingAnim = useCallback(() => {
    // Pulse loop (independent)
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.45, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1,    duration: 1500, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOp, { toValue: 0,   duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseOp, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Entrance sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOp, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.spring(heroY,  { toValue: 0, tension: 60, friction: 14, useNativeDriver: true }),
      ]),
      Animated.stagger(110, [
        Animated.parallel([
          Animated.timing(pill1Op, { toValue: 1, duration: 360, useNativeDriver: true }),
          Animated.spring(pill1X,  { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pill2Op, { toValue: 1, duration: 360, useNativeDriver: true }),
          Animated.spring(pill2X,  { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pill3Op, { toValue: 1, duration: 360, useNativeDriver: true }),
          Animated.spring(pill3X,  { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(cardOp, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(cardY,  { toValue: 0, tension: 55, friction: 13, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const viewableChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) setCurrentIndex(viewableItems[0].index ?? 0);
  }).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      openLanding();
    }
  };

  const openLanding = () => {
    Animated.timing(slidesFade, { toValue: 0, duration: 380, useNativeDriver: true }).start(() => {
      setShowLanding(true);
      startLandingAnim();
    });
  };

  const handleLogin = () => {
    completeOnboarding();
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    completeOnboarding();
    navigation.navigate('Signup');
  };

  // ── LANDING VIEW ────────────────────────────────────────────────────────────
  if (showLanding) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.deepNavy} />

        <View style={styles.blob1} />
        <View style={styles.blob2} />

        {/* Hero area */}
        <Animated.View style={[styles.heroArea, {
          opacity: heroOp,
          transform: [{ translateY: heroY }],
        }]}>
          <Text style={styles.brandName}>PayLoop</Text>
          <Text style={styles.brandSub}>Bill Management, Reimagined</Text>

          <Animated.View style={[styles.pulseRing, {
            opacity: pulseOp,
            transform: [{ scale: pulseScale }],
          }]} />

          <View style={styles.heroRingOuter}>
            <View style={styles.heroRingInner}>
              <View style={styles.heroCircle}>
                <Feather name="credit-card" size={52} color={Colors.deepNavy} />
              </View>
            </View>
          </View>

          {/* Pill 1 */}
          <Animated.View style={[styles.pill, styles.pillTopRight, {
            opacity: pill1Op, transform: [{ translateX: pill1X }],
          }]}>
            <View style={[styles.pillIcon, { backgroundColor: 'rgba(200,241,53,0.18)' }]}>
              <Feather name="zap" size={11} color={Colors.accent} />
            </View>
            <Text style={styles.pillText}>Smart Bills</Text>
          </Animated.View>

          {/* Pill 2 */}
          <Animated.View style={[styles.pill, styles.pillMidLeft, {
            opacity: pill2Op, transform: [{ translateX: pill2X }],
          }]}>
            <View style={[styles.pillIcon, { backgroundColor: 'rgba(52,211,153,0.18)' }]}>
              <Feather name="shield" size={11} color="#34d399" />
            </View>
            <Text style={styles.pillText}>₹0 Late Fees</Text>
            <View style={styles.pillCheck}>
              <Feather name="check" size={8} color="#34d399" />
            </View>
          </Animated.View>

          {/* Pill 3 */}
          <Animated.View style={[styles.pill, styles.pillBotRight, {
            opacity: pill3Op, transform: [{ translateX: pill3X }],
          }]}>
            <View style={[styles.pillIcon, { backgroundColor: 'rgba(96,165,250,0.18)' }]}>
              <Feather name="bar-chart-2" size={11} color="#60a5fa" />
            </View>
            <Text style={styles.pillText}>Auto Track</Text>
          </Animated.View>
        </Animated.View>

        {/* Bottom card */}
        <Animated.View style={[styles.landingCard, {
          opacity: cardOp,
          transform: [{ translateY: cardY }],
        }]}>
          <Text style={styles.headline}>Take control of{'\n'}every bill</Text>
          <Text style={styles.subline}>
            Track, pay, and never miss a due date again — all in one beautiful app.
          </Text>

          <View style={styles.btnRow}>
            <Pressable style={styles.loginBtn} onPress={handleLogin}>
              <Text style={styles.loginBtnText}>Log In</Text>
            </Pressable>
            <Pressable style={styles.signupBtn} onPress={handleSignup}>
              <Text style={styles.signupBtnText}>Sign Up</Text>
            </Pressable>
          </View>

          <Text style={styles.supportLine}>
            Contact our <Text style={styles.supportLink}>Support</Text> if you need help.
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ── ONBOARDING SLIDES VIEW ──────────────────────────────────────────────────
  return (
    <Animated.View style={[styles.slidesShell, { opacity: slidesFade }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Skip button */}
      <View style={styles.slidesHeader}>
        <Pressable onPress={openLanding} style={styles.skipBtn} hitSlop={12}>
          <Text style={styles.skipText}>Skip</Text>
          <Feather name="chevrons-right" size={14} color={Colors.textMuted} />
        </Pressable>
      </View>

      {/* Slides */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={SLIDES}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id}
          ref={listRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false },
          )}
          onViewableItemsChanged={viewableChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
          renderItem={({ item, index }) => (
            <OnboardSlide
              item={item}
              index={index}
              isFocused={index === currentIndex}
            />
          )}
        />
      </View>

      {/* Footer */}
      <View style={styles.slidesFooter}>
        {/* Animated dot paginator */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => {
            const range = [(i - 1) * width, i * width, (i + 1) * width];
            const w  = scrollX.interpolate({ inputRange: range, outputRange: [8, 32, 8],  extrapolate: 'clamp' });
            const op = scrollX.interpolate({ inputRange: range, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { width: w, opacity: op }]} />;
          })}
        </View>

        {/* Next / Get Started */}
        <Pressable style={styles.nextBtn} onPress={goNext}>
          <Text style={styles.nextBtnText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          {currentIndex < SLIDES.length - 1 && (
            <Feather name="arrow-right" size={18} color={Colors.accent} style={{ marginLeft: 8 }} />
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const HERO_H = height * 0.54;

const styles = StyleSheet.create({

  // ── Landing ─────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
  },
  blob1: {
    position: 'absolute',
    width: 380, height: 380, borderRadius: 190,
    backgroundColor: 'rgba(200,241,53,0.07)',
    top: -140, right: -120,
  },
  blob2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(200,241,53,0.04)',
    bottom: '30%', left: -70,
  },
  heroArea: {
    height: HERO_H,
    alignItems: 'center',
    paddingTop: 68,
  },
  brandName: {
    fontSize: 34, fontWeight: '900',
    color: Colors.accent, letterSpacing: -1.5, marginBottom: 4,
  },
  brandSub: {
    fontSize: 13, fontWeight: '500',
    color: 'rgba(255,255,255,0.45)', marginBottom: 32,
  },
  pulseRing: {
    position: 'absolute',
    top: HERO_H * 0.28,
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(200,241,53,0.3)',
  },
  heroRingOuter: {
    width: 196, height: 196, borderRadius: 98,
    borderWidth: 1.5, borderColor: 'rgba(200,241,53,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroRingInner: {
    width: 172, height: 172, borderRadius: 86,
    borderWidth: 1, borderColor: 'rgba(200,241,53,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroCircle: {
    width: 148, height: 148, borderRadius: 74,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 24, elevation: 14,
  },
  pill: {
    position: 'absolute',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 28, paddingHorizontal: 12, paddingVertical: 9, gap: 7,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 14, elevation: 8,
  },
  pillTopRight: { top: 150, right: 22 },
  pillMidLeft:  { top: 222, left: 18 },
  pillBotRight: { bottom: 28, right: 34 },
  pillIcon: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  pillText: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  pillCheck: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(52,211,153,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  landingCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 40, borderTopRightRadius: 40,
    paddingHorizontal: 28, paddingTop: 32, paddingBottom: 36,
  },
  headline: {
    fontSize: 32, fontWeight: '900',
    color: Colors.textPrimary, letterSpacing: -1, lineHeight: 38, marginBottom: 10,
  },
  subline: {
    fontSize: 14, color: Colors.textSecondary,
    lineHeight: 22, fontWeight: '500', marginBottom: 28,
  },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  loginBtn: {
    flex: 1, height: 54, borderRadius: 16,
    borderWidth: 1.5, borderColor: Colors.deepNavy,
    alignItems: 'center', justifyContent: 'center',
  },
  loginBtnText: { fontSize: 15, fontWeight: '800', color: Colors.deepNavy },
  signupBtn: {
    flex: 1, height: 54, borderRadius: 16,
    backgroundColor: Colors.deepNavy,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.deepNavy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  signupBtnText: { fontSize: 15, fontWeight: '800', color: Colors.accent },
  supportLine: {
    textAlign: 'center', fontSize: 12.5,
    color: Colors.textMuted, fontWeight: '500',
  },
  supportLink: {
    color: Colors.textPrimary, fontWeight: '700', textDecorationLine: 'underline',
  },

  // ── Slides ──────────────────────────────────────────────────────────────────
  slidesShell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slidesHeader: {
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 8,
    alignItems: 'flex-end',
  },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surface, borderRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  skipText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },

  slide: {
    width,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  illustCard: {
    height: 300,
    backgroundColor: Colors.deepNavy,
    borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 28,
  },
  illustDecor1: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(200,241,53,0.07)',
    top: -130, right: -100,
  },
  illustDecor2: {
    position: 'absolute',
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(200,241,53,0.04)',
    bottom: -80, left: -60,
  },
  illustIconCircle: {
    width: 148, height: 148, borderRadius: 74,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  numBadge: {
    position: 'absolute', top: 18, right: 18,
    backgroundColor: 'rgba(200,241,53,0.12)',
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(200,241,53,0.25)',
  },
  numBadgeText: {
    fontSize: 12, fontWeight: '800',
    color: Colors.accent, letterSpacing: 1.5,
  },
  slideCounter: {
    fontSize: 11, fontWeight: '700',
    color: Colors.textMuted, letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 8,
  },
  slideTitle: {
    fontSize: 30, fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.5, lineHeight: 36, marginBottom: 10,
  },
  slideDesc: {
    fontSize: 15, color: Colors.textSecondary,
    lineHeight: 23, fontWeight: '500',
  },

  slidesFooter: {
    paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12,
  },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 6, marginBottom: 18,
  },
  dot: { height: 8, borderRadius: 4, backgroundColor: Colors.deepNavy },
  nextBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.deepNavy,
    height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
  },
  nextBtnText: { color: Colors.accent, fontSize: 17, fontWeight: '700' },
});
