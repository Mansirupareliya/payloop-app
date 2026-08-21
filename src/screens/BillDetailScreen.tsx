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
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useBillStore } from '../store/billStore';
import { usePhotoStore } from '../store/photoStore';
import { getCategoryById } from '../constants/categories';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate, isOverdue, isDueToday } from '../utils/dateUtils';
import { RootStackParamList, PaymentMethod, BillStatus } from '../types';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../constants/colors';

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
  const photoUri = usePhotoStore(s => bill ? s.photos[bill.id] : undefined);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
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

  let statusColor: string = Colors.deepNavy; // upcoming
  let statusIcon = 'clock';
  let statusText = 'Upcoming';
  if (status === 'paid') {
    statusColor = Colors.success;
    statusIcon = 'check-circle';
    statusText = 'Paid';
  } else if (status === 'overdue') {
    statusColor = Colors.danger;
    statusIcon = 'alert-circle';
    statusText = 'Overdue';
  } else if (status === 'due_today') {
    statusColor = Colors.warning;
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
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerIcon} hitSlop={16}>
          <Feather name="chevron-left" size={24} color={Colors.deepNavy} />
        </Pressable>
        <Text style={styles.title}>Bill Details</Text>
        <Pressable
          onPress={() => navigation.navigate('AddBill', { billId: bill.id })}
          style={styles.headerIcon}
          hitSlop={8}
        >
          <Feather name="edit-2" size={20} color={Colors.deepNavy} />
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
              <Feather name={category.icon as any} size={28} color={Colors.deepNavy} />
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

        {/* ── Bill Photo ── */}
        {photoUri && (
          <Pressable style={styles.photoCard} onPress={() => setShowPhotoModal(true)}>
            <Image source={{ uri: photoUri }} style={styles.photoImage} resizeMode="cover" />
            <View style={styles.photoOverlay}>
              <Feather name="maximize" size={18} color="#fff" />
              <Text style={styles.photoOverlayText}>Tap to view full</Text>
            </View>
          </Pressable>
        )}

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
                    <Stop offset="0" stopColor={Colors.deepNavy} />
                    <Stop offset="1" stopColor="#1A1A1A" />
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

      {/* ── Fullscreen Photo Modal ── */}
      <Modal visible={showPhotoModal} transparent animationType="fade">
        <Pressable style={styles.fullscreenBg} onPress={() => setShowPhotoModal(false)}>
          {photoUri && (
            <Image
              source={{ uri: photoUri }}
              style={styles.fullscreenImg}
              resizeMode="contain"
            />
          )}
          <Pressable style={styles.fullscreenClose} onPress={() => setShowPhotoModal(false)}>
            <Feather name="x" size={20} color="#fff" />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const { width: SW } = Dimensions.get('window');

const styles = StyleSheet.create({
  // ── Bill photo
  photoCard: {
    marginHorizontal: 24, marginBottom: 16, borderRadius: 16,
    overflow: 'hidden', height: 180,
  },
  photoImage: { width: '100%', height: '100%' },
  photoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  photoOverlayText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // ── Fullscreen photo modal
  fullscreenBg: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center', alignItems: 'center',
  },
  fullscreenImg: { width: SW, height: SW * 1.4 },
  fullscreenClose: {
    position: 'absolute', top: 52, right: 20,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  shell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFound: {
    textAlign: 'center',
    marginTop: 10,
    color: Colors.textMuted,
    fontSize: 10,
  },

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 52,
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
    color: Colors.deepNavy,
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
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 15,
    marginBottom: 20,
    shadowColor: Colors.border,
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
    color: Colors.deepNavy,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroCategory: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  heroAmount: {
    color: Colors.deepNavy,
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
    borderTopColor: Colors.borderLight,
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
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },

  // ── Card
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.border,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.deepNavy,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.deepNavy,
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
    shadowColor: Colors.deepNavy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  payBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  deleteBtn: {
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: 'transparent',
  },
  deleteBtnText: {
    color: Colors.danger,
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
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.deepNavy,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.deepNavy,
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 16,
  },
  pillRow: {
    gap: 8,
  },
  pill: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 4,
  },
  pillActive: {
    backgroundColor: Colors.deepNavy,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  pillTextActive: {
    color: Colors.surface,
  },
  confirmBtn: {
    backgroundColor: Colors.success, // emerald-500
    borderRadius: 28,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
});
