import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, Radius } from '../../constants/theme';

interface StreakCardProps {
  streak: number;
}

function getStreakMessage(months: number): string {
  if (months === 0) return 'Start your payment streak!';
  if (months < 3) return 'Great start! Keep going 💪';
  if (months < 6) return 'You\'re building good habits! 🌟';
  if (months < 12) return 'Excellent payment discipline!';
  return 'Payment legend! You\'re unstoppable! 🏆';
}

function getStars(months: number): string {
  if (months >= 12) return '★★★★★';
  if (months >= 6) return '★★★★☆';
  if (months >= 3) return '★★★☆☆';
  if (months >= 1) return '★★☆☆☆';
  return '★☆☆☆☆';
}

export function StreakCard({ streak }: StreakCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.fireBadge}>
          <Text style={styles.fireEmoji}>🔥</Text>
        </View>
        <View>
          <Text style={styles.streakCount}>
            {streak === 0 ? '0' : streak} Month{streak !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.label}>Payment Streak</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.stars}>{getStars(streak)}</Text>
        <Text style={styles.message}>{getStreakMessage(streak)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  fireBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#FFF1D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fireEmoji: {
    fontSize: 26,
  },
  streakCount: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  label: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },
  right: {
    alignItems: 'flex-end',
    gap: 2,
  },
  stars: {
    fontSize: Typography.size.sm,
    color: Colors.warning,
    letterSpacing: 1,
  },
  message: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
    maxWidth: 140,
    textAlign: 'right',
  },
});
