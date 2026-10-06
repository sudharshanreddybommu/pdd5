import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  QrCode,
  DollarSign,
  AlertCircle,
  FileText,
  Building,
  CheckCheck,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Settings,
  UploadCloud,
  Trash2,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Save,
  FileCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import OPConsultationSlipModal from '../components/OPConsultationSlipModal';

const ORAL_SPECIALIZATIONS = [
  'Oral Medicine & Radiology',
  'Oral & Maxillofacial Surgery',
  'Oral Pathology & Microbiology',
  'Oral Oncology & Premalignancy',
  'Periodontics & Oral Implantology',
  'Conservative Dentistry & Endodontics',
  'Prosthodontics & Crown Bridge',
  'Pediatric & Preventive Dentistry',
  'Public Health Dentistry',
  'General Dental Surgery (BDS/MDS)',
  'Head & Neck Surgical Oncology'
];

const DoctorDashboard: React.FC = () => {
  const { user, profile, hospital } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'appointments' | 'payments' | 'profile_settings'>(
    (tabParam as any) || 'overview'
  );

  useEffect(() => {
    if (tabParam && ['overview', 'requests', 'appointments', 'payments', 'profile_settings'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'overview' | 'requests' | 'appointments' | 'payments' | 'profile_settings') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [stats, setStats] = useState<any>({
    newRequests: 0,
    acceptedAppointments: 0,
    todayAppointments: 0,
    paymentVerifications: 0,
    completedConsultations: 0
  });

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Profile & Settings Form State
  const [docName, setDocName] = useState(profile?.fullName || '');
  const [docSpecialization, setDocSpecialization] = useState(profile?.specialization || 'Oral Oncology');
  const [docQualification, setDocQualification] = useState(profile?.qualification || '');
  const [docExperience, setDocExperience] = useState(profile?.experienceYears || 5);
  const [docFee, setDocFee] = useState(profile?.consultationFee || 500);
  const [docHours, setDocHours] = useState(profile?.availableHours || '09:00 - 17:00');
  const [docProfilePhoto, setDocProfilePhoto] = useState(profile?.profilePhoto || '');
  const [docUpiId, setDocUpiId] = useState(profile?.upiId || '');
  const [docQrCode, setDocQrCode] = useState(profile?.qrCodeUrl || '');
  
  const [hospName, setHospName] = useState(hospital?.name || '');
  const [hospAddress, setHospAddress] = useState(hospital?.address || '');
  const [hospCity, setHospCity] = useState(hospital?.city || 'Hyderabad');
  const [hospState, setHospState] = useState(hospital?.state || 'Telangana');

  const [settingsMsg, setSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  // Rejection modal state
  const [rejectingAptId, setRejectingAptId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [selectedForOpSlip, setSelectedForOpSlip] = useState<any | null>(null);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.all([
        api.get('/doctor/dashboard/stats'),
        api.get('/doctor/appointments/list')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (listRes.data.success) {
        setAppointments(listRes.data.appointments || []);
      }
    } catch (err) {
      console.error('Error loading doctor portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  useEffect(() => {
    if (profile) {
      setDocName(profile.fullName || '');
      setDocSpecialization(profile.specialization || 'Oral Oncology');
      setDocQualification(profile.qualification || '');
      setDocExperience(profile.experienceYears || 5);
      setDocFee(profile.consultationFee || 500);
      setDocHours(profile.availableHours || '09:00 - 17:00');
      setDocProfilePhoto(profile.profilePhoto || '');
      setDocUpiId(profile.upiId || '');
      setDocQrCode(profile.qrCodeUrl || '');
    }
    if (hospital) {
      setHospName(hospital.name || '');
      setHospAddress(hospital.address || '');
      setHospCity(hospital.city || 'Hyderabad');
      setHospState(hospital.state || 'Telangana');
    }
  }, [profile, hospital]);

  const handleAppointmentAction = async (appointmentId: string, action: 'ACCEPT' | 'REJECT' | 'COMPLETE', reason?: string) => {
    try {
      await api.post(`/doctor/appointments/${appointmentId}/action`, {
        action,
        reason
      });
      setRejectingAptId(null);
      setRejectReason('');
      fetchDoctorData();
    } catch (err) {
      console.error('Action failed:', err);
    }
  };

  const handleVerifyPayment = async (appointmentId: string, action: 'VERIFY' | 'REJECT', reason?: string) => {
    try {
      await api.post('/payments/verify', {
        appointmentId,
        action,
        rejectionReason: reason
      });
      fetchDoctorData();
    } catch (err) {
      console.error('Payment action failed:', err);
    }
  };

  // Profile Photo file upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocProfilePhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // QR Code file upload
  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDocQrCode(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg(null);

    try {
      const res = await api.put('/doctor/profile', {
        fullName: docName,
        specialization: docSpecialization,
        qualification: docQualification,
        experienceYears: docExperience,
        consultationFee: docFee,
        availableHours: docHours,
        profilePhoto: docProfilePhoto,
        upiId: docUpiId,
        hospitalName: hospName,
        hospitalAddress: hospAddress,
        city: hospCity,
        state: hospState
      });

      if (res.data.success) {
        setSettingsMsg({ type: 'success', text: 'Doctor profile and settings updated successfully!' });
        setTimeout(() => setSettingsMsg(null), 4000);
      }
    } catch (err: any) {
      setSettingsMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSavingSettings(false);
    }
  };

  const pendingRequests = appointments.filter(a => a.status === 'PENDING');
  const paymentQueue = appointments.filter(a => a.status === 'PAYMENT_SUBMITTED' || a.status === 'PAYMENT_VERIFICATION');

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 mb-8 gap-4">
          <div className="flex items-center space-x-4">
            {docProfilePhoto ? (
              <img
                src={docProfilePhoto}
                alt={docName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500 shadow-md shadow-cyan-500/20 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-cyan-500/20 flex-shrink-0">
                {docName ? docName.charAt(0) : 'D'}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
                  DOCTOR CLINICAL PORTAL
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-600" />
                  <span>Registered Doctor</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Welcome, Dr. {docName || user?.email?.split('@')[0]}
              </h1>
              <p className="text-xs text-slate-500">
                {docSpecialization} • {hospName || 'Authorized Specialty Clinic'}
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
            <button
              onClick={() => handleTabChange('overview')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'}`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('requests')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1 ${activeTab === 'requests' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'}`}
            >
              <span>Patient Requests</span>
              {stats.newRequests > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full animate-pulse">
                  {stats.newRequests}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('payments')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1 ${activeTab === 'payments' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'}`}
            >
              <span>Payment Verification</span>
              {stats.paymentVerifications > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full">
                  {stats.paymentVerifications}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('appointments')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors ${activeTab === 'appointments' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'}`}
            >
              All Appointments
            </button>
            <button
              onClick={() => handleTabChange('profile_settings')}
              className={`px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5 ${activeTab === 'profile_settings' ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'}`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Profile & Settings</span>
            </button>
            <button
              onClick={fetchDoctorData}
              disabled={loading}
              title="Refresh Portal Data"
              className="p-1.5 text-slate-400 hover:text-cyan-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 5 Stats Metrics Cards - Clickable to open tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <button
            onClick={() => handleTabChange('requests')}
            className="text-left p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-cyan-600">New Requests</span>
              <Users className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.newRequests}</p>
            <span className="text-[10px] text-cyan-600 font-semibold block mt-1">Click to view requests →</span>
          </button>

          <button
            onClick={() => handleTabChange('appointments')}
            className="text-left p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-emerald-600">Accepted</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.acceptedAppointments}</p>
            <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Confirmed appointments →</span>
          </button>

          <button
            onClick={() => handleTabChange('appointments')}
            className="text-left p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-indigo-600">Today Schedule</span>
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.todayAppointments}</p>
            <span className="text-[10px] text-indigo-600 font-semibold block mt-1">View schedule →</span>
          </button>

          <button
            onClick={() => handleTabChange('payments')}
            className="text-left p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-amber-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-amber-600">Pending Verif.</span>
              <DollarSign className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.paymentVerifications}</p>
            <span className="text-[10px] text-amber-600 font-semibold block mt-1">Verify UPI payments →</span>
          </button>

          <button
            onClick={() => handleTabChange('appointments')}
            className="text-left p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-teal-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold group-hover:text-teal-600">Completed</span>
              <CheckCheck className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.completedConsultations}</p>
            <span className="text-[10px] text-teal-600 font-semibold block mt-1">Consultation history →</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Urgent Attention Queue</h2>
              {pendingRequests.length === 0 && paymentQueue.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  ✓ No pending requests or unverified payments at this moment.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map(a => (
                    <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">Patient: {a.patient?.fullName || 'Rahul Verma'}</span>
                        <span className="text-[11px] text-slate-400">Requested: {new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleAppointmentAction(a.id, 'ACCEPT')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setRejectingAptId(a.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Patient Requests */}
        {activeTab === 'requests' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Patient Appointment Requests</h2>
            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No new appointment requests pending.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map(a => (
                  <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.patient?.fullName || 'Rahul Verma'}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold">New</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Phone: {a.patient?.phone || '9876543210'}</p>
                      <p className="text-xs text-slate-500">Date: {new Date(a.preferredDate).toLocaleDateString()} | Time: {a.preferredTime}</p>
                      {a.notes && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{a.notes}"</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAppointmentAction(a.id, 'ACCEPT')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => setRejectingAptId(a.id)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payment Verification Queue */}
        {activeTab === 'payments' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">UPI Payment Verification Queue</h2>
            {paymentQueue.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No appointment payments waiting for verification.
              </div>
            ) : (
              <div className="space-y-4">
                {paymentQueue.map(a => {
                  const proof = a.paymentProof;
                  return (
                    <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        {proof?.screenshotUrl && (
                          <a href={proof.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                            <img src={proof.screenshotUrl} alt="Payment Proof" className="w-16 h-16 rounded-xl object-cover border" />
                            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink className="w-4 h-4 text-white" />
                            </div>
                          </a>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Patient: {a.patient?.fullName || 'Rahul Verma'}</h4>
                          <p className="text-xs text-slate-500">Amount: ₹ {proof?.amountPaid || a.consultationFee}.00</p>
                          <p className="text-xs text-slate-500 font-mono">Txn/UTR: {proof?.transactionId || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleVerifyPayment(a.id, 'VERIFY')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                          Verify & Confirm Slot
                        </button>
                        <button
                          onClick={() => handleVerifyPayment(a.id, 'REJECT', 'Invalid Transaction Screenshot')}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
                        >
                          Reject Payment
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: All Appointments */}
        {activeTab === 'appointments' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">All Doctor Consultation Appointments</h2>
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No consultation records found.
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => (
                  <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{a.patient?.fullName || 'Patient'}</span>
                      <span className="text-slate-400">{new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        a.status === 'CONFIRMED' || a.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        a.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                        a.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {a.status}
                      </span>
                      {(a.status === 'CONFIRMED' || a.status === 'COMPLETED') && (
                        <button
                          type="button"
                          onClick={() => setSelectedForOpSlip(a)}
                          className="px-3 py-1 bg-cyan-100 dark:bg-cyan-950/80 hover:bg-cyan-200 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 font-bold rounded-lg text-[11px] flex items-center space-x-1 border border-cyan-300 dark:border-cyan-800 transition-colors"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>OP Form</span>
                        </button>
                      )}
                      {a.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleAppointmentAction(a.id, 'COMPLETE')}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px]"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Profile & Settings */}
        {activeTab === 'profile_settings' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Doctor Profile & Clinical Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update your profile photo, clinical specialization, consultation fees, and UPI payment details.
              </p>
            </div>

            {settingsMsg && (
              <div className={`p-4 rounded-2xl text-xs font-bold flex items-center space-x-2 ${
                settingsMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 border border-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 border border-rose-300'
              }`}>
                {settingsMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{settingsMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfileSettings} className="space-y-6">
              
              {/* Profile Photo Section */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80">
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-3">
                  Doctor Profile Photo
                </label>
                <div className="flex flex-wrap items-center gap-4">
                  {docProfilePhoto ? (
                    <div className="relative">
                      <img
                        src={docProfilePhoto}
                        alt="Doctor Preview"
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setDocProfilePhoto('')}
                        className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-500"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md">
                      {docName ? docName.charAt(0) : 'D'}
                    </div>
                  )}

                  <div className="space-y-2 flex-1 min-w-[200px]">
                    <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-400 transition-colors shadow-sm">
                      <UploadCloud className="w-4 h-4" />
                      <span>{docProfilePhoto ? 'Change Photo from Device' : 'Upload Photo from Device'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Upload your real doctor profile photo. PNG, JPG, or JPEG supported.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Doctor Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Oral Specialization
                  </label>
                  <select
                    value={docSpecialization}
                    onChange={(e) => setDocSpecialization(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    {ORAL_SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Medical Qualification
                  </label>
                  <input
                    type="text"
                    required
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={docExperience}
                    onChange={(e) => setDocExperience(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Consultation Fee (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={docFee}
                    onChange={(e) => setDocFee(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Available Hours
                  </label>
                  <input
                    type="text"
                    value={docHours}
                    onChange={(e) => setDocHours(e.target.value)}
                    placeholder="09:00 - 17:00"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              {/* Hospital Details */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Hospital / Clinic Details
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Hospital Name
                    </label>
                    <input
                      type="text"
                      value={hospName}
                      onChange={(e) => setHospName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={hospAddress}
                      onChange={(e) => setHospAddress(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={hospCity}
                      onChange={(e) => setHospCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={hospState}
                      onChange={(e) => setHospState(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* UPI & QR Code Settings */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  UPI & Payment QR Code
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Doctor UPI ID
                    </label>
                    <input
                      type="text"
                      value={docUpiId}
                      onChange={(e) => setDocUpiId(e.target.value)}
                      placeholder="doctor@upi"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                    />

                    <div className="mt-4">
                      <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-400 transition-colors">
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Custom QR Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {docQrCode && (
                    <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block mb-1.5 font-bold">Active UPI QR Preview</span>
                      <img
                        src={docQrCode}
                        alt="UPI QR Code"
                        className="w-32 h-32 mx-auto object-contain bg-white p-1 rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center space-x-2 active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving Changes...' : 'Save Profile & Settings'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>

      {/* Reject Modal */}
      {rejectingAptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reject Appointment Request</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g. Schedule conflict, doctor on leave)..."
              className="w-full p-2.5 rounded-xl border text-xs"
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRejectingAptId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAppointmentAction(rejectingAptId, 'REJECT', rejectReason)}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official OP Consultation Slip Modal */}
      {selectedForOpSlip && (
        <OPConsultationSlipModal
          appointment={selectedForOpSlip}
          onClose={() => setSelectedForOpSlip(null)}
        />
      )}

    </div>
  );
};

export default DoctorDashboard;
