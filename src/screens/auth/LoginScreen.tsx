import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  deepNavy:  '#001B48',
  darkBlue:  '#02457A',
  primary:   '#018ABE',
  lightBlue: '#97CADB',
  paleBlue:  '#D6E8EE',
  white:     '#FFFFFF',
};

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.deepNavy} />

      {/* ── Dark navy header ── */}
      <View style={styles.header}>
        {/* Decorative circles */}
        <View style={styles.circleTopRight} />
        <View style={styles.circleBottomLeft} />

        <Text style={styles.headerGreeting}>Good Morning! 👋</Text>
        <Text style={styles.headerTitle}>Welcome to</Text>
        <Text style={styles.headerBrand}>PayLoop</Text>
        <Text style={styles.headerSub}>Manage all your bills in one place</Text>
      </View>

      {/* ── White card form ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formWrapper}
      >
        <View style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.cardTitle}>Login</Text>

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
                placeholder="Enter your password"
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

          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Sign up link */}
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
  container: {
    flex: 1,
    backgroundColor: C.deepNavy,
  },

  // ── Header
  header: {
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 36,
    position: 'relative',
    overflow: 'hidden',
  },
  circleTopRight: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: C.darkBlue,
    top: -60,
    right: -50,
    opacity: 0.6,
  },
  circleBottomLeft: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.primary,
    bottom: -30,
    left: -30,
    opacity: 0.25,
  },
  headerGreeting: {
    fontSize: 13,
    color: C.lightBlue,
    fontWeight: '500',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
  },
  headerBrand: {
    fontSize: 36,
    fontWeight: '900',
    color: C.primary,
    letterSpacing: -1,
    marginBottom: 8,
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
    paddingTop: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.deepNavy,
    marginBottom: 20,
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
    marginBottom: 16,
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

  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 13,
    color: C.primary,
    fontWeight: '600',
  },

  // Login button
  loginBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Sign up
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
  },
  signupText: {
    color: C.lightBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  signupLink: {
    color: C.primary,
    fontSize: 14,
    fontWeight: '800',
  },
});
