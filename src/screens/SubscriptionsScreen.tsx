import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { formatCurrency } from '../utils/currencyUtils';
import { getDueDateLabel, formatDate } from '../utils/dateUtils';
import { BillCategoryIcon } from '../components/bills/BillCategoryIcon';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/common/EmptyState';
import { RootStackParamList } from '../types';
import { Pressable } from 'react-native';

type NavProp = StackNavigationProp<RootStackParamList>;

const SUBSCRIPTION_CATEGORIES = ['entertainment', 'internet', 'mobile'];

export function SubscriptionsScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills } = useBillStore();

  // Filter subscription-like bills
  const subscriptions = bills.filter(
    b => SUBSCRIPTION_CATEGORIES.includes(b.categoryId) && !b.isPaid
  ).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const monthlyTotal = subscriptions
    .filter(b => b.frequency === 'Monthly')
    .reduce((s, b) => s + b.amount, 0);
  const yearlyTotal = monthlyTotal * 12;

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <Text style={styles.title}>Subscriptions</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Insight Card */}
        {monthlyTotal > 0 && (
          <Card variant="dark" style={styles.insightCard}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={styles.insightText}>
              <Text style={styles.insightTitle}>Subscription Spending</Text>
              <Text style={styles.insightSub}>
                You're spending {formatCurrency(monthlyTotal)}/month on subscriptions
              </Text>
              <Text style={styles.insightYearly}>
                That's {formatCurrency(yearlyTotal)} per year
              </Text>
            </View>
          </Card>
        )}

        {/* Summary Row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatCurrency(monthlyTotal)}</Text>
            <Text style={styles.summaryLabel}>Monthly</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{formatCurrency(yearlyTotal)}</Text>
            <Text style={styles.summaryLabel}>Yearly (est.)</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{subscriptions.length}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>
        </View>

        {/* Subscription List */}
        <Text style={styles.listTitle}>Active Subscriptions</Text>
        {subscriptions.length === 0 ? (
          <EmptyState
            emoji="📺"
            title="No subscriptions found"
            subtitle="Bills from Entertainment, Internet & Mobile categories will appear here"
          />
        ) : (
          subscriptions.map(bill => (
            <Pressable
              key={bill.id}
              style={styles.subCard}
              onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
            >
              <BillCategoryIcon categoryId={bill.categoryId} size={44} />
              <View style={styles.subInfo}>
                <Text style={styles.subName}>{bill.name}</Text>
                <Text style={styles.subFreq}>{bill.frequency}</Text>
                <Text style={styles.subDue}>Next: {formatDate(bill.dueDate)}</Text>
              </View>
              <View style={styles.subRight}>
                <Text style={styles.subAmount}>{formatCurrency(bill.amount)}</Text>
                <Text style={styles.subPer}>/{bill.frequency === 'Monthly' ? 'mo' : 'yr'}</Text>
              </View>
            </Pressable>
          ))
        )}

        <View style={{ height: 140 }} />
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
    paddingTop: 52,
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
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  insightIcon: {
    fontSize: 28,
  },
  insightText: {
    flex: 1,
    gap: 2,
  },
  insightTitle: {
    color: Colors.textOnDark,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  insightSub: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.sm,
    lineHeight: 18,
  },
  insightYearly: {
    color: Colors.warning,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    alignItems: 'center',
    gap: 4,
    ...Shadow.sm,
  },
  summaryValue: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  listTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadow.sm,
  },
  subInfo: {
    flex: 1,
    gap: 2,
  },
  subName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  subFreq: {
    fontSize: Typography.size.xs,
    color: Colors.accent,
    fontWeight: Typography.weight.semibold,
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  subDue: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  subRight: {
    alignItems: 'flex-end',
  },
  subAmount: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  subPer: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },
});
