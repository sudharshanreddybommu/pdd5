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
    let user = memoryDb.users.find(u => u.id === userId);
    let profile = memoryDb.patientProfiles.find(p => p.userId === userId);

    if (!profile) {
      // Auto-create patient profile if missing
      profile = {
        id: 'pat-' + Date.now(),
        userId: userId!,
        fullName: req.body.fullName || user?.fullName || 'Patient',
        phone: req.body.phone || user?.phone || '',
        gender: req.body.gender || 'Other',
        age: req.body.age || 30,
        city: req.body.city || '',
        state: req.body.state || '',
        tobaccoHabit: req.body.tobaccoHabit || 'NO',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.patientProfiles.push(profile);
    }

    const {
      fullName,
      phone,
      email,
      age,
      gender,
      tobaccoHabit,
      arecaNutHabit,
      alcoholHabit,
      smokingDuration,
      address,
      city,
      state,
      pincode,
      bloodGroup,
      emergencyContact,
      medicalHistory,
      avatarUrl,
      currentPassword,
      newPassword
    } = req.body;

    // Handle Password Change if requested
    if (newPassword && currentPassword && user?.passwordHash) {
      const bcrypt = (await import('bcryptjs')).default;
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ success: false, message: 'Current password does not match.' });
        return;
      }
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    // Update User core fields
    if (user) {
      if (fullName) user.fullName = fullName;
      if (phone) user.phone = phone;
      if (email) user.email = email;
      user.updatedAt = new Date().toISOString();
    }

    // Update Profile extended fields
    Object.assign(profile, {
      fullName: fullName || profile.fullName,
      phone: phone || profile.phone,
      age: age !== undefined ? parseInt(age, 10) : profile.age,
      gender: gender || profile.gender,
      tobaccoHabit: tobaccoHabit || profile.tobaccoHabit,
      arecaNutHabit: arecaNutHabit !== undefined ? arecaNutHabit : profile.arecaNutHabit,
      alcoholHabit: alcoholHabit !== undefined ? alcoholHabit : profile.alcoholHabit,
      smokingDuration: smokingDuration || profile.smokingDuration,
      address: address || profile.address,
      city: city || profile.city,
      state: state || profile.state,
      pincode: pincode || profile.pincode,
      bloodGroup: bloodGroup || profile.bloodGroup,
      emergencyContact: emergencyContact || profile.emergencyContact,
      medicalHistory: medicalHistory || profile.medicalHistory,
      avatarUrl: avatarUrl || profile.avatarUrl,
      updatedAt: new Date().toISOString()
    });

    memoryDb.save();

    res.json({
      success: true,
      message: 'Profile and settings updated successfully.',
      profile,
      user: user ? {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role
      } : undefined
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating patient profile.' });
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
