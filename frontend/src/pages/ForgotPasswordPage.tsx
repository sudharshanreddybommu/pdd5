import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.data.devToken) {
        setDevToken(res.data.devToken);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error requesting reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
        
        <Link to="/login" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-cyan-600 mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Forgot Password
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Enter your registered email and we will send a password reset link.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="text-center py-6 space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Reset Link Sent!</h3>
            <p className="text-xs text-slate-500">
              Please check your email inbox for instructions.
            </p>
            {devToken && (
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl text-left border border-cyan-200 dark:border-cyan-800">
                <p className="text-[11px] font-bold text-cyan-800 dark:text-cyan-300 mb-1">Quick Reset Link:</p>
                <Link
                  to={`/reset-password?token=${devToken}&email=${encodeURIComponent(email)}`}
                  className="text-xs text-cyan-600 dark:text-cyan-400 underline font-semibold break-all"
                >
                  Click Here to Reset Password
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;
