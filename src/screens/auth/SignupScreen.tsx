import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';

type SignupNav = StackNavigationProp<AuthStackParamList, 'Signup'>;

export const SignupScreen = () => {
  const navigation = useNavigation<SignupNav>();
  const signup = useAuthStore(s => s.signup);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signup(email, password, phone || undefined);
      navigation.navigate('Congratulations');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.deepNavy} />

      <View style={styles.header}>
        <View style={styles.circle} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={Colors.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Join PayLoop — it's free</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.cardTitle}>Sign Up</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {[
              { label: 'Email', icon: 'mail', value: email, set: setEmail, keyboard: 'email-address' as any, secure: false, show: false, setShow: null },
              { label: 'Password', icon: 'lock', value: password, set: setPassword, keyboard: 'default' as any, secure: !showPass, show: showPass, setShow: setShowPass },
              { label: 'Confirm Password', icon: 'lock', value: confirmPassword, set: setConfirmPassword, keyboard: 'default' as any, secure: !showConfirm, show: showConfirm, setShow: setShowConfirm },
            ].map(f => (
              <View key={f.label} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <View style={styles.inputRow}>
                  <Feather name={f.icon as any} size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder={`Enter your ${f.label.toLowerCase()}`}
                    placeholderTextColor={Colors.textMuted}
                    value={f.value} onChangeText={f.set}
                    keyboardType={f.keyboard}
                    autoCapitalize="none"
                    secureTextEntry={f.secure}
                  />
                  {f.setShow && (
                    <TouchableOpacity onPress={() => f.setShow!((p: boolean) => !p)} style={{ padding: 4 }}>
                      <Feather name={f.show ? 'eye' : 'eye-off'} size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone <Text style={{ color: Colors.textMuted, fontWeight: '400' }}>(optional)</Text></Text>
              <View style={styles.inputRow}>
                <Feather name="phone" size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input} placeholder="Your phone number"
                  placeholderTextColor={Colors.textMuted}
                  value={phone} onChangeText={setPhone} keyboardType="phone-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.signupBtn, loading && { opacity: 0.7 }]}
              onPress={handleSignup} disabled={loading}
            >
              {loading ? <ActivityIndicator color={Colors.accent} /> : <Text style={styles.signupBtnText}>Create Account</Text>}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepNavy },

  header: {
    paddingTop: 56, paddingHorizontal: 28, paddingBottom: 32,
    position: 'relative', overflow: 'hidden',
  },
  circle: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.darkBlue, top: -50, right: -40, opacity: 0.6,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '900', color: Colors.surface, letterSpacing: -0.5, marginBottom: 4 },
  headerSub: { fontSize: 13, color: Colors.textOnDarkMuted },

  card: {
    flex: 1, backgroundColor: Colors.surface,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 28, paddingTop: 28,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 16, letterSpacing: -0.3 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderWidth: 1,
    borderColor: '#fecaca', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
  },
  errorText: { flex: 1, color: Colors.danger, fontSize: 13, fontWeight: '500' },

  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },

  signupBtn: {
    backgroundColor: Colors.deepNavy, borderRadius: 14,
    height: 54, justifyContent: 'center', alignItems: 'center',
    marginTop: 8, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  signupBtnText: { color: Colors.accent, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { color: Colors.textMuted, fontSize: 14 },
  loginLink: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
});
