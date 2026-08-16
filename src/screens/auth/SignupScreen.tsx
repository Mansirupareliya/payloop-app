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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome5 } from '@expo/vector-icons';
import { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

export const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const signup = useAuthStore((state) => state.signup);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      // Navigate to Congratulations — do NOT auto-login
      navigation.navigate('Congratulations');
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <FontAwesome5 name="leaf" size={60} color="#0d5c56" style={styles.leafIcon} />
        </View>
      </View>

      {/* Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <View style={styles.card}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <FontAwesome5 name="arrow-left" size={14} color="#0f766e" />
            <Text style={styles.backButtonText}>Back to login</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.cardTitle}>Sign Up</Text>

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

            <View style={styles.inputContainer}>
              <FontAwesome5 name="lock" size={16} color="#a0a0a0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#a0a0a0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <FontAwesome5 name="mobile-alt" size={18} color="#a0a0a0" style={[styles.inputIcon, { marginLeft: 2 }]} />
              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                placeholderTextColor="#a0a0a0"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.signupButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    paddingTop: 60,
    paddingHorizontal: 30,
    height: 120,
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
  formContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 25,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 8,
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 15,
    height: 55,
  },
  inputIcon: {
    marginRight: 10,
    width: 20,
    textAlign: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: '#0f766e',
    borderRadius: 25,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
