import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { useBillStore } from '../store/billStore';
import { BillCard } from '../components/bills/BillCard';
import { RootStackParamList } from '../types';
import { isOverdue } from '../utils/dateUtils';

type NavProp = StackNavigationProp<RootStackParamList>;

type FilterTab = 'All' | 'Paid' | 'Pending' | 'Overdue';
const FILTER_TABS: FilterTab[] = ['All', 'Paid', 'Pending', 'Overdue'];

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
      <StatusBar barStyle="dark-content" backgroundColor="#f3f8ff" />

      <View style={styles.header}>
        <Pressable style={styles.headerIcon} onPress={() => (navigation as any).navigate('MainTabs')}>
          <Feather name="chevron-left" size={24} color="#1e293b" />
        </Pressable>
        <Text style={styles.title}>My Bills</Text>
        <Pressable style={styles.headerIcon} onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Profile' })}>
          <Feather name="settings" size={22} color="#1e293b" />
        </Pressable>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <Feather name="search" size={18} color="#94a3b8" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bills..."
          placeholderTextColor="#94a3b8"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* ── Filter Tabs ── */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {FILTER_TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Bill List ── */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {query ? 'No results found' : 'No bills found for this filter.'}
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
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f3f8ff',
  },

  // ── Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 17,
    paddingBottom: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#142449ff',
  },

  // ── Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e1e5eaff',
    marginHorizontal: 24,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },

  // ── Filter Tabs
  tabContainer: {
    marginBottom: 14,
  },
  tabRow: {
    paddingHorizontal: 24,
    gap: 5,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  tabActive: {
    backgroundColor: '#0a235c', // Dark blue from image
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  tabTextActive: {
    color: '#ffffff',
  },

  // ── List
  list: {
    paddingHorizontal: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
});
