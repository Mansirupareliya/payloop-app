import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, setYear, setMonth, parseISO } from 'date-fns';
import { useBillStore } from '../store/billStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/currencyUtils';
import {
  getDashboardStats,
  getCategorySpending,
  getMonthlySpending,
  getBudgetUsage,
} from '../utils/analyticsUtils';
import { getCategoryById } from '../constants/categories';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function AnalyticsScreen() {
  const { bills, payments } = useBillStore();
  const { budget } = useSettingsStore();

  // Default to current month/year
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // State for the picker itself so it doesn't apply until user confirms
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());

  const selectedMonthStr = format(selectedDate, 'yyyy-MM');
  const displayMonthLabel = format(selectedDate, 'MMMM yyyy');

  const stats = getDashboardStats(bills, payments, selectedMonthStr);
  const catSpending = getCategorySpending(bills, selectedMonthStr);
  const monthlyData = getMonthlySpending(bills, 6);
  const budgetUsage = getBudgetUsage(bills, budget.monthly, selectedMonthStr);
  const totalThisMonth = stats.totalPaid + stats.totalPending;
  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);

  const handleSelectMonth = (monthIndex: number) => {
    let newDate = setYear(new Date(), pickerYear);
    newDate = setMonth(newDate, monthIndex);
    setSelectedDate(newDate);
    setShowPicker(false);
  };

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Pressable style={styles.monthButton} onPress={() => {
          setPickerYear(selectedDate.getFullYear());
          setShowPicker(true);
        }}>
          <Feather name="calendar" size={16} color={Colors.deepNavy} />
          <Text style={styles.monthButtonText}>{displayMonthLabel}</Text>
          <Feather name="chevron-down" size={16} color={Colors.deepNavy} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Overview Gradient Card ── */}
        <View style={styles.heroCard}>
          <View style={StyleSheet.absoluteFill}>
            <Svg width="100%" height="100%" style={{ borderRadius: 24 }}>
              <Defs>
                <LinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#1A1A1A" />
                  <Stop offset="1" stopColor={Colors.deepNavy} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroGrad)" rx="24" />
            </Svg>
          </View>

          <Text style={styles.heroTitle}>Expected Spend</Text>
          <Text style={styles.heroAmount}>{formatCurrency(totalThisMonth)}</Text>

          <View style={styles.heroRow}>
            <View style={styles.heroStat}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View>
                <Text style={styles.heroStatLabel}>Paid</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(stats.totalPaid)}</Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroStat}>
              <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
              <View>
                <Text style={styles.heroStatLabel}>Pending</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(stats.totalPending)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Monthly Spending Bar Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Trend (6 Mos)</Text>
          <View style={styles.barChart}>
            {monthlyData.map((m, i) => {
              const height = maxMonthly > 0 ? (m.total / maxMonthly) * 120 : 4;
              // Check if this bar corresponds to the currently selected month
              // monthlyData provides month label 'Aug' and we have to match
              // but monthlyData doesn't store the exact yyyy-MM key easily.
              // For purely visual purposes we will just highlight the last bar (current real month) 
              // or leave them all flat if we are browsing history.
              // Actually getMonthlySpending is hardcoded to "last 6 months from NOW".
              const isCurrentRealMonth = i === monthlyData.length - 1;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barValue}>{m.total > 0 ? `₹${Math.round(m.total / 1000)}k` : ''}</Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(height, 8),
                          backgroundColor: isCurrentRealMonth ? Colors.deepNavy : Colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isCurrentRealMonth && { color: Colors.deepNavy, fontWeight: '800' }]}>{m.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Budget Usage ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Budget Status</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>Spent {formatCurrency(budgetUsage.spent)}</Text>
            <Text style={styles.budgetValue}>{budgetUsage.percent}%</Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.min(100, Math.max(0, budgetUsage.percent))}%`,
                  backgroundColor: budgetUsage.percent >= 85 ? Colors.danger : budgetUsage.percent >= 65 ? Colors.warning : Colors.deepNavy,
                },
              ]}
            />
          </View>

          <View style={styles.budgetMetaRow}>
            <Text style={styles.budgetMeta}>Remaining: {formatCurrency(budgetUsage.remaining)}</Text>
            <Text style={styles.budgetMeta}>Budget: {formatCurrency(budget.monthly)}</Text>
          </View>
        </View>

        {/* ── Category Breakdown ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Category Breakdown</Text>
          {catSpending.length === 0 ? (
            <Text style={styles.emptyText}>No spending data for this month</Text>
          ) : (
            catSpending.map(cat => {
              const category = getCategoryById(cat.categoryId);
              return (
                <View key={cat.categoryId} style={styles.catRow}>
                  <View style={styles.catIconWrap}>
                    <Feather name={category.icon as any} size={20} color={Colors.deepNavy} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={styles.catName}>{category.name}</Text>
                      <Text style={styles.catAmount}>{formatCurrency(cat.total)}</Text>
                    </View>
                    <View style={styles.trackSmall}>
                      <View
                        style={[
                          styles.fillSmall,
                          {
                            width: `${cat.percentage}%`,
                            backgroundColor: category.color || Colors.deepNavy,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.catPercent}>{cat.percentage}% of total bills</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── Payment Stats ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Stats</Text>
          {[
            { label: 'Upcoming Bills', value: String(stats.upcomingCount) },
            { label: 'Overdue Bills', value: String(stats.overdueCount), isDanger: stats.overdueCount > 0 },
          ].map((row, idx, arr) => (
            <View key={row.label} style={[styles.statRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.statLabel}>{row.label}</Text>
              <Text style={[styles.statValue, row.isDanger && { color: Colors.danger }]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Month/Year Picker Modal ── */}
      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            {/* Year Selector */}
            <View style={styles.yearRow}>
              <Pressable onPress={() => setPickerYear(y => y - 1)} style={styles.yearBtn}>
                <Feather name="chevron-left" size={24} color={Colors.deepNavy} />
              </Pressable>
              <Text style={styles.yearText}>{pickerYear}</Text>
              <Pressable onPress={() => setPickerYear(y => y + 1)} style={styles.yearBtn}>
                <Feather name="chevron-right" size={24} color={Colors.deepNavy} />
              </Pressable>
            </View>

            {/* Months Grid */}
            <View style={styles.monthGrid}>
              {MONTHS.map((m, index) => {
                const isSelected = selectedDate.getMonth() === index && selectedDate.getFullYear() === pickerYear;
                return (
                  <Pressable
                    key={m}
                    style={[styles.monthBox, isSelected && styles.monthBoxSelected]}
                    onPress={() => handleSelectMonth(index)}
                  >
                    <Text style={[styles.monthBoxText, isSelected && styles.monthBoxTextSelected]}>{m}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.deepNavy,
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.deepNavy,
  },
  scroll: {
    paddingHorizontal: 16,
  },

  // ── Hero Gradient Card
  heroCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '700',
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.surface,
    marginBottom: 24,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  heroStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  heroStatValue: {
    fontSize: 16,
    color: Colors.surface,
    fontWeight: '800',
  },
  heroDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 16,
  },

  // ── Base Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.border,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.deepNavy,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    paddingVertical: 16,
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Bar Chart
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: 8,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barWrapper: {
    width: '60%',
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  barValue: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '800',
  },

  // ── Budget Track
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  budgetValue: {
    fontSize: 13,
    color: Colors.deepNavy,
    fontWeight: '800',
  },
  track: {
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  budgetMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '700',
  },

  // ── Categories
  catRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.deepNavy,
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.deepNavy,
  },
  catPercent: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  trackSmall: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
  },
  fillSmall: {
    height: '100%',
    borderRadius: 3,
  },

  // ── Stats
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.deepNavy,
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  yearBtn: {
    padding: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.deepNavy,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  monthBox: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBoxSelected: {
    backgroundColor: Colors.deepNavy,
  },
  monthBoxText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  monthBoxTextSelected: {
    color: Colors.surface,
  },
});
