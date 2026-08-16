import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  StatusBar,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { useBillStore } from '../store/billStore';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { formatCurrency, percentOf } from '../utils/currencyUtils';
import { getBudgetUsage } from '../utils/analyticsUtils';
import { ProgressBar } from '../components/common/ProgressBar';
import { Card } from '../components/common/Card';

export function BudgetScreen() {
  const { budget, updateMonthlyBudget, updateCategoryBudget } = useSettingsStore();
  const { bills } = useBillStore();

  const [editingMonthly, setEditingMonthly] = useState(false);
  const [monthlyInput, setMonthlyInput] = useState(String(budget.monthly));

  const budgetUsage = getBudgetUsage(bills, budget.monthly);

  function saveMonthly() {
    const val = parseFloat(monthlyInput);
    if (!isNaN(val) && val > 0) {
      updateMonthlyBudget(val);
    }
    setEditingMonthly(false);
  }

  // Calculate spending per category this month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const categorySpending: Record<string, number> = {};
  bills
    .filter(b => b.dueDate.startsWith(currentMonth))
    .forEach(b => {
      categorySpending[b.categoryId] = (categorySpending[b.categoryId] ?? 0) + b.amount;
    });

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <Text style={styles.title}>Budget</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Monthly Budget Hero */}
        <Card variant="dark" style={styles.heroCard}>
          <Text style={styles.heroLabel}>Monthly Budget</Text>
          {editingMonthly ? (
            <View style={styles.editRow}>
              <Text style={styles.heroRupee}>₹</Text>
              <TextInput
                style={styles.heroInput}
                value={monthlyInput}
                onChangeText={setMonthlyInput}
                keyboardType="numeric"
                autoFocus
                onSubmitEditing={saveMonthly}
                returnKeyType="done"
              />
              <Pressable onPress={saveMonthly} style={styles.saveChip}>
                <Text style={styles.saveChipText}>Save</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={() => { setEditingMonthly(true); setMonthlyInput(String(budget.monthly)); }}>
              <Text style={styles.heroAmount}>{formatCurrency(budget.monthly)}</Text>
              <Text style={styles.heroHint}>Tap to edit</Text>
            </Pressable>
          )}

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{formatCurrency(budgetUsage.spent)}</Text>
              <Text style={styles.heroStatLabel}>Spent</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={[styles.heroStatValue, { color: budgetUsage.remaining > 0 ? Colors.success : Colors.danger }]}>
                {formatCurrency(budgetUsage.remaining)}
              </Text>
              <Text style={styles.heroStatLabel}>Remaining</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{budgetUsage.percent}%</Text>
              <Text style={styles.heroStatLabel}>Used</Text>
            </View>
          </View>

          <ProgressBar
            percent={budgetUsage.percent}
            height={10}
            color={Colors.primaryLight}
          />
        </Card>

        {/* Category Budgets */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Category Limits</Text>
          {DEFAULT_CATEGORIES.filter(c => c.id !== 'other').map(cat => {
            const limit = budget.categories[cat.id] ?? 0;
            const spent = categorySpending[cat.id] ?? 0;
            const pct   = percentOf(spent, limit);

            return (
              <View key={cat.id} style={styles.catRow}>
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <View style={styles.catInfo}>
                  <View style={styles.catHeader}>
                    <Text style={styles.catName}>{cat.name}</Text>
                    <Text style={styles.catAmounts}>
                      {formatCurrency(spent)} / {formatCurrency(limit)}
                    </Text>
                  </View>
                  <ProgressBar
                    percent={pct}
                    color={cat.color}
                    height={6}
                  />
                  {pct >= 85 && limit > 0 && (
                    <Text style={styles.warningText}>
                      ⚠️ {pct}% of limit used
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
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
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  heroCard: {
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  heroLabel: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  heroAmount: {
    color: Colors.textOnDark,
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.black,
    letterSpacing: -0.5,
  },
  heroHint: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  heroRupee: {
    color: Colors.textOnDark,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extrabold,
  },
  heroInput: {
    color: Colors.textOnDark,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extrabold,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.textOnDarkMuted,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  saveChip: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  saveChipText: {
    color: Colors.textOnDark,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStat: {
    alignItems: 'center',
    gap: 2,
  },
  heroStatValue: {
    color: Colors.textOnDark,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
  },
  heroStatLabel: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
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
  catRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
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
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catName: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  catAmounts: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  warningText: {
    fontSize: Typography.size.xs,
    color: Colors.warning,
    fontWeight: Typography.weight.semibold,
  },
});
