import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius } from '../constants/theme';
import { useBillStore } from '../store/billStore';
import { BillCard } from '../components/bills/BillCard';
import { EmptyState } from '../components/common/EmptyState';
import { RootStackParamList, Bill } from '../types';
import { isOverdue, isDueToday } from '../utils/dateUtils';

type NavProp = StackNavigationProp<RootStackParamList>;

type FilterTab = 'All' | 'Upcoming' | 'Overdue' | 'Paid';
const FILTER_TABS: FilterTab[] = ['All', 'Upcoming', 'Overdue', 'Paid'];

export function BillsScreen() {
  const navigation = useNavigation<NavProp>();
  const { bills } = useBillStore();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');

  const filtered = bills.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesSearch) return false;

    switch (activeTab) {
      case 'Upcoming': return !b.isPaid && !isOverdue(b.dueDate, b.isPaid);
      case 'Overdue':  return !b.isPaid && isOverdue(b.dueDate, b.isPaid);
      case 'Paid':     return b.isPaid;
      default:         return true;
    }
  }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.surface} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Bills</Text>
        <Pressable
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddBill', {})}
        >
          <Feather name="plus" size={24} color={Colors.textPrimary} />
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bills..."
          placeholderTextColor={Colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={12}>
            <Feather name="x-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {FILTER_TABS.map(tab => {
            const count = bills.filter(b => {
              switch (tab) {
                case 'Upcoming': return !b.isPaid && !isOverdue(b.dueDate, b.isPaid);
                case 'Overdue':  return !b.isPaid && isOverdue(b.dueDate, b.isPaid);
                case 'Paid':     return b.isPaid;
                default:         return true;
              }
            }).length;

            return (
              <Pressable
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                  {tab}
                </Text>
                {count > 0 && (
                  <View style={[styles.tabBadge, activeTab === tab && styles.tabBadgeActive]}>
                    <Text style={[styles.tabBadgeText, activeTab === tab && styles.tabBadgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bill List */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={{ marginTop: 40 }}>
            <EmptyState
              emoji="📋"
              title={query ? 'No results found' : 'No bills here'}
              subtitle={query ? `No bills matching "${query}"` : 'Tap + to add your first bill'}
            />
          </View>
        ) : (
          filtered.map(bill => (
            <BillCard
              key={bill.id}
              bill={bill}
              onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
              onMarkPaid={() => navigation.navigate('BillDetail', { billId: bill.id })}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddBill', {})}
      >
        <Feather name="plus" size={24} color={Colors.textOnDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.surface, // Clean white background
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt, // Light gray
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  tabContainer: {
    marginBottom: Spacing.md,
  },
  tabRow: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceAlt,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textOnDark,
  },
  tabBadge: {
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBadgeTextActive: {
    color: Colors.textOnDark,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
});
