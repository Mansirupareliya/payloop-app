import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useBillStore } from '../store/billStore';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { isOverdue } from '../utils/dateUtils';
import { getCategoryById } from '../constants/categories';
import { format, parseISO, setYear, setMonth } from 'date-fns';
import { Colors } from '../constants/colors';
import { exportMonthlyCSV } from '../utils/csvExportUtils';
import { Bill, Payment, RootStackParamList } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'paid' | 'remaining' | 'overdue';

interface TabConfig {
  key: Tab;
  label: string;
  emptyMsg: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
}

const TABS: TabConfig[] = [
  {
    key: 'paid',
    label: 'Paid',
    emptyMsg: 'No bills paid this month.',
    accentColor: '#059669',
    badgeBg: '#d1fae5',
    badgeText: '#059669',
  },
  {
    key: 'remaining',
    label: 'Remaining',
    emptyMsg: 'No upcoming bills this month.',
    accentColor: Colors.warning,
    badgeBg: Colors.warningLight,
    badgeText: Colors.warning,
  },
  {
    key: 'overdue',
    label: 'Overdue',
    emptyMsg: 'No overdue bills this month.',
    accentColor: Colors.danger,
    badgeBg: Colors.dangerLight,
    badgeText: Colors.danger,
  },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PaidRow({ p, isLast, onPress }: { p: Payment; isLast: boolean; onPress: () => void }) {
  const cat = getCategoryById(p.categoryId);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, isLast && { borderBottomWidth: 0 }, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: cat.color || '#eff6ff' }]}>
        <Feather name={cat.icon as any} size={20} color={Colors.textOnDark} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{p.billName}</Text>
        <Text style={styles.rowMeta}>{cat.name} · {p.paymentMethod}</Text>
        <Text style={styles.rowDate}>{formatDate(p.paidDate)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>{formatCurrency(p.amount)}</Text>
        <View style={[styles.badge, { backgroundColor: '#d1fae5' }]}>
          <Text style={[styles.badgeText, { color: '#059669' }]}>✓ Paid</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

function BillRow({ b, tab, isLast, onPress }: { b: Bill; tab: Tab; isLast: boolean; onPress: () => void }) {
  const cat = getCategoryById(b.categoryId);
  const cfg = TABS.find(t => t.key === tab)!;
  const label = tab === 'overdue' ? 'Overdue' : 'Upcoming';
  return (
    <Pressable
      style={({ pressed }) => [styles.row, isLast && { borderBottomWidth: 0 }, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: cat.color || '#eff6ff' }]}>
        <Feather name={cat.icon as any} size={20} color={Colors.textOnDark} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{b.name}</Text>
        <Text style={styles.rowMeta}>{cat.name} · {b.frequency}</Text>
        <Text style={styles.rowDate}>Due {formatDate(b.dueDate)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowAmount}>{formatCurrency(b.amount)}</Text>
        <View style={[styles.badge, { backgroundColor: cfg.badgeBg }]}>
          <Text style={[styles.badgeText, { color: cfg.badgeText }]}>{label}</Text>
        </View>
      </View>
      <Feather name="chevron-right" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export function HistoryScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { payments, bills } = useBillStore();

  const [activeTab, setActiveTab] = useState<Tab>('paid');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());
  const [exporting, setExporting] = useState(false);

  const monthKeyISO   = format(selectedDate, 'yyyy-MM');       // for bills
  const monthKeyLabel = format(selectedDate, 'MMMM yyyy');     // for display & payments

  // ── Data per tab ────────────────────────────────────────────────────────────
  const paidItems: Payment[] = payments
    .filter(p => {
      try { return format(parseISO(p.paidDate), 'yyyy-MM') === monthKeyISO; }
      catch { return false; }
    })
    .sort((a, b) => b.paidDate.localeCompare(a.paidDate));

  const monthBills = bills.filter(b => b.dueDate.startsWith(monthKeyISO));

  const remainingItems: Bill[] = monthBills
    .filter(b => !b.isPaid && !isOverdue(b.dueDate, b.isPaid))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const overdueItems: Bill[] = monthBills
    .filter(b => !b.isPaid && isOverdue(b.dueDate, b.isPaid))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // ── Totals ──────────────────────────────────────────────────────────────────
  const paidTotal     = paidItems.reduce((s, p) => s + p.amount, 0);
  const remainTotal   = remainingItems.reduce((s, b) => s + b.amount, 0);
  const overdueTotal  = overdueItems.reduce((s, b) => s + b.amount, 0);

  const counts = { paid: paidItems.length, remaining: remainingItems.length, overdue: overdueItems.length };

  const activeCfg = TABS.find(t => t.key === activeTab)!;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelectMonth = (monthIndex: number) => {
    let d = setYear(new Date(), pickerYear);
    d = setMonth(d, monthIndex);
    setSelectedDate(d);
    setShowPicker(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportMonthlyCSV(bills, payments, selectedDate);
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message ?? 'Could not export CSV.');
    } finally {
      setExporting(false);
    }
  };

  // ── Render list content ──────────────────────────────────────────────────────
  const renderContent = () => {
    if (activeTab === 'paid') {
      if (paidItems.length === 0) return <EmptyState msg={activeCfg.emptyMsg} sub={monthKeyLabel} />;
      return (
        <>
          <View style={styles.listCard}>
            {paidItems.map((p, i) => (
              <PaidRow
                key={p.id}
                p={p}
                isLast={i === paidItems.length - 1}
                onPress={() => navigation.navigate('BillDetail', { billId: p.billId })}
              />
            ))}
          </View>
          <TotalBar count={paidItems.length} total={paidTotal} cfg={activeCfg} label="paid" />
        </>
      );
    }

    if (activeTab === 'remaining') {
      if (remainingItems.length === 0) return <EmptyState msg={activeCfg.emptyMsg} sub={monthKeyLabel} />;
      return (
        <>
          <View style={styles.listCard}>
            {remainingItems.map((b, i) => (
              <BillRow
                key={b.id}
                b={b}
                tab="remaining"
                isLast={i === remainingItems.length - 1}
                onPress={() => navigation.navigate('BillDetail', { billId: b.id })}
              />
            ))}
          </View>
          <TotalBar count={remainingItems.length} total={remainTotal} cfg={activeCfg} label="upcoming" />
        </>
      );
    }

    // overdue
    if (overdueItems.length === 0) return <EmptyState msg={activeCfg.emptyMsg} sub={monthKeyLabel} />;
    return (
      <>
        <View style={styles.listCard}>
          {overdueItems.map((b, i) => (
            <BillRow
              key={b.id}
              b={b}
              tab="overdue"
              isLast={i === overdueItems.length - 1}
              onPress={() => navigation.navigate('BillDetail', { billId: b.id })}
            />
          ))}
        </View>
        <TotalBar count={overdueItems.length} total={overdueTotal} cfg={activeCfg} label="overdue" />
      </>
    );
  };

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={16}>
          <Feather name="chevron-left" size={24} color={Colors.deepNavy} />
        </Pressable>
        <Text style={styles.title}>History</Text>

        <View style={styles.headerRight}>
          <Pressable style={styles.monthButton} onPress={() => {
            setPickerYear(selectedDate.getFullYear());
            setShowPicker(true);
          }}>
            <Feather name="calendar" size={15} color={Colors.deepNavy} />
            <Text style={styles.monthButtonText}>{monthKeyLabel}</Text>
            <Feather name="chevron-down" size={15} color={Colors.deepNavy} />
          </Pressable>

          <Pressable
            style={[styles.exportBtn, exporting && { opacity: 0.6 }]}
            onPress={handleExport}
            disabled={exporting}
            hitSlop={8}
          >
            {exporting
              ? <ActivityIndicator size="small" color={Colors.deepNavy} />
              : <Feather name="download" size={17} color={Colors.deepNavy} />
            }
          </Pressable>
        </View>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabBar}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          const count  = counts[tab.key];
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabBtn, active && { backgroundColor: Colors.deepNavy }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {count > 0 && (
                <View style={[
                  styles.tabCount,
                  { backgroundColor: active ? 'rgba(255,255,255,0.15)' : tab.badgeBg },
                ]}>
                  <Text style={[styles.tabCountText, { color: active ? '#fff' : tab.badgeText }]}>
                    {count}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── Content ── */}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ── Month/Year Picker Modal ── */}
      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <View style={styles.yearRow}>
              <Pressable onPress={() => setPickerYear(y => y - 1)} style={styles.yearBtn}>
                <Feather name="chevron-left" size={24} color={Colors.deepNavy} />
              </Pressable>
              <Text style={styles.yearText}>{pickerYear}</Text>
              <Pressable onPress={() => setPickerYear(y => y + 1)} style={styles.yearBtn}>
                <Feather name="chevron-right" size={24} color={Colors.deepNavy} />
              </Pressable>
            </View>
            <View style={styles.monthGrid}>
              {MONTHS.map((m, index) => {
                const sel = selectedDate.getMonth() === index && selectedDate.getFullYear() === pickerYear;
                return (
                  <Pressable
                    key={m}
                    style={[styles.monthBox, sel && styles.monthBoxSelected]}
                    onPress={() => handleSelectMonth(index)}
                  >
                    <Text style={[styles.monthBoxText, sel && styles.monthBoxTextSelected]}>{m}</Text>
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

// ─── Helper components ────────────────────────────────────────────────────────

function EmptyState({ msg, sub }: { msg: string; sub: string }) {
  return (
    <View style={styles.emptyState}>
      <Feather name="inbox" size={40} color={Colors.borderLight} style={{ marginBottom: 16 }} />
      <Text style={styles.emptyText}>{msg}</Text>
      <Text style={styles.emptySubText}>Nothing to show for {sub}.</Text>
    </View>
  );
}

function TotalBar({
  count, total, cfg, label,
}: {
  count: number; total: number; cfg: TabConfig; label: string;
}) {
  return (
    <View style={[styles.totalBar, { borderColor: cfg.accentColor + '30' }]}>
      <View style={styles.totalLeft}>
        <View style={[styles.totalDot, { backgroundColor: cfg.accentColor }]} />
        <Text style={styles.totalCount}>
          {count} {label} bill{count !== 1 ? 's' : ''}
        </Text>
      </View>
      <View>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={[styles.totalAmount, { color: cfg.accentColor }]}>
          {formatCurrency(total)}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: Colors.background },

  // ── header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: Colors.deepNavy },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  monthButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.border, paddingHorizontal: 10,
    paddingVertical: 7, borderRadius: 20, gap: 5,
  },
  monthButtonText: { fontSize: 12, fontWeight: '700', color: Colors.deepNavy },
  exportBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
  },

  // ── tab bar
  tabBar: {
    flexDirection: 'row', gap: 8,
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderRadius: 13, gap: 6,
  },
  tabLabel: { fontSize: 13, fontWeight: '700', color: Colors.textMuted },
  tabLabelActive: { color: Colors.surface },
  tabCount: {
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  tabCountText: { fontSize: 11, fontWeight: '800' },

  // ── scroll
  scroll: { paddingHorizontal: 20, paddingTop: 4 },

  // ── list card
  listCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    overflow: 'hidden', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },

  // ── row
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: 14,
  },
  rowPressed: { backgroundColor: Colors.surfaceAlt },
  iconWrap: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  rowInfo: { flex: 1, gap: 3 },
  rowName: { fontSize: 15, fontWeight: '800', color: Colors.deepNavy },
  rowMeta: { fontSize: 11, color: Colors.textMuted, fontWeight: '700' },
  rowDate: { fontSize: 11, color: Colors.textMuted, fontWeight: '600' },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  rowAmount: { fontSize: 15, fontWeight: '800', color: Colors.deepNavy },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 10, fontWeight: '800' },

  // ── total bar
  totalBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surface, borderRadius: 16,
    paddingHorizontal: 20, paddingVertical: 16,
    borderWidth: 1.5, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  totalLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  totalDot: { width: 10, height: 10, borderRadius: 5 },
  totalCount: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  totalLabel: { fontSize: 11, fontWeight: '600', color: Colors.textMuted, textAlign: 'right' },
  totalAmount: { fontSize: 20, fontWeight: '800', textAlign: 'right' },

  // ── empty
  emptyState: { alignItems: 'center', marginTop: 72 },
  emptyText: { fontSize: 15, fontWeight: '800', color: Colors.textSecondary, marginBottom: 6 },
  emptySubText: { fontSize: 13, color: Colors.textMuted, fontWeight: '600' },

  // ── modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.surface, borderRadius: 24, padding: 24, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
  },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  yearBtn: { padding: 8, backgroundColor: Colors.borderLight, borderRadius: 12 },
  yearText: { fontSize: 18, fontWeight: '800', color: Colors.deepNavy },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  monthBox: {
    width: '30%', aspectRatio: 1.5,
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  monthBoxSelected: { backgroundColor: Colors.deepNavy },
  monthBoxText: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  monthBoxTextSelected: { color: Colors.surface },
});
