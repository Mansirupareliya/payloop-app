import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography, Radius, Spacing } from '../../constants/theme';
import { BillStatus } from '../../types';

interface BadgeProps {
  status: BillStatus;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<BillStatus, { label: string; bg: string; text: string }> = {
  upcoming:  { label: 'Upcoming',  bg: Colors.infoLight,    text: Colors.info },
  overdue:   { label: 'Overdue',   bg: Colors.dangerLight,  text: Colors.danger },
  paid:      { label: 'Paid ✓',    bg: Colors.successLight, text: Colors.success },
  due_today: { label: 'Due Today', bg: Colors.warningLight, text: Colors.warning },
};

export function Badge({ status, size = 'sm' }: BadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        size === 'md' && styles.badgeMd,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
          size === 'md' && styles.textMd,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
  textMd: {
    fontSize: Typography.size.sm,
  },
});
