import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  TextInput, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useBillStore } from '../store/billStore';
import { BillCard } from '../components/bills/BillCard';
import { Colors } from '../constants/colors';
import { RootStackParamList } from '../types';
import { isOverdue } from '../utils/dateUtils';

type NavProp = StackNavigationProp<RootStackParamList>;
type FilterTab = 'All' | 'Paid' | 'Pending' | 'Overdue';
const FILTER_TABS: FilterTab[] = ['All', 'Pending', 'Paid', 'Overdue'];

export function BillsScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills } = useBillStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filtered = bills.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesSearch) return false;
    switch (activeTab) {
      case 'Pending': return !b.isPaid && !isOverdue(b.dueDate, b.isPaid);
      case 'Overdue': return !b.isPaid && isOverdue(b.dueDate, b.isPaid);
      case 'Paid': return b.isPaid;
      default: return true;
    }
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>My Bills</Text>
        <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('AddBill', {})}>
          <Feather name="plus" size={20} color={Colors.surface} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bills..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <Feather name="x" size={16} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
        {FILTER_TABS.map(tab => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bill List */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={Colors.border} />
            <Text style={styles.emptyText}>
              {query ? 'No results found' : 'No bills in this category'}
            </Text>
          </View>
        ) : (
          filtered.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
            />
          ))
        )}
        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 10,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  iconBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.deepNavy,
    alignItems: 'center', justifyContent: 'center',
  },

  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, marginHorizontal: 24,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textPrimary, fontWeight: '500' },

  tabRow: { paddingHorizontal: 24, gap: 8, marginBottom: 8, alignItems: 'center' },
  tab: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  tabActive: { backgroundColor: Colors.deepNavy, borderColor: Colors.deepNavy },
  tabText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: Colors.surface },

  list: { paddingHorizontal: 16, paddingTop: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
});
