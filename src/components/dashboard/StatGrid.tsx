import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../../constants/theme';

interface StatItem {
  label: string;
  value: string;
  accent?: string;
}

interface StatGridProps {
  stats: StatItem[];
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <View style={styles.grid}>
      {stats.map((stat, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.label}>{stat.label}</Text>
          <Text style={[styles.value, stat.accent ? { color: stat.accent } : {}]}>
            {stat.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
    marginTop: Spacing.base,
  },
  card: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    ...Shadow.sm,
  },
  label: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    marginTop: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.extrabold,
    letterSpacing: -0.5,
  },
});
