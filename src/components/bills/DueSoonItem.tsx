import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Bill } from '../../types';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, Radius } from '../../constants/theme';
import { formatCurrency } from '../../utils/currencyUtils';
import { getDueDateLabel, isOverdue, isDueToday, daysUntilDue } from '../../utils/dateUtils';
import { BillCategoryIcon } from './BillCategoryIcon';

interface DueSoonItemProps {
  bill: Bill;
  onPress?: () => void;
}

export function DueSoonItem({ bill, onPress }: DueSoonItemProps) {
  const overdue  = isOverdue(bill.dueDate, bill.isPaid);
  const dueToday = isDueToday(bill.dueDate);
  const days     = daysUntilDue(bill.dueDate);

  const dotColor = overdue
    ? Colors.danger
    : dueToday
    ? Colors.warning
    : days <= 3
    ? Colors.warning
    : Colors.info;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <BillCategoryIcon categoryId={bill.categoryId} size={38} />

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{bill.name}</Text>
        <View style={styles.dueBadge}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={[styles.dueText, overdue && styles.overdueText]}>
            {getDueDateLabel(bill.dueDate)}
          </Text>
        </View>
      </View>

      <Text style={[styles.amount, overdue && styles.overdueAmount]}>
        {formatCurrency(bill.amount)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  dueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.full,
  },
  dueText: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },
  overdueText: {
    color: Colors.danger,
    fontWeight: Typography.weight.bold,
  },
  amount: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  overdueAmount: {
    color: Colors.danger,
  },
});
