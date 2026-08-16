import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Bill, BillStatus } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';
import { isOverdue, isDueToday } from '../../utils/dateUtils';
import { getCategoryById } from '../../constants/categories';

interface BillCardProps {
  bill: Bill;
  onPress?: () => void;
}

function getBillStatus(bill: Bill): BillStatus {
  if (bill.isPaid) return 'paid';
  if (isOverdue(bill.dueDate, bill.isPaid)) return 'overdue';
  if (isDueToday(bill.dueDate)) return 'due_today';
  return 'upcoming';
}

export function BillCard({ bill, onPress }: BillCardProps) {
  const status = getBillStatus(bill);
  const cat = getCategoryById(bill.categoryId);

  // Format due date like "25 Aug"
  const dueDateObj = new Date(bill.dueDate);
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const formattedDate = `${dueDateObj.getDate()} ${monthNames[dueDateObj.getMonth()]}`;

  const statusText = status === 'paid' ? 'Paid' : status === 'overdue' ? 'Overdue' : status === 'due_today' ? 'Due Today' : 'Upcoming';
  const statusColor = status === 'paid' ? '#10b981' : status === 'overdue' ? '#ef4444' : status === 'due_today' ? '#f59e0b' : '#3b82f6';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.left}>
        <View style={[styles.iconContainer, { backgroundColor: cat.color || '#1e3a8a' }]}>
          <Feather name={cat.icon as any} size={20} color="#ffffff" />
        </View>
      </View>

      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>{bill.name}</Text>
        <Text style={styles.dueLabel}>
          Due {formattedDate} • {bill.frequency}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>
          {formatCurrency(bill.amount)}
        </Text>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 6,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    backgroundColor: '#f8fafc',
  },
  left: {
    marginRight: 16,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mid: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  dueLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  amount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
