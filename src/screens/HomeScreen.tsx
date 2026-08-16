import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { useSettingsStore } from '../store/settingsStore';
import { formatCurrency } from '../utils/currencyUtils';
import { getDashboardStats } from '../utils/analyticsUtils';
import { RootStackParamList } from '../types';

type NavProp = StackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills, payments, loading, fetchBills, fetchPayments } = useBillStore();
  const { userName } = useSettingsStore();

  useEffect(() => {
    fetchBills();
    fetchPayments();
  }, []);

  const stats = getDashboardStats(bills, payments);
  
  // Calculate total balance (upcoming bills this month for example, or total unpaid)
  const totalBalance = stats.totalUpcoming + stats.totalOverdue;

  if (loading && bills.length === 0) {
    return (
      <View style={[styles.shell, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Account Selector style */}
        <View style={styles.topNav}>
          <View style={styles.accountPill}>
            <Feather name="user" size={14} color={Colors.textOnDark} />
            <Text style={styles.accountPillText}>Personal • {userName}</Text>
            <Feather name="chevron-down" size={14} color={Colors.textOnDark} />
          </View>
          <Feather name="bell" size={20} color={Colors.textPrimary} />
        </View>

        {/* Large Balance Display */}
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Total Upcoming</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
          <Text style={styles.balanceSub}>
            <Feather name="calendar" size={12} color={Colors.textSecondary} /> Due in next 30 days
          </Text>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('AddBill', {})}>
            <View style={styles.actionIconBg}>
              <Feather name="plus" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Add Bill</Text>
          </Pressable>
          
          <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Bills' })}>
            <View style={styles.actionIconBg}>
              <Feather name="upload" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Pay</Text>
          </Pressable>

          <Pressable style={styles.actionBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Calendar' })}>
            <View style={styles.actionIconBg}>
              <Feather name="repeat" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.actionText}>Schedule</Text>
          </Pressable>
        </View>

        {/* Overdue Alert */}
        {stats.overdueCount > 0 && (
          <View style={styles.overdueAlert}>
            <Feather name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.overdueAlertText}>
              {stats.overdueCount} overdue bill{stats.overdueCount > 1 ? 's' : ''} ({formatCurrency(stats.totalOverdue)})
            </Text>
          </View>
        )}

        {/* Activity / Bills List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Bills</Text>
          <Pressable onPress={() => navigation.navigate('MainTabs', { screen: 'Bills' })}>
            <Text style={styles.seeAllText}>See All</Text>
          </Pressable>
        </View>

        <View style={styles.cardList}>
          {stats.dueSoonBills.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="check-circle" size={32} color={Colors.success} style={{marginBottom: 8}} />
              <Text style={styles.emptyTitle}>You're all caught up!</Text>
              <Text style={styles.emptySub}>No bills due soon.</Text>
            </View>
          ) : (
            stats.dueSoonBills.slice(0, 5).map(bill => (
              <Pressable 
                key={bill.id} 
                style={styles.listItem}
                onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
              >
                <View style={styles.listIconWrap}>
                  <Feather name="file-text" size={20} color={Colors.primary} />
                </View>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{bill.name}</Text>
                  <Text style={styles.listSubtitle}>Due {new Date(bill.dueDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.listAmount}>{formatCurrency(bill.amount)}</Text>
                  <Feather name="chevron-right" size={16} color={Colors.textMuted} />
                </View>
              </Pressable>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  scroll: {
    paddingTop: 56,
    paddingBottom: Spacing.xl,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    gap: 6,
  },
  accountPillText: {
    color: Colors.textOnDark,
    fontSize: 12,
    fontWeight: '600',
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  balanceSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 8,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: Spacing['2xl'],
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  overdueAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    marginHorizontal: Spacing.xl,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: 8,
    marginBottom: Spacing.lg,
  },
  overdueAlertText: {
    color: Colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  cardList: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    minHeight: 400,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
