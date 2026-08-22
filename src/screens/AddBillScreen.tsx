import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  StatusBar,
  Platform,
  Switch,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useBillStore } from '../store/billStore';
import { usePhotoStore } from '../store/photoStore';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { Colors } from '../constants/colors';
import {
  RootStackParamList,
  PaymentFrequency,
  PaymentMethod,
  ReminderOption,
} from '../types';
import { formatDate } from '../utils/dateUtils';
import { formatCurrencyInput } from '../utils/currencyUtils';

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'AddBill'>;

const FREQUENCIES: PaymentFrequency[] = [
  'One time', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly',
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'UPI',           label: 'UPI',          icon: 'zap' },
  { id: 'Cash',          label: 'Cash',         icon: 'dollar-sign' },
  { id: 'Credit Card',   label: 'Credit',       icon: 'credit-card' },
  { id: 'Debit Card',    label: 'Debit',        icon: 'credit-card' },
  { id: 'Bank Transfer', label: 'Bank',         icon: 'repeat' },
  { id: 'Other',         label: 'Other',        icon: 'more-horizontal' },
];

const REMINDERS: ReminderOption[] = [
  '7 days before', '3 days before', '1 day before', 'On due date',
];

export function AddBillScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { addBill, getBillById, updateBill } = useBillStore();
  const { setPhoto, getPhoto } = usePhotoStore();

  const editBill = route.params?.billId ? getBillById(route.params.billId) : undefined;
  const isEditing = !!editBill;

  const [name, setName]           = useState(editBill?.name ?? '');
  const [categoryId, setCategoryId] = useState(editBill?.categoryId ?? 'electricity');
  const [amount, setAmount]       = useState(editBill ? String(editBill.amount) : '');
  const [dueDateObj, setDueDateObj] = useState(
    editBill?.dueDate ? new Date(editBill.dueDate) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState<PaymentFrequency>(editBill?.frequency ?? 'Monthly');
  const [method, setMethod]       = useState<PaymentMethod>(editBill?.paymentMethod ?? 'UPI');
  const [autoRepeat, setAutoRepeat] = useState(editBill?.autoRepeat ?? true);
  const [reminder, setReminder]   = useState<ReminderOption>(editBill?.reminders?.[0] ?? '1 day before');
  const [notes, setNotes]         = useState(editBill?.notes ?? '');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [billPhoto, setBillPhoto]     = useState<string | null>(
    editBill ? (getPhoto(editBill.id) ?? null) : null
  );
  const [scanning, setScanning]       = useState(false);
  const [scanResult, setScanResult]   = useState<{ billName: string | null; amount: string; rawText: string } | null>(null);
  const [showScanModal, setShowScanModal] = useState(false);

  const selectedCategory = DEFAULT_CATEGORIES.find(c => c.id === categoryId) ?? DEFAULT_CATEGORIES[0];

  async function runOCR(uri: string) {
    setScanning(true);
    try {
      const formData = new FormData();
      formData.append('image', { uri, name: 'bill.jpg', type: 'image/jpeg' } as any);
      const response = await fetch('http://192.168.29.112:4000/api/scan', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setScanResult({
        billName: data.billName ?? '',
        amount:   data.amount ? String(data.amount) : '',
        rawText:  data.rawText ?? '',
      });
      setShowScanModal(true);
    } catch {
      // Network error — still open modal so user can type manually
      setScanResult({ billName: '', amount: '', rawText: '' });
      setShowScanModal(true);
    } finally {
      setScanning(false);
    }
  }

  async function handleScanBill() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to scan bills.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setBillPhoto(result.assets[0].uri);
    await runOCR(result.assets[0].uri);
  }

  async function handlePickFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (result.canceled || !result.assets[0]) return;
    setBillPhoto(result.assets[0].uri);
    await runOCR(result.assets[0].uri);
  }

  function applyScanResult() {
    if (scanResult?.billName) setName(scanResult.billName);
    if (scanResult?.amount)   setAmount(scanResult.amount);
    setShowScanModal(false);
  }

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDueDateObj(selectedDate);
  };

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please enter a bill name.');
      return;
    }
    const parsedAmount = parseFloat(amount.replace(/,/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Missing Info', 'Please enter a valid amount.');
      return;
    }
    const billData = {
      name: name.trim(),
      categoryId,
      amount: parsedAmount,
      dueDate: dueDateObj.toISOString(),
      frequency,
      autoRepeat,
      reminders: [reminder] as ReminderOption[],
      paymentMethod: method,
      notes: notes.trim(),
    };
    if (isEditing && editBill) {
      updateBill(editBill.id, billData);
      if (billPhoto) setPhoto(editBill.id, billPhoto);
    } else {
      const newId = await addBill(billData);
      if (billPhoto && newId) setPhoto(newId, billPhoto);
    }
    navigation.goBack();
  }

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={12}>
          <Feather name="chevron-left" size={22} color={Colors.deepNavy} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Bill' : 'Add New Bill'}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Scan Bill Photo ── */}
        <View style={styles.scanCard}>
          {billPhoto ? (
            <View style={styles.scanPreview}>
              <Image source={{ uri: billPhoto }} style={styles.scanImage} resizeMode="cover" />
              {scanning && (
                <View style={styles.scanOverlay}>
                  <ActivityIndicator size="large" color={Colors.accent} />
                  <Text style={styles.scanningText}>Reading bill...</Text>
                </View>
              )}
              {!scanning && (
                <Pressable style={styles.rescanBtn} onPress={handleScanBill}>
                  <Feather name="refresh-cw" size={14} color={Colors.textOnDark} />
                  <Text style={styles.rescanText}>Rescan</Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={styles.scanActions}>
              <Pressable style={styles.scanBtn} onPress={handleScanBill}>
                <View style={styles.scanBtnIcon}>
                  <Feather name="camera" size={22} color={Colors.deepNavy} />
                </View>
                <Text style={styles.scanBtnTitle}>Scan Bill</Text>
                <Text style={styles.scanBtnSub}>Take a photo to auto-fill</Text>
              </Pressable>

              <View style={styles.scanDivider} />

              <Pressable style={styles.scanBtn} onPress={handlePickFromGallery}>
                <View style={styles.scanBtnIcon}>
                  <Feather name="image" size={22} color={Colors.deepNavy} />
                </View>
                <Text style={styles.scanBtnTitle}>From Gallery</Text>
                <Text style={styles.scanBtnSub}>Pick an existing photo</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ── Bill Name ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bill Name</Text>
          <View style={styles.inputCard}>
            <Feather name="file-text" size={18} color={Colors.lightBlue} style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Electricity Bill"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* ── Category ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Category</Text>
          <Pressable style={styles.inputCard} onPress={() => setShowCategoryModal(true)}>
            <View style={[styles.catDot, { backgroundColor: selectedCategory.bgColor }]}>
              <Feather name={selectedCategory.icon as any} size={16} color={selectedCategory.color} />
            </View>
            <Text style={styles.inputValue}>{selectedCategory.name}</Text>
            <Feather name="chevron-down" size={18} color={Colors.darkBlue} />
          </Pressable>
        </View>

        {/* ── Amount ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Amount</Text>
          <View style={styles.inputCard}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={[styles.textInput, { fontSize: 20, fontWeight: '700' }]}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              value={amount}
              onChangeText={t => setAmount(formatCurrencyInput(t))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* ── Due Date ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Due Date</Text>
          <Pressable style={styles.inputCard} onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={18} color={Colors.lightBlue} style={styles.inputIcon} />
            <Text style={styles.inputValue}>{formatDate(dueDateObj.toISOString())}</Text>
            <Feather name="edit-2" size={14} color={Colors.darkBlue} />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dueDateObj}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* ── Frequency ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payment Frequency</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {FREQUENCIES.map(f => {
              const active = frequency === f;
              return (
                <Pressable
                  key={f}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{f}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Auto Repeat ── */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: Colors.accentLight }]}>
              <Feather name="refresh-cw" size={16} color={Colors.deepNavy} />
            </View>
            <View>
              <Text style={styles.toggleTitle}>Auto Repeat</Text>
              <Text style={styles.toggleSub}>Automatically add next bill after due date</Text>
            </View>
          </View>
          <Switch
            value={autoRepeat}
            onValueChange={setAutoRepeat}
            trackColor={{ false: Colors.border, true: Colors.accent }}
            thumbColor={Colors.surface}
          />
        </View>

        {/* ── Reminder ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Reminder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {REMINDERS.map(rem => {
              const active = reminder === rem;
              return (
                <Pressable
                  key={rem}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setReminder(rem)}
                >
                  <Feather
                    name="bell"
                    size={12}
                    color={active ? '#fff' : Colors.darkBlue}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{rem}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── Payment Method ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Payment Method</Text>
          <View style={styles.methodGrid}>
            {PAYMENT_METHODS.map(m => {
              const active = method === m.id;
              return (
                <Pressable
                  key={m.id}
                  style={[styles.methodBox, active && styles.methodBoxActive]}
                  onPress={() => setMethod(m.id)}
                >
                  <Feather
                    name={m.icon as any}
                    size={20}
                    color={active ? '#fff' : Colors.textSecondary}
                  />
                  <Text style={[styles.methodText, active && styles.methodTextActive]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Notes ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes <Text style={styles.optional}>(Optional)</Text></Text>
          <View style={[styles.inputCard, { alignItems: 'flex-start', paddingVertical: 14 }]}>
            <Feather name="edit-3" size={16} color={Colors.lightBlue} style={[styles.inputIcon, { marginTop: 2 }]} />
            <TextInput
              style={[styles.textInput, { minHeight: 60 }]}
              placeholder="Add notes or account number..."
              placeholderTextColor={Colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* ── Submit Button ── */}
        <Pressable style={styles.submitBtn} onPress={handleSave}>
          <Feather name={isEditing ? 'check' : 'plus'} size={20} color={Colors.textOnDark} style={{ marginRight: 8 }} />
          <Text style={styles.submitBtnText}>{isEditing ? 'Update Bill' : 'Add Bill'}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Scan Result Modal ── */}
      <Modal visible={showScanModal} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setShowScanModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Scan Result</Text>

          {billPhoto && (
            <Image source={{ uri: billPhoto }} style={styles.resultThumb} resizeMode="cover" />
          )}

          <Text style={styles.scanFieldLabel}>Bill Name</Text>
          <View style={styles.scanFieldRow}>
            <TextInput
              style={styles.scanFieldInput}
              value={scanResult?.billName ?? ''}
              onChangeText={t => setScanResult(r => r ? { ...r, billName: t } : r)}
              placeholder="Enter bill name..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <Text style={styles.scanFieldLabel}>Amount (₹)</Text>
          <View style={styles.scanFieldRow}>
            <TextInput
              style={styles.scanFieldInput}
              value={scanResult?.amount ?? ''}
              onChangeText={t => setScanResult(r => r ? { ...r, amount: t } : r)}
              placeholder="Enter amount..."
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>

          {scanResult?.rawText ? (
            <View style={styles.rawTextBox}>
              <Text style={styles.rawTextLabel}>Detected text from bill:</Text>
              <Text style={styles.rawText} numberOfLines={4}>{scanResult.rawText}</Text>
            </View>
          ) : (
            <View style={styles.rawTextBox}>
              <Text style={styles.rawTextLabel}>Could not read text from image.</Text>
              <Text style={styles.rawText}>Please enter name and amount manually above.</Text>
            </View>
          )}

          <Pressable style={styles.applyBtn} onPress={applyScanResult}>
            <Feather name="check" size={18} color={Colors.accent} />
            <Text style={styles.applyBtnText}>Apply to Form</Text>
          </Pressable>
        </View>
      </Modal>

      {/* ── Category Modal ── */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select Category</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.catGrid}>
              {DEFAULT_CATEGORIES.map(cat => {
                const active = categoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catItem, active && styles.catItemActive]}
                    onPress={() => {
                      setCategoryId(cat.id);
                      setShowCategoryModal(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.catIconBox, { backgroundColor: active ? cat.color : cat.bgColor }]}>
                      <Feather name={cat.icon as any} size={20} color={active ? '#fff' : cat.color} />
                    </View>
                    <Text style={[styles.catName, active && { color: cat.color, fontWeight: '700' }]} numberOfLines={2}>
                      {cat.name}
                    </Text>
                    {active && (
                      <View style={[styles.catCheck, { backgroundColor: cat.color }]}>
                        <Feather name="check" size={10} color={Colors.textOnDark} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
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

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: Colors.background,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.deepNavy,
  },
  // ── Scroll ──
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // ── Scan Card ──
  scanCard: {
    backgroundColor: Colors.surface, borderRadius: 18, marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  scanActions: { flexDirection: 'row' },
  scanBtn: { flex: 1, alignItems: 'center', paddingVertical: 20, gap: 8 },
  scanBtnIcon: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: Colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  scanBtnTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  scanBtnSub: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  scanDivider: { width: 1, backgroundColor: Colors.borderLight, marginVertical: 14 },
  scanPreview: { height: 180, position: 'relative' },
  scanImage: { width: '100%', height: '100%' },
  scanOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,10,10,0.6)',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  scanningText: { color: Colors.accent, fontSize: 13, fontWeight: '700' },
  rescanBtn: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.deepNavy, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  rescanText: { color: Colors.textOnDark, fontSize: 11, fontWeight: '700' },

  // ── Section ──
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  optional: {
    fontWeight: '400',
    color: Colors.textMuted,
  },

  // ── Input Card ──
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.deepNavy,
  },
  inputValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.deepNavy,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.darkBlue,
    marginRight: 8,
  },
  catDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  // ── Pills ──
  pillRow: {
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: Colors.deepNavy,
    borderColor: Colors.deepNavy,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
  },

  // ── Toggle Card ──
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.deepNavy,
  },
  toggleSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // ── Payment Methods ──
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  methodBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 6,
    minWidth: 88,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  methodBoxActive: {
    backgroundColor: Colors.deepNavy,
    borderColor: Colors.deepNavy,
  },
  methodText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  methodTextActive: {
    color: '#fff',
  },

  // ── Submit Button ──
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.deepNavy,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Scan Result Modal fields ──
  resultThumb: {
    width: '100%', height: 120, borderRadius: 12, marginBottom: 16,
  },
  scanFieldLabel: {
    fontSize: 12, fontWeight: '700', color: Colors.textSecondary,
    marginBottom: 6, marginTop: 4,
  },
  scanFieldRow: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  scanFieldInput: {
    fontSize: 15, fontWeight: '600', color: Colors.textPrimary, paddingVertical: 8,
  },
  rawTextBox: {
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  rawTextLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 4,
  },
  rawText: {
    fontSize: 11, color: Colors.textSecondary, lineHeight: 16,
  },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.deepNavy, borderRadius: 14,
    paddingVertical: 14, gap: 8,
  },
  applyBtnText: {
    fontSize: 15, fontWeight: '700', color: Colors.surface,
  },

  // ── Category Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.deepNavy,
    marginBottom: 16,
    textAlign: 'center',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  catItem: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  catItemActive: {
    borderColor: Colors.deepNavy,
    backgroundColor: Colors.surfaceAlt,
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.darkBlue,
    textAlign: 'center',
  },
  catCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
