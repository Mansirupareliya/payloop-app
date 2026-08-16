import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { formatCurrency } from '../../utils/currencyUtils';

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  onPress?: () => void;
}

export function SummaryCard({ title, amount, subtitle, onPress }: SummaryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
    >
      {/* Background decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>{formatCurrency(amount)}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius['3xl'],
    padding: Spacing.xl,
    overflow: 'hidden',
    ...Shadow.blue,
  },
  circle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99,102,241,0.18)',
    top: -40,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59,130,246,0.12)',
    bottom: -20,
    right: 60,
  },
  title: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    letterSpacing: 0.3,
  },
  amount: {
    color: Colors.textOnDark,
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.black,
    marginTop: Spacing.sm,
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
  },
});
