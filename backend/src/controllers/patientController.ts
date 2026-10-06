import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { memoryDb } from '../database/db.js';

export async function getPatientProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const profile = memoryDb.patientProfiles.find(p => p.userId === userId);
    if (!profile) {
      res.status(404).json({ success: false, message: 'Patient profile not found.' });
      return;
    }

    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching patient profile.' });
  }
}

export async function updatePatientProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    let profile = memoryDb.patientProfiles.find(p => p.userId === userId);

    if (!profile) {
      res.status(404).json({ success: false, message: 'Profile not found.' });
      return;
    }

    Object.assign(profile, req.body, { updatedAt: new Date().toISOString() });
    memoryDb.save();

    res.json({ success: true, message: 'Profile updated successfully.', profile });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
}

export async function getPatientScreenings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const profile = memoryDb.patientProfiles.find(p => p.userId === userId);
    if (!profile) {
      res.json({ success: true, screenings: [] });
      return;
    }

    const screenings = memoryDb.screenings
      .filter(s => s.patientProfileId === profile.id)
      .map(s => {
        const images = memoryDb.screeningImages.filter(img => img.screeningId === s.id);
        const symptoms = memoryDb.screeningSymptoms.filter(sym => sym.screeningId === s.id);
        const prediction = memoryDb.predictions.find(pred => pred.screeningId === s.id);
        const report = memoryDb.reports.find(r => r.screeningId === s.id);
        return {
          ...s,
          images,
          symptoms,
          prediction,
          report
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, screenings });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving patient screenings.' });
  }
}

export async function getPatientAppointments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    const profile = memoryDb.patientProfiles.find(p => p.userId === userId);
    if (!profile) {
      res.json({ success: true, appointments: [] });
      return;
    }

    const appointments = memoryDb.appointments
      .filter(a => a.patientProfileId === profile.id)
      .map(a => {
        const doctor = memoryDb.doctorProfiles.find(d => d.id === a.doctorProfileId);
        const hospital = memoryDb.hospitals.find(h => h.id === a.hospitalId || h.doctorProfileId === a.doctorProfileId);
        const payment = memoryDb.payments.find(p => p.appointmentId === a.id);
        const paymentProof = payment ? memoryDb.paymentProofs.find(pp => pp.paymentId === payment.id) : null;
        const screening = a.screeningId ? memoryDb.screenings.find(s => s.id === a.screeningId) : null;
        const history = memoryDb.appointmentStatusHistories.filter(h => h.appointmentId === a.id);

        return {
          ...a,
          patient: {
            ...profile,
            email: req.user?.email
          },
          doctor,
          hospital,
          payment,
          paymentProof,
          screening,
          history
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, appointments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving patient appointments.' });
  }
}
