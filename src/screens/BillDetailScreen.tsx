import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useBillStore } from '../store/billStore';
import { getCategoryById } from '../constants/categories';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDueDateLabel, isOverdue, isDueToday } from '../utils/dateUtils';
import { BillCategoryIcon } from '../components/bills/BillCategoryIcon';
import { RootStackParamList, PaymentMethod, BillStatus } from '../types';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'BillDetail'>;

const METHODS: PaymentMethod[] = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'];

function getBillStatus(isPaid: boolean, dueDate: string): BillStatus {
  if (isPaid) return 'paid';
  if (isOverdue(dueDate, isPaid)) return 'overdue';
  if (isDueToday(dueDate)) return 'due_today';
  return 'upcoming';
}

export function BillDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { getBillById, markAsPaid, deleteBill } = useBillStore();

  const bill = getBillById(route.params.billId);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [transId, setTransId] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  if (!bill) {
    return (
      <View style={styles.shell}>
        <Text style={styles.notFound}>Bill not found.</Text>
      </View>
    );
  }

  const category = getCategoryById(bill.categoryId);
  const status = getBillStatus(bill.isPaid, bill.dueDate);

  let statusColor = '#3b82f6'; // upcoming
  let statusIcon = 'clock';
  let statusText = 'Upcoming';
  if (status === 'paid') {
    statusColor = '#10b981';
    statusIcon = 'check-circle';
    statusText = 'Paid';
  } else if (status === 'overdue') {
    statusColor = '#ef4444';
    statusIcon = 'alert-circle';
    statusText = 'Overdue';
  } else if (status === 'due_today') {
    statusColor = '#f59e0b';
    statusIcon = 'alert-triangle';
    statusText = 'Due Today';
  }

  function handleMarkPaid() {
    markAsPaid(bill!.id, {
      paymentMethod: payMethod,
      transactionId: transId.trim() || undefined,
      notes: payNotes.trim() || undefined,
    });
    setShowPayModal(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigation.goBack();
    }, 1500);
  }

  function handleDelete() {
    Alert.alert(
      'Delete Bill',
      `Are you sure you want to delete "${bill!.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteBill(bill!.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f8ff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerIcon} hitSlop={16}>
          <Feather name="chevron-left" size={24} color="#0a235c" />
        </Pressable>
        <Text style={styles.title}>Bill Details</Text>
        <Pressable
          onPress={() => navigation.navigate('AddBill', { billId: bill.id })}
          style={styles.headerIcon}
          hitSlop={8}
        >
          <Feather name="edit-2" size={20} color="#0a235c" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {showSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✅ Payment recorded successfully!</Text>
          </View>
        )}

        {/* ── Hero Card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.iconWrap}>
              <Feather name={category.icon as any} size={28} color="#1d4ed8" />
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{bill.name}</Text>
              <Text style={styles.heroCategory}>{category.name}</Text>
            </View>
          </View>

          <Text style={styles.heroAmount}>{formatCurrency(bill.amount)}</Text>

          <View style={styles.heroBottom}>
            <View style={styles.statusRow}>
              <Feather name={statusIcon as any} size={14} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
            <Text style={styles.heroDue}>Due: {formatDate(bill.dueDate)}</Text>
          </View>
        </View>

        {/* ── Details Card ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frequency</Text>
            <Text style={styles.detailValue}>{bill.frequency}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Auto Repeat</Text>
            <Text style={styles.detailValue}>{bill.autoRepeat ? 'Yes' : 'No'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reminders</Text>
            <Text style={styles.detailValue}>{bill.reminders.join(', ') || 'None'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{bill.paymentMethod ?? 'Not set'}</Text>
          </View>

          {bill.notes ? (
            <View style={[styles.detailRow, { borderBottomWidth: 0, flexDirection: 'column', alignItems: 'flex-start', gap: 4 }]}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={[styles.detailValue, { textAlign: 'left' }]}>{bill.notes}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Payment Info (If Paid) ── */}
        {bill.isPaid && bill.paidDate && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment Info</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid On</Text>
              <Text style={styles.detailValue}>{formatDate(bill.paidDate)}</Text>
            </View>
            {bill.transactionId && (
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>{bill.transactionId}</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Actions ── */}
        {!bill.isPaid && (
          <Pressable style={styles.payBtnContainer} onPress={() => setShowPayModal(true)}>
            <View style={StyleSheet.absoluteFill}>
              <Svg width="100%" height="100%" style={{ borderRadius: 28 }}>
                <Defs>
                  <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor="#0ea5e9" />
                    <Stop offset="1" stopColor="#1d4ed8" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#btnGrad)" rx="28" />
              </Svg>
            </View>
            <Text style={styles.payBtnText}>Mark as Paid</Text>
          </Pressable>
        )}

        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete Bill</Text>
        </Pressable>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ── Pay Modal ── */}
      <Modal visible={showPayModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Record Payment</Text>
            <Text style={styles.modalSubtitle}>{bill.name} • {formatCurrency(bill.amount)}</Text>

            <Text style={styles.modalLabel}>Payment Method</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
              {METHODS.map(m => {
                const active = payMethod === m;
                return (
                  <Pressable
                    key={m}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setPayMethod(m)}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{m}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.modalLabel, { marginTop: 16 }]}>Transaction ID (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. UPI12345"
              placeholderTextColor="#94a3b8"
              value={transId}
              onChangeText={setTransId}
            />

            <Text style={styles.modalLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Any notes..."
              placeholderTextColor="#94a3b8"
              value={payNotes}
              onChangeText={setPayNotes}
            />

            <Pressable style={styles.confirmBtn} onPress={handleMarkPaid}>
              <Text style={styles.confirmBtnText}>Confirm Payment</Text>
            </Pressable>

            <Pressable
              style={styles.cancelBtn}
              onPress={() => setShowPayModal(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f3f8ff',
  },
  notFound: {
    textAlign: 'center',
    marginTop: 10,
    color: '#94a3b8',
    fontSize: 10,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a235c',
  },

  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  successBanner: {
    backgroundColor: '#d1fae5', // green-100
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  successText: {
    color: '#059669', // green-600
    fontWeight: '800',
    fontSize: 13,
  },

  // ── Hero Card
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 28,
    backgroundColor: '#eff6ff', // blue-50
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    color: '#0a235c',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroCategory: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  heroAmount: {
    color: '#1d4ed8',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 20,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  heroDue: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a235c',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0a235c',
    textAlign: 'right',
  },

  // ── Actions
  payBtnContainer: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  deleteBtn: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'transparent',
  },
  deleteBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800',
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a235c',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0a235c',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
    marginBottom: 16,
  },
  pillRow: {
    gap: 8,
  },
  pill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 4,
  },
  pillActive: {
    backgroundColor: '#1d4ed8',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  confirmBtn: {
    backgroundColor: '#10b981', // emerald-500
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '700',
  },
});
