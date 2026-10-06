import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Stethoscope,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Fingerprint,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import MobileAccessModal from '../components/MobileAccessModal';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role')?.toUpperCase() as 'PATIENT' | 'DOCTOR') || 'PATIENT';

  const navigate = useNavigate();
  const { login } = useAuth();

  const [roleTab, setRoleTab] = useState<'PATIENT' | 'DOCTOR'>(initialRole);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  // Email & Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanInput = emailOrPhone.trim();
    if (!cleanInput) {
      setErrorMsg('Please enter your registered Email or Phone number.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: cleanInput,
        phoneOrEmail: cleanInput,
        password,
        role: roleTab,
        rememberMe
      });

      if (res.data.success) {
        setSuccessMsg('Login successful! Entering dashboard...');
        login({
          user: res.data.user,
          token: res.data.token,
          profile: res.data.profile,
          hospital: res.data.hospital
        });

        setTimeout(() => {
          if (res.data.user.role === 'DOCTOR') {
            navigate('/doctor');
          } else {
            navigate('/patient');
          }
        }, 500);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid email or password. Please check your credentials.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole: 'PATIENT' | 'DOCTOR') => {
    setRoleTab(newRole);
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmailOrPhone('');
    setPassword('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100/60 to-cyan-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-7 sm:p-9 transition-all">
        
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/25">
            {roleTab === 'PATIENT' ? <User className="w-8 h-8" /> : <Stethoscope className="w-8 h-8" />}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {roleTab === 'PATIENT' ? 'Patient Login' : 'Doctor Login'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in with your registered email and password to access your portal
          </p>
        </div>

        {/* Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('PATIENT')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              roleTab === 'PATIENT'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-md shadow-slate-950/5'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('DOCTOR')}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              roleTab === 'DOCTOR'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md shadow-slate-950/5'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Standard Email & Password Form */}
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Registered Email or Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                placeholder="your.email@example.com or 9876543210"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Remember me on this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-500 hover:to-teal-500 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2.5 transition-all hover:scale-[1.01] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to {roleTab === 'PATIENT' ? 'Patient' : 'Doctor'} Portal</span>
                <ArrowRight className="w-4 h-4 text-cyan-200" />
              </>
            )}
          </button>
        </form>

        {/* Phone QR Code helper button */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setIsMobileModalOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Open & Scan on Mobile Phone (QR Code)</span>
          </button>
        </div>

        {/* Signup Link */}
        <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link
            to={`/register?role=${roleTab.toLowerCase()}`}
            className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline ml-1"
          >
            Sign up as {roleTab === 'PATIENT' ? 'Patient' : 'Doctor'}
          </Link>
        </div>

        {/* Mobile Access Modal */}
        <MobileAccessModal
          isOpen={isMobileModalOpen}
          onClose={() => setIsMobileModalOpen(false)}
          localIp="10.236.114.42"
          port={5173}
        />

      </div>
    </div>
  );
};

export default LoginPage;
