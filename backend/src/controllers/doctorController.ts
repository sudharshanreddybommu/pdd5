import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { memoryDb } from '../database/db.js';
import { logAudit } from '../utils/auditLogger.js';

export async function findDoctors(req: Request, res: Response): Promise<void> {
  try {
    const { search, city, state, specialization, maxFee, availability } = req.query;

    let docs = memoryDb.doctorProfiles.filter(d => d.verificationStatus === 'REGISTERED' || d.verificationStatus === 'VERIFIED' || !d.verificationStatus);

    if (search) {
      const q = String(search).toLowerCase();
      docs = docs.filter(d => {
        const hosp = memoryDb.hospitals.find(h => h.doctorProfileId === d.id);
        return (
          d.fullName.toLowerCase().includes(q) ||
          d.qualification.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          (hosp && hosp.name.toLowerCase().includes(q)) ||
          (hosp && hosp.city.toLowerCase().includes(q)) ||
          (hosp && hosp.state && hosp.state.toLowerCase().includes(q))
        );
      });
    }

    if (state) {
      const st = String(state).toLowerCase();
      docs = docs.filter(d => {
        const hosp = memoryDb.hospitals.find(h => h.doctorProfileId === d.id);
        return hosp && hosp.state && hosp.state.toLowerCase().includes(st);
      });
    }

    if (city) {
      const c = String(city).toLowerCase();
      docs = docs.filter(d => {
        const hosp = memoryDb.hospitals.find(h => h.doctorProfileId === d.id);
        return hosp && hosp.city.toLowerCase().includes(c);
      });
    }

    if (specialization) {
      const s = String(specialization).toLowerCase();
      docs = docs.filter(d => d.specialization.toLowerCase().includes(s));
    }

    if (maxFee) {
      const feeLimit = Number(maxFee);
      if (!isNaN(feeLimit)) {
        docs = docs.filter(d => d.consultationFee <= feeLimit);
      }
    }

    const doctorCards = docs.map(d => {
      const hospital = memoryDb.hospitals.find(h => h.doctorProfileId === d.id);
      return {
        ...d,
        hospital,
        rating: 4.9,
        reviewsCount: 48,
        isAvailableToday: true,
      };
    });

    res.json({ success: true, count: doctorCards.length, doctors: doctorCards });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error querying verified doctors.' });
  }
}

export async function getDoctorById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const doctor = memoryDb.doctorProfiles.find(d => d.id === id || d.userId === id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found.' });
      return;
    }

    const hospital = memoryDb.hospitals.find(h => h.doctorProfileId === doctor.id);
    const availabilities = memoryDb.doctorAvailabilities.filter(a => a.doctorProfileId === doctor.id);

    res.json({ success: true, doctor, hospital, availabilities });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving doctor details.' });
  }
}

export async function getDoctorDashboardStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    let doc = memoryDb.doctorProfiles.find(d => d.userId === userId);
    if (!doc) {
      const user = memoryDb.users.find(u => u.id === userId);
      doc = {
        id: `doc-${Date.now()}`,
        userId: userId || `usr-doc-${Date.now()}`,
        fullName: user?.email?.split('@')[0] || 'Doctor',
        qualification: 'BDS/MDS',
        specialization: 'Oral Oncology & Premalignancy',
        registrationNumber: 'REG-AUTO',
        experienceYears: 5,
        consultationFee: 500,
        availableHours: '09:00 - 17:00',
        upiId: '',
        verificationStatus: 'REGISTERED' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.doctorProfiles.push(doc);
      memoryDb.save();
    }

    const appointments = memoryDb.appointments.filter(a => a.doctorProfileId === doc.id);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const newRequests = appointments.filter(a => a.status === 'PENDING').length;
    const acceptedAppointments = appointments.filter(a => a.status === 'ACCEPTED' || a.status === 'PAYMENT_PENDING' || a.status === 'CONFIRMED').length;
    const todayAppointments = appointments.filter(a => a.preferredDate.toString().startsWith(todayStr)).length;
    const paymentVerifications = appointments.filter(a => a.status === 'PAYMENT_SUBMITTED' || a.status === 'PAYMENT_VERIFICATION').length;
    const completedConsultations = appointments.filter(a => a.status === 'COMPLETED').length;

    res.json({
      success: true,
      stats: {
        newRequests,
        acceptedAppointments,
        todayAppointments,
        paymentVerifications,
        completedConsultations,
        totalAppointments: appointments.length,
        verificationStatus: doc.verificationStatus
      },
      doctor: doc
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error calculating dashboard metrics.' });
  }
}

export async function getDoctorAppointments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const doc = memoryDb.doctorProfiles.find(d => d.userId === userId);
    if (!doc) {
      res.json({ success: true, appointments: [] });
      return;
    }

    const appointments = memoryDb.appointments
      .filter(a => a.doctorProfileId === doc.id)
      .map(a => {
        const patient = memoryDb.patientProfiles.find(p => p.id === a.patientProfileId);
        const patientUser = patient ? memoryDb.users.find(u => u.id === patient.userId) : null;
        const hospital = memoryDb.hospitals.find(h => h.id === a.hospitalId || h.doctorProfileId === doc.id);
        const payment = memoryDb.payments.find(p => p.appointmentId === a.id);
        const paymentProof = payment ? memoryDb.paymentProofs.find(pp => pp.paymentId === payment.id) : null;
        const mappedProof = paymentProof ? {
          ...paymentProof,
          screenshotUrl: paymentProof.fileUrl,
          fileUrl: paymentProof.fileUrl,
          amountPaid: payment?.amount || a.fee || 500
        } : null;
        
        let screening: any = null;
        if (a.screeningId) {
          const s = memoryDb.screenings.find(sc => sc.id === a.screeningId);
          if (s) {
            const images = memoryDb.screeningImages.filter(img => img.screeningId === s.id);
            const symptoms = memoryDb.screeningSymptoms.filter(sym => sym.screeningId === s.id);
            const prediction = memoryDb.predictions.find(pred => pred.screeningId === s.id);
            screening = { ...s, images, symptoms, prediction };
          }
        }

        return {
          ...a,
          patient: patient ? { ...patient, email: patientUser?.email } : null,
          doctor: doc,
          hospital,
          payment,
          paymentProof: mappedProof,
          screening,
          history: memoryDb.appointmentStatusHistories.filter(h => h.appointmentId === a.id)
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, appointments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving doctor appointment queue.' });
  }
}

export async function handlePatientRequest(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { appointmentId } = req.params;
    const { action, reason, suggestedDate, suggestedTime } = req.body;
    const userId = req.user?.id;

    const appointment = memoryDb.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment request not found.' });
      return;
    }

    const doc = memoryDb.doctorProfiles.find(d => d.userId === userId);
    if (!doc || doc.id !== appointment.doctorProfileId) {
      res.status(403).json({ success: false, message: 'Unauthorized to manage this appointment.' });
      return;
    }

    const fromStatus = appointment.status;

    if (action === 'ACCEPT') {
      appointment.status = 'ACCEPTED';
      // Automatically create payment record with doctor fee if not present
      let payment = memoryDb.payments.find(p => p.appointmentId === appointment.id);
      if (!payment) {
        payment = {
          id: `pay-${Date.now()}`,
          appointmentId: appointment.id,
          amount: appointment.fee || doc.consultationFee,
          currency: 'INR',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        memoryDb.payments.push(payment);
      }
      
      // Notify patient
      const pat = memoryDb.patientProfiles.find(p => p.id === appointment.patientProfileId);
      if (pat) {
        memoryDb.notifications.push({
          id: `notif-${Date.now()}`,
          userId: pat.userId,
          title: 'Appointment Request Accepted!',
          message: `Dr. ${doc.fullName} accepted your appointment request. Please proceed with payment verification.`,
          type: 'APPOINTMENT_ACCEPTED',
          isRead: false,
          link: `/patient/appointments`,
          createdAt: new Date().toISOString()
        });
      }
    } else if (action === 'REJECT') {
      appointment.status = 'REJECTED';
      const pat = memoryDb.patientProfiles.find(p => p.id === appointment.patientProfileId);
      if (pat) {
        memoryDb.notifications.push({
          id: `notif-${Date.now()}`,
          userId: pat.userId,
          title: 'Appointment Request Status Update',
          message: `Dr. ${doc.fullName} was unable to accept your request on this time. Reason: ${reason || 'Schedule Conflict'}.`,
          type: 'APPOINTMENT_REJECTED',
          isRead: false,
          link: `/patient/find-doctors`,
          createdAt: new Date().toISOString()
        });
      }
    } else if (action === 'RESCHEDULE') {
      if (suggestedDate) appointment.preferredDate = new Date(suggestedDate).toISOString();
      if (suggestedTime) appointment.preferredTime = suggestedTime;
      appointment.status = 'ACCEPTED';

      const pat = memoryDb.patientProfiles.find(p => p.id === appointment.patientProfileId);
      if (pat) {
        memoryDb.notifications.push({
          id: `notif-${Date.now()}`,
          userId: pat.userId,
          title: 'Appointment Rescheduled by Doctor',
          message: `Dr. ${doc.fullName} suggested ${suggestedDate} at ${suggestedTime}.`,
          type: 'APPOINTMENT_RESCHEDULED',
          isRead: false,
          link: `/patient/appointments`,
          createdAt: new Date().toISOString()
        });
      }
    } else if (action === 'COMPLETE') {
      appointment.status = 'COMPLETED';
    }

    appointment.updatedAt = new Date().toISOString();

    memoryDb.appointmentStatusHistories.push({
      id: `ash-${Date.now()}`,
      appointmentId: appointment.id,
      fromStatus,
      toStatus: appointment.status,
      changedByUserId: userId,
      reason: reason || action,
      timestamp: new Date().toISOString()
    });

    memoryDb.save();
    logAudit(userId || null, `APPOINTMENT_${action}`, 'Appointment', appointment.id, { fromStatus, toStatus: appointment.status }, req.ip);

    res.json({ success: true, message: `Appointment marked as ${appointment.status}.`, appointment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error processing appointment action.' });
  }
}

export async function updateDoctorQR(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const { qrCodeUrl } = req.body;
    const doc = memoryDb.doctorProfiles.find(d => d.userId === userId);
    if (!doc) {
      res.status(404).json({ success: false, message: 'Doctor profile not found.' });
      return;
    }

    doc.qrCodeUrl = qrCodeUrl;
    doc.updatedAt = new Date().toISOString();
    memoryDb.save();

    res.json({ success: true, message: 'Payment QR code updated successfully.', doctor: doc });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error saving QR code.' });
  }
}

export async function updateDoctorProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const {
      fullName,
      specialization,
      qualification,
      experienceYears,
      consultationFee,
      availableHours,
      profilePhoto,
      upiId,
      qrCodeUrl,
      hospitalName,
      hospitalAddress,
      city,
      state,
      pincode
    } = req.body;

    let doc = memoryDb.doctorProfiles.find(d => d.userId === userId);
    if (!doc) {
      const user = memoryDb.users.find(u => u.id === userId);
      doc = {
        id: `doc-${Date.now()}`,
        userId: userId || `usr-doc-${Date.now()}`,
        fullName: fullName?.trim() || user?.email?.split('@')[0] || 'Doctor',
        qualification: qualification?.trim() || 'BDS/MDS',
        specialization: specialization || 'Oral Oncology & Premalignancy',
        registrationNumber: 'REG-AUTO',
        experienceYears: Number(experienceYears) || 5,
        consultationFee: Number(consultationFee) || 500,
        availableHours: availableHours || '09:00 - 17:00',
        upiId: upiId?.trim() || '',
        qrCodeUrl: qrCodeUrl || '',
        profilePhoto: profilePhoto || '',
        verificationStatus: 'REGISTERED' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.doctorProfiles.push(doc);
    } else {
      if (fullName) doc.fullName = fullName.trim();
      if (specialization) doc.specialization = specialization;
      if (qualification) doc.qualification = qualification.trim();
      if (experienceYears) doc.experienceYears = Number(experienceYears);
      if (consultationFee) doc.consultationFee = Number(consultationFee);
      if (availableHours) doc.availableHours = availableHours;
      if (profilePhoto !== undefined) doc.profilePhoto = profilePhoto;
      if (upiId !== undefined) doc.upiId = upiId.trim();
      if (qrCodeUrl !== undefined) doc.qrCodeUrl = qrCodeUrl;
      doc.updatedAt = new Date().toISOString();
    }

    let hosp = memoryDb.hospitals.find(h => h.doctorProfileId === doc.id);
    if (!hosp && (hospitalName || hospitalAddress || city || state)) {
      hosp = {
        id: `hosp-${Date.now()}`,
        doctorProfileId: doc.id,
        name: hospitalName?.trim() || 'Authorized Dental / Oncology Clinic',
        address: hospitalAddress?.trim() || '',
        city: city?.trim() || 'Hyderabad',
        state: state?.trim() || 'Telangana',
        pincode: pincode?.trim() || '500001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.hospitals.push(hosp);
    } else if (hosp) {
      if (hospitalName) hosp.name = hospitalName.trim();
      if (hospitalAddress) hosp.address = hospitalAddress.trim();
      if (city) hosp.city = city.trim();
      if (state) hosp.state = state.trim();
      if (pincode) hosp.pincode = pincode.trim();
      hosp.updatedAt = new Date().toISOString();
    }

    memoryDb.save();

    res.json({
      success: true,
      message: 'Doctor profile updated successfully.',
      profile: doc,
      hospital: hosp
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating doctor profile.' });
  }
}

