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
  FileCheck,
  Eye,
  ZoomIn,
  Download,
  Maximize2,
  Image as ImageIcon
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

  // Payment Proof Screenshot Modal & Action State
  const [viewingProofAppointment, setViewingProofAppointment] = useState<any | null>(null);
  const [rejectingPaymentAptId, setRejectingPaymentAptId] = useState<string | null>(null);
  const [paymentRejectReason, setPaymentRejectReason] = useState<string>('');

  const getProofImageUrl = (proof: any): string => {
    if (!proof) return '';
    const raw = proof.screenshotUrl || proof.fileUrl || '';
    if (!raw) return '';
    if (raw.startsWith('http') || raw.startsWith('blob:') || raw.startsWith('data:')) {
      return raw;
    }
    return raw.startsWith('/') ? raw : `/${raw}`;
  };

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
                  {/* Payment Queue Items in Overview */}
                  {paymentQueue.map(a => {
                    const proof = a.paymentProof;
                    const imgUrl = getProofImageUrl(proof);
                    return (
                      <div key={a.id} className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          {imgUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingProofAppointment(a)}
                              className="relative group w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 dark:border-amber-600 flex-shrink-0 bg-black/10"
                              title="Click to view full payment screenshot"
                            >
                              <img src={imgUrl} alt="Payment Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <ZoomIn className="w-4 h-4 text-white" />
                              </div>
                            </button>
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                {a.patient?.fullName || 'Rahul Verma'}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                                Payment Verification Needed
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">
                              Fee: ₹ {proof?.amountPaid || a.fee || 500}.00 • {new Date(a.preferredDate).toLocaleDateString()} ({a.preferredTime})
                            </span>
                            {proof?.notes && (
                              <span className="text-[11px] text-slate-400 italic">Notes: {proof.notes}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                          {imgUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingProofAppointment(a)}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1 hover:bg-slate-100"
                            >
                              <Eye className="w-3.5 h-3.5 text-cyan-600" />
                              <span>Inspect Screenshot</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleVerifyPayment(a.id, 'VERIFY')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectingPaymentAptId(a.id);
                              setPaymentRejectReason('');
                            }}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Regular Pending Requests in Overview */}
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
                {pendingRequests.map(a => {
                  const proof = a.paymentProof;
                  const imgUrl = getProofImageUrl(proof);
                  return (
                    <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        {imgUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingProofAppointment(a)}
                            className="relative group w-16 h-16 rounded-2xl overflow-hidden border border-cyan-500/50 flex-shrink-0 bg-black/10"
                            title="Click to view payment proof"
                          >
                            <img src={imgUrl} alt="Payment Proof" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <ZoomIn className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{a.patient?.fullName || 'Rahul Verma'}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold">New</span>
                            {imgUrl && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center space-x-1">
                                <ImageIcon className="w-3 h-3" />
                                <span>Receipt Attached</span>
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Phone: {a.patient?.phone || '9876543210'}</p>
                          <p className="text-xs text-slate-500">Date: {new Date(a.preferredDate).toLocaleDateString()} | Time: {a.preferredTime}</p>
                          {a.notes && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">"{a.notes}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {imgUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingProofAppointment(a)}
                            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1 hover:bg-slate-100"
                          >
                            <Eye className="w-3.5 h-3.5 text-cyan-600" />
                            <span>View Proof</span>
                          </button>
                        )}
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Payment Verification Queue */}
        {activeTab === 'payments' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">UPI Payment Verification Queue</h2>
                <p className="text-xs text-slate-500">Inspect patient transaction screenshots and approve appointment slots.</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {paymentQueue.length} Waiting Verification
              </span>
            </div>

            {paymentQueue.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No appointment payments waiting for verification.
              </div>
            ) : (
              <div className="space-y-4">
                {paymentQueue.map(a => {
                  const proof = a.paymentProof;
                  const imgUrl = getProofImageUrl(proof);
                  return (
                    <div key={a.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                      
                      {/* Left: Screenshot preview + Patient Details */}
                      <div className="flex items-start space-x-4">
                        {imgUrl ? (
                          <div className="relative group flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setViewingProofAppointment(a)}
                              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-cyan-500 dark:border-cyan-400 shadow-md bg-slate-900 relative block"
                              title="Click to zoom / verify screenshot"
                            >
                              <img src={imgUrl} alt="Patient Payment Screenshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                <ZoomIn className="w-5 h-5 mb-1" />
                                <span>Click to Zoom</span>
                              </div>
                            </button>
                            <span className="inline-block mt-1 text-[9px] font-mono font-bold text-center w-full text-cyan-600 dark:text-cyan-400">
                              📷 Screenshot
                            </span>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-2xl bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800 flex flex-col items-center justify-center text-amber-700 dark:text-amber-300 text-center p-2">
                            <ImageIcon className="w-6 h-6 mb-1" />
                            <span className="text-[10px] font-bold">No Image Found</span>
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              Patient: {a.patient?.fullName || 'Rahul Verma'}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                              Apt #{a.appointmentNumber || a.id.slice(0, 8)}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-500">
                            <strong>Phone:</strong> {a.patient?.phone || 'N/A'} • <strong>Email:</strong> {a.patient?.email || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">
                            <strong>Slot:</strong> {new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}
                          </p>
                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                              Amount: ₹ {proof?.amountPaid || a.consultationFee || a.fee || 500}.00
                            </span>
                            {proof?.uploadedAt && (
                              <span className="text-[10px] text-slate-400">
                                Submitted: {new Date(proof.uploadedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          {proof?.notes && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 italic pt-1">
                              <strong>Patient Notes:</strong> "{proof.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                        {imgUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingProofAppointment(a)}
                            className="px-4 py-2.5 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Inspect Screenshot</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(a.id, 'VERIFY')}
                          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Verify & Confirm Slot</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRejectingPaymentAptId(a.id);
                            setPaymentRejectReason('');
                          }}
                          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Payment</span>
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
                {appointments.map(a => {
                  const proof = a.paymentProof;
                  const imgUrl = getProofImageUrl(proof);
                  return (
                    <div key={a.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 dark:text-white block">{a.patient?.fullName || 'Patient'}</span>
                          <span className="text-slate-400">({a.patient?.phone || 'No Phone'})</span>
                        </div>
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

                        {imgUrl && (
                          <button
                            type="button"
                            onClick={() => setViewingProofAppointment(a)}
                            className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 font-bold rounded-lg text-[11px] flex items-center space-x-1 border border-amber-300 dark:border-amber-800"
                            title="View uploaded payment receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Payment Proof</span>
                          </button>
                        )}

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
                  );
                })}
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

      {/* Reject Appointment Modal */}
      {rejectingAptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reject Appointment Request</h3>
            <p className="text-xs text-slate-500">Provide a reason for rejecting this consultation request.</p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (e.g. Schedule conflict, doctor on emergency leave)..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingAptId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAppointmentAction(rejectingAptId, 'REJECT', rejectReason)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Proof Modal */}
      {rejectingPaymentAptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center space-x-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Reject Payment Proof</h3>
            </div>
            <p className="text-xs text-slate-500">
              The patient will be notified to re-upload a valid transaction screenshot or receipt.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={paymentRejectReason}
                onChange={(e) => setPaymentRejectReason(e.target.value)}
                placeholder="e.g. Transaction ID / UTR is unreadable, Amount mismatch, Duplicate screenshot..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPaymentAptId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleVerifyPayment(rejectingPaymentAptId, 'REJECT', paymentRejectReason || 'Invalid or unreadable transaction screenshot');
                  setRejectingPaymentAptId(null);
                  if (viewingProofAppointment?.id === rejectingPaymentAptId) {
                    setViewingProofAppointment(null);
                  }
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Reject & Request Re-upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Screenshot Inspector Lightbox Modal */}
      {viewingProofAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Payment Proof Verification</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-mono">
                      #{viewingProofAppointment.appointmentNumber || viewingProofAppointment.id.slice(0, 8)}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Patient: <strong>{viewingProofAppointment.patient?.fullName || 'Rahul Verma'}</strong> • Phone: {viewingProofAppointment.patient?.phone || 'N/A'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofAppointment(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body: Image Preview + Metadata */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Big Screenshot Image */}
              <div className="md:col-span-2 flex flex-col items-center justify-center bg-slate-950/90 rounded-2xl p-4 border border-slate-800 min-h-[320px] relative">
                {getProofImageUrl(viewingProofAppointment.paymentProof) ? (
                  <div className="w-full flex flex-col items-center">
                    <img
                      src={getProofImageUrl(viewingProofAppointment.paymentProof)}
                      alt="Uploaded Payment Receipt Screenshot"
                      className="max-h-[500px] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-700"
                    />
                    <div className="mt-3 flex items-center space-x-3">
                      <a
                        href={getProofImageUrl(viewingProofAppointment.paymentProof)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 backdrop-blur-sm transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Full Image in New Tab</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 py-12">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No screenshot image found for this transaction.</p>
                  </div>
                )}
              </div>

              {/* Right 1 Col: Transaction Details & Verification Actions */}
              <div className="flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">
                      Transaction Summary
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Consultation Fee:</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹ {viewingProofAppointment.paymentProof?.amountPaid || viewingProofAppointment.consultationFee || viewingProofAppointment.fee || 500}.00
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Payment Status:</span>
                      <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        {viewingProofAppointment.payment?.status || viewingProofAppointment.status || 'SUBMITTED'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Requested Slot:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {new Date(viewingProofAppointment.preferredDate).toLocaleDateString()} ({viewingProofAppointment.preferredTime})
                      </span>
                    </div>
                    {viewingProofAppointment.paymentProof?.uploadedAt && (
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                        Uploaded on: {new Date(viewingProofAppointment.paymentProof.uploadedAt).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {viewingProofAppointment.paymentProof?.notes && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Patient's Transaction Notes / UTR
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-mono bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        {viewingProofAppointment.paymentProof.notes}
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 text-xs text-cyan-900 dark:text-cyan-200 leading-relaxed">
                    💡 <strong>Doctor Verification Check:</strong> Verify the UTR / Ref number and amount on the screenshot against your UPI / bank account before confirming.
                  </div>
                </div>

                {/* Bottom Verification Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleVerifyPayment(viewingProofAppointment.id, 'VERIFY');
                      setViewingProofAppointment(null);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify & Confirm Slot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRejectingPaymentAptId(viewingProofAppointment.id);
                      setPaymentRejectReason('');
                    }}
                    className="w-full py-2.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Payment Screenshot</span>
                  </button>
                </div>

              </div>

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

