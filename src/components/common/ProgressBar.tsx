import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Spacing } from '../../constants/theme';

interface ProgressBarProps {
  percent: number;        // 0–100
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  valueLabel?: string;
}

export function ProgressBar({
  percent,
  color = Colors.primaryLight,
  height = 10,
  showLabel = false,
  label,
  valueLabel,
}: ProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));
  const barColor = percent >= 85 ? Colors.danger : percent >= 65 ? Colors.warning : color;

  return (
    <View>
      {showLabel && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {valueLabel && <Text style={styles.valueLabel}>{valueLabel}</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedPercent}%`,
              backgroundColor: barColor,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.border,
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: 999,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  valueLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
  },
});
