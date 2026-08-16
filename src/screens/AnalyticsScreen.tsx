import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency, percentOf } from '../utils/currencyUtils';
import {
  getDashboardStats,
  getCategorySpending,
  getMonthlySpending,
  getBudgetUsage,
} from '../utils/analyticsUtils';
import { getCategoryById } from '../constants/categories';
import { ProgressBar } from '../components/common/ProgressBar';
import { Card } from '../components/common/Card';
import { currentMonthLabel } from '../utils/dateUtils';

export function AnalyticsScreen() {
  const { bills, payments } = useBillStore();
  const { budget } = useSettingsStore();

  const stats          = getDashboardStats(bills, payments);
  const catSpending    = getCategorySpending(bills);
  const monthlyData    = getMonthlySpending(bills, 6);
  const budgetUsage    = getBudgetUsage(bills, budget.monthly);
  const totalThisMonth = stats.totalPaid + stats.totalPending;

  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>{currentMonthLabel()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Monthly Overview */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewAmount}>{formatCurrency(totalThisMonth)}</Text>
              <Text style={styles.overviewLabel}>Total Bills</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewAmount, { color: Colors.success }]}>
                {formatCurrency(stats.totalPaid)}
              </Text>
              <Text style={styles.overviewLabel}>Paid</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.overviewItem}>
              <Text style={[styles.overviewAmount, { color: Colors.warning }]}>
                {formatCurrency(stats.totalPending)}
              </Text>
              <Text style={styles.overviewLabel}>Pending</Text>
            </View>
          </View>
        </Card>

        {/* 6-Month Bar Chart */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Monthly Spending (6 Months)</Text>
          <View style={styles.barChart}>
            {monthlyData.map((m, i) => {
              const height = maxMonthly > 0 ? (m.total / maxMonthly) * 120 : 4;
              return (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barValue}>{m.total > 0 ? `₹${Math.round(m.total / 1000)}k` : ''}</Text>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(height, 4),
                          backgroundColor:
                            i === monthlyData.length - 1
                              ? Colors.primaryLight
                              : Colors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{m.month}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Category Breakdown */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🗂 Category Breakdown</Text>
          {catSpending.length === 0 ? (
            <Text style={styles.emptyText}>No data for this month</Text>
          ) : (
            catSpending.map(cat => {
              const category = getCategoryById(cat.categoryId);
              return (
                <View key={cat.categoryId} style={styles.catRow}>
                  <Text style={styles.catIcon}>{category.icon}</Text>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={styles.catName}>{category.name}</Text>
                      <Text style={styles.catAmount}>{formatCurrency(cat.total)}</Text>
                    </View>
                    <ProgressBar
                      percent={cat.percentage}
                      color={category.color}
                      height={6}
                    />
                    <Text style={styles.catPercent}>{cat.percentage}% of total</Text>
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/* Budget Summary */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Budget Status</Text>
          <ProgressBar
            percent={budgetUsage.percent}
            height={14}
            showLabel
            label={`Spent ${formatCurrency(budgetUsage.spent)}`}
            valueLabel={`${budgetUsage.percent}%`}
          />
          <View style={styles.budgetMetaRow}>
            <Text style={styles.budgetMeta}>Remaining: {formatCurrency(budgetUsage.remaining)}</Text>
            <Text style={styles.budgetMeta}>Budget: {formatCurrency(budget.monthly)}</Text>
          </View>
        </Card>

        {/* Payment Stats */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Payment Stats</Text>
          {[
            { label: 'Total Payments',   value: String(payments.length) },
            { label: 'Overdue Bills',    value: String(stats.overdueCount), accent: stats.overdueCount > 0 ? Colors.danger : undefined },
            { label: 'Upcoming Bills',   value: String(stats.upcomingCount) },
          ].map(row => (
            <View key={row.label} style={styles.statRow}>
              <Text style={styles.statLabel}>{row.label}</Text>
              <Text style={[styles.statValue, row.accent ? { color: row.accent } : {}]}>
                {row.value}
              </Text>
            </View>
          ))}
        </Card>

        <View style={{ height: 90 }} />
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
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: Typography.weight.medium,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  overviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  overviewAmount: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  overviewLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.borderLight,
  },
  // Bar chart
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    paddingTop: Spacing.sm,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  barWrapper: {
    width: '60%',
    justifyContent: 'flex-end',
    height: 120,
  },
  bar: {
    width: '100%',
    borderRadius: Radius.sm,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  barValue: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: Typography.weight.bold,
  },
  // Category rows
  catRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  catIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  catInfo: {
    flex: 1,
    gap: 4,
  },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  catAmount: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  catPercent: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textMuted,
    padding: Spacing.base,
    fontSize: Typography.size.sm,
  },
  budgetMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  budgetMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  statLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  statValue: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
});
