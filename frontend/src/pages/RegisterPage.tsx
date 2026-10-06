import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  UploadCloud,
  Link2,
  Trash2,
  ShieldCheck,
  Calendar,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PhoneInputWithCountry from '../components/PhoneInputWithCountry';

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

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role')?.toUpperCase() as 'PATIENT' | 'DOCTOR') || 'PATIENT';

  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>(initialRole);

  // 3-Step Wizard: 1: 'CONTACT' -> 2: 'PASSWORD' -> 3: 'DETAILS'
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Contact
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91');

  // Step 2: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 3: Patient Profile Fields
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [tobaccoUse, setTobaccoUse] = useState('None');
  const [smokingHistory, setSmokingHistory] = useState('Non-smoker');
  const [alcoholUse, setAlcoholUse] = useState('None');
  const [previousOralLesions, setPreviousOralLesions] = useState('None');
  const [medicalConditions, setMedicalConditions] = useState('None');

  // Step 3: Doctor Specific Fields
  const [qualification, setQualification] = useState('BDS, MDS');
  const [specialization, setSpecialization] = useState('Oral Medicine & Radiology');
  const [experienceYears, setExperienceYears] = useState('5');
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [pincode, setPincode] = useState('500001');
  const [consultationFee, setConsultationFee] = useState('500');
  const [availableDays, setAvailableDays] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [availableTime, setAvailableTime] = useState('09:00 - 17:00');
  const [upiId, setUpiId] = useState('');
  const [qrMode, setQrMode] = useState<'UPLOAD' | 'LINK'>('UPLOAD');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrUploadedPreview, setQrUploadedPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setAvailableDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (PNG, JPG, JPEG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setQrUploadedPreview(result);
      setQrCodeUrl(result);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Step 1 Validation -> Next to Step 2
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[\s+()-]/g, '');

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!cleanPhone || cleanPhone.length < 8) {
      setErrorMsg('Please enter a valid phone number (minimum 8 digits).');
      return;
    }

    setStep(2);
  };

  // Step 2 Validation -> Next to Step 3
  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setStep(3);
  };

  // Step 3: Final Submit & Register
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName || !fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }

    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[\s+()-]/g, '');

    try {
      if (role === 'PATIENT') {
        const res = await api.post('/auth/register/patient', {
          fullName: fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password,
          confirmPassword,
          dob,
          gender,
          city,
          state,
          tobaccoUse,
          smokingHistory,
          alcoholUse,
          previousOralLesions,
          medicalConditions
        });

        if (res.data.success) {
          setSuccessMsg('Account created successfully! Redirecting...');
          login({
            user: res.data.user,
            token: res.data.token,
            profile: res.data.profile
          });
          setTimeout(() => navigate('/patient'), 700);
        }
      } else {
        // Doctor Signup
        const finalQrUrl = qrUploadedPreview || qrCodeUrl || (upiId ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(fullName.trim())}&am=${consultationFee}&cu=INR` : '');

        const res = await api.post('/auth/register/doctor', {
          fullName: fullName.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          password,
          confirmPassword,
          qualification: qualification.trim(),
          specialization,
          experienceYears,
          hospitalName: hospitalName.trim(),
          hospitalAddress: hospitalAddress.trim(),
          city,
          state,
          pincode,
          hospitalPhone: cleanPhone,
          consultationFee,
          availableDays,
          availableTime,
          upiId: upiId.trim(),
          qrCodeUrl: finalQrUrl
        });

        if (res.data.success) {
          setSuccessMsg('Doctor account created successfully! Redirecting...');
          login({
            user: res.data.user,
            token: res.data.token,
            profile: res.data.profile,
            hospital: res.data.hospital
          });
          setTimeout(() => navigate('/doctor'), 700);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100/60 to-cyan-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
      <div className="w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-9 transition-all">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/25">
            {role === 'PATIENT' ? <User className="w-8 h-8" /> : <Stethoscope className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Create {role === 'PATIENT' ? 'Patient' : 'Doctor'} Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Join OPMD Care AI-Assisted Oral Screening & Specialist Platform
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-6">
          <button
            type="button"
            onClick={() => {
              setRole('PATIENT');
              setErrorMsg(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              role === 'PATIENT'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-md shadow-slate-950/5'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Patient Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('DOCTOR');
              setErrorMsg(null);
            }}
            className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              role === 'DOCTOR'
                ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md shadow-slate-950/5'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor / Specialist</span>
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="mb-7">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className={step >= 1 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>
              1. Contact Info
            </span>
            <span className={step >= 2 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>
              2. Set Password
            </span>
            <span className={step >= 3 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>
              3. Profile Details
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-teal-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center space-x-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: CONTACT INFO (EMAIL & PHONE)                                     */}
        {/* ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                You will use this email or your phone number to sign in anytime.
              </p>
            </div>

            <div>
              <PhoneInputWithCountry
                label="Phone Number"
                required
                value={phone}
                onChange={(fullPhone) => setPhone(fullPhone)}
                placeholder="9876543210"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <span>Next: Set Password</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SET PASSWORD                                                     */}
        {/* ========================================================================= */}
        {step === 2 && (
          <form onSubmit={handleNextFromStep2} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Create Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-3.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Next: Profile Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: DETAILS FORM (PATIENT OR DOCTOR)                                 */}
        {/* ========================================================================= */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'PATIENT' ? 'e.g. Rahul Sharma' : 'e.g. Dr. Bommu Suresh'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* PATIENT SPECIFIC DETAILS */}
            {role === 'PATIENT' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Date of Birth / Age
                    </label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hyderabad"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Telangana"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Health & Habits */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Medical & Habits Overview (Optional)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Tobacco / Gutkha
                      </label>
                      <select
                        value={tobaccoUse}
                        onChange={(e) => setTobaccoUse(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <option value="None">None</option>
                        <option value="Chewable Tobacco">Chewable Tobacco</option>
                        <option value="Betel Quid / Gutkha">Betel Quid / Gutkha</option>
                        <option value="Past User">Past User</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Smoking History
                      </label>
                      <select
                        value={smokingHistory}
                        onChange={(e) => setSmokingHistory(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <option value="Non-smoker">Non-smoker</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Regular">Regular (Cigarettes/Beedi)</option>
                        <option value="Former Smoker">Former Smoker</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* DOCTOR SPECIFIC DETAILS */}
            {role === 'DOCTOR' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Medical Qualification <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="e.g. BDS, MDS (Oral Oncology)"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                      placeholder="5"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Oral Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    {ORAL_SPECIALIZATIONS.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Hospital / Clinic Name
                    </label>
                    <input
                      type="text"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="e.g. Apollo Dental & Oral Oncology"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Consultation Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      placeholder="500"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Hyderabad"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Doctor UPI ID (for fees)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="doctor@upi"
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* QR Code Upload / Link */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Payment QR Code (Optional)
                    </label>
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => setQrMode('UPLOAD')}
                        className={`text-[11px] px-2 py-1 rounded-md font-bold ${
                          qrMode === 'UPLOAD'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Upload Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrMode('LINK')}
                        className={`text-[11px] px-2 py-1 rounded-md font-bold ${
                          qrMode === 'LINK'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        Paste Link
                      </button>
                    </div>
                  </div>

                  {qrMode === 'UPLOAD' ? (
                    qrUploadedPreview ? (
                      <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center space-x-2">
                          <img
                            src={qrUploadedPreview}
                            alt="QR Preview"
                            className="w-12 h-12 object-contain rounded-lg border bg-white"
                          />
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">QR Selected</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setQrUploadedPreview(null); setQrCodeUrl(''); }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-center bg-white dark:bg-slate-800">
                        <UploadCloud className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Click to upload QR Code</span>
                        <input type="file" accept="image/*" onChange={handleQrFileUpload} className="hidden" />
                      </label>
                    )
                  ) : (
                    <input
                      type="url"
                      value={qrCodeUrl}
                      onChange={(e) => setQrCodeUrl(e.target.value)}
                      placeholder="https://example.com/qr-code.png"
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  )}
                </div>
              </>
            )}

            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Registration & Enter Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Bottom Login Link */}
        <div className="mt-7 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to={`/login?role=${role.toLowerCase()}`}
            className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline ml-1"
          >
            Sign in directly with Email & Password
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
