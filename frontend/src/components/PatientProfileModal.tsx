cd import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  ShieldCheck,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Activity,
  HeartPulse,
  Key,
  Globe,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ALL_INDIA_STATES, getCitiesForState } from '../utils/indiaLocations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
];

const PatientProfileModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile, updateProfileState } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'habits' | 'security'>('profile');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    age: '30',
    gender: 'Male',
    bloodGroup: 'B+',
    avatarUrl: '',
    address: '',
    state: 'Telangana',
    city: 'Hyderabad',
    pincode: '',
    tobaccoHabit: 'NO',
    arecaNutHabit: false,
    alcoholHabit: false,
    smokingDuration: 'None',
    emergencyContact: '',
    medicalHistory: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize data from current user and profile
  useEffect(() => {
    if (user || profile) {
      const stateVal = profile?.state || 'Telangana';
      setFormData({
        fullName: profile?.fullName || user?.fullName || '',
        phone: profile?.phone || user?.phone || '',
        email: user?.email || '',
        age: String(profile?.age || 30),
        gender: profile?.gender || 'Male',
        bloodGroup: profile?.bloodGroup || 'B+',
        avatarUrl: profile?.avatarUrl || user?.avatarUrl || AVATAR_OPTIONS[0],
        address: profile?.address || '',
        state: stateVal,
        city: profile?.city || 'Hyderabad',
        pincode: profile?.pincode || '',
        tobaccoHabit: profile?.tobaccoHabit || 'NO',
        arecaNutHabit: Boolean(profile?.arecaNutHabit),
        alcoholHabit: Boolean(profile?.alcoholHabit),
        smokingDuration: profile?.smokingDuration || 'None',
        emergencyContact: profile?.emergencyContact || '',
        medicalHistory: profile?.medicalHistory || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAvailableCities(getCitiesForState(stateVal));
    }
  }, [user, profile, isOpen]);

  // Handle State Change
  const handleStateChange = (stateName: string) => {
    const cities = getCitiesForState(stateName);
    setAvailableCities(cities);
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      city: cities[0] || ''
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    // Validate password change
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setStatusMessage({ type: 'error', text: 'Please enter your current password to set a new password.' });
        setSaving(false);
        return;
      }
      if (formData.newPassword.length < 6) {
        setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
        setSaving(false);
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
        setSaving(false);
        return;
      }
    }

    try {
      const res = await api.put('/patient/profile', formData);
      if (res.data.success) {
        setStatusMessage({ type: 'success', text: 'Profile and account settings updated successfully!' });
        
        // Sync local auth context state
        if (res.data.user) {
          updateProfileState?.(res.data.profile, res.data.user);
        }

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-cyan-900 via-teal-900 to-slate-900 text-white flex items-center justify-between border-b border-cyan-800/40">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest text-cyan-300 uppercase">
                PATIENT PORTAL
              </span>
              <h2 className="text-xl font-black text-white">
                Profile & Account Settings
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-6 pt-3 space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'profile'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Personal & Contact Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('habits')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'habits'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>2. Habits & Health Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs font-extrabold rounded-t-xl border-b-2 transition-all flex items-center space-x-2 ${
              activeTab === 'security'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>3. Password & Security</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-bold ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: PERSONAL & CONTACT INFO */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Profile Avatar
                </label>
                <div className="flex items-center space-x-3">
                  {AVATAR_OPTIONS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Avatar"
                      onClick={() => setFormData({ ...formData, avatarUrl: url })}
                      className={`w-12 h-12 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                        formData.avatarUrl === url
                          ? 'border-cyan-500 ring-2 ring-cyan-500/40 scale-105'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* State (All-India 28 States & 8 UTs) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State / Union Territory
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {ALL_INDIA_STATES.map((st: string) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / District
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    {availableCities.map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                {/* Address Line */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Residential Address & Pincode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Street, Landmark, Area"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="col-span-2 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Pincode (e.g. 500033)"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: HABITS & CLINICAL PROFILE */}
          {activeTab === 'habits' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200">
                <p className="font-bold mb-1">🩺 Clinical Risk Profiling</p>
                <p>
                  Accurate habit information helps our AI multimodality engine evaluate your Oral Potentially Malignant Disorder (OPMD) baseline score.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Tobacco / Gutkha Habit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tobacco / Smoking Habit
                  </label>
                  <select
                    value={formData.tobaccoHabit}
                    onChange={(e) => setFormData({ ...formData, tobaccoHabit: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="NO">Never Used (Non-smoker)</option>
                    <option value="OCCASIONAL">Occasional / Social (1-3 times/month)</option>
                    <option value="DAILY_MILD">Daily Mild (1-5 cigarettes or beedis/day)</option>
                    <option value="DAILY_HEAVY">Daily Heavy (6+ cigarettes or gutkha daily)</option>
                    <option value="FORMER">Former User (Quit recently)</option>
                  </select>
                </div>

                {/* Duration of Habit */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Habit Duration (Years)
                  </label>
                  <select
                    value={formData.smokingDuration}
                    onChange={(e) => setFormData({ ...formData, smokingDuration: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="None">None</option>
                    <option value="< 1 year">Less than 1 year</option>
                    <option value="1–5 years">1 to 5 years</option>
                    <option value="5–10 years">5 to 10 years</option>
                    <option value="10+ years">More than 10 years</option>
                  </select>
                </div>

                {/* Areca Nut / Betel Quid */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Areca Nut / Pan Masala</p>
                    <p className="text-[11px] text-slate-500">Regular chewing of supari or paan</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.arecaNutHabit}
                    onChange={(e) => setFormData({ ...formData, arecaNutHabit: e.target.checked })}
                    className="w-5 h-5 accent-cyan-600 rounded cursor-pointer"
                  />
                </div>

                {/* Alcohol */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Alcohol Consumption</p>
                    <p className="text-[11px] text-slate-500">Regular alcohol intake</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.alcoholHabit}
                    onChange={(e) => setFormData({ ...formData, alcoholHabit: e.target.checked })}
                    className="w-5 h-5 accent-cyan-600 rounded cursor-pointer"
                  />
                </div>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Relative / Guardian mobile"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

                {/* Medical History / Allergies */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Known Medical Conditions / Drug Allergies
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Diabetes, Hypertension, Penicillin allergy, Bleeding gums"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-black text-slate-900 dark:text-white mb-1 flex items-center space-x-2">
                  <Key className="w-4 h-4 text-cyan-600" />
                  <span>Change Password</span>
                </h4>
                <p className="text-[11px] text-slate-500 mb-4">
                  Leave these fields blank if you do not wish to change your current password.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="At least 6 characters"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Re-enter new password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-cyan-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FIDO2 Biometric Info */}
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-teal-900 dark:text-teal-200">
                    FIDO2 / WebAuthn Biometric Security
                  </p>
                  <p className="text-teal-700 dark:text-teal-300 mt-0.5">
                    Your account supports seamless FaceID, Windows Hello, and Fingerprint passwordless authentication.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile & Settings'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default PatientProfileModal;
