import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2, ArrowRight, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const role = searchParams.get('role') || 'PATIENT';

  const navigate = useNavigate();
  const { login } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Set password form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setErrorMsg('No verification token provided in link.');
        return;
      }

      try {
        const res = await api.post('/auth/register/verify-email', { token, email });
        if (res.data.success) {
          setStatus('verified');
          setUserId(res.data.userId);
        } else {
          setStatus('error');
          setErrorMsg(res.data.message || 'Verification failed');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Verification token invalid or expired.');
      }
    };

    verify();
  }, [token, email]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      setSubmittingPassword(true);
      const res = await api.post('/auth/register/set-password', {
        userId,
        password,
        confirmPassword
      });

      if (res.data.token) {
        login({ user: res.data.user, token: res.data.token });
      }

      // If patient, go to patient details or dashboard
      if (role === 'DOCTOR') {
        navigate('/doctor');
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error setting password');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        
        {status === 'verifying' && (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Verifying your Email...
            </h3>
            <p className="text-xs text-slate-500">Checking security token authenticity.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Verification Failed
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400">{errorMsg}</p>
            <div className="pt-4">
              <Link
                to="/register"
                className="px-6 py-2.5 bg-cyan-600 text-white text-xs font-bold rounded-xl"
              >
                Try Registering Again
              </Link>
            </div>
          </div>
        )}

        {status === 'verified' && (
          <div className="py-4 text-left space-y-6 animate-in fade-in">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Email Verified Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Now set your secure password to complete your account.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars, Aa1@..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPassword}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20 flex items-center justify-center space-x-2"
              >
                <span>{submittingPassword ? 'Saving...' : 'Set Password & Enter Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;
