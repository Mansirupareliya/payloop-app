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
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useBillStore } from '../store/billStore';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import {
  RootStackParamList,
  PaymentFrequency,
  PaymentMethod,
  ReminderOption,
} from '../types';
import { formatDate } from '../utils/dateUtils';
import { formatCurrencyInput } from '../utils/currencyUtils';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'AddBill'>;

const FREQUENCIES: PaymentFrequency[] = [
  'One time', 'Daily', 'Weekly', 'Monthly', 'Yearly',
];

const METHODS = [
  { id: 'UPI', label: 'UPI', icon: 'smartphone' },
  { id: 'Cash', label: 'Cash', icon: 'camera' }, // closest to cash/scan
  { id: 'Credit Card', label: 'Card', icon: 'credit-card' },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: 'home' },
  { id: 'Other', label: 'Other', icon: 'arrow-down-circle' },
];

const REMINDERS: ReminderOption[] = [
  '7 days before',
  '3 days before',
  '1 day before',
  'On due date'
];

export function AddBillScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { addBill, getBillById, updateBill } = useBillStore();

  const editBill = route.params?.billId ? getBillById(route.params.billId) : undefined;
  const isEditing = !!editBill;

  const [name, setName] = useState(editBill?.name ?? '');
  const [categoryId, setCategoryId] = useState(editBill?.categoryId ?? 'electricity');
  const [amount, setAmount] = useState(editBill ? String(editBill.amount) : '');

  const initialDate = editBill?.dueDate ? new Date(editBill.dueDate) : new Date();
  const [dueDateObj, setDueDateObj] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [frequency, setFrequency] = useState<PaymentFrequency>(editBill?.frequency ?? 'Monthly');
  const [method, setMethod] = useState<PaymentMethod>(editBill?.paymentMethod ?? 'UPI');
  const [autoRepeat, setAutoRepeat] = useState(editBill?.autoRepeat ?? true);
  const [reminder, setReminder] = useState(editBill?.reminders?.[0] ?? '7 days before');
  const [notes, setNotes] = useState(editBill?.notes ?? '');

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDateObj(selectedDate);
    }
  };

  function handleSave() {
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
      reminders: [reminder] as any,
      paymentMethod: method,
      notes: notes.trim(),
    };

    if (isEditing && editBill) {
      updateBill(editBill.id, billData);
    } else {
      addBill(billData);
    }
    navigation.goBack();
  }

  const selectedCategory = DEFAULT_CATEGORIES.find(c => c.id === categoryId) || DEFAULT_CATEGORIES[0];

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />



      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerIcon} hitSlop={16}>
          <Feather name="chevron-left" size={24} color="#0a235c" />
        </Pressable>
        <Text style={styles.title}>{isEditing ? 'Edit Bill' : 'Add New Bill'}</Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Bill Name */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Bill Name</Text>
          <View style={styles.glassInput}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Electricity Bill"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Category */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Category</Text>
          <Pressable style={styles.glassInputRow}>
            <Feather name={selectedCategory.icon as any} size={18} color="#1d4ed8" style={styles.inputIcon} />
            <Text style={styles.inputText}>{selectedCategory.name}</Text>
            <Feather name="chevron-down" size={18} color="#0a235c" />
          </Pressable>
        </View>

        {/* Amount */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.glassInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.textInput}
              placeholder="0"
              placeholderTextColor="#94a3b8"
              value={amount}
              onChangeText={t => setAmount(formatCurrencyInput(t))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Due Date</Text>
          <Pressable style={styles.glassInputRow} onPress={() => setShowDatePicker(true)}>
            <Feather name="calendar" size={18} color="#0a235c" style={styles.inputIcon} />
            <Text style={styles.inputText}>
              {formatDate(dueDateObj.toISOString())}
            </Text>
            <Feather name="calendar" size={18} color="#0a235c" />
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dueDateObj}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Payment Frequency */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Payment Frequency</Text>
          <View style={styles.glassInputRow}>
            <Text style={styles.inputText}>{frequency}</Text>
            <Feather name="chevron-down" size={18} color="#0a235c" />
          </View>
        </View>

        {/* Auto repeat */}
        <View style={[styles.inputWrap, styles.rowBetween]}>
          <Text style={styles.label}>Auto repeat</Text>
          <Switch
            value={autoRepeat}
            onValueChange={setAutoRepeat}
            trackColor={{ false: '#cbd5e1', true: '#1d4ed8' }}
            thumbColor={'#ffffff'}
          />
        </View>

        {/* Reminder */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Reminder</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
            {REMINDERS.map(rem => {
              const active = reminder === rem;
              return (
                <Pressable
                  key={rem}
                  style={[styles.pill, active && styles.pillActive]}
                  onPress={() => setReminder(rem)}
                >
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{rem}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Payment Method */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Payment Method</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.methodRow}>
            {METHODS.map(m => {
              const active = method === m.id;
              return (
                <Pressable
                  key={m.id}
                  style={[styles.methodBox, active && styles.methodBoxActive]}
                  onPress={() => setMethod(m.id as PaymentMethod)}
                >
                  <Feather name={m.icon as any} size={22} color={active ? '#ffffff' : '#0a235c'} />
                  <Text style={[styles.methodText, active && styles.methodTextActive]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Notes */}
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <View style={styles.glassInput}>
            <TextInput
              style={styles.textInput}
              placeholder="Electricity meter no..."
              placeholderTextColor="#94a3b8"
              value={notes}
              onChangeText={setNotes}
            />
          </View>
        </View>

        {/* Submit Button */}
        <Pressable style={styles.submitBtnContainer} onPress={handleSave}>
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
          <Text style={styles.submitBtnText}>{isEditing ? 'Update Bill' : 'Add Bill'}</Text>
        </Pressable>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f3f8ff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a235c',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  inputWrap: {
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0a235c',
    marginBottom: 8,
  },
  glassInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  glassInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  inputIcon: {
    marginRight: 10,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginRight: 8,
  },
  pillRow: {
    gap: 4,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  pillActive: {
    backgroundColor: '#3b82f6', // blue
    borderColor: '#3b82f6',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0a235c',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  methodRow: {
    gap: 12,
  },
  methodBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  methodBoxActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  methodText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0a235c',
  },
  methodTextActive: {
    color: '#ffffff',
  },
  submitBtnContainer: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
});
