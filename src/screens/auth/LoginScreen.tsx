import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';

type LoginNav = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginNav>();
  const login = useAuthStore(s => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try { await login(email, password); }
    catch (err: any) { setError(err.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.deepNavy} />

      {/* Dark header */}
      <View style={styles.header}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <Text style={styles.greeting}>Welcome back 👋</Text>
        <Text style={styles.brand}>PayLoop</Text>
        <Text style={styles.sub}>Manage all your bills in one place</Text>
      </View>

      {/* White card */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.cardTitle}>Sign In</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputRow}>
                <Feather name="mail" size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input} placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  value={email} onChangeText={setEmail}
                  keyboardType="email-address" autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputRow}>
                <Feather name="lock" size={16} color={Colors.textMuted} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.input} placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  value={password} onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={{ padding: 4 }}>
                  <Feather name={showPass ? 'eye' : 'eye-off'} size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin} disabled={loading}
            >
              {loading ? <ActivityIndicator color={Colors.accent} /> : <Text style={styles.loginBtnText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.deepNavy },

  header: {
    paddingTop: 64, paddingHorizontal: 28, paddingBottom: 40,
    position: 'relative', overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: Colors.darkBlue, top: -60, right: -50, opacity: 0.6,
  },
  circle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.accent, bottom: -20, left: -20, opacity: 0.12,
  },
  greeting: { fontSize: 13, color: Colors.textOnDarkMuted, fontWeight: '500', marginBottom: 8 },
  brand: { fontSize: 38, fontWeight: '900', color: Colors.accent, letterSpacing: -1, marginBottom: 6 },
  sub: { fontSize: 13, color: Colors.textOnDarkMuted },

  card: {
    flex: 1, backgroundColor: Colors.surface,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 28, paddingTop: 32,
  },
  cardTitle: {
    fontSize: 24, fontWeight: '800', color: Colors.textPrimary,
    marginBottom: 20, letterSpacing: -0.3,
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, borderWidth: 1,
    borderColor: '#fecaca', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14,
  },
  errorText: { flex: 1, color: Colors.danger, fontSize: 13, fontWeight: '500' },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceAlt, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, height: 52,
  },
  input: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 22 },
  forgotText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  loginBtn: {
    backgroundColor: Colors.deepNavy, borderRadius: 14,
    height: 54, justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  loginBtnText: { color: Colors.accent, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { color: Colors.textMuted, fontSize: 14 },
  signupLink: { color: Colors.textPrimary, fontSize: 14, fontWeight: '800' },
});
