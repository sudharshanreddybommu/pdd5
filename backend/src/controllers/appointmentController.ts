import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { memoryDb } from '../database/db.js';
import { logAudit } from '../utils/auditLogger.js';

export async function requestAppointment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    let patient = memoryDb.patientProfiles.find(p => p.userId === userId);

    if (!patient && userId) {
      const user = memoryDb.users.find(u => u.id === userId);
      patient = {
        id: `pat-prof-${Date.now()}`,
        userId,
        fullName: user?.email.split('@')[0] || 'Patient',
        dob: null,
        gender: 'Not specified',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'India',
        emergencyContact: '',
        tobaccoUse: 'None',
        smokingHistory: 'Non-smoker',
        alcoholUse: 'None',
        previousOralLesions: 'None',
        previousOralSurgery: 'None',
        familyHistory: 'None',
        medicalConditions: 'None',
        currentMedication: 'None',
        allergies: 'None',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.patientProfiles.push(patient);
    }

    const {
      doctorId,
      hospitalId,
      screeningId,
      preferredDate,
      preferredTime,
      reason,
      message
    } = req.body;

    if (!doctorId || !preferredDate || !preferredTime) {
      res.status(400).json({
        success: false,
        message: 'Doctor, preferred date, and preferred time are required.'
      });
      return;
    }

    const doctor = memoryDb.doctorProfiles.find(d => d.id === doctorId || d.userId === doctorId);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found.' });
      return;
    }

    // SERVER-SIDE DOUBLE BOOKING PREVENTION
    const dateFormatted = new Date(preferredDate).toISOString().split('T')[0];
    const existingConflict = memoryDb.appointments.find(a => {
      if (a.doctorProfileId !== doctor.id) return false;
      if (a.status === 'CANCELLED' || a.status === 'REJECTED') return false;
      const existingDate = new Date(a.preferredDate).toISOString().split('T')[0];
      return existingDate === dateFormatted && a.preferredTime === preferredTime;
    });

    if (existingConflict) {
      res.status(409).json({
        success: false,
        message: `Dr. ${doctor.fullName} already has a consultation booked on ${dateFormatted} at ${preferredTime}. Please choose another time slot.`
      });
      return;
    }

    const appointmentCount = memoryDb.appointments.length + 1;
    const appointmentNumber = `OPMD-APT-${new Date().getFullYear()}-${String(appointmentCount).padStart(6, '0')}`;
    const appointmentId = `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newAppointment = {
      id: appointmentId,
      appointmentNumber,
      patientProfileId: patient?.id || 'pat-anonymous',
      doctorProfileId: doctor.id,
      hospitalId: hospitalId || null,
      screeningId: screeningId || null,
      preferredDate: new Date(preferredDate).toISOString(),
      preferredTime,
      reason: reason || 'Oral Cavity Evaluation / Second Opinion',
      message: message || '',
      status: 'PENDING',
      fee: doctor.consultationFee || 500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryDb.appointments.push(newAppointment);

    // Initial Status History
    memoryDb.appointmentStatusHistories.push({
      id: `ash-${Date.now()}`,
      appointmentId,
      fromStatus: 'PENDING',
      toStatus: 'PENDING',
      changedByUserId: userId,
      reason: 'Initial consultation request submitted by patient',
      timestamp: new Date().toISOString()
    });

    // Notify Doctor
    memoryDb.notifications.push({
      id: `notif-${Date.now()}`,
      userId: doctor.userId,
      title: 'New Patient Consultation Request!',
      message: `Patient ${patient?.fullName || 'User'} requested an appointment on ${dateFormatted} at ${preferredTime}.`,
      type: 'APPOINTMENT_REQUESTED',
      isRead: false,
      link: `/doctor/requests`,
      createdAt: new Date().toISOString()
    });

    memoryDb.save();
    logAudit(userId || null, 'CREATE_APPOINTMENT_REQUEST', 'Appointment', appointmentId, { appointmentNumber }, req.ip);

    res.json({
      success: true,
      message: 'Appointment request sent to the doctor successfully!',
      appointment: newAppointment
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error scheduling appointment.', error: err.message });
  }
}

export async function getAppointmentDetails(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const appointment = memoryDb.appointments.find(a => a.id === id || a.appointmentNumber === id);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    const patient = memoryDb.patientProfiles.find(p => p.id === appointment.patientProfileId);
    const patientUser = patient ? memoryDb.users.find(u => u.id === patient.userId) : null;
    const doctor = memoryDb.doctorProfiles.find(d => d.id === appointment.doctorProfileId);
    const doctorUser = doctor ? memoryDb.users.find(u => u.id === doctor.userId) : null;
    const hospital = memoryDb.hospitals.find(h => h.id === appointment.hospitalId || h.doctorProfileId === appointment.doctorProfileId);
    const payment = memoryDb.payments.find(p => p.appointmentId === appointment.id);
    const paymentProof = payment ? memoryDb.paymentProofs.find(pp => pp.paymentId === payment.id) : null;
    const history = memoryDb.appointmentStatusHistories.filter(h => h.appointmentId === appointment.id);

    let screening: any = null;
    if (appointment.screeningId) {
      const s = memoryDb.screenings.find(sc => sc.id === appointment.screeningId);
      if (s) {
        const images = memoryDb.screeningImages.filter(img => img.screeningId === s.id);
        const symptoms = memoryDb.screeningSymptoms.filter(sym => sym.screeningId === s.id);
        const prediction = memoryDb.predictions.find(pred => pred.screeningId === s.id);
        screening = { ...s, images, symptoms, prediction };
      }
    }

    res.json({
      success: true,
      appointment: {
        ...appointment,
        patient: patient ? { ...patient, email: patientUser?.email } : null,
        doctor: doctor ? { ...doctor, email: doctorUser?.email } : null,
        hospital,
        payment,
        paymentProof,
        screening,
        history
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving appointment details.' });
  }
}
