import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { CustomButton } from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import {
  Appointment,
  getAppointments,
  handleDoctorAction,
} from '../services/appointmentService';

export const AppointmentsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'PENDING' | 'ACCEPTED' | 'ALL'>('PENDING');

  // Doctor action modal state
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [actionType, setActionType] = useState<'ACCEPTED' | 'REJECTED'>('ACCEPTED');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionModal, setActionModal] = useState(false);

  useEffect(() => {
    loadList();
  }, [user]);

  const loadList = async () => {
    setLoading(true);
    const data = await getAppointments(isDoctor);
    setAppointments(data);
    setLoading(false);
  };

  const filteredList = appointments.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'PENDING') return a.status === 'PENDING';
    if (filter === 'ACCEPTED') return a.status === 'ACCEPTED' || a.status === 'CONFIRMED';
    return true;
  });

  const handleActionSubmit = async () => {
    if (!selectedAppt) return;
    setActionLoading(true);
    try {
      await handleDoctorAction(selectedAppt.id, actionType, notes);
      setActionLoading(false);
      setActionModal(false);
      Alert.alert(
        actionType === 'ACCEPTED' ? 'Request Accepted' : 'Request Rejected',
        `The consultation request has been ${actionType.toLowerCase()}.`
      );
      loadList();
    } catch (err: any) {
      setActionLoading(false);
      const msg = err.response?.data?.message || err.message || 'Action failed';
      Alert.alert('Error', msg);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'REJECTED':
      case 'CANCELLED':
        return colors.danger;
      default:
        return colors.textMuted;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={isDoctor ? 'Patient Requests' : 'My Consultations'}
        subtitle={isDoctor ? 'Clinical booking approvals' : 'Scheduled doctor visits'}
        onBack={() => navigation.navigate('HomeTab')}
      />

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'PENDING' && styles.tabBtnActive]}
          onPress={() => setFilter('PENDING')}
        >
          <Text style={[styles.tabText, filter === 'PENDING' && styles.tabTextActive]}>
            Pending ({appointments.filter((a) => a.status === 'PENDING').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'ACCEPTED' && styles.tabBtnActive]}
          onPress={() => setFilter('ACCEPTED')}
        >
          <Text style={[styles.tabText, filter === 'ACCEPTED' && styles.tabTextActive]}>
            Confirmed ({appointments.filter((a) => a.status === 'ACCEPTED' || a.status === 'CONFIRMED').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, filter === 'ALL' && styles.tabBtnActive]}
          onPress={() => setFilter('ALL')}
        >
          <Text style={[styles.tabText, filter === 'ALL' && styles.tabTextActive]}>
            All ({appointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredList.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>
              {isDoctor ? 'No patient requests in this filter' : 'No consultations found'}
            </Text>
            <Text style={styles.emptySub}>
              {isDoctor
                ? 'New patient appointment requests will appear here in real-time.'
                : 'Book a consultation with verified specialists.'}
            </Text>
            {!isDoctor && (
              <CustomButton
                title="Find Specialists"
                onPress={() => navigation.navigate('DoctorsTab')}
                style={styles.findBtn}
              />
            )}
          </View>
        ) : (
          filteredList.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>
                    {isDoctor
                      ? `👤 ${item.patient?.fullName || 'Patient'}`
                      : `🩺 ${item.doctor?.fullName || 'Specialist Doctor'}`}
                  </Text>
                  <Text style={styles.docSpec}>
                    {isDoctor
                      ? (item.patient?.phone ? `Phone: ${item.patient.phone}` : 'Oral Screening Consultation')
                      : (item.doctor?.specialization || 'Oral Pathologist')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(item.status) },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.timeBox}>
                <Text style={styles.timeIcon}>🕒</Text>
                <Text style={styles.timeText}>
                  {item.preferredDate || 'Upcoming'} • {item.preferredTime || '10:30 AM'}
                </Text>
              </View>

              {item.reason && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>Reason: {item.reason}</Text>
                </View>
              )}

              {item.notes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>Notes: {item.notes}</Text>
                </View>
              )}

              {/* Doctor Approval / Rejection Controls */}
              {isDoctor && item.status === 'PENDING' && (
                <View style={styles.doctorActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => {
                      setSelectedAppt(item);
                      setActionType('ACCEPTED');
                      setNotes('Consultation approved. Please visit clinic.');
                      setActionModal(true);
                    }}
                  >
                    <Text style={styles.acceptBtnText}>✓ Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => {
                      setSelectedAppt(item);
                      setActionType('REJECTED');
                      setNotes('Doctor unavailable at this slot.');
                      setActionModal(true);
                    }}
                  >
                    <Text style={styles.rejectBtnText}>✕ Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Doctor Action Modal */}
      <Modal visible={actionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {actionType === 'ACCEPTED' ? 'Accept Consultation' : 'Reject Consultation'}
            </Text>
            <Text style={styles.modalSub}>Patient: {selectedAppt?.patient?.fullName || 'Patient'}</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalInputLabel}>
                {actionType === 'ACCEPTED' ? 'Instructions for Patient' : 'Rejection Reason'}
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Add clinical instructions or slot notes..."
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
                onPress={() => setActionModal(false)}
                style={styles.modalHalfBtn}
              />
              <CustomButton
                title={actionType === 'ACCEPTED' ? 'Confirm Approval' : 'Confirm Rejection'}
                onPress={handleActionSubmit}
                loading={actionLoading}
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
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
    fontSize: 44,
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
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  findBtn: {
    width: 160,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  docSpec: {
    fontSize: 12,
    color: colors.primaryLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  timeIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  notesBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  doctorActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: colors.tealBg,
    borderWidth: 1,
    borderColor: colors.tealLight,
  },
  acceptBtnText: {
    color: colors.tealLight,
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtnBtn: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  rejectBtn: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  rejectBtnText: {
    color: colors.danger,
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
    fontSize: 13,
    color: colors.primaryLight,
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
