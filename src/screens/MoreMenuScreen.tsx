import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Pressable, StatusBar, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { MoreStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

type NavProp = StackNavigationProp<MoreStackParamList>;

const MENU_ITEMS = [
  { icon: 'bar-chart-2', label: 'Analytics',       subtitle: 'Spending charts & insights',       screen: 'Analytics' as const },
  { icon: 'clock',       label: 'Payment History',  subtitle: 'All past payments',                screen: 'History' as const },
  { icon: 'repeat',      label: 'Subscriptions',    subtitle: 'OTT, internet & recurring services',screen: 'Subscriptions' as const },
  { icon: 'settings',    label: 'Settings',         subtitle: 'Profile, notifications & more',    screen: 'Settings' as const },
  { icon: 'file-text',  label: 'Terms & Conditions', subtitle: 'Usage policy & legal information', screen: 'Terms' as const },
];

export function MoreMenuScreen() {
  const navigation = useNavigation<NavProp>();
  const logout = useAuthStore(s => s.logout);
  const { userName } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {(userName || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{userName || 'PayLoop User'}</Text>
            <Text style={styles.userSub}>Premium Member</Text>
          </View>
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>PRO</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable
              key={item.screen}
              style={({ pressed }) => [
                styles.menuItem,
                index === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 },
                pressed && { backgroundColor: Colors.surfaceAlt },
              ]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuIconBox}>
                <Feather name={item.icon as any} size={18} color={Colors.textPrimary} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.75 }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color={Colors.danger} style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>

        <View style={{ height: 140 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 24, paddingTop: 52, paddingBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },

  scroll: { paddingHorizontal: 20 },

  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.deepNavy, borderRadius: 20,
    padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 10, elevation: 6,
  },
  userAvatar: {
    width: 50, height: 50, borderRadius: 14,
    backgroundColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  userAvatarText: { fontSize: 22, fontWeight: '800', color: Colors.deepNavy },
  userName: { fontSize: 16, fontWeight: '800', color: Colors.surface },
  userSub: { fontSize: 12, color: Colors.textOnDarkMuted, marginTop: 2 },
  userBadge: {
    backgroundColor: Colors.accent, paddingHorizontal: 10,
    paddingVertical: 5, borderRadius: 20,
  },
  userBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.deepNavy },

  menuCard: {
    backgroundColor: Colors.surface, borderRadius: 20,
    overflow: 'hidden', marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: 14,
  },
  menuIconBox: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  menuSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface, borderRadius: 14,
    paddingVertical: 16, borderWidth: 1.5, borderColor: Colors.border,
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});
