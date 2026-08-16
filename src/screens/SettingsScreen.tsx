import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius, Shadow } from '../constants/theme';
import { useSettingsStore } from '../store/settingsStore';
import { useBillStore } from '../store/billStore';
import { formatCurrency } from '../utils/currencyUtils';
import { Card } from '../components/common/Card';

export function SettingsScreen() {
  const {
    userName,
    budget,
    notificationsEnabled,
    updateUserName,
    updateMonthlyBudget,
    toggleNotifications,
  } = useSettingsStore();
  const { bills, payments } = useBillStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);

  function saveName() {
    if (nameInput.trim()) updateUserName(nameInput.trim());
    setEditingName(false);
  }

  const totalBills = bills.length;
  const totalPaid  = bills.filter(b => b.isPaid).length;
  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.topBar}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Profile</Text>

          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.avatarInfo}>
              {editingName ? (
                <View style={styles.nameEditRow}>
                  <TextInput
                    style={styles.nameInput}
                    value={nameInput}
                    onChangeText={setNameInput}
                    autoFocus
                    onSubmitEditing={saveName}
                    returnKeyType="done"
                  />
                  <Pressable onPress={saveName} style={styles.saveBtn} hitSlop={8}>
                    <Text style={styles.saveBtnText}>Save</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => { setEditingName(true); setNameInput(userName); }}>
                  <Text style={styles.nameText}>{userName}</Text>
                  <Text style={styles.nameHint}>Tap to edit</Text>
                </Pressable>
              )}
            </View>
          </View>
        </Card>

        {/* Stats */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📊 My Stats</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Total Bills',    value: String(totalBills) },
              { label: 'Bills Paid',     value: String(totalPaid) },
              { label: 'Total Tracked',  value: formatCurrency(totalAmount) },
              { label: 'Monthly Budget', value: formatCurrency(budget.monthly) },
            ].map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Enable Notifications</Text>
              <Text style={styles.toggleHint}>Get reminded before bills are due</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={Colors.surface}
            />
          </View>
        </Card>

        {/* App Info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About PayLoop</Text>
          {[
            { label: 'Version', value: '1.0.0' },
            { label: 'Build',   value: 'Phase 1 MVP' },
            { label: 'Stack',   value: 'React Native + Expo' },
          ].map(row => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </Card>

        {/* Danger zone */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.danger }]}>⚠️ Data</Text>
          <Text style={styles.dangerHint}>
            All data is stored locally on your device. Uninstalling the app will remove all data.
          </Text>
        </Card>

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
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.textOnDark,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extrabold,
  },
  avatarInfo: {
    flex: 1,
  },
  nameText: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.textPrimary,
  },
  nameHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nameInput: {
    flex: 1,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryLight,
    paddingVertical: 4,
  },
  saveBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  saveBtnText: {
    color: Colors.textOnDark,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.bold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '46%',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.extrabold,
    color: Colors.primaryDark,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    color: Colors.textPrimary,
  },
  toggleHint: {
    fontSize: Typography.size.xs,
    color: Colors.textMuted,
    marginTop: 2,
    maxWidth: '80%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  infoValue: {
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
  },
  dangerHint: {
    fontSize: Typography.size.sm,
    color: Colors.textMuted,
    lineHeight: 20,
  },
});
