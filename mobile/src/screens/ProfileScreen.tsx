import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { CustomButton } from '../components/CustomButton';
import { BASE_API_URL, setCustomApiUrl } from '../services/api';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [serverUrl, setServerUrl] = useState(BASE_API_URL);
  const [showConfig, setShowConfig] = useState(false);

  const handleSaveServer = () => {
    setCustomApiUrl(serverUrl.trim());
    Alert.alert('Server Configured', `API URL updated to:\n${serverUrl.trim()}`);
    setShowConfig(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Profile & Settings"
        subtitle="Manage your clinical profile"
        onBack={() => navigation.navigate('HomeTab')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'Patient User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'patient@opmdcare.com'}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'PATIENT'}</Text>
          </View>
        </View>

        {/* Clinical Info Summary */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>CLINICAL MONITORING</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AppointmentsTab')}
          >
            <Text style={styles.menuIcon}>📅</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>My Consultations</Text>
              <Text style={styles.menuSub}>Upcoming appointments & doctor notes</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ScreeningTab', { screen: 'ScreeningWizard' })}
          >
            <Text style={styles.menuIcon}>📸</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>New AI Screening</Text>
              <Text style={styles.menuSub}>Screen oral lesions & mucosal symptoms</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Developer / Faculty Server Config */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>DEVELOPER & SERVER CONFIG</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowConfig(!showConfig)}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Backend Server URL</Text>
              <Text style={styles.menuSub}>{serverUrl}</Text>
            </View>
            <Text style={styles.menuArrow}>{showConfig ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showConfig && (
            <View style={styles.configBox}>
              <Text style={styles.configHint}>
                Change this to your local Wi-Fi IP (e.g., http://192.168.1.10:5000/api) if running on physical device:
              </Text>
              <TextInput
                style={styles.configInput}
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
              />
              <CustomButton
                title="Save API Endpoint"
                onPress={handleSaveServer}
                style={styles.configSaveBtn}
              />
            </View>
          )}
        </View>

        {/* Logout */}
        <CustomButton
          title="Sign Out"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  roleText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDim,
    letterSpacing: 1,
    marginBottom: 10,
  },
  menuItem: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  menuSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 18,
    color: colors.textDim,
    fontWeight: 'bold',
  },
  configBox: {
    backgroundColor: colors.surfaceCard,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  configHint: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginBottom: 8,
  },
  configInput: {
    backgroundColor: colors.surface,
    padding: 10,
    borderRadius: 10,
    color: colors.text,
    fontSize: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  configSaveBtn: {
    paddingVertical: 10,
  },
  logoutBtn: {
    marginTop: 10,
  },
});
