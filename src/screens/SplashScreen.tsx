import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

// Animated SVG Path (JS-driven, needed for strokeDashoffset)
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Infinity lemniscate: starts at center, traces left loop then right loop
const INF_PATH =
  'M 0,0 C -20,-55 -90,-55 -90,0 C -90,55 -20,55 0,0 C 20,-55 90,-55 90,0 C 90,55 20,55 0,0';
const DASH_LEN = 660; // slightly over-estimated so it starts fully hidden

// ── Bouncing loading dot ──────────────────────────────────────────────────────
function BounceDot({ delay }: { delay: number }) {
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, { toValue: -10, duration: 340, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,  duration: 340, useNativeDriver: true }),
        Animated.delay(700 - delay),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return <Animated.View style={[styles.dot, { transform: [{ translateY: y }] }]} />;
}

// ── Main SplashScreen ─────────────────────────────────────────────────────────
interface Props { onDone: () => void }

export function SplashScreen({ onDone }: Props) {
  // Animation values — all created once via useRef
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const glowScale   = useRef(new Animated.Value(0.2)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  const infScale    = useRef(new Animated.Value(0)).current;
  const infOpacity  = useRef(new Animated.Value(0)).current;
  const dashOffset  = useRef(new Animated.Value(DASH_LEN)).current;  // JS thread

  const payOpacity  = useRef(new Animated.Value(0)).current;
  const payX        = useRef(new Animated.Value(-48)).current;
  const pOpacity    = useRef(new Animated.Value(0)).current;
  const pX          = useRef(new Animated.Value(48)).current;

  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const tagY        = useRef(new Animated.Value(18)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;

  // Pulse ring (starts after main sequence)
  const pulseScale  = useRef(new Animated.Value(1)).current;
  const pulseOp     = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Start background pulse loop (runs independent of sequence)
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseScale, { toValue: 1.5, duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseScale, { toValue: 1,   duration: 1400, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(pulseOp, { toValue: 0,   duration: 1400, useNativeDriver: true }),
          Animated.timing(pulseOp, { toValue: 0.5, duration: 1400, useNativeDriver: true }),
        ]),
      ])
    ).start();

    // Main entrance sequence
    Animated.sequence([
      // Phase 1 — glow + ∞ scale in (0 – 550ms)
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.spring(glowScale,   { toValue: 1, tension: 35, friction: 10, useNativeDriver: true }),
        Animated.spring(infScale,    { toValue: 1, tension: 55, friction:  7, useNativeDriver: true }),
        Animated.timing(infOpacity,  { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),

      // Phase 2 — draw the ∞ stroke (550 – 1400ms)
      Animated.timing(dashOffset, { toValue: 0, duration: 850, useNativeDriver: false }),

      // Phase 3 — text slides in from both sides (1400 – 1800ms)
      Animated.parallel([
        Animated.spring(payX,      { toValue: 0, tension: 90, friction: 13, useNativeDriver: true }),
        Animated.timing(payOpacity,{ toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(pX,        { toValue: 0, tension: 90, friction: 13, useNativeDriver: true }),
        Animated.timing(pOpacity,  { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),

      // Phase 4 — tagline + dots appear (1800 – 2350ms)
      Animated.parallel([
        Animated.timing(tagOpacity,  { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.spring(tagY,        { toValue: 0, tension: 60, friction: 14, useNativeDriver: true }),
        Animated.timing(dotsOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),

      // Phase 5 — hold (2350 – 3250ms)
      Animated.delay(900),

      // Phase 6 — fade out (3250 – 3650ms)
      Animated.timing(screenOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),

    ]).start(() => onDone());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>

      {/* ── Outer glow blob ── */}
      <Animated.View style={[styles.glowBlob, {
        opacity: glowOpacity,
        transform: [{ scale: glowScale }],
      }]} />

      {/* ── Pulse ring behind ∞ ── */}
      <Animated.View style={[styles.pulseRing, {
        opacity: pulseOp,
        transform: [{ scale: pulseScale }],
      }]} />

      {/* ── Logo row: PayL + ∞ + p ── */}
      <View style={styles.logoRow}>

        {/* "PayL" — slides in from left */}
        <Animated.Text style={[styles.logoText, {
          opacity: payOpacity,
          transform: [{ translateX: payX }],
        }]}>
          PayL
        </Animated.Text>

        {/* ∞ symbol — scales + draws */}
        <Animated.View style={[styles.infWrap, {
          opacity: infOpacity,
          transform: [{ scale: infScale }],
        }]}>
          <Svg width={88} height={54} viewBox="-110 -68 220 136">
            {/* Glow fill (static, lime tint) */}
            <Path
              d={INF_PATH}
              stroke="rgba(200,241,53,0.18)"
              strokeWidth={26}
              fill="none"
              strokeLinecap="round"
            />
            {/* Animated drawing stroke */}
            <AnimatedPath
              d={INF_PATH}
              stroke={Colors.accent}
              strokeWidth={14}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${DASH_LEN}`}
              strokeDashoffset={dashOffset}
            />
          </Svg>
        </Animated.View>

        {/* "p" — slides in from right */}
        <Animated.Text style={[styles.logoText, {
          opacity: pOpacity,
          transform: [{ translateX: pX }],
        }]}>
          p
        </Animated.Text>

      </View>

      {/* ── Tagline ── */}
      <Animated.Text style={[styles.tagline, {
        opacity: tagOpacity,
        transform: [{ translateY: tagY }],
      }]}>
        Bill Management, Reimagined
      </Animated.Text>

      {/* ── Loading dots ── */}
      <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
        <BounceDot delay={0} />
        <BounceDot delay={160} />
        <BounceDot delay={320} />
      </Animated.View>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.deepNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },

  glowBlob: {
    position: 'absolute',
    width: 420, height: 420, borderRadius: 210,
    backgroundColor: 'rgba(200,241,53,0.08)',
  },

  pulseRing: {
    position: 'absolute',
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 1.5,
    borderColor: 'rgba(200,241,53,0.35)',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  logoText: {
    fontSize: 54,
    fontWeight: '900',
    color: Colors.surface,
    letterSpacing: -2,
    lineHeight: 64,
  },

  infWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    marginBottom: 6, // nudge down so ∞ aligns with text center visually
  },

  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 80,
  },

  dotsRow: {
    position: 'absolute',
    bottom: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
  },
});
