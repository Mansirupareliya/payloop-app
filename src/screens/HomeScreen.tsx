import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useBillStore } from '../store/billStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/currencyUtils';
import { getDashboardStats } from '../utils/analyticsUtils';
import { getCategoryById } from '../constants/categories';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

type NavProp = StackNavigationProp<RootStackParamList>;

function BillRow({ bill, onPress }: { bill: any; onPress: () => void }) {
  const cat = getCategoryById(bill.categoryId);
  const dueDate = new Date(bill.dueDate);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;

  const statusColor = isOverdue ? Colors.danger : isDueToday ? Colors.warning : Colors.textMuted;
  const statusBg = isOverdue ? '#FFF0F0' : isDueToday ? '#FFF4EE' : Colors.surfaceAlt;
  const statusText = isOverdue
    ? `${Math.abs(diffDays)}d overdue`
    : isDueToday ? 'Due today'
    : diffDays === 1 ? 'Tomorrow'
    : `${diffDays} days left`;

  return (
    <Pressable style={({ pressed }) => [styles.billCard, pressed && { opacity: 0.85 }]} onPress={onPress}>
      <View style={[styles.billIcon, { backgroundColor: cat.bgColor }]}>
        <Feather name={cat.icon as any} size={17} color={cat.color} />
      </View>
      <View style={styles.billInfo}>
        <Text style={styles.billName} numberOfLines={1}>{bill.name}</Text>
        <Text style={styles.billCat}>{cat.name}</Text>
      </View>
      <View style={styles.billRight}>
        <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
        <View style={[styles.billStatusPill, { backgroundColor: statusBg }]}>
          <Text style={[styles.billStatusText, { color: statusColor }]}>{statusText}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills, payments, loading, fetchBills, fetchPayments } = useBillStore();
  const { userName } = useSettingsStore();
  const { user } = useAuthStore();

  useEffect(() => { fetchBills(); fetchPayments(); }, []);

  const stats = getDashboardStats(bills, payments);
  const pendingBills = bills.filter(b => !b.isPaid).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const paidBills   = bills.filter(b => b.isPaid);
  const currentSpending = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalBills  = bills.length;
  const paidPct     = totalBills > 0 ? Math.round((paidBills.length / totalBills) * 100) : 0;
  const displayName = userName || (user?.email ? user.email.split('@')[0] : 'there');

  // ring math
  const R = 44; const CIRC = 2 * Math.PI * R;
  const offset = CIRC - (paidPct / 100) * CIRC;

  if (loading && bills.length === 0) {
    return (
      <View style={[styles.shell, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.deepNavy} />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetSub}>{getGreeting()},</Text>
            <Text style={styles.greetName}>{displayName} 👋</Text>
          </View>
          <Pressable style={styles.bellBtn} onPress={() => navigation.navigate('History')}>
            <Feather name="bell" size={19} color={Colors.textPrimary} />
            <View style={styles.notifDot} />
          </Pressable>
        </View>

        {/* ── Hero Card ── */}
        <View style={styles.heroCard}>
          {/* decorative circles */}
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />

          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>Total Upcoming</Text>
            <Text style={styles.heroAmount}>{formatCurrency(stats.totalUpcoming)}</Text>
            <Text style={styles.heroSub}>Due this month</Text>

            <View style={styles.heroPillRow}>
              <View style={styles.heroPill}>
                <View style={styles.heroPillDot} />
                <Text style={styles.heroPillText}>{pendingBills.length} pending</Text>
              </View>
              {stats.overdueCount > 0 && (
                <View style={[styles.heroPill, { backgroundColor: 'rgba(229,62,62,0.15)' }]}>
                  <View style={[styles.heroPillDot, { backgroundColor: Colors.danger }]} />
                  <Text style={[styles.heroPillText, { color: Colors.danger }]}>{stats.overdueCount} overdue</Text>
                </View>
              )}
            </View>
          </View>

          {/* Circle progress */}
          <View style={styles.heroRight}>
            <Svg width={110} height={110} viewBox="0 0 110 110">
              <Circle cx="55" cy="55" r={R} stroke="rgba(255,255,255,0.12)" strokeWidth="8" fill="none" />
              <Circle
                cx="55" cy="55" r={R}
                stroke={Colors.accent} strokeWidth="8" fill="none"
                strokeDasharray={CIRC} strokeDashoffset={offset}
                strokeLinecap="round" transform="rotate(-90 55 55)"
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text style={styles.ringPct}>{paidPct}%</Text>
              <Text style={styles.ringLabel}>paid</Text>
            </View>
          </View>
        </View>

        {/* ── Quick Stats ── */}
        <View style={styles.statsRow}>
          {[
            { icon: 'clock', label: 'Pending', value: pendingBills.length, color: Colors.warning, bg: '#FFF4EE' },
            { icon: 'check-circle', label: 'Paid', value: paidBills.length, color: Colors.success, bg: '#F3FDD3' },
            { icon: 'alert-circle', label: 'Overdue', value: stats.overdueCount, color: Colors.danger, bg: '#FFF0F0' },
          ].map(s => (
            <View key={s.label} style={styles.statBox}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Feather name={s.icon as any} size={15} color={s.color} />
              </View>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.actionsRow}>
          {[
            { icon: 'plus-circle', label: 'Add Bill',  onPress: () => navigation.navigate('AddBill', {}) },
            { icon: 'calendar',    label: 'Calendar',  onPress: () => navigation.navigate('MainTabs') },
            { icon: 'bar-chart-2', label: 'Analytics', onPress: () => navigation.navigate('MainTabs') },
            { icon: 'clock',       label: 'History',   onPress: () => navigation.navigate('History')  },
          ].map(a => (
            <Pressable key={a.label} style={styles.actionBtn} onPress={a.onPress}>
              <View style={styles.actionIcon}>
                <Feather name={a.icon as any} size={18} color={Colors.deepNavy} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Due Soon ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Due Soon</Text>
          <Pressable onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.seeAll}>See All →</Text>
          </Pressable>
        </View>

        <View style={styles.billsList}>
          {pendingBills.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="check-circle" size={32} color={Colors.success} />
              <Text style={styles.emptyText}>All caught up!</Text>
              <Text style={styles.emptySubText}>No pending bills right now</Text>
            </View>
          ) : (
            pendingBills.slice(0, 4).map(bill => (
              <BillRow
                key={bill.id}
                bill={bill}
                onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
              />
            ))
          )}
        </View>

        {/* ── Spending Snapshot ── */}
        <View style={styles.spendCard}>
          <View style={styles.spendTop}>
            <View>
              <Text style={styles.spendLabel}>Total Paid</Text>
              <Text style={styles.spendAmount}>{formatCurrency(currentSpending)}</Text>
            </View>
            <View style={styles.spendBadge}>
              <Feather name="trending-up" size={14} color={Colors.accent} />
              <Text style={styles.spendBadgeText}>{paidBills.length} bills</Text>
            </View>
          </View>
          <View style={styles.spendBar}>
            <View style={[styles.spendFill, { width: `${Math.min(paidPct, 100)}%` }]} />
          </View>
          <Text style={styles.spendFooter}>{paidPct}% of your bills are paid this cycle</Text>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: 20 },

  /* Header */
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 22, paddingTop: 52, paddingBottom: 18,
  },
  greetSub: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  greetName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3, marginTop: 1 },
  bellBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  notifDot: {
    position: 'absolute', top: 9, right: 9,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.accent, borderWidth: 1.5, borderColor: Colors.surface,
  },

  /* Hero Card */
  heroCard: {
    marginHorizontal: 22, marginBottom: 16, borderRadius: 24,
    backgroundColor: Colors.deepNavy, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22, shadowRadius: 16, elevation: 10,
  },
  heroCircle1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(200,241,53,0.06)', top: -60, right: 60,
  },
  heroCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 20,
  },
  heroLeft: { flex: 1, marginRight: 12 },
  heroLabel: { color: Colors.textOnDarkMuted, fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  heroAmount: { color: Colors.surface, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginBottom: 4 },
  heroSub: { color: Colors.textOnDarkMuted, fontSize: 12, marginBottom: 14 },
  heroPillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(200,241,53,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  heroPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent },
  heroPillText: { fontSize: 11, fontWeight: '700', color: Colors.accent },
  heroRight: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringPct: { fontSize: 18, fontWeight: '900', color: Colors.surface },
  ringLabel: { fontSize: 10, fontWeight: '600', color: Colors.textOnDarkMuted },

  /* Stats */
  statsRow: {
    flexDirection: 'row', paddingHorizontal: 22,
    gap: 10, marginBottom: 16,
  },
  statBox: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: 16,
    paddingVertical: 14, alignItems: 'center', gap: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  statNum: { fontSize: 18, fontWeight: '900' },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },

  /* Quick Actions */
  actionsRow: {
    flexDirection: 'row', paddingHorizontal: 22,
    gap: 10, marginBottom: 22,
  },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionLabel: { fontSize: 10, fontWeight: '700', color: Colors.textSecondary },

  /* Section */
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 22, marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  seeAll: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },

  /* Bill rows */
  billsList: { paddingHorizontal: 22, marginBottom: 16 },
  billCard: {
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  billIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  billInfo: { flex: 1 },
  billName: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  billCat: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
  billRight: { alignItems: 'flex-end', gap: 4 },
  billAmount: { fontSize: 14, fontWeight: '800', color: Colors.textPrimary },
  billStatusPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  billStatusText: { fontSize: 10, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 28, gap: 6 },
  emptyText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emptySubText: { fontSize: 12, color: Colors.textMuted },

  /* Spend card */
  spendCard: {
    marginHorizontal: 22, backgroundColor: Colors.surface, borderRadius: 20,
    padding: 18, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  spendTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  spendLabel: { fontSize: 12, color: Colors.textMuted, fontWeight: '600', marginBottom: 3 },
  spendAmount: { fontSize: 22, fontWeight: '900', color: Colors.textPrimary, letterSpacing: -0.5 },
  spendBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F3FDD3', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  spendBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.deepNavy },
  spendBar: {
    height: 7, backgroundColor: Colors.borderLight, borderRadius: 4,
    overflow: 'hidden', marginBottom: 8,
  },
  spendFill: { height: '100%', backgroundColor: Colors.deepNavy, borderRadius: 4 },
  spendFooter: { fontSize: 11, color: Colors.textMuted, fontWeight: '500' },
});
