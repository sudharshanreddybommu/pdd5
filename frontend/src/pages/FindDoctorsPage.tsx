import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  MapPin,
  Stethoscope,
  Calendar,
  Clock,
  Phone,
  ShieldCheck,
  Filter,
  DollarSign,
  Building,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import api from '../services/api';
import GoogleMapsModal from '../components/GoogleMapsModal';
import { useAuth } from '../context/AuthContext';
import { ALL_INDIA_STATES_AND_CITIES, ALL_INDIAN_STATES, ALL_INDIAN_CITIES_FLAT } from '../utils/indiaLocations';

const FindDoctorsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [maxFee, setMaxFee] = useState<string>('');

  // Modals
  const [mapDoctor, setMapDoctor] = useState<{ doctor: any; hospital: any } | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<any | null>(null);

  // Booking form state
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:30 AM');
  const [reason, setReason] = useState('Oral screening evaluation / Biopsy consultation');
  const [message, setMessage] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);
  const [bookingErrorMsg, setBookingErrorMsg] = useState<string | null>(null);

  // Dynamically compute available cities based on selected state
  const availableCities = selectedState
    ? ALL_INDIA_STATES_AND_CITIES.find(s => s.state === selectedState)?.cities || []
    : ALL_INDIAN_CITIES_FLAT;

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedState) params.state = selectedState;
      if (selectedCity) params.city = selectedCity;
      if (selectedSpec) params.specialization = selectedSpec;
      if (maxFee) params.maxFee = maxFee;

      const res = await api.get('/doctor/find', { params });
      if (res.data.success) {
        setDoctors(res.data.doctors || []);
      }
    } catch (err) {
      console.error('Error querying doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [searchQuery, selectedState, selectedCity, selectedSpec, maxFee]);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;

    setBookingErrorMsg(null);
    setBookingSuccessMsg(null);
    setSubmittingBooking(true);

    try {
      const res = await api.post('/appointments/request', {
        doctorId: bookingDoctor.id,
        hospitalId: bookingDoctor.hospital?.id,
        preferredDate,
        preferredTime,
        reason,
        message
      });

      if (res.data.success) {
        setBookingSuccessMsg(`Appointment requested! Your ID is ${res.data.appointment.appointmentNumber}. The doctor will review your slot.`);
        setTimeout(() => {
          setBookingDoctor(null);
          setBookingSuccessMsg(null);
        }, 3000);
      }
    } catch (err: any) {
      setBookingErrorMsg(err.response?.data?.message || 'Error scheduling appointment.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
            TELE-ONCOLOGY & DENTAL SPECIALISTS
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {t('doctor.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('doctor.subtitle')}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Query */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor, hospital, city..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* State Filter (All Indian States & UTs) */}
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity(''); // Reset city when state changes
            }}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="">🇮🇳 All Indian States ({ALL_INDIAN_STATES.length})</option>
            {ALL_INDIAN_STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* City Filter (Filtered by state or all cities) */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="">
              {selectedState ? `All Cities in ${selectedState} (${availableCities.length})` : `All Indian Cities (${availableCities.length})`}
            </option>
            {availableCities.map((ct) => (
              <option key={ct} value={ct}>
                {ct}
              </option>
            ))}
          </select>

          {/* Specialization Filter */}
          <select
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="">{t('doctor.allSpecialties')}</option>
            <option value="Oral Oncologist">Oral Oncology</option>
            <option value="Oral Pathology">Oral Pathology</option>
            <option value="Oral Medicine">Oral Medicine & Radiology</option>
            <option value="Maxillofacial Surgery">Maxillofacial Surgery</option>
          </select>

          {/* Max Fee Filter */}
          <select
            value={maxFee}
            onChange={(e) => setMaxFee(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
          >
            <option value="">{t('doctor.fee')}: All Fees</option>
            <option value="500">Under ₹500</option>
            <option value="750">Under ₹750</option>
            <option value="1000">Under ₹1000</option>
            <option value="1500">Under ₹1500</option>
          </select>

        </div>

        {/* Doctors Directory Cards */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading verified doctors directory...
          </div>
        ) : doctors.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto shadow-inner">
              <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No Registered Doctors in Directory Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Dental and oral specialists who register through the Doctor Portal will appear here.
            </p>
            <div className="pt-2">
              <a
                href="/register?role=DOCTOR"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-cyan-500/25 transition-transform hover:-translate-y-0.5"
              >
                <Stethoscope className="w-4 h-4" />
                <span>Are you a Doctor? Register Your Clinic</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doc) => {
              const hospital = doc.hospital;
              return (
                <div
                  key={doc.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Doctor Info & Photo */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-start space-x-3.5">
                        {doc.profilePhoto ? (
                          <img
                            src={doc.profilePhoto}
                            alt={doc.fullName}
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/30 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-teal-500 to-blue-600 text-white flex items-center justify-center font-black text-xl uppercase shadow-md shadow-cyan-500/20 border-2 border-cyan-500/30 flex-shrink-0">
                            {doc.fullName ? doc.fullName.charAt(0) : 'D'}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                              {doc.fullName}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold text-[10px] flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3 text-cyan-600" />
                              <span>Registered Doctor</span>
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-0.5">
                            {doc.specialization}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {doc.qualification} • {doc.experienceYears} {t('doctor.experience')}
                          </p>
                        </div>
                      </div>

                      {/* Map Icon Button */}
                      <button
                        type="button"
                        onClick={() => setMapDoctor({ doctor: doc, hospital })}
                        className="p-2.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-600 dark:text-cyan-400 transition-colors shadow-sm"
                        title="View Hospital Location on Google Maps"
                      >
                        <MapPin className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Hospital & Location Details */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5 mb-4">
                      <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold">
                        <Building className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{hospital?.name || 'Oral Oncology Specialty Clinic'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-5">
                        {hospital?.address}, {hospital?.city}, {hospital?.state}
                      </p>
                      <div className="flex items-center space-x-4 text-[11px] text-slate-500 pl-5 pt-1">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{doc.availableHours || '09:30 AM - 05:30 PM'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{doc.phone}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fee & Action Row */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('doctor.fee')}</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        ₹ {doc.consultationFee}.00
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setMapDoctor({ doctor: doc, hospital })}
                        className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {t('doctor.viewOnMap')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBookingDoctor(doc);
                          setPreferredDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20"
                      >
                        {t('doctor.bookAppointment')}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Google Maps Modal */}
      {mapDoctor && (
        <GoogleMapsModal
          doctor={mapDoctor.doctor}
          hospital={mapDoctor.hospital}
          onClose={() => setMapDoctor(null)}
        />
      )}

      {/* Appointment Request Modal */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-600 tracking-wider">BOOK CONSULTATION</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Request Appointment with {bookingDoctor.fullName}
                </h3>
              </div>
              <button
                onClick={() => setBookingDoctor(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Consultation Requested!</h4>
                <p className="text-xs text-slate-500">{bookingSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-4">
                
                {bookingErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-xs text-rose-700 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{bookingErrorMsg}</span>
                  </div>
                )}

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs space-y-1">
                  <div className="text-slate-500">Patient: <strong>{profile?.fullName || user?.email}</strong></div>
                  <div className="text-slate-500">Hospital: <strong>{bookingDoctor.hospital?.name}</strong></div>
                  <div className="text-slate-500">Consultation Fee: <strong>₹ {bookingDoctor.consultationFee}.00</strong></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Preferred Time *
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="09:30 AM">09:30 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="05:00 PM">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reason for Consultation
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. White patch second opinion"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Message to Doctor (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Any prior biopsy history or questions..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setBookingDoctor(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBooking}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20"
                  >
                    {submittingBooking ? 'Submitting Request...' : 'Send Request'}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default FindDoctorsPage;
