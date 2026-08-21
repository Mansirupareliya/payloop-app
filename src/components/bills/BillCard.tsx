import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Bill, BillStatus } from '../../types';
import { formatCurrency } from '../../utils/currencyUtils';
import { isOverdue, isDueToday } from '../../utils/dateUtils';
import { getCategoryById } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { usePhotoStore } from '../../store/photoStore';

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
  const photoUri = usePhotoStore(s => s.photos[bill.id]);

  const dueDateObj = new Date(bill.dueDate);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const formattedDate = `${dueDateObj.getDate()} ${monthNames[dueDateObj.getMonth()]}`;

  const statusConfig = {
    paid:     { label: 'Paid',     color: Colors.success },
    overdue:  { label: 'Overdue',  color: Colors.danger  },
    due_today:{ label: 'Due Today',color: Colors.warning  },
    upcoming: { label: 'Upcoming', color: Colors.textMuted},
  }[status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
    >
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.photoThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.iconBox, { backgroundColor: cat.bgColor }]}>
          <Feather name={cat.icon as any} size={18} color={cat.color} />
        </View>
      )}

      <View style={styles.mid}>
        <Text style={styles.name} numberOfLines={1}>{bill.name}</Text>
        <Text style={styles.dueLabel}>Due {formattedDate} · {bill.frequency}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(bill.amount)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status === 'paid' ? '#F3FDD3' : status === 'overdue' ? '#FFF0F0' : status === 'due_today' ? '#FFF4EE' : Colors.surfaceAlt }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  photoThumb: {
    width: 36, height: 36, borderRadius: 10, marginRight: 10,
  },
  mid: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  dueLabel: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  right: { alignItems: 'flex-end', gap: 3 },
  amount: { fontSize: 13, fontWeight: '800', color: Colors.textPrimary },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
