import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  History,
  Search,
  Calendar,
  FileText,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Activity,
  Plus,
  ShieldCheck,
  Download,
  User,
  Settings
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ScreeningReportViewer from '../components/ScreeningReportViewer';
import PatientProfileModal from '../components/PatientProfileModal';

const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();

  const [screenings, setScreenings] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedScreeningForReport, setSelectedScreeningForReport] = useState<any | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(
    searchParams.get('tab') === 'profile' || searchParams.get('editProfile') === 'true'
  );

  useEffect(() => {
    if (searchParams.get('tab') === 'profile' || searchParams.get('editProfile') === 'true') {
      setShowProfileModal(true);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [scRes, aptRes] = await Promise.all([
        api.get('/patient/screenings'),
        api.get('/patient/appointments')
      ]);
      if (scRes.data.success) setScreenings(scRes.data.screenings || []);
      if (aptRes.data.success) setAppointments(aptRes.data.appointments || []);
    } catch (err) {
      console.error('Error loading patient dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRiskBadge = (category: string) => {
    if (category === 'HIGHER RISK') {
      return (
        <span className="px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>HIGHER RISK</span>
        </span>
      );
    }
    if (category === 'REQUIRES PROFESSIONAL EVALUATION') {
      return (
        <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>EVALUATION NEEDED</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center space-x-1">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>LOWER RISK</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Banner / Welcome */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white shadow-xl mb-10 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-300">
              PATIENT HEALTH PORTAL
            </span>
            <h1 className="text-3xl font-black mt-1 mb-2">
              Welcome back, {profile?.fullName || user?.fullName || user?.email?.split('@')[0] || 'Patient'}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100/80 leading-relaxed mb-6">
              Track your oral mucosal health, view AI screening predictions, and update your medical habits anytime.
            </p>

            {/* Actions: Start Screening & Edit Profile */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/screening"
                className="inline-flex items-center space-x-3 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-cyan-500/30 transition-transform transform hover:-translate-y-0.5"
              >
                <Camera className="w-5 h-5 text-slate-950" />
                <span className="tracking-wide">START ORAL SCREENING</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </Link>

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="inline-flex items-center space-x-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm rounded-2xl backdrop-blur-sm transition-all"
              >
                <Settings className="w-4 h-4 text-cyan-300" />
                <span>Edit Profile & Settings</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:block absolute right-8 bottom-0 opacity-15 pointer-events-none">
            <Activity className="w-72 h-72 text-cyan-200" />
          </div>
        </div>

        {/* 6 Dashboard Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {/* 1. Start Oral Screening */}
          <Link
            to="/screening"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-cyan-500 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                1. Start Oral Screening
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Take front, left, and right photos and answer symptoms questionnaire for multimodal AI risk assessment.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Previous Screenings */}
          <div
            onClick={() => {
              const el = document.getElementById('previous-screenings-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-500 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                2. Previous Screenings
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Review your {screenings.length} completed oral mucosal assessments, risk histories, and images.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-teal-600 dark:text-teal-400">
              <span>View Past Results ({screenings.length})</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Find Doctors */}
          <Link
            to="/find-doctors"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                3. Find Doctors
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Discover verified oral oncology specialists, view Google Maps clinics & check consultation fees.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Browse Specialists</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Appointments */}
          <Link
            to="/patient/appointments"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                4. Appointments & Payments
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check consultation booking status, upload QR payment receipts, and manage scheduled consultations.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Active Consultations ({appointments.length})</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 5. Reports */}
          <div
            onClick={() => {
              if (screenings.length > 0) setSelectedScreeningForReport(screenings[0]);
            }}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                5. Clinical PDF Reports
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download and print detailed clinical screening assessment summaries to present to your dentist.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>{screenings.length > 0 ? 'Open Latest Report' : 'No Reports Yet'}</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Profile & Account Settings */}
          <div
            onClick={() => setShowProfileModal(true)}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-cyan-500 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                6. Profile & Health Settings
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Update your personal info, state/city, emergency contact, tobacco/smoking habits, and password anytime.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400">
              <span>Manage Profile & Habits</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Previous Screenings List Section */}
        <div id="previous-screenings-section" className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Previous Oral Screenings</h2>
              <p className="text-xs text-slate-500">History of your AI multimodal assessments</p>
            </div>
            <Link
              to="/screening"
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Screening</span>
            </Link>
          </div>

          {screenings.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No screenings performed yet.</p>
              <p className="text-xs mt-1">Click "Start Oral Screening" above to complete your first assessment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Screening ID</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">AI Risk Result</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {screenings.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {s.screeningNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {getRiskBadge(s.prediction?.riskCategory || s.riskCategory)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                        {((s.prediction?.confidence || s.confidence || 0.9) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedScreeningForReport(s)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-semibold text-xs inline-flex items-center space-x-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Screening Report Viewer Modal */}
      {selectedScreeningForReport && (
        <ScreeningReportViewer
          screening={selectedScreeningForReport}
          onClose={() => setSelectedScreeningForReport(null)}
        />
      )}

      {/* Patient Profile & Account Settings Modal */}
      <PatientProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onSuccess={() => {
          fetchData();
        }}
      />

    </div>
  );
};

export default PatientDashboard;

