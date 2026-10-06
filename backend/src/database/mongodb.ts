import mongoose from 'mongoose';
import { memoryDb } from './db.js';

let isMongoConnected = false;

// 1. Mongoose Schemas
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'users' });

const PatientProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  fullName: String,
  phone: String,
  age: Number,
  gender: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  bloodGroup: String,
  emergencyContact: String,
  tobaccoHabit: String,
  arecaNutHabit: Boolean,
  alcoholHabit: Boolean,
  smokingDuration: Number,
  medicalHistory: String,
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'patient_profiles' });

const DoctorProfileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  fullName: { type: String, required: true },
  qualification: String,
  specialization: String,
  registrationNumber: String,
  experienceYears: Number,
  consultationFee: Number,
  availableHours: String,
  upiId: String,
  qrCodeUrl: String,
  profilePhoto: String,
  verificationStatus: { type: String, default: 'REGISTERED' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'doctor_profiles' });

const HospitalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  doctorProfileId: String,
  name: String,
  address: String,
  city: String,
  state: String,
  contactPhone: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'hospitals' });

const ScreeningSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  patientProfileId: String,
  riskScore: Number,
  riskCategory: String,
  notes: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'screenings' });

const ScreeningImageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  screeningId: String,
  angle: String,
  fileUrl: String,
  qualityScore: Number,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'screening_images' });

const PredictionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  screeningId: String,
  riskCategory: String,
  confidenceScore: Number,
  lesionTypesDetected: [String],
  recommendation: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'predictions' });

const AppointmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  appointmentNumber: String,
  patientProfileId: String,
  doctorProfileId: String,
  hospitalId: String,
  screeningId: String,
  preferredDate: String,
  preferredTime: String,
  status: { type: String, default: 'PENDING' },
  fee: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'appointments' });

const PaymentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  appointmentId: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'payments' });

const PaymentProofSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  paymentId: String,
  fileUrl: String,
  fileType: String,
  notes: String,
  rejectionReason: String,
  verifiedAt: Date,
  verifiedByUserId: String,
  uploadedAt: { type: Date, default: Date.now }
}, { collection: 'payment_proofs' });

const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  action: String,
  resource: String,
  resourceId: String,
  detailsJson: String,
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: 'audit_logs' });

export const MongoModels = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  PatientProfile: mongoose.models.PatientProfile || mongoose.model('PatientProfile', PatientProfileSchema),
  DoctorProfile: mongoose.models.DoctorProfile || mongoose.model('DoctorProfile', DoctorProfileSchema),
  Hospital: mongoose.models.Hospital || mongoose.model('Hospital', HospitalSchema),
  Screening: mongoose.models.Screening || mongoose.model('Screening', ScreeningSchema),
  ScreeningImage: mongoose.models.ScreeningImage || mongoose.model('ScreeningImage', ScreeningImageSchema),
  Prediction: mongoose.models.Prediction || mongoose.model('Prediction', PredictionSchema),
  Appointment: mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema),
  Payment: mongoose.models.Payment || mongoose.model('Payment', PaymentSchema),
  PaymentProof: mongoose.models.PaymentProof || mongoose.model('PaymentProof', PaymentProofSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
};

/**
 * Synchronize all memoryDb records into MongoDB collections
 */
export async function syncDataStoreToMongoDB(): Promise<void> {
  if (!isMongoConnected) return;

  try {
    // 1. Sync Users
    for (const u of memoryDb.users) {
      await MongoModels.User.findOneAndUpdate({ id: u.id }, u, { upsert: true });
    }

    // 2. Sync Patients
    for (const p of memoryDb.patientProfiles) {
      await MongoModels.PatientProfile.findOneAndUpdate({ id: p.id }, p, { upsert: true });
    }

    // 3. Sync Doctors
    for (const d of memoryDb.doctorProfiles) {
      await MongoModels.DoctorProfile.findOneAndUpdate({ id: d.id }, d, { upsert: true });
    }

    // 4. Sync Hospitals
    for (const h of memoryDb.hospitals) {
      await MongoModels.Hospital.findOneAndUpdate({ id: h.id }, h, { upsert: true });
    }

    // 5. Sync Screenings
    for (const s of memoryDb.screenings) {
      await MongoModels.Screening.findOneAndUpdate({ id: s.id }, s, { upsert: true });
    }

    // 6. Sync Screening Images
    for (const img of memoryDb.screeningImages) {
      await MongoModels.ScreeningImage.findOneAndUpdate({ id: img.id }, img, { upsert: true });
    }

    // 7. Sync Predictions
    for (const pred of memoryDb.predictions) {
      await MongoModels.Prediction.findOneAndUpdate({ id: pred.id }, pred, { upsert: true });
    }

    // 8. Sync Appointments
    for (const a of memoryDb.appointments) {
      await MongoModels.Appointment.findOneAndUpdate({ id: a.id }, a, { upsert: true });
    }

    // 9. Sync Payments
    for (const pay of memoryDb.payments) {
      await MongoModels.Payment.findOneAndUpdate({ id: pay.id }, pay, { upsert: true });
    }

    // 10. Sync Payment Proofs
    for (const proof of memoryDb.paymentProofs) {
      await MongoModels.PaymentProof.findOneAndUpdate({ id: proof.id }, proof, { upsert: true });
    }

    // 11. Sync Audit Logs
    for (const log of memoryDb.auditLogs.slice(-200)) {
      await MongoModels.AuditLog.findOneAndUpdate({ id: log.id }, log, { upsert: true });
    }

    console.log('✅ Synchronized all OPMD collections to MongoDB database.');
  } catch (err) {
    console.error('⚠️ Error syncing data to MongoDB:', err);
  }
}

/**
 * Connect to MongoDB instance (Local or Atlas)
 */
export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/opmd_care';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log(`🍃 Connected to MongoDB successfully: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    // Initial sync from datastore to MongoDB
    await syncDataStoreToMongoDB();
    return true;
  } catch (err: any) {
    isMongoConnected = false;
    console.log(`ℹ️ MongoDB connection not established (${err.message}). Using unified JSON Document Datastore.`);
    return false;
  }
}

export function getMongoStatus(): { connected: boolean; uri: string } {
  return {
    connected: isMongoConnected,
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/opmd_care'
  };
}
