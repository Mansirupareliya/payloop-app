import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, formatMonthYear } from '../utils/dateUtils';
import { getCategoryById } from '../constants/categories';
import { BillCategoryIcon } from '../components/bills/BillCategoryIcon';
import { EmptyState } from '../components/common/EmptyState';
import { Card } from '../components/common/Card';
import { format, parseISO } from 'date-fns';

export function HistoryScreen() {
  const { payments } = useBillStore();
  const [filter, setFilter] = useState<'all' | string>('all');

  // Group payments by month
  const grouped: Record<string, typeof payments> = {};
  for (const p of payments) {
    try {
      const key = format(parseISO(p.paidDate), 'MMMM yyyy');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    } catch { /* skip */ }
  }

  const months = Object.keys(grouped).sort((a, b) => {
    const da = new Date(a);
    const db = new Date(b);
    return db.getTime() - da.getTime();
  });

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <Text style={styles.title}>Payment History</Text>
        <Text style={styles.subtitle}>{payments.length} payments recorded</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {payments.length === 0 ? (
          <EmptyState
            emoji="📜"
            title="No payment history yet"
            subtitle="Your paid bills will appear here"
          />
        ) : (
          months.map(month => {
            const monthPayments = grouped[month];
            const monthTotal = monthPayments.reduce((s, p) => s + p.amount, 0);

            return (
              <Card key={month} style={styles.monthCard}>
                {/* Month Header */}
                <View style={styles.monthHeader}>
                  <Text style={styles.monthTitle}>{month}</Text>
                  <Text style={styles.monthTotal}>{formatCurrency(monthTotal)}</Text>
                </View>

                {/* Payment Rows */}
                {monthPayments.map(p => {
                  const cat = getCategoryById(p.categoryId);
                  return (
                    <View key={p.id} style={styles.payRow}>
                      <BillCategoryIcon categoryId={p.categoryId} size={40} />
                      <View style={styles.payInfo}>
                        <Text style={styles.payName}>{p.billName}</Text>
                        <Text style={styles.payMeta}>
                          {cat.name} • {p.paymentMethod}
                        </Text>
                        <Text style={styles.payDate}>{formatDate(p.paidDate)}</Text>
                      </View>
                      <View style={styles.payRight}>
                        <Text style={styles.payAmount}>{formatCurrency(p.amount)}</Text>
                        <View style={styles.paidBadge}>
                          <Text style={styles.paidBadgeText}>✓ Paid</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}

                {/* Month Footer */}
                <View style={styles.monthFooter}>
                  <Text style={styles.monthFooterText}>
                    {monthPayments.length} payment{monthPayments.length !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.monthFooterTotal}>
                    Total: {formatCurrency(monthTotal)}
                  </Text>
                </View>
              </Card>
            );
          })
        )}

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
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  monthCard: {
    marginBottom: Spacing.base,
    padding: 0,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  monthTitle: {
    color: Colors.textOnDark,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
  },
  monthTotal: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  payInfo: {
    flex: 1,
    gap: 2,
  },
  payName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  payMeta: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },
  payDate: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
  },
  payRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  payAmount: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  paidBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  paidBadgeText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: Typography.weight.bold,
  },
  monthFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surfaceAlt,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  monthFooterText: {
    color: Colors.textMuted,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  monthFooterTotal: {
    color: Colors.textPrimary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
  },
});
