import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { memoryDb } from '../database/db.js';
import { logAudit } from '../utils/auditLogger.js';

export async function submitPaymentProof(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { appointmentId, fileUrl, notes } = req.body;
    const userId = req.user?.id;

    const appointment = memoryDb.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    if (!fileUrl) {
      res.status(400).json({ success: false, message: 'Payment receipt / screenshot file is required.' });
      return;
    }

    let payment = memoryDb.payments.find(p => p.appointmentId === appointment.id);
    if (!payment) {
      payment = {
        id: `pay-${Date.now()}`,
        appointmentId: appointment.id,
        amount: appointment.fee || 500,
        currency: 'INR',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      memoryDb.payments.push(payment);
    } else {
      payment.status = 'SUBMITTED';
      payment.updatedAt = new Date().toISOString();
    }

    const proof = {
      id: `proof-${Date.now()}`,
      paymentId: payment.id,
      fileUrl,
      fileType: fileUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      uploadedAt: new Date().toISOString(),
      notes: notes || 'UPI / Bank Transfer Screenshot',
      rejectionReason: null,
      verifiedAt: null,
      verifiedByUserId: null
    };
    memoryDb.paymentProofs.push(proof);

    // Update appointment status to PAYMENT_SUBMITTED
    const fromStatus = appointment.status;
    appointment.status = 'PAYMENT_SUBMITTED';
    appointment.updatedAt = new Date().toISOString();

    memoryDb.appointmentStatusHistories.push({
      id: `ash-${Date.now()}`,
      appointmentId: appointment.id,
      fromStatus,
      toStatus: 'PAYMENT_SUBMITTED',
      changedByUserId: userId,
      reason: 'Patient submitted payment screenshot for verification',
      timestamp: new Date().toISOString()
    });

    // Notify Doctor
    const doc = memoryDb.doctorProfiles.find(d => d.id === appointment.doctorProfileId);
    if (doc) {
      memoryDb.notifications.push({
        id: `notif-${Date.now()}`,
        userId: doc.userId,
        title: 'Payment Proof Submitted',
        message: `Patient submitted payment receipt for appointment #${appointment.appointmentNumber}. Please review and verify.`,
        type: 'PAYMENT_SUBMITTED',
        isRead: false,
        link: `/doctor/payments`,
        createdAt: new Date().toISOString()
      });
    }

    memoryDb.save();
    logAudit(userId || null, 'SUBMIT_PAYMENT_PROOF', 'Payment', payment.id, { appointmentId }, req.ip);

    res.json({
      success: true,
      message: 'Payment screenshot submitted successfully! Doctor will verify shortly.',
      payment,
      proof
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error submitting payment proof.', error: err.message });
  }
}

export async function verifyDoctorPayment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { appointmentId, action, rejectionReason } = req.body; // action: 'VERIFY' | 'REJECT' | 'REQUEST_REUPLOAD'
    const userId = req.user?.id;

    const appointment = memoryDb.appointments.find(a => a.id === appointmentId);
    if (!appointment) {
      res.status(404).json({ success: false, message: 'Appointment not found.' });
      return;
    }

    const doc = memoryDb.doctorProfiles.find(d => d.userId === userId);
    if (!doc || doc.id !== appointment.doctorProfileId) {
      res.status(403).json({ success: false, message: 'Unauthorized to verify this payment.' });
      return;
    }

    const payment = memoryDb.payments.find(p => p.appointmentId === appointment.id);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found.' });
      return;
    }

    const proof = memoryDb.paymentProofs.find(pp => pp.paymentId === payment.id);
    const pat = memoryDb.patientProfiles.find(p => p.id === appointment.patientProfileId);
    const fromStatus = appointment.status;

    if (action === 'VERIFY') {
      payment.status = 'VERIFIED';
      if (proof) {
        proof.verifiedAt = new Date().toISOString();
        proof.verifiedByUserId = userId;
      }
      appointment.status = 'CONFIRMED';

      if (pat) {
        memoryDb.notifications.push({
          id: `notif-${Date.now()}`,
          userId: pat.userId,
          title: 'Consultation Confirmed! 🎉',
          message: `Your payment was verified by Dr. ${doc.fullName}. Appointment #${appointment.appointmentNumber} is CONFIRMED.`,
          type: 'APPOINTMENT_CONFIRMED',
          isRead: false,
          link: `/patient/appointments/${appointment.id}`,
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // REJECT / REQUEST_REUPLOAD
      payment.status = 'REJECTED';
      if (proof) {
        proof.rejectionReason = rejectionReason || 'Receipt unreadable or invalid transaction ID';
      }
      appointment.status = 'PAYMENT_PENDING';

      if (pat) {
        memoryDb.notifications.push({
          id: `notif-${Date.now()}`,
          userId: pat.userId,
          title: 'Payment Verification Unsuccessful',
          message: `Payment could not be verified: ${rejectionReason || 'Invalid screenshot'}. Please re-upload your receipt.`,
          type: 'PAYMENT_REJECTED',
          isRead: false,
          link: `/patient/appointments/${appointment.id}`,
          createdAt: new Date().toISOString()
        });
      }
    }

    payment.updatedAt = new Date().toISOString();
    appointment.updatedAt = new Date().toISOString();

    memoryDb.appointmentStatusHistories.push({
      id: `ash-${Date.now()}`,
      appointmentId: appointment.id,
      fromStatus,
      toStatus: appointment.status,
      changedByUserId: userId,
      reason: action === 'VERIFY' ? 'Payment confirmed by doctor' : `Payment rejected: ${rejectionReason}`,
      timestamp: new Date().toISOString()
    });

    memoryDb.save();
    logAudit(userId || null, `PAYMENT_${action}`, 'Payment', payment.id, { status: payment.status }, req.ip);

    res.json({
      success: true,
      message: action === 'VERIFY' ? 'Payment verified and appointment CONFIRMED!' : 'Payment rejected.',
      appointment,
      payment
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error updating payment status.' });
  }
}
