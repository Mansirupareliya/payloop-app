import React from 'react';
import { View, Text, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography, Spacing } from '../constants/theme';

export function SubscriptionsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={16}>
          <Feather name="chevron-left" size={24} color={Colors.deepNavy} />
        </Pressable>
        <Text style={styles.title}>Subscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Feather name="repeat" size={40} color={Colors.primaryLight} />
        </View>
        <Text style={styles.comingSoon}>Coming Soon</Text>
        <Text style={styles.sub}>
          Subscription tracking is free and will be available in the next update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: Spacing.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.size.lg, fontWeight: Typography.weight.extrabold, color: Colors.textPrimary },

  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  comingSoon: {
    fontSize: Typography.size['2xl'], fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary, marginBottom: Spacing.sm,
  },
  sub: {
    fontSize: Typography.size.sm, color: Colors.textMuted,
    textAlign: 'center', lineHeight: 22,
    fontWeight: Typography.weight.medium,
  },
});
