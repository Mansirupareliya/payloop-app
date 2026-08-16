import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useBillStore } from '../store/billStore';
import { formatCalendarHeader } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { isOverdue, isDueToday } from '../utils/dateUtils';
import { BillCategoryIcon } from '../components/bills/BillCategoryIcon';
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

  // Compute days in month
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday = 0
  let startOffset = (firstDay.getDay() + 6) % 7;

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
      <StatusBar barStyle="dark-content" backgroundColor="#f3f8ff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => (navigation as any).navigate('MainTabs')}>
          <Feather name="chevron-left" size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.title}>Calendar</Text>
        <Pressable style={styles.headerIcon}>
          <Feather name="calendar" size={22} color="#1e293b" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Calendar Card ── */}
        <View style={styles.calendarCard}>
          {/* Month Navigator */}
          <View style={styles.monthNav}>
            <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={12}>
              <Feather name="chevron-left" size={20} color="#1e293b" />
            </Pressable>
            <Text style={styles.monthLabel}>{formatCalendarHeader(year, month)}</Text>
            <Pressable onPress={nextMonth} style={styles.navBtn} hitSlop={12}>
              <Feather name="chevron-right" size={20} color="#1e293b" />
            </Pressable>
          </View>

          {/* Day Labels */}
          <View style={styles.dayLabelRow}>
            {DAY_LABELS.map(d => (
              <Text key={d} style={styles.dayLabel}>{d}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`empty-${i}`} style={styles.cell} />;

              const dayBills = getBillsForDay(day);
              const isSelected = selectedDay === day;
              const hasBills = dayBills.length > 0;

              const hasPaid = dayBills.some(b => b.isPaid);
              const hasOverdue = dayBills.some(b => !b.isPaid && isOverdue(b.dueDate, b.isPaid));
              const hasUpcoming = dayBills.some(b => !b.isPaid && !isOverdue(b.dueDate, b.isPaid));

              let dotColor = null;
              if (hasOverdue) dotColor = '#ef4444';
              else if (hasUpcoming) dotColor = '#3b82f6';
              else if (hasPaid) dotColor = '#10b981';

              return (
                <Pressable
                  key={day}
                  style={[
                    styles.cell,
                    hasBills && !isSelected && styles.cellHasBills,
                    isSelected && styles.cellSelected,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[
                    styles.dayNum,
                    isSelected && styles.dayNumSelected,
                  ]}>
                    {day}
                  </Text>
                  {dotColor && (
                    <View style={[styles.dot, { backgroundColor: dotColor }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Legend ── */}
        <View style={styles.legendContainer}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Paid</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
              <Text style={styles.legendText}>Upcoming</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
              <Text style={styles.legendText}>Overdue</Text>
            </View>
          </View>
        </View>

        {/* ── Selected Day Bills ── */}
        <View style={styles.billsCard}>
          <Text style={styles.billsCardTitle}>
            Bills on {selectedDay ? `${selectedDay} ${formatCalendarHeader(year, month).split(' ')[0]}` : '...'}
          </Text>

          {selectedBills.length === 0 ? (
            <Text style={styles.noBillsText}>No bills on this day</Text>
          ) : (
            selectedBills.map((bill, idx) => {
              const status = bill.isPaid ? 'Paid' : isOverdue(bill.dueDate, bill.isPaid) ? 'Overdue' : 'Upcoming';
              const statusColor = bill.isPaid ? '#10b981' : isOverdue(bill.dueDate, bill.isPaid) ? '#ef4444' : '#3b82f6';
              const iconName = bill.isPaid ? 'check-circle' : isOverdue(bill.dueDate, bill.isPaid) ? 'alert-circle' : 'clock';

              return (
                <View key={bill.id} style={[styles.billRow, idx === selectedBills.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.billIconWrap}>
                    <Feather name="zap" size={16} color="#3b82f6" />
                  </View>
                  <View style={styles.billInfo}>
                    <Text style={styles.billName}>{bill.name}</Text>
                    <View style={styles.statusRow}>
                      <Feather name={iconName} size={10} color={statusColor} style={{ marginTop: 1 }} />
                      <Text style={[styles.billStatusText, { color: statusColor }]}>{status}</Text>
                    </View>
                  </View>
                  <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f3f8ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 16,
  },

  // ── Calendar Card
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 10,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  navBtn: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a235c',
  },
  dayLabelRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '800',
    color: '#0a235c',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    marginBottom: 2,
  },
  cellHasBills: {
    backgroundColor: '#cffafe', // Light cyan blue
  },
  cellSelected: {
    backgroundColor: '#1d4ed8', // Dark blue
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  dayNumSelected: {
    color: '#ffffff',
  },
  dot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // ── Legend
  legendContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0a235c',
  },

  // ── Selected Bills
  billsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  billsCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0a235c',
    marginBottom: 16,
  },
  noBillsText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 16,
    fontWeight: '500',
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  billIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  billName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  billStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  billAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
});
