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
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { formatDate, formatCalendarHeader, isSameDayStr } from '../utils/dateUtils';
import { formatCurrency } from '../utils/currencyUtils';
import { isOverdue, isDueToday } from '../utils/dateUtils';
import { BillCategoryIcon } from '../components/bills/BillCategoryIcon';
import { RootStackParamList } from '../types';

type NavProp = StackNavigationProp<RootStackParamList>;

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getDotColor(hasPaid: boolean, hasOverdue: boolean, hasUpcoming: boolean): string | null {
  if (hasPaid) return Colors.success;
  if (hasOverdue) return Colors.danger;
  if (hasUpcoming) return Colors.primaryLight;
  return null;
}

export function CalendarScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills } = useBillStore();

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  // Compute days in month
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday = 0
  let startOffset = (firstDay.getDay() + 6) % 7; // convert Sunday=0 to Monday=0

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function getBillsForDay(day: number) {
    const date = new Date(year, month, day).toISOString();
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

      <View style={styles.topBar}>
        <Text style={styles.title}>Calendar</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Navigator */}
        <View style={styles.monthNav}>
          <Pressable onPress={prevMonth} style={styles.navBtn} hitSlop={12}>
            <Text style={styles.navArrow}>‹</Text>
          </Pressable>
          <Text style={styles.monthLabel}>{formatCalendarHeader(year, month)}</Text>
          <Pressable onPress={nextMonth} style={styles.navBtn} hitSlop={12}>
            <Text style={styles.navArrow}>›</Text>
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
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const isSelected = selectedDay === day;

            const hasPaid    = dayBills.some(b => b.isPaid);
            const hasOverdue = dayBills.some(b => !b.isPaid && isOverdue(b.dueDate, b.isPaid));
            const hasUpcoming = dayBills.some(b => !b.isPaid && !isOverdue(b.dueDate, b.isPaid));

            const dotColor = getDotColor(hasPaid, hasOverdue, hasUpcoming);

            return (
              <Pressable
                key={day}
                style={[
                  styles.cell,
                  isToday && styles.todayCell,
                  isSelected && !isToday && styles.selectedCell,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[
                  styles.dayNum,
                  isToday && styles.todayText,
                  isSelected && !isToday && styles.selectedText,
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

        {/* Legend */}
        <View style={styles.legend}>
          {[
            { color: Colors.success, label: 'Paid' },
            { color: Colors.primaryLight, label: 'Upcoming' },
            { color: Colors.danger, label: 'Overdue' },
          ].map(l => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>

        {/* Selected Day Bills */}
        {selectedDay && (
          <View style={styles.dayDetails}>
            <Text style={styles.dayDetailsTitle}>
              {selectedDay} {formatCalendarHeader(year, month)}
            </Text>
            {selectedBills.length === 0 ? (
              <Text style={styles.noBillsText}>No bills on this day</Text>
            ) : (
              selectedBills.map(bill => (
                <Pressable
                  key={bill.id}
                  style={styles.billRow}
                  onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
                >
                  <BillCategoryIcon categoryId={bill.categoryId} size={36} />
                  <View style={styles.billRowInfo}>
                    <Text style={styles.billRowName}>{bill.name}</Text>
                    <Text style={[
                      styles.billRowStatus,
                      bill.isPaid ? styles.paidText : isOverdue(bill.dueDate, bill.isPaid) ? styles.overdueText : styles.upcomingText,
                    ]}>
                      {bill.isPaid ? '✅ Paid' : isOverdue(bill.dueDate, bill.isPaid) ? '🚨 Overdue' : '🔔 Upcoming'}
                    </Text>
                  </View>
                  <Text style={styles.billRowAmount}>{formatCurrency(bill.amount)}</Text>
                </Pressable>
              ))
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  navArrow: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
  },
  monthLabel: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  dayLabelRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  todayCell: {
    backgroundColor: Colors.primaryDark,
  },
  selectedCell: {
    backgroundColor: Colors.accentLight,
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  dayNum: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  todayText: {
    color: Colors.textOnDark,
    fontWeight: Typography.weight.extrabold,
  },
  selectedText: {
    color: Colors.accent,
    fontWeight: Typography.weight.bold,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.base,
    marginTop: Spacing.base,
    marginBottom: Spacing.base,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.semibold,
  },
  dayDetails: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    ...Shadow.md,
  },
  dayDetailsTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  noBillsText: {
    color: Colors.textMuted,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  billRowInfo: {
    flex: 1,
  },
  billRowName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  billRowStatus: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    marginTop: 2,
  },
  paidText:     { color: Colors.success },
  overdueText:  { color: Colors.danger },
  upcomingText: { color: Colors.primaryLight },
  billRowAmount: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
});
