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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { PillSelector } from '../components/common/PillSelector';
import {
  RootStackParamList,
  PaymentFrequency,
  PaymentMethod,
} from '../types';
import { formatDate } from '../utils/dateUtils';
import { formatCurrencyInput } from '../utils/currencyUtils';

type NavProp = StackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'AddBill'>;

const FREQUENCIES: PaymentFrequency[] = [
  'One time', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-yearly', 'Yearly',
];
const METHODS: PaymentMethod[] = [
  'UPI', 'Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other',
];

export function AddBillScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { addBill, getBillById, updateBill } = useBillStore();

  const editBill = route.params?.billId ? getBillById(route.params.billId) : undefined;
  const isEditing = !!editBill;

  const [name,       setName]       = useState(editBill?.name ?? '');
  const [categoryId, setCategoryId] = useState(editBill?.categoryId ?? 'electricity');
  const [amount,     setAmount]     = useState(editBill ? String(editBill.amount) : '');
  
  // Date Picker State
  const initialDate = editBill?.dueDate ? new Date(editBill.dueDate) : new Date();
  const [dueDateObj, setDueDateObj] = useState(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [frequency,  setFrequency]  = useState<PaymentFrequency>(editBill?.frequency ?? 'Monthly');
  const [method,     setMethod]     = useState<PaymentMethod>(editBill?.paymentMethod ?? 'Bank Transfer');

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
    const parsedAmount = parseFloat(amount);
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
      autoRepeat: false, // Removed auto repeat from UI, defaulting to false
      reminders: ['3 days before'] as any, // Kept default reminder internally
      paymentMethod: method,
      notes: '', // Removed from UI to simplify classic form
    };

    if (isEditing && editBill) {
      updateBill(editBill.id, billData);
    } else {
      addBill(billData);
    }
    navigation.goBack();
  }

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={16}>
          <Feather name="chevron-left" size={28} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.screenTitle}>{isEditing ? 'Edit Bill' : 'New Bill'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Large Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={Colors.textMuted}
              value={amount}
              onChangeText={t => setAmount(formatCurrencyInput(t))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        </View>

        {/* Bill Details Form - Classic Professional Style */}
        <View style={styles.formSection}>
          
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Bill Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Internet Bill"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {DEFAULT_CATEGORIES.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[styles.catChip, categoryId === cat.id && styles.catChipActive]}
                  onPress={() => setCategoryId(cat.id)}
                >
                  <Text style={[styles.catChipText, categoryId === cat.id && styles.catChipTextActive]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Due Date</Text>
            <Pressable 
              style={styles.dateInputContainer} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {formatDate(dueDateObj.toISOString())}
              </Text>
              <Feather name="calendar" size={20} color={Colors.textSecondary} />
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

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Payment Frequency</Text>
            <PillSelector
              options={FREQUENCIES}
              selected={frequency}
              onSelect={f => setFrequency(f as PaymentFrequency)}
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Payment Method</Text>
            <PillSelector
              options={METHODS}
              selected={method}
              onSelect={m => setMethod(m as PaymentMethod)}
            />
          </View>

        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button at Bottom */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>
            {isEditing ? 'Update Bill' : 'Confirm'}
          </Text>
          <Feather name="check" size={20} color={Colors.textOnDark} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.surface, // Pure white background
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: 56,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scroll: {
    paddingTop: Spacing.md,
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.xl,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 42,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 4,
    marginBottom: 4,
  },
  amountInput: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.textPrimary,
    minWidth: 120,
    textAlign: 'center',
  },
  formSection: {
    paddingHorizontal: Spacing.xl,
  },
  inputWrap: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
  },
  dateText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  catScroll: {
    marginHorizontal: -Spacing.xs,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  catChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  catChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
    paddingBottom: 40,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  saveBtn: {
    backgroundColor: Colors.primaryDark,
    flexDirection: 'row',
    borderRadius: Radius.lg,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: Colors.textOnDark,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
