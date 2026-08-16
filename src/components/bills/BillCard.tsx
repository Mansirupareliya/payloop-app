import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Bill, BillStatus } from '../../types';
import { Colors } from '../../constants/colors';
import { Typography, Spacing, Radius } from '../../constants/theme';
import { formatCurrency } from '../../utils/currencyUtils';
import { getDueDateLabel, isOverdue, isDueToday } from '../../utils/dateUtils';
import { BillCategoryIcon } from './BillCategoryIcon';

interface BillCardProps {
  bill: Bill;
  onPress?: () => void;
  onMarkPaid?: () => void;
}

function getBillStatus(bill: Bill): BillStatus {
  if (bill.isPaid) return 'paid';
  if (isOverdue(bill.dueDate, bill.isPaid)) return 'overdue';
  if (isDueToday(bill.dueDate)) return 'due_today';
  return 'upcoming';
}

function StatusBadge({ status }: { status: BillStatus }) {
  if (status === 'paid') {
    return (
      <View style={[styles.badge, styles.badgePaid]}>
        <Text style={[styles.badgeText, styles.badgeTextPaid]}>PAID</Text>
      </View>
    );
  }
  if (status === 'overdue') {
    return (
      <View style={[styles.badge, styles.badgeOverdue]}>
        <Text style={[styles.badgeText, styles.badgeTextOverdue]}>OVERDUE</Text>
      </View>
    );
  }
  if (status === 'due_today') {
    return (
      <View style={[styles.badge, styles.badgeDueToday]}>
        <Text style={[styles.badgeText, styles.badgeTextDueToday]}>DUE TODAY</Text>
      </View>
    );
  }
  return null;
}

export function BillCard({ bill, onPress, onMarkPaid }: BillCardProps) {
  const status = getBillStatus(bill);
  const dueDateLabel = getDueDateLabel(bill.dueDate);
  const isOverdueStatus = status === 'overdue';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <BillCategoryIcon categoryId={bill.categoryId} size={40} />
        </View>
      </View>

      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>{bill.name}</Text>
        <Text style={[styles.dueLabel, isOverdueStatus && styles.overdueDue]}>
          Due {dueDateLabel}
        </Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={status} />
          {bill.frequency !== 'One time' && (
            <View style={styles.recurringBadge}>
              <Feather name="repeat" size={10} color={Colors.textSecondary} />
              <Text style={styles.recurringText}>{bill.frequency}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, isOverdueStatus && styles.overdueAmount]}>
          {formatCurrency(bill.amount)}
        </Text>
        {!bill.isPaid && onMarkPaid && (
          <Pressable style={styles.payBtn} onPress={onMarkPaid} hitSlop={12}>
            <Text style={styles.payBtnText}>PAY</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  left: {
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  dueLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  overdueDue: {
    color: Colors.danger,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgePaid: {
    backgroundColor: Colors.successLight,
  },
  badgeTextPaid: {
    color: Colors.success,
  },
  badgeOverdue: {
    backgroundColor: Colors.dangerLight,
  },
  badgeTextOverdue: {
    color: Colors.danger,
  },
  badgeDueToday: {
    backgroundColor: Colors.warningLight,
  },
  badgeTextDueToday: {
    color: Colors.warning,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    gap: 4,
  },
  recurringText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  overdueAmount: {
    color: Colors.danger,
  },
  payBtn: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  payBtnText: {
    color: Colors.textOnDark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

