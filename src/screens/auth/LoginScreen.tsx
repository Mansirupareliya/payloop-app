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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // authStore sets isAuthenticated = true → App.tsx auto-navigates to MainTabs
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header Section */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="leaf" size={60} color="#0d5c56" style={styles.leafIcon} />
        </View>
        <Text style={styles.title}>Hello!</Text>
        <Text style={styles.subtitle}>Welcome to PayLoop</Text>
      </View>

      {/* Main Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login</Text>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorBox}>
              <FontAwesome5 name="exclamation-circle" size={14} color="#dc2626" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <FontAwesome5 name="envelope" size={16} color="#a0a0a0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#a0a0a0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <FontAwesome5 name="lock" size={16} color="#a0a0a0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#a0a0a0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or login with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={20} color="#1877f2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={20} color="#db4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="apple" size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f766e',
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 30,
    paddingBottom: 40,
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    top: 40,
    left: -20,
    opacity: 0.8,
  },
  leafIcon: {
    transform: [{ rotate: '-45deg' }],
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2f1',
    marginTop: 5,
  },
  formContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 24,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: '#0f766e',
    borderRadius: 25,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 15,
    color: '#a0a0a0',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 20,
  },
  signupText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  signupLink: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
