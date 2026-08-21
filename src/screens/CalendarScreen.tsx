import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useBillStore } from '../store/billStore';
import { formatCalendarHeader } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { isOverdue } from '../utils/dateUtils';
import { getCategoryById } from '../constants/categories';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';

type NavProp = StackNavigationProp<RootStackParamList>;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills } = useBillStore();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function getBillsForDay(day: number) {
    return bills.filter(b => {
      const bd = new Date(b.dueDate);
      return bd.getFullYear() === year && bd.getMonth() === month && bd.getDate() === day;
    });
  }

  const selectedBills = selectedDay ? getBillsForDay(selectedDay) : [];

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  }

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <Pressable style={styles.iconBtn}>
          <Feather name="calendar" size={18} color={Colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Month Navigator ── */}
        <View style={styles.calCard}>
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={12}>
              <Feather name="chevron-left" size={20} color={Colors.textPrimary} />
            </Pressable>
            <Text style={styles.monthLabel}>{formatCalendarHeader(year, month)}</Text>
            <Pressable onPress={nextMonth} style={styles.navBtn} hitSlop={12}>
              <Feather name="chevron-right" size={20} color={Colors.textPrimary} />
            </Pressable>
          </View>

          {/* Day labels */}
          <View style={styles.dayLabelRow}>
            {DAY_LABELS.map(d => (
              <Text key={d} style={styles.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`e-${i}`} style={styles.cell} />;

              const dayBills = getBillsForDay(day);
              const isSelected = selectedDay === day;
              const hasOverdue = dayBills.some(b => !b.isPaid && isOverdue(b.dueDate, b.isPaid));
              const hasUpcoming = dayBills.some(b => !b.isPaid && !isOverdue(b.dueDate, b.isPaid));
              const hasPaid = dayBills.some(b => b.isPaid);

              let dotColor = null as string | null;
              if (hasOverdue) dotColor = Colors.danger;
              else if (hasUpcoming) dotColor = Colors.deepNavy;
              else if (hasPaid) dotColor = Colors.success;

              return (
                <Pressable
                  key={day}
                  style={[
                    styles.cell,
                    dayBills.length > 0 && !isSelected && styles.cellHasBills,
                    isSelected && styles.cellSelected,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>{day}</Text>
                  {dotColor && <View style={[styles.dot, { backgroundColor: dotColor }]} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Legend ── */}
        <View style={styles.legend}>
          {[
            { color: Colors.success, label: 'Paid' },
            { color: Colors.deepNavy, label: 'Upcoming' },
            { color: Colors.danger, label: 'Overdue' },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Day Bills ── */}
        <View style={styles.billsCard}>
          <Text style={styles.billsTitle}>
            Bills on {selectedDay ? `${selectedDay} ${formatCalendarHeader(year, month).split(' ')[0]}` : '—'}
          </Text>

          {selectedBills.length === 0 ? (
            <Text style={styles.noBills}>No bills on this day</Text>
          ) : (
            selectedBills.map((bill, idx) => {
              const cat = getCategoryById(bill.categoryId);
              const overdue = isOverdue(bill.dueDate, bill.isPaid);
              const statusColor = bill.isPaid ? Colors.success : overdue ? Colors.danger : Colors.textSecondary;
              const statusLabel = bill.isPaid ? 'Paid' : overdue ? 'Overdue' : 'Upcoming';
              return (
                <Pressable
                  key={bill.id}
                  style={[styles.billRow, idx === selectedBills.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
                >
                  <View style={[styles.billIcon, { backgroundColor: cat.bgColor }]}>
                    <Feather name={cat.icon as any} size={16} color={cat.color} />
                  </View>
                  <View style={styles.billInfo}>
                    <Text style={styles.billName}>{bill.name}</Text>
                    <Text style={[styles.billStatus, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                  <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  scroll: { paddingHorizontal: 20 },

  calCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16, paddingHorizontal: 4,
  },
  navBtn: { padding: 6 },
  monthLabel: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },

  dayLabelRow: { flexDirection: 'row', marginBottom: 10 },
  dayLabel: {
    flex: 1, textAlign: 'center',
    fontSize: 11, fontWeight: '700', color: Colors.textMuted,
  },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`, aspectRatio: 1,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 50, marginBottom: 2,
  },
  cellHasBills: { backgroundColor: Colors.surfaceAlt },
  cellSelected: { backgroundColor: Colors.deepNavy },
  dayNum: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  dayNumSelected: { color: Colors.accent },
  dot: { position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2 },

  legend: {
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingVertical: 12, marginBottom: 12,
    flexDirection: 'row', justifyContent: 'space-evenly',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary },

  billsCard: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  billsTitle: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  noBills: {
    fontSize: 13, color: Colors.textMuted,
    textAlign: 'center', paddingVertical: 20,
  },
  billRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  billIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  billInfo: { flex: 1 },
  billName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  billStatus: { fontSize: 11, fontWeight: '600' },
  billAmount: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
});
