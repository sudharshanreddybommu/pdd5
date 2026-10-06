import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Welcome Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {isDoctor ? `Dr. ${user?.fullName || 'Clinician'}` : (user?.fullName || 'Patient')}
          </Text>
        </View>
        <View style={[styles.roleChip, isDoctor && styles.doctorChip]}>
          <Text style={[styles.roleChipText, isDoctor && styles.doctorChipText]}>
            {user?.role || 'PATIENT'}
          </Text>
        </View>
      </View>

      {/* Main Action Banner */}
      {isDoctor ? (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('AppointmentsTab')}
          style={[styles.heroCard, styles.doctorHeroCard]}
        >
          <View style={styles.heroHeader}>
            <View style={[styles.heroBadge, styles.doctorHeroBadge]}>
              <Text style={styles.doctorHeroBadgeText}>CLINICAL PORTAL</Text>
            </View>
            <Text style={styles.heroIcon}>🩺</Text>
          </View>
          <Text style={styles.heroTitle}>Patient Consultation Requests</Text>
          <Text style={styles.heroSubtitle}>
            Review pending screening reports, evaluate mucosal lesion photos, and approve appointments.
          </Text>
          <View style={styles.heroAction}>
            <Text style={styles.doctorHeroActionText}>Manage Patient Requests →</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ScreeningTab', { screen: 'ScreeningWizard' })}
          style={styles.heroCard}
        >
          <View style={styles.heroHeader}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>AI POWERED</Text>
            </View>
            <Text style={styles.heroIcon}>📸</Text>
          </View>
          <Text style={styles.heroTitle}>Oral Lesion Screening</Text>
          <Text style={styles.heroSubtitle}>
            Capture or upload mouth photos for instant AI risk assessment of OPMD, Leukoplakia, and OSMF.
          </Text>
          <View style={styles.heroAction}>
            <Text style={styles.heroActionText}>Start Clinical Screening →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Action Grid */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => navigation.navigate('DoctorsTab')}
        >
          <Text style={styles.gridIcon}>👨‍⚕️</Text>
          <Text style={styles.gridTitle}>Specialists Directory</Text>
          <Text style={styles.gridSub}>Verified Pathologists & Oncologists</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gridCard}
          onPress={() => navigation.navigate('AppointmentsTab')}
        >
          <Text style={styles.gridIcon}>📅</Text>
          <Text style={styles.gridTitle}>
            {isDoctor ? 'Patient Bookings' : 'My Appointments'}
          </Text>
          <Text style={styles.gridSub}>
            {isDoctor ? 'Review & take action' : 'View & track visits'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clinical Warning Signs Education Card */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Key OPMD Clinical Indicators</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoItem}>
          <Text style={styles.bulletDot}>🔴</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoHeading}>Erythroplakia</Text>
            <Text style={styles.infoDesc}>Velvety red patches in the mouth with high dysplastic risk.</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.bulletDot}>⚪</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoHeading}>Leukoplakia</Text>
            <Text style={styles.infoDesc}>Adherent white patches on buccal mucosa, tongue or gums.</Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.bulletDot}>🟡</Text>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoHeading}>Oral Submucous Fibrosis (OSMF)</Text>
            <Text style={styles.infoDesc}>Burning sensation with spices & restricted mouth opening.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 13,
    color: colors.textMuted,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  roleChip: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  roleChipText: {
    color: colors.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  doctorChip: {
    backgroundColor: colors.tealBg,
    borderColor: colors.tealLight,
  },
  doctorChipText: {
    color: colors.tealLight,
  },
  heroCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    marginBottom: 20,
  },
  doctorHeroCard: {
    borderColor: colors.teal,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  heroBadgeText: {
    color: colors.primaryLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  doctorHeroBadge: {
    backgroundColor: colors.tealBg,
    borderColor: colors.tealLight,
  },
  doctorHeroBadgeText: {
    color: colors.tealLight,
    fontSize: 10,
    fontWeight: '800',
  },
  heroIcon: {
    fontSize: 28,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroAction: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  heroActionText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  doctorHeroActionText: {
    color: colors.tealLight,
    fontSize: 13,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  gridCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  gridSub: {
    fontSize: 11,
    color: colors.textDim,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  bulletDot: {
    fontSize: 14,
    marginRight: 10,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
