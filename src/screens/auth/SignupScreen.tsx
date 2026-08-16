import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  deepNavy:  '#001B48',
  darkBlue:  '#02457A',
  primary:   '#018ABE',
  lightBlue: '#97CADB',
  paleBlue:  '#D6E8EE',
  white:     '#FFFFFF',
};

export const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const signup = useAuthStore((state) => state.signup);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await signup(email, password, phone || undefined);
      navigation.navigate('Congratulations');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.deepNavy} />

      {/* ── Compact dark header ── */}
      <View style={styles.header}>
        <View style={styles.circleTopRight} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={20} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <Text style={styles.headerSub}>Join PayLoop — it's free</Text>
      </View>

      {/* ── Form card ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.cardTitle}>Sign Up</Text>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputRow}>
                <Feather name="mail" size={16} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputRow}>
                <Feather name="lock" size={16} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  <Feather name={showPass ? 'eye' : 'eye-off'} size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <Feather name="lock" size={16} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Repeat your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPass}
                />
                <TouchableOpacity onPress={() => setShowConfirmPass(p => !p)} style={styles.eyeBtn}>
                  <Feather name={showConfirmPass ? 'eye' : 'eye-off'} size={16} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone (optional)</Text>
              <View style={styles.inputRow}>
                <Feather name="phone" size={16} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your phone number"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signupBtn, loading && styles.signupBtnDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <Text style={styles.signupBtnText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
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
  container: {
    flex: 1,
    backgroundColor: C.deepNavy,
  },

  // ── Header
  header: {
    paddingTop: 56,
    paddingHorizontal: 28,
    paddingBottom: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  circleTopRight: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: C.darkBlue,
    top: -50,
    right: -40,
    opacity: 0.6,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: C.white,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 13,
    color: C.lightBlue,
    fontWeight: '400',
  },

  // ── Card
  formWrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: C.white,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.deepNavy,
    marginBottom: 16,
    letterSpacing: -0.5,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },

  // Input
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 4,
  },

  // Signup button
  signupBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  signupBtnDisabled: {
    opacity: 0.7,
  },
  signupBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Login
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: C.lightBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
