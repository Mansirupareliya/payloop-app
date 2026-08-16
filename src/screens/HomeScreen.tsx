import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect, Circle, Path, G } from 'react-native-svg';
import { useBillStore } from '../store/billStore';
import { useSettingsStore } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/currencyUtils';
import { getDashboardStats } from '../utils/analyticsUtils';
import { getCategoryById } from '../constants/categories';
import { RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

// ─── Greeting Helper ─────────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

type NavProp = StackNavigationProp<RootStackParamList>;

// ─── SVG Components ──────────────────────────────────────────────────────────

const GlassGradient = ({ colors, style }: { colors: string[], style?: any }) => (
  <View style={[StyleSheet.absoluteFill, { borderRadius: 24, overflow: 'hidden' }, style]}>
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors[0]} stopOpacity="1" />
          <Stop offset="1" stopColor={colors[1]} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grad)" />
    </Svg>
  </View>
);

const WalletIcon = () => (
  <View style={styles.walletContainer}>
    <View style={styles.walletBody}>
      <View style={styles.walletFlap} />
      <View style={styles.walletBadge}>
        <Feather name="dollar-sign" size={14} color="#3b82f6" />
      </View>
      <View style={styles.walletLine} />
    </View>
  </View>
);

// ─── Due Soon Bill Row ───────────────────────────────────────────────────────
function NewBillRow({ bill, onPress }: { bill: any; onPress: () => void }) {
  const cat = getCategoryById(bill.categoryId);
  const dueDate = new Date(bill.dueDate);
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;

  const statusColor = isOverdue ? '#ef4444' : isDueToday ? '#f59e0b' : '#6b7280';
  const statusText = isOverdue
    ? `${Math.abs(diffDays)}d overdue`
    : isDueToday
      ? 'Due today'
      : diffDays === 1
        ? 'Due Tomorrow'
        : `Due in ${diffDays} days`;

  return (
    <Pressable
      style={({ pressed }) => [styles.billCard, pressed && styles.billCardPressed]}
      onPress={onPress}
    >
      <View style={[styles.billIconWrap, { backgroundColor: cat.color }]}>
        <Feather name={cat.icon as any} size={18} color="#fff" />
      </View>

      <View style={styles.billInfo}>
        <Text style={styles.billName} numberOfLines={1}>{bill.name}</Text>
        <Text style={[styles.billStatus, { color: statusColor }]}>{statusText}</Text>
      </View>

      <Text style={styles.billAmount}>{formatCurrency(bill.amount)}</Text>
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills, payments, loading, fetchBills, fetchPayments } = useBillStore();
  const { userName } = useSettingsStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchBills();
    fetchPayments();
  }, []);

  const stats = getDashboardStats(bills, payments);

  const pendingBills = bills.filter(b => !b.isPaid).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const paidBills = bills.filter(b => b.isPaid);

  // Total budget hardcoded to 25000 as per image for now, or based on actual data
  const totalBudget = 25000;
  const currentSpending = payments.reduce((sum, p) => sum + p.amount, 0);
  const budgetPercentage = Math.min(Math.round((currentSpending / totalBudget) * 100) || 0, 100);

  const displayName = userName || (user?.email ? user.email.split('@')[0] : 'there');
  const greeting = getGreeting();

  if (loading && bills.length === 0) {
    return (
      <View style={[styles.shell, styles.centered]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f8ff" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable style={styles.headerIcon}>
            <Feather name="menu" size={24} color="#1e293b" />
          </Pressable>
          <Pressable style={styles.headerIcon} onPress={() => (navigation as any).navigate('Profile', { screen: 'History' })}>
            <Feather name="bell" size={22} color="#1e293b" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* ── Greeting ── */}
        <View style={styles.greetingSection}>
          <View>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.greetingName}>{displayName} 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* ── Upcoming Payments Card ── */}
        <View style={styles.mainCardWrap}>
          <GlassGradient colors={['#1e40af', '#3b82f6']} />
          <View style={styles.mainCardContent}>
            <View style={styles.mainCardLeft}>
              <Text style={styles.mainCardLabel}>Upcoming Payments</Text>
              <Text style={styles.mainCardAmount}>{formatCurrency(stats.totalUpcoming)}</Text>
              <Text style={styles.mainCardSub}>Due this month</Text>
            </View>
            <WalletIcon />
          </View>
        </View>

        {/* ── Summary Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#fff7ed' }]}>
              <Feather name="clock" size={14} color="#f97316" />
            </View>
            <View style={styles.statBoxTextWrap}>
              <Text style={[styles.statBoxNum, { color: '#f97316' }]}>{pendingBills.length}</Text>
              <Text style={styles.statBoxLabel}>Due Soon</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#ecfdf5' }]}>
              <Feather name="check-circle" size={14} color="#10b981" />
            </View>
            <View style={styles.statBoxTextWrap}>
              <Text style={[styles.statBoxNum, { color: '#10b981' }]}>{paidBills.length}</Text>
              <Text style={styles.statBoxLabel}>Paid</Text>
            </View>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIconBadge, { backgroundColor: '#fef2f2' }]}>
              <Feather name="alert-circle" size={14} color="#ef4444" />
            </View>
            <View style={styles.statBoxTextWrap}>
              <Text style={[styles.statBoxNum, { color: '#ef4444' }]}>{stats.overdueCount}</Text>
              <Text style={styles.statBoxLabel}>Overdue</Text>
            </View>
          </View>
        </View>

        {/* ── Due Soon Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Due Soon</Text>
          <Pressable onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        </View>

        <View style={styles.billsList}>
          {pendingBills.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending bills.</Text>
            </View>
          ) : (
            pendingBills.slice(0, 3).map(bill => (
              <NewBillRow
                key={bill.id}
                bill={bill}
                onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
              />
            ))
          )}
        </View>

        {/* ── Financial Insights Row ── */}
        <View style={styles.insightsRow}>
          {/* Monthly Spending */}
          <View style={[styles.insightCard, { flex: 1.5, marginRight: 12 }]}>
            <Text style={styles.insightLabel}>Monthly Spending</Text>
            <View style={styles.insightAmountRow}>
              <Text style={styles.insightAmountMain}>{formatCurrency(currentSpending)}</Text>
              <Text style={styles.insightAmountSub}> / {formatCurrency(totalBudget)}</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${budgetPercentage}%` }]} />
            </View>
          </View>

          {/* Budget Used */}
          <View style={[styles.insightCard, { flex: 1, alignItems: 'center' }]}>
            <Text style={styles.insightLabel}>Budget Used</Text>
            <View style={styles.circleProgressWrap}>
              <Text style={styles.circleProgressText}>{budgetPercentage}%</Text>
              <Svg width="48" height="48" viewBox="0 0 48 48">
                <Circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="4" fill="none" />
                <Circle
                  cx="24" cy="24" r="20"
                  stroke="#1e3a8a" strokeWidth="4" fill="none"
                  strokeDasharray="125" strokeDashoffset={125 - (budgetPercentage / 100) * 125}
                  strokeLinecap="round"
                  transform="rotate(-90 24 24)"
                />
              </Svg>
            </View>
          </View>
        </View>

        {/* ── Payment Streak ── */}
        <View style={styles.streakCardWrap}>
          <GlassGradient colors={['#ffffff', '#e0e7ff']} style={{ opacity: 0.8 }} />
          <View style={styles.streakCardContent}>
            <View style={styles.streakIconWrap}>
              <FontAwesome5 name="fire" size={24} color="#f97316" />
            </View>
            <View style={styles.streakInfo}>
              <Text style={styles.streakTitle}>Payment Streak</Text>
              <Text style={styles.streakSub}>12 months on time</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f3f8ff', // Soft bluish white background
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingTop: 14,
    paddingBottom: 20,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 6,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
    borderWidth: 1,
    borderColor: '#f3f8ff',
  },

  // ── Greeting
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  greetingText: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 24,
    backgroundColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },

  // ── Main Card
  mainCardWrap: {
    height: 140,
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  mainCardContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainCardLeft: {
    flex: 1,
  },
  mainCardLabel: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  mainCardAmount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  mainCardSub: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '500',
  },

  // Wallet SVG Styling
  walletContainer: {
    width: 80,
    height: 70,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  walletBody: {
    width: 72,
    height: 52,
    backgroundColor: '#60a5fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#93c5fd',
    opacity: 0.9,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  walletFlap: {
    position: 'absolute',
    top: -12,
    right: 8,
    width: 44,
    height: 20,
    backgroundColor: '#93c5fd',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    opacity: 0.8,
  },
  walletBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  walletLine: {
    position: 'absolute',
    left: 8,
    top: 16,
    width: 16,
    height: 3,
    backgroundColor: '#fff',
    borderRadius: 2,
    opacity: 0.8,
  },

  // ── Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: (width - 48 - 24) / 3, // 3 columns
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statBoxTextWrap: {
    flex: 1,
  },
  statBoxNum: {
    fontSize: 13,
    fontWeight: '800',
  },
  statBoxLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },

  // ── Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e293b',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },

  // ── Due Soon List
  billsList: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  billCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  billCardPressed: {
    backgroundColor: '#f8fafc',
  },
  billIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  billStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  billAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },

  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },

  // ── Financial Insights
  insightsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  insightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  insightAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  insightAmountMain: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  insightAmountSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1e3a8a',
    borderRadius: 3,
  },
  circleProgressWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  circleProgressText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },

  // ── Payment Streak
  streakCardWrap: {
    height: 80,
    marginHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#e0e7ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
  },
  streakCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  streakIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 2,
  },
  streakSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
});
