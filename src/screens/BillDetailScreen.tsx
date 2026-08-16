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
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { getCategoryById } from '../constants/categories';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, getDueDateLabel, isOverdue, isDueToday } from '../utils/dateUtils';
import { BillCategoryIcon } from '../components/bills/BillCategoryIcon';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';
import { PillSelector } from '../components/common/PillSelector';
import { RootStackParamList, PaymentMethod, BillStatus } from '../types';

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
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backIcon}>←</Text>
        </Pressable>
        <Text style={styles.screenTitle}>Bill Details</Text>
        <Pressable
          onPress={() => navigation.navigate('AddBill', { billId: bill.id })}
          style={styles.editBtn}
          hitSlop={8}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Success Banner */}
        {showSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✅ Payment recorded successfully!</Text>
          </View>
        )}

        {/* Hero */}
        <Card style={styles.heroCard} variant="dark">
          <View style={styles.heroTop}>
            <BillCategoryIcon categoryId={bill.categoryId} size={52} />
            <View style={styles.heroInfo}>
              <Text style={styles.heroName}>{bill.name}</Text>
              <Text style={styles.heroCategory}>{category.icon} {category.name}</Text>
            </View>
          </View>
          <Text style={styles.heroAmount}>{formatCurrency(bill.amount)}</Text>
          <View style={styles.heroBottom}>
            <Badge status={status} size="md" />
            <Text style={styles.heroDue}>{getDueDateLabel(bill.dueDate)}</Text>
          </View>
        </Card>

        {/* Details */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          {[
            { label: 'Due Date',   value: formatDate(bill.dueDate) },
            { label: 'Frequency',  value: bill.frequency },
            { label: 'Auto Repeat', value: bill.autoRepeat ? 'Yes' : 'No' },
            { label: 'Reminders',  value: bill.reminders.join(', ') || 'None' },
            { label: 'Payment Method', value: bill.paymentMethod ?? 'Not set' },
          ].map(row => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
          {bill.notes ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{bill.notes}</Text>
            </View>
          ) : null}
        </Card>

        {/* Paid details if already paid */}
        {bill.isPaid && bill.paidDate && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Payment Info</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Paid On</Text>
              <Text style={styles.detailValue}>{formatDate(bill.paidDate)}</Text>
            </View>
            {bill.transactionId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>{bill.transactionId}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Actions */}
        {!bill.isPaid && (
          <Pressable style={styles.payBtn} onPress={() => setShowPayModal(true)}>
            <Text style={styles.payBtnText}>Mark as Paid 💳</Text>
          </Pressable>
        )}

        <Pressable style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>🗑 Delete Bill</Text>
        </Pressable>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Pay Modal */}
      <Modal visible={showPayModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Record Payment</Text>
            <Text style={styles.modalSubtitle}>{bill.name} • {formatCurrency(bill.amount)}</Text>

            <Text style={styles.modalLabel}>Payment Method</Text>
            <PillSelector
              options={METHODS}
              selected={payMethod}
              onSelect={m => setPayMethod(m as PaymentMethod)}
            />

            <Text style={[styles.modalLabel, { marginTop: Spacing.base }]}>
              Transaction ID (Optional)
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. UPI12345"
              placeholderTextColor={Colors.textMuted}
              value={transId}
              onChangeText={setTransId}
            />

            <Text style={styles.modalLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Any notes..."
              placeholderTextColor={Colors.textMuted}
              value={payNotes}
              onChangeText={setPayNotes}
            />

            <Pressable style={styles.confirmBtn} onPress={handleMarkPaid}>
              <Text style={styles.confirmBtnText}>✓ Confirm Payment</Text>
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
    backgroundColor: Colors.background,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 100,
    color: Colors.textMuted,
    fontSize: Typography.size.base,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  screenTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  editBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.accentLight,
  },
  editText: {
    color: Colors.accent,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  successBanner: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  successText: {
    color: Colors.success,
    fontWeight: Typography.weight.bold,
    fontSize: Typography.size.base,
  },
  heroCard: {
    marginBottom: Spacing.base,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    color: Colors.textOnDark,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
  },
  heroCategory: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },
  heroAmount: {
    color: Colors.textOnDark,
    fontSize: Typography.size['4xl'],
    fontWeight: Typography.weight.black,
    letterSpacing: -1,
    marginBottom: Spacing.md,
  },
  heroBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroDue: {
    color: Colors.textOnDarkMuted,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semibold,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  detailValue: {
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
    maxWidth: '60%',
    textAlign: 'right',
  },
  payBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base + 2,
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    ...Shadow.blue,
  },
  payBtnText: {
    color: Colors.textOnDark,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
  },
  deleteBtn: {
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    marginBottom: Spacing.md,
  },
  deleteBtnText: {
    color: Colors.danger,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.base,
  },
  modalTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalInput: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  confirmBtn: {
    backgroundColor: Colors.success,
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  confirmBtnText: {
    color: Colors.textOnDark,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
  },
  cancelBtn: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});
