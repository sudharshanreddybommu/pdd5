import React, { useState, useEffect } from 'react';
import {
  Database,
  Users,
  UserCheck,
  Stethoscope,
  Camera,
  Calendar,
  CreditCard,
  ShieldCheck,
  Code2,
  RefreshCw,
  Search,
  ExternalLink,
  ZoomIn,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  HardDrive,
  X,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import api from '../services/api';

type TabKey = 'overview' | 'users' | 'patients' | 'doctors' | 'screenings' | 'appointments' | 'payments' | 'audit' | 'raw_json';

const DatabaseExplorerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [dbData, setDbData] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchDatabase = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/database/overview');
      if (res.data.success) {
        setDbData(res.data);
      }
    } catch (err) {
      console.error('Failed to load database explorer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabase();
  }, []);

  const stats = dbData?.stats || {};
  const data = dbData?.data || {};

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opmd_data_store_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFullImageUrl = (pathUrl: string) => {
    if (!pathUrl) return '';
    if (pathUrl.startsWith('http') || pathUrl.startsWith('blob:') || pathUrl.startsWith('data:')) {
      return pathUrl;
    }
    return pathUrl.startsWith('/') ? pathUrl : `/${pathUrl}`;
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-teal-950 text-white shadow-2xl mb-8 relative overflow-hidden border border-cyan-800/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Database className="w-4 h-4" />
                <span>Live System Database Explorer (లైవ్ డేటాబేస్ వ్యూయర్)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                OPMD Care Database Admin
              </h1>
              <p className="text-xs sm:text-sm text-cyan-100/80 mt-1 max-w-2xl leading-relaxed">
                Live browser viewer for all persistent JSON collections: User credentials, patient habits, oral scan images, AI predictions, and verified UPI payment proofs.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={fetchDatabase}
                disabled={loading}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold flex items-center space-x-2 backdrop-blur-sm transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Live DB</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 rounded-2xl text-xs font-extrabold flex items-center space-x-2 shadow-lg shadow-cyan-500/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export data_store.json</span>
              </button>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <HardDrive className="w-80 h-80 text-cyan-200" />
          </div>
        </div>

        {/* 6 Quick Stats Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase">Users</span>
              <Users className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-2xl font-black">{stats.totalUsers || 0}</p>
            <span className="text-[10px] text-cyan-600 font-semibold mt-1">Auth Credentials</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase">Patients</span>
              <UserCheck className="w-4 h-4 text-teal-600" />
            </div>
            <p className="text-2xl font-black">{stats.totalPatients || 0}</p>
            <span className="text-[10px] text-teal-600 font-semibold mt-1">Habit Profiles</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase">Doctors</span>
              <Stethoscope className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black">{stats.totalDoctors || 0}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1">Specialists</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase">Oral Scans</span>
              <Camera className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black">{stats.totalScreenings || 0}</p>
            <span className="text-[10px] text-purple-600 font-semibold mt-1">AI Assessments</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase">Appointments</span>
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black">{stats.totalAppointments || 0}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1">Booked Slots</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-bold uppercase">DB File Size</span>
              <HardDrive className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black">{stats.databaseFileSizeKb || 16} <span className="text-xs font-normal">KB</span></p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1">data_store.json</span>
          </div>
        </div>

        {/* Interactive Database Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: '1. DB Overview', icon: Layers },
            { id: 'users', label: `2. Users (${data.users?.length || 0})`, icon: Users },
            { id: 'patients', label: `3. Patients (${data.patientProfiles?.length || 0})`, icon: UserCheck },
            { id: 'doctors', label: `4. Doctors (${data.doctorProfiles?.length || 0})`, icon: Stethoscope },
            { id: 'screenings', label: `5. Scans & AI Photos (${data.screenings?.length || 0})`, icon: Camera },
            { id: 'appointments', label: `6. Appointments (${data.appointments?.length || 0})`, icon: Calendar },
            { id: 'payments', label: `7. Payment Proofs (${data.payments?.length || 0})`, icon: CreditCard },
            { id: 'audit', label: `8. Audit Logs (${data.auditLogs?.length || 0})`, icon: ShieldCheck },
            { id: 'raw_json', label: '9. Raw JSON Inspector', icon: Code2 }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKey)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Search Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, phone, city, or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <span className="text-xs text-slate-400">
            Storage Engine: <strong className="text-cyan-600 dark:text-cyan-400">JSON Atomic Document Datastore</strong>
          </span>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Database className="w-5 h-5 text-cyan-600" />
                <span>Database File & Persistence Architecture</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The OPMD Care system utilizes an atomic, schema-validated JSON document store. All operations are flushed to disk synchronously to ensure 100% data durability across restarts.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between font-mono">
                  <span className="text-slate-500">Database File Path:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">backend/data_store.json</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between font-mono">
                  <span className="text-slate-500">Media Uploads Directory:</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">backend/uploads/</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between font-mono">
                  <span className="text-slate-500">Password Encryption:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">bcrypt (10 Salt Rounds)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between font-mono">
                  <span className="text-slate-500">Last Disk Flush:</span>
                  <span className="font-bold">{new Date(stats.lastUpdated || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-base flex items-center space-x-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>Data Collections Summary (సేవ్ అయిన కలెక్షన్స్)</span>
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
                  <span className="text-slate-500 block">1. users</span>
                  <strong className="text-lg text-cyan-700 dark:text-cyan-300 font-mono">{stats.totalUsers || 0} Records</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                  <span className="text-slate-500 block">2. patientProfiles</span>
                  <strong className="text-lg text-teal-700 dark:text-teal-300 font-mono">{stats.totalPatients || 0} Records</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <span className="text-slate-500 block">3. doctorProfiles</span>
                  <strong className="text-lg text-blue-700 dark:text-blue-300 font-mono">{stats.totalDoctors || 0} Records</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                  <span className="text-slate-500 block">4. screenings</span>
                  <strong className="text-lg text-purple-700 dark:text-purple-300 font-mono">{stats.totalScreenings || 0} Records</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                  <span className="text-slate-500 block">5. appointments</span>
                  <strong className="text-lg text-amber-700 dark:text-amber-300 font-mono">{stats.totalAppointments || 0} Records</strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-slate-500 block">6. paymentProofs</span>
                  <strong className="text-lg text-emerald-700 dark:text-emerald-300 font-mono">{stats.totalPaymentProofs || 0} Receipts</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS TABLE */}
        {activeTab === 'users' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h3 className="font-bold text-base mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-cyan-600" />
              <span>Authentication Table: `users` ({data.users?.length || 0} accounts)</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Password Hash (Bcrypt)</th>
                  <th className="py-3 px-3">Verified</th>
                  <th className="py-3 px-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(data.users || [])
                  .filter((u: any) => JSON.stringify(u).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-bold">{u.id}</td>
                      <td className="py-3 px-3 text-slate-900 dark:text-white font-semibold font-sans">{u.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[10px]">{u.passwordHashPreview}</td>
                      <td className="py-3 px-3">
                        {u.isVerified ? (
                          <span className="text-emerald-600 font-bold">✓ Verified</span>
                        ) : (
                          <span className="text-amber-500 font-bold">Pending</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-sans">{new Date(u.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PATIENTS TABLE */}
        {activeTab === 'patients' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h3 className="font-bold text-base mb-4 flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-teal-600" />
              <span>Patient Profiles Table: `patientProfiles` ({data.patientProfiles?.length || 0} records)</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Patient Name</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Age / Gender</th>
                  <th className="py-3 px-3">Location (State & City)</th>
                  <th className="py-3 px-3">Habits (Smoking / Tobacco / Alcohol)</th>
                  <th className="py-3 px-3">Blood Group</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(data.patientProfiles || [])
                  .filter((p: any) => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {p.fullName || 'Anonymous Patient'}
                        <span className="block text-[10px] text-slate-400 font-mono">{p.id}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">{p.phone || 'N/A'}</td>
                      <td className="py-3 px-3">{p.age ? `${p.age} yrs` : 'N/A'} / {p.gender || 'N/A'}</td>
                      <td className="py-3 px-3">
                        <span className="font-semibold">{p.city || 'N/A'}</span>, {p.state || 'N/A'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 text-[10px]">
                          {p.tobaccoHabit && p.tobaccoHabit !== 'NONE' && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold">
                              Tobacco: {p.tobaccoHabit}
                            </span>
                          )}
                          {p.arecaNutHabit && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">
                              Gutkha / Pan
                            </span>
                          )}
                          {p.alcoholHabit && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold">
                              Alcohol
                            </span>
                          )}
                          {(!p.tobaccoHabit || p.tobaccoHabit === 'NONE') && !p.arecaNutHabit && !p.alcoholHabit && (
                            <span className="text-emerald-600 font-semibold">No Risk Habits</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-bold text-rose-600">{p.bloodGroup || 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: DOCTORS TABLE */}
        {activeTab === 'doctors' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h3 className="font-bold text-base mb-4 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <span>Doctor Profiles Table: `doctorProfiles` ({data.doctorProfiles?.length || 0} specialists)</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Doctor Name</th>
                  <th className="py-3 px-3">Specialization</th>
                  <th className="py-3 px-3">Qualification & Exp</th>
                  <th className="py-3 px-3">Consultation Fee</th>
                  <th className="py-3 px-3">Available Hours</th>
                  <th className="py-3 px-3">UPI ID / QR Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(data.doctorProfiles || [])
                  .filter((d: any) => JSON.stringify(d).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        Dr. {d.fullName}
                        <span className="block text-[10px] text-slate-400 font-mono">{d.id}</span>
                      </td>
                      <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-semibold">{d.specialization}</td>
                      <td className="py-3 px-3">{d.qualification} ({d.experienceYears || 5} yrs exp)</td>
                      <td className="py-3 px-3 font-bold text-emerald-600 font-mono">₹ {d.consultationFee}.00</td>
                      <td className="py-3 px-3 font-mono text-slate-500">{d.availableHours || '09:00 - 17:00'}</td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">{d.upiId || 'N/A'}</span>
                        {d.qrCodeUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(getFullImageUrl(d.qrCodeUrl))}
                            className="block text-[10px] text-cyan-600 underline mt-0.5"
                          >
                            Preview QR Code
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: SCREENINGS & ORAL PHOTOS TABLE */}
        {activeTab === 'screenings' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h3 className="font-bold text-base mb-4 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-purple-600" />
              <span>Oral Mucosal Scans & AI Predictions: `screenings` ({data.screenings?.length || 0} scans)</span>
            </h3>
            <div className="space-y-4">
              {(data.screenings || [])
                .filter((s: any) => JSON.stringify(s).toLowerCase().includes(searchTerm.toLowerCase()))
                .map((s: any) => (
                  <div key={s.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                    
                    {/* Scan Details */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400">Scan ID: {s.id}</span>
                        <span className="text-xs text-slate-400">• {new Date(s.createdAt).toLocaleString()}</span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Patient: {s.patientName} <span className="text-slate-400 text-xs">({s.patientPhone})</span>
                      </h4>

                      {/* AI Risk Badge */}
                      {s.prediction && (
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            s.prediction.riskCategory === 'HIGHER RISK' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300' :
                            s.prediction.riskCategory === 'REQUIRES PROFESSIONAL EVALUATION' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          }`}>
                            AI Risk: {s.prediction.riskCategory}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            Confidence: {Math.round((s.prediction.confidenceScore || 0.92) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Oral Images (Front, Left, Right) */}
                    <div className="flex items-center space-x-3">
                      {(s.images || []).map((img: any, idx: number) => {
                        const imgUrl = getFullImageUrl(img.fileUrl || img.imageUrl);
                        return (
                          <div key={idx} className="text-center">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(imgUrl)}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 relative group bg-black/20 block"
                              title={`Click to view ${img.angle || 'Oral'} Photo`}
                            >
                              <img src={imgUrl} alt="Oral Scan" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                                <ZoomIn className="w-4 h-4" />
                              </div>
                            </button>
                            <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 block">
                              {img.angle || `View ${idx + 1}`}
                            </span>
                          </div>
                        );
                      })}
                      {(!s.images || s.images.length === 0) && (
                        <div className="text-xs text-slate-400 italic">No image assets attached</div>
                      )}
                    </div>

                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 6: APPOINTMENTS TABLE */}
        {activeTab === 'appointments' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h3 className="font-bold text-base mb-4 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>Appointments Table: `appointments` ({data.appointments?.length || 0} bookings)</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Appointment #</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-3">Slot Time</th>
                  <th className="py-3 px-3">Fee</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Payment Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(data.appointments || [])
                  .filter((a: any) => JSON.stringify(a).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-cyan-600 dark:text-cyan-400 font-bold">
                        #{a.appointmentNumber || a.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white">
                        {a.patientName} <span className="block text-[10px] text-slate-400 font-mono">{a.patientPhone}</span>
                      </td>
                      <td className="py-3 px-3 font-sans">{a.doctorName}</td>
                      <td className="py-3 px-3 font-sans">
                        {new Date(a.preferredDate).toLocaleDateString()} at {a.preferredTime}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">₹ {a.consultationFee}.00</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          a.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          a.status === 'PAYMENT_SUBMITTED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          a.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {a.paymentProof?.fileUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(getFullImageUrl(a.paymentProof.fileUrl))}
                            className="text-cyan-600 hover:underline font-bold text-[11px]"
                          >
                            View Receipt 📷
                          </button>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 7: PAYMENTS TABLE */}
        {activeTab === 'payments' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h3 className="font-bold text-base mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Payments & UPI Proofs Table: `payments` ({data.payments?.length || 0} transactions)</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Txn ID</th>
                  <th className="py-3 px-3">Apt #</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Notes / UTR</th>
                  <th className="py-3 px-3">Screenshot Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(data.payments || [])
                  .filter((p: any) => JSON.stringify(p).toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 text-cyan-600 font-bold">{p.id}</td>
                      <td className="py-3 px-3 text-slate-500 font-sans">#{p.appointmentNumber}</td>
                      <td className="py-3 px-3 font-sans font-bold text-slate-900 dark:text-white">
                        {p.patientName} <span className="block text-[10px] text-slate-400 font-mono">{p.patientPhone}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-600">₹ {p.amount}.00</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          p.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-sans">{p.proofNotes || 'N/A'}</td>
                      <td className="py-3 px-3">
                        {p.screenshotUrl ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(getFullImageUrl(p.screenshotUrl))}
                            className="px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] rounded-lg hover:bg-cyan-200"
                          >
                            Inspect Screenshot 🔍
                          </button>
                        ) : (
                          <span className="text-slate-400">No Image</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS TABLE */}
        {activeTab === 'audit' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
            <h3 className="font-bold text-base mb-4 flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Live Security & Audit Trail: `auditLogs` ({data.auditLogs?.length || 0} events)</span>
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Action</th>
                  <th className="py-3 px-3">Resource</th>
                  <th className="py-3 px-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {(data.auditLogs || []).map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 text-slate-500 font-sans">{new Date(l.createdAt).toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-cyan-600">{l.userId || 'ANONYMOUS'}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{l.action}</td>
                    <td className="py-2.5 px-3 text-slate-500">{l.resource} #{l.resourceId}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">{l.ipAddress || '::1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 9: RAW JSON INSPECTOR */}
        {activeTab === 'raw_json' && (
          <div className="p-6 rounded-3xl bg-slate-900 text-slate-100 border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-sm">backend/data_store.json (Live JSON Data Stream)</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-2xl overflow-x-auto text-xs font-mono text-cyan-300 max-h-[600px] leading-relaxed select-all">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-3xl bg-slate-900 rounded-3xl p-4 border border-slate-800 shadow-2xl">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-rose-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Asset Preview"
              className="max-h-[75vh] w-auto rounded-2xl object-contain mx-auto"
            />
            <div className="mt-3 text-center">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-cyan-400 hover:underline inline-flex items-center space-x-1"
              >
                <span>Open full image in browser tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DatabaseExplorerPage;
