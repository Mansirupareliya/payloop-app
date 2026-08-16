import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBillStore } from '../store/billStore';
import { formatCurrency } from '../utils/currencyUtils';
import { formatDate } from '../utils/dateUtils';
import { getCategoryById } from '../constants/categories';
import { format, parseISO, setYear, setMonth } from 'date-fns';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function HistoryScreen() {
  const navigation = useNavigation();
  const { payments } = useBillStore();

  // Selected date state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(selectedDate.getFullYear());

  const displayMonthLabel = format(selectedDate, 'MMMM yyyy');
  const filterMonthKey = format(selectedDate, 'MMMM yyyy');

  // Group payments by month
  const grouped: Record<string, typeof payments> = {};
  for (const p of payments) {
    try {
      const key = format(parseISO(p.paidDate), 'MMMM yyyy');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    } catch { /* skip */ }
  }

  // Get payments for the selected month only
  const monthPayments = grouped[filterMonthKey] || [];
  const monthTotal = monthPayments.reduce((s, p) => s + p.amount, 0);

  const handleSelectMonth = (monthIndex: number) => {
    let newDate = setYear(new Date(), pickerYear);
    newDate = setMonth(newDate, monthIndex);
    setSelectedDate(newDate);
    setShowPicker(false);
  };

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor="#f3f8ff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={16}>
          <Feather name="chevron-left" size={24} color="#0a235c" />
        </Pressable>
        <Text style={styles.title}>History</Text>

        <Pressable style={styles.monthButton} onPress={() => {
          setPickerYear(selectedDate.getFullYear());
          setShowPicker(true);
        }}>
          <Feather name="calendar" size={16} color="#0a235c" />
          <Text style={styles.monthButtonText}>{displayMonthLabel}</Text>
          <Feather name="chevron-down" size={16} color="#0a235c" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {monthPayments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No payment history.</Text>
            <Text style={styles.emptySubText}>No bills were paid in {displayMonthLabel}.</Text>
          </View>
        ) : (
          <View style={styles.monthCard}>
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{filterMonthKey}</Text>
              <Text style={styles.monthTotal}>{formatCurrency(monthTotal)}</Text>
            </View>

            {/* Payment Rows */}
            {monthPayments.map((p, idx, arr) => {
              const cat = getCategoryById(p.categoryId);
              return (
                <View key={p.id} style={[styles.payRow, idx === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.catIconWrap, { backgroundColor: cat.color || '#eff6ff' }]}>
                    <Feather name={cat.icon as any} size={20} color="#fff" />
                  </View>

                  <View style={styles.payInfo}>
                    <Text style={styles.payName}>{p.billName}</Text>
                    <Text style={styles.payMeta}>
                      {cat.name} • {p.paymentMethod}
                    </Text>
                    <Text style={styles.payDate}>{formatDate(p.paidDate)}</Text>
                  </View>

                  <View style={styles.payRight}>
                    <Text style={styles.payAmount}>{formatCurrency(p.amount)}</Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidBadgeText}>✓ Paid</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Month Footer */}
            <View style={styles.monthFooter}>
              <Text style={styles.monthFooterText}>
                {monthPayments.length} payment{monthPayments.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Month/Year Picker Modal ── */}
      <Modal visible={showPicker} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            {/* Year Selector */}
            <View style={styles.yearRow}>
              <Pressable onPress={() => setPickerYear(y => y - 1)} style={styles.yearBtn}>
                <Feather name="chevron-left" size={24} color="#0a235c" />
              </Pressable>
              <Text style={styles.yearText}>{pickerYear}</Text>
              <Pressable onPress={() => setPickerYear(y => y + 1)} style={styles.yearBtn}>
                <Feather name="chevron-right" size={24} color="#0a235c" />
              </Pressable>
            </View>

            {/* Months Grid */}
            <View style={styles.monthGrid}>
              {MONTHS.map((m, index) => {
                const isSelected = selectedDate.getMonth() === index && selectedDate.getFullYear() === pickerYear;
                return (
                  <Pressable
                    key={m}
                    style={[styles.monthBox, isSelected && styles.monthBoxSelected]}
                    onPress={() => handleSelectMonth(index)}
                  >
                    <Text style={[styles.monthBoxText, isSelected && styles.monthBoxTextSelected]}>{m}</Text>
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
    paddingTop: 14,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a235c',
  },
  monthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0a235c',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a235c',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },

  monthCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 0,
    marginBottom: 20,
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  monthTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  monthTotal: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 16,
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payInfo: {
    flex: 1,
    gap: 4,
  },
  payName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a235c',
  },
  payMeta: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
  },
  payDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  payRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  payAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  paidBadge: {
    backgroundColor: '#d1fae5', // green-100
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadgeText: {
    color: '#059669', // green-600
    fontSize: 10,
    fontWeight: '800',
  },
  monthFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  monthFooterText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },

  // ── Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  yearRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  yearBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a235c',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  monthBox: {
    width: '30%',
    aspectRatio: 1.5,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBoxSelected: {
    backgroundColor: '#1d4ed8',
  },
  monthBoxText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  monthBoxTextSelected: {
    color: '#ffffff',
  },
});
