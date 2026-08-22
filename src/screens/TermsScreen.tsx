import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography, Spacing, Radius } from '../constants/theme';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By downloading, installing, or using PayLoop, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use the application.',
  },
  {
    title: '2. Use of the App',
    body: 'PayLoop is a personal bill and payment tracking application intended for individual use. You agree to use the app only for lawful purposes and in a manner consistent with these terms.',
  },
  {
    title: '3. Data Storage & Privacy',
    body: 'All your bill and payment data is stored securely on our servers and locally on your device. We do not sell or share your personal data with third parties. Your data is tied to your account and only accessible by you.',
  },
  {
    title: '4. Account Security',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss resulting from unauthorized use of your account.',
  },
  {
    title: '5. Accuracy of Information',
    body: 'PayLoop is a tracking tool only. We do not verify the accuracy of the bill data you enter. You are solely responsible for ensuring that the information you input is correct.',
  },
  {
    title: '6. Notifications & SMS',
    body: 'By enabling notifications or providing your phone number, you consent to receive bill reminders and payment alerts from PayLoop. You can disable these at any time in the Settings.',
  },
  {
    title: '7. Limitation of Liability',
    body: 'PayLoop is provided "as is" without warranties of any kind. We are not liable for any missed payments, financial losses, or damages arising from your use of the app or reliance on its reminders.',
  },
  {
    title: '8. Modifications',
    body: 'We reserve the right to update these Terms & Conditions at any time. Continued use of the app after changes are posted constitutes your acceptance of the revised terms.',
  },
  {
    title: '9. Termination',
    body: 'We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time, which will remove your data from our servers.',
  },
  {
    title: '10. Contact',
    body: 'If you have questions about these Terms & Conditions, please contact us through the PayLoop support channel.',
  },
];

export function TermsScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.shell}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={16}>
          <Feather name="chevron-left" size={24} color={Colors.deepNavy} />
        </Pressable>
        <Text style={styles.title}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated: August 2026</Text>

        <Text style={styles.intro}>
          Please read these Terms & Conditions carefully before using the PayLoop app.
        </Text>

        {SECTIONS.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
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

  scroll: { paddingHorizontal: Spacing.lg },

  lastUpdated: {
    fontSize: Typography.size.xs, color: Colors.textMuted,
    fontWeight: Typography.weight.medium, marginBottom: Spacing.md,
  },
  intro: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: 22, marginBottom: Spacing.lg,
    fontWeight: Typography.weight.medium,
  },

  section: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.lg, marginBottom: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: {
    fontSize: Typography.size.sm, fontWeight: Typography.weight.extrabold,
    color: Colors.deepNavy, marginBottom: Spacing.sm,
  },
  sectionBody: {
    fontSize: Typography.size.sm, color: Colors.textSecondary,
    lineHeight: 22, fontWeight: Typography.weight.medium,
  },
});
