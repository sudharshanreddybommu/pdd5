import { Request, Response } from 'express';
import { memoryDb } from '../database/db.js';

export async function getDatabaseOverview(_req: Request, res: Response): Promise<void> {
  try {
    const users = memoryDb.users.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      passwordHashPreview: u.passwordHash ? u.passwordHash.substring(0, 15) + '...' : 'N/A'
    }));

    const patientProfiles = memoryDb.patientProfiles;
    const doctorProfiles = memoryDb.doctorProfiles;
    const hospitals = memoryDb.hospitals;

    const screenings = memoryDb.screenings.map(s => {
      const images = memoryDb.screeningImages.filter(img => img.screeningId === s.id);
      const symptoms = memoryDb.screeningSymptoms.filter(sym => sym.screeningId === s.id);
      const prediction = memoryDb.predictions.find(p => p.screeningId === s.id);
      const patient = memoryDb.patientProfiles.find(p => p.id === s.patientProfileId);
      return {
        ...s,
        patientName: patient?.fullName || 'Anonymous Patient',
        patientPhone: patient?.phone || 'N/A',
        images,
        symptoms,
        prediction
      };
    });

    const appointments = memoryDb.appointments.map(a => {
      const patient = memoryDb.patientProfiles.find(p => p.id === a.patientProfileId);
      const doc = memoryDb.doctorProfiles.find(d => d.id === a.doctorProfileId);
      const payment = memoryDb.payments.find(p => p.appointmentId === a.id);
      const proof = payment ? memoryDb.paymentProofs.find(pp => pp.paymentId === payment.id) : null;
      return {
        ...a,
        patientName: patient?.fullName || 'Patient',
        patientPhone: patient?.phone || 'N/A',
        doctorName: doc?.fullName || 'Doctor',
        consultationFee: doc?.consultationFee || a.fee || 500,
        payment,
        paymentProof: proof
      };
    });

    const payments = memoryDb.payments.map(p => {
      const appointment = memoryDb.appointments.find(a => a.id === p.appointmentId);
      const patient = appointment ? memoryDb.patientProfiles.find(pat => pat.id === appointment.patientProfileId) : null;
      const proof = memoryDb.paymentProofs.find(pp => pp.paymentId === p.id);
      return {
        ...p,
        appointmentNumber: appointment?.appointmentNumber || 'N/A',
        patientName: patient?.fullName || 'Patient',
        patientPhone: patient?.phone || 'N/A',
        screenshotUrl: proof?.fileUrl,
        proofNotes: proof?.notes,
        proofUploadedAt: proof?.uploadedAt
      };
    });

    const auditLogs = memoryDb.auditLogs.slice(-100).reverse();
    const notifications = memoryDb.notifications.slice(-100).reverse();

    const stats = {
      totalUsers: memoryDb.users.length,
      totalPatients: memoryDb.patientProfiles.length,
      totalDoctors: memoryDb.doctorProfiles.length,
      totalScreenings: memoryDb.screenings.length,
      totalOralPhotos: memoryDb.screeningImages.length,
      totalAppointments: memoryDb.appointments.length,
      totalPayments: memoryDb.payments.length,
      totalPaymentProofs: memoryDb.paymentProofs.length,
      databaseFileSizeKb: Math.round(JSON.stringify(memoryDb).length / 1024),
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      stats,
      data: {
        users,
        patientProfiles,
        doctorProfiles,
        hospitals,
        screenings,
        appointments,
        payments,
        auditLogs,
        notifications
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve database records.', error: err.message });
  }
}
