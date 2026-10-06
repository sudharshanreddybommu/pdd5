import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { CustomButton } from '../components/CustomButton';
import { Doctor, getDoctors } from '../services/doctorService';
import { bookAppointment } from '../services/appointmentService';

import { ALL_INDIAN_STATES } from '../utils/indiaLocations';

export const DoctorsScreen = ({ navigation }: any) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, [selectedState]);

  const loadDoctors = async () => {
    setLoading(true);
    const data = await getDoctors(selectedState ? { state: selectedState } : undefined);
    setDoctors(data);
    setLoading(false);
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      doc.fullName.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      (doc.clinicAddress && doc.clinicAddress.toLowerCase().includes(q)) ||
      (doc.city && doc.city.toLowerCase().includes(q)) ||
      (doc.state && doc.state.toLowerCase().includes(q));

    const matchState = !selectedState || (doc.state && doc.state.toLowerCase().includes(selectedState.toLowerCase()));

    return matchSearch && matchState;
  });

  const handleBook = async () => {
    if (!selectedDoctor) return;
    setBookingLoading(true);
    try {
      const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
      const res = await bookAppointment({
        doctorId: selectedDoctor.id,
        preferredDate: tomorrow,
        preferredTime: '10:30 AM',
        reason: notes || 'Oral lesion screening & specialist consultation.',
        message: notes,
      });
      setBookingLoading(false);
      setBookingModal(false);
      Alert.alert(
        'Appointment Requested! 🎉',
        `Your consultation request has been sent to ${selectedDoctor.fullName}. The doctor will review and accept it.`,
        [
          {
            text: 'View My Appointments',
            onPress: () => navigation.navigate('AppointmentsTab'),
          },
        ]
      );
    } catch (err: any) {
      setBookingLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to request appointment';
      Alert.alert('Booking Error', msg);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Find Specialists"
        subtitle="Oral Pathologists & Oncologists"
        onBack={() => navigation.navigate('HomeTab')}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by doctor, clinic, city or state..."
          placeholderTextColor={colors.textDim}
          value={search}
          onChangeText={setSearch}
        />
        {/* Horizontal All India State Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.stateChipsScroll}
          contentContainerStyle={styles.stateChipsContent}
        >
          <TouchableOpacity
            style={[styles.stateChip, !selectedState && styles.stateChipActive]}
            onPress={() => setSelectedState('')}
          >
            <Text style={[styles.stateChipText, !selectedState && styles.stateChipTextActive]}>
              🇮🇳 All India ({ALL_INDIAN_STATES.length} States)
            </Text>
          </TouchableOpacity>
          {ALL_INDIAN_STATES.map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.stateChip, selectedState === st && styles.stateChipActive]}
              onPress={() => setSelectedState(selectedState === st ? '' : st)}
            >
              <Text style={[styles.stateChipText, selectedState === st && styles.stateChipTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredDoctors.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🩺</Text>
            <Text style={styles.emptyText}>No specialists found</Text>
            <Text style={styles.emptySub}>Try searching with different terms</Text>
          </View>
        ) : (
          filteredDoctors.map((doc) => (
            <View key={doc.id} style={styles.doctorCard}>
              <View style={styles.docHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>👨‍⚕️</Text>
                </View>
                <View style={styles.docInfo}>
                  <Text style={styles.docName}>{doc.fullName}</Text>
                  <Text style={styles.docSpec}>{doc.specialization}</Text>
                  <View style={styles.badgeRow}>
                    <Text style={styles.ratingBadge}>⭐ {doc.rating || '4.9'}</Text>
                    <Text style={styles.expBadge}>
                      {doc.experienceYears || '10+'} Yrs Exp
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.clinicAddress}>
                📍 {doc.clinicAddress || 'Jubilee Hills, Hyderabad'}
              </Text>

              {doc.bio && <Text style={styles.docBio}>{doc.bio}</Text>}

              <View style={styles.docFooter}>
                <View>
                  <Text style={styles.feeLabel}>Consultation Fee</Text>
                  <Text style={styles.feeVal}>₹{doc.consultationFee || 500}</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => {
                    setSelectedDoctor(doc);
                    setBookingModal(true);
                  }}
                >
                  <Text style={styles.bookBtnText}>Book Visit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Book Consultation</Text>
            <Text style={styles.modalSub}>{selectedDoctor?.fullName}</Text>
            <Text style={styles.modalClinic}>{selectedDoctor?.clinicAddress}</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>Chief Complaint / Remarks</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Mention your screening results or lesions..."
                placeholderTextColor={colors.textDim}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            <View style={styles.modalActions}>
              <CustomButton
                title="Cancel"
                variant="secondary"
                onPress={() => setBookingModal(false)}
                style={styles.modalHalfBtn}
              />
              <CustomButton
                title="Confirm"
                onPress={handleBook}
                loading={bookingLoading}
                style={styles.modalHalfBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateChipsScroll: {
    marginTop: 8,
  },
  stateChipsContent: {
    gap: 8,
    paddingVertical: 2,
  },
  stateChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateChipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  stateChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  stateChipTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  doctorCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surfaceCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 26,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  docSpec: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  ratingBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
  },
  expBadge: {
    fontSize: 11,
    color: colors.textMuted,
  },
  clinicAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 8,
  },
  docBio: {
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 16,
    marginBottom: 12,
  },
  docFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  feeLabel: {
    fontSize: 10,
    color: colors.textDim,
  },
  feeVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  bookBtn: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  bookBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalSub: {
    fontSize: 14,
    color: colors.primaryLight,
    marginTop: 2,
    fontWeight: '600',
  },
  modalClinic: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 20,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 14,
    padding: 12,
    color: colors.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalHalfBtn: {
    flex: 1,
  },
});
