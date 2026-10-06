import api from './api';

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  doctor?: {
    fullName: string;
    specialization: string;
    clinicAddress?: string;
  };
  patient?: {
    fullName: string;
    phone?: string;
    email?: string;
  };
  hospital?: {
    name: string;
    address: string;
    city: string;
  };
  scheduledAt?: string;
  preferredDate?: string;
  preferredTime?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  notes?: string;
  screeningId?: string;
  createdAt?: string;
}

export const getAppointments = async (isDoctor?: boolean) => {
  try {
    if (isDoctor) {
      const res = await api.get('/doctor/appointments/list');
      return res.data?.appointments || [];
    } else {
      const res = await api.get('/patient/appointments');
      return res.data?.appointments || [];
    }
  } catch (err) {
    console.warn('Failed to fetch appointments from backend:', err);
    return [];
  }
};

export const bookAppointment = async (data: {
  doctorId: string;
  preferredDate: string;
  preferredTime?: string;
  reason?: string;
  message?: string;
  screeningId?: string;
}) => {
  const res = await api.post('/appointment/request', {
    doctorId: data.doctorId,
    preferredDate: data.preferredDate,
    preferredTime: data.preferredTime || '10:30 AM',
    reason: data.reason || 'Oral lesion evaluation & screening consultation',
    message: data.message || '',
    screeningId: data.screeningId,
  });
  return res.data;
};

export const handleDoctorAction = async (appointmentId: string, action: 'ACCEPTED' | 'REJECTED', notes?: string) => {
  const res = await api.post(`/doctor/appointments/${appointmentId}/action`, {
    action,
    rejectionReason: action === 'REJECTED' ? notes : undefined,
    doctorNotes: action === 'ACCEPTED' ? notes : undefined,
  });
  return res.data;
};
