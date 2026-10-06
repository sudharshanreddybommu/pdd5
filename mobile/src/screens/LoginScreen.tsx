import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { CustomButton } from '../components/CustomButton';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoRole, setDemoRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter both your email and password.');
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Sign In Failed', result.message || 'Please check your credentials.');
    }
  };

  const handleQuickDemo = async (role: 'PATIENT' | 'DOCTOR') => {
    const demoEmail = role === 'PATIENT' ? 'patient@opmdcare.com' : 'doctor@opmdcare.com';
    const demoPass = 'Password@123';
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    const result = await login(demoEmail, demoPass);
    setLoading(false);
    if (!result.success) {
      Alert.alert('Demo Sign In', 'Could not connect to backend server. Running in offline/demo mode.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo & Title */}
        <View style={styles.headerArea}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>⚕️</Text>
          </View>
          <Text style={styles.appTitle}>OPMD Care</Text>
          <Text style={styles.appSubtitle}>Oral Health & AI Screening Platform</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSub}>Access your clinical screenings and appointments</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address or Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="patient@opmdcare.com or 9876543210"
              placeholderTextColor={colors.textDim}
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.textDim}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          {/* Quick Demo Login for Reviewers / Faculty */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>— QUICK DEMO LOGIN —</Text>
            <View style={styles.demoButtons}>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleQuickDemo('PATIENT')}
              >
                <Text style={styles.demoBtnText}>Patient Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleQuickDemo('DOCTOR')}
              >
                <Text style={styles.demoBtnText}>Doctor Demo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryBg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoBadgeText: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: colors.primaryLight,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  cardSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loginBtn: {
    marginTop: 8,
  },
  demoSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 10,
    color: colors.textDim,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 10,
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  demoBtn: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoBtnText: {
    color: colors.primaryLight,
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  registerLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
