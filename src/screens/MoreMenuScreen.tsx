import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { MoreStackParamList } from '../types';
import { useAuthStore } from '../store/authStore';

type NavProp = StackNavigationProp<MoreStackParamList>;

interface MenuItem {
  icon: string;
  label: string;
  subtitle: string;
  screen: keyof MoreStackParamList;
  accent?: string;
}

const MENU_ITEMS: MenuItem[] = [
  {
    icon: '📊',
    label: 'Analytics',
    subtitle: 'Spending charts & insights',
    screen: 'Analytics',
  },
  {
    icon: '💰',
    label: 'Budget',
    subtitle: 'Set monthly & category limits',
    screen: 'Budget',
  },
  {
    icon: '📜',
    label: 'Payment History',
    subtitle: 'All past payments',
    screen: 'History',
  },
  {
    icon: '📺',
    label: 'Subscriptions',
    subtitle: 'OTT, internet & recurring services',
    screen: 'Subscriptions',
  },
  {
    icon: '⚙️',
    label: 'Settings',
    subtitle: 'Profile, notifications & more',
    screen: 'Settings',
  },
];

export function MoreMenuScreen() {
  const navigation = useNavigation<NavProp>();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* PayLoop branding */}
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>₹</Text>
          </View>
          <View>
            <Text style={styles.brandName}>PayLoop</Text>
            <Text style={styles.brandTagline}>Manage all your bills in one place</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map(item => (
            <Pressable
              key={item.screen}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuIconWrap}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSub}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuChevron}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* Premium Banner */}
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumEmoji}>⭐</Text>
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>PayLoop Pro</Text>
            <Text style={styles.premiumSub}>Unlimited bills, advanced analytics, cloud sync</Text>
          </View>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Soon</Text>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>🚪  Logout</Text>
        </Pressable>

        <View style={{ height: 90 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.primaryDark,
    borderRadius: Radius['2xl'],
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadow.blue,
  },
  brandIcon: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    fontSize: 26,
    fontWeight: Typography.weight.black,
    color: Colors.textOnDark,
  },
  brandName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textOnDark,
  },
  brandTagline: {
    fontSize: Typography.size.xs,
    color: Colors.textOnDarkMuted,
    marginTop: 2,
  },
  menuList: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    overflow: 'hidden',
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  menuItemPressed: {
    backgroundColor: Colors.surfaceAlt,
  },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuText: {
    flex: 1,
    gap: 1,
  },
  menuLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  menuSub: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.medium,
  },
  menuChevron: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: Typography.weight.bold,
  },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumEmoji: {
    fontSize: 28,
  },
  premiumText: {
    flex: 1,
    gap: 2,
  },
  premiumTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.extrabold,
    color: '#92400E',
  },
  premiumSub: {
    fontSize: Typography.size.xs,
    color: '#B45309',
    lineHeight: 16,
  },
  premiumBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  premiumBadgeText: {
    color: Colors.textOnDark,
    fontSize: 11,
    fontWeight: Typography.weight.bold,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: Radius.xl,
    paddingVertical: Spacing.base,
    marginTop: Spacing.base,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonPressed: {
    opacity: 0.75,
  },
  logoutText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: '#dc2626',
  },
});
