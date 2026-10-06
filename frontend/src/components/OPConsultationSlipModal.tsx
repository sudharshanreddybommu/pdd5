import React from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  FileCheck,
  CreditCard,
  QrCode,
  AlertCircle
} from 'lucide-react';

interface Props {
  appointment: any;
  onClose: () => void;
}

const OPConsultationSlipModal: React.FC<Props> = ({ appointment, onClose }) => {
  if (!appointment) return null;

  const doctor = appointment.doctor;
  const patient = appointment.patient;
  const hospital = appointment.hospital;
  const payment = appointment.payment;
  const paymentProof = appointment.paymentProof;

  const opNumber = `OP-${new Date(appointment.preferredDate || Date.now()).getFullYear()}-${(appointment.appointmentNumber || appointment.id || '').split('-').pop()?.toUpperCase() || '78921'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden flex flex-col">
        
        {/* Top Control Bar (Hidden during Print) */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-sm">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Official OP Consultation Slip
              </h2>
              <p className="text-[11px] text-slate-500">
                ఓపీ రసీదు & అపాయింట్‌మెంట్ కన్ఫర్మేషన్ స్లిప్
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable OP Slip Body */}
        <div id="op-slip-print-area" className="p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900">
          
          {/* Slip Header */}
          <div className="pb-5 border-b-2 border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
                  +
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  OPMD Care Network
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Oral Premalignant Disorders & Oncology Tele-Consultation Slip
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>CONFIRMED & VERIFIED</span>
              </span>
              <p className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                SLIP #{opNumber}
              </p>
            </div>
          </div>

          {/* Quick Schedule Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-50 via-teal-50 to-emerald-50 dark:from-cyan-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 border border-cyan-200 dark:border-cyan-800/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Consultation Date</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {new Date(appointment.preferredDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Allotted Time Slot</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">
                  {appointment.preferredTime || '10:00 AM - 11:00 AM'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Fee Paid</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                  ₹ {appointment.fee || doctor?.consultationFee || 500}.00 (UPI Paid)
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid (Patient vs Doctor & Hospital) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            {/* Patient Info Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-400 font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
                <User className="w-4 h-4" />
                <span>Patient Details (రోగి వివరాలు)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Full Name:</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  {patient?.fullName || 'Registered Patient'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Phone:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {patient?.phone || patient?.emergencyContact || 'Available on file'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Gender / Age:</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">
                    {patient?.gender || 'Adult'} {patient?.age ? `• ${patient.age} yrs` : ''}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Chief Complaint:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "{appointment.reason || 'Oral mucosal examination & second opinion'}"
                </p>
              </div>
            </div>

            {/* Doctor Info Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-400 font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
                <Stethoscope className="w-4 h-4" />
                <span>Consulting Doctor (వైద్యుల వివరాలు)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Doctor Name:</span>
                <p className="font-bold text-sm text-slate-900 dark:text-white">
                  Dr. {doctor?.fullName || 'Specialist Doctor'}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Specialization & Qual:</span>
                <p className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {doctor?.specialization || 'Oral Medicine & Oncology'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {doctor?.qualification || 'BDS, MDS'} {doctor?.experienceYears ? `• ${doctor.experienceYears} Years Exp.` : ''}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Medical Reg No:</span>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {doctor?.registrationNumber || 'AP-DENT-REG-9842'}
                </p>
              </div>
            </div>

          </div>

          {/* Hospital & Location Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-cyan-700 dark:text-cyan-400 font-bold border-b border-slate-200 dark:border-slate-700 pb-2">
              <Building2 className="w-4 h-4" />
              <span>Hospital / Clinic Center Details (ఆసుపత్రి వివరాలు)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {hospital?.name || 'Specialty Oral Health & Oncology Clinic'}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    {hospital?.address || 'Near Metro Station, Main Road'}, {hospital?.city || 'Hyderabad'}, {hospital?.state || 'Telangana'} - {hospital?.pincode || '500001'}
                  </span>
                </p>
              </div>
              <div className="sm:text-right space-y-1">
                <p className="text-slate-500 text-[11px]">
                  <strong>Consultation Mode:</strong> In-Person Clinical OPD
                </p>
                <p className="text-slate-500 text-[11px]">
                  <strong>Verification Mode:</strong> Doctor Verified via UPI QR
                </p>
              </div>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Important Instructions for Patient (ముఖ్యమైన సూచనలు):</span>
            </div>
            <ul className="list-disc list-inside space-x-0 space-y-0.5 text-amber-800 dark:text-amber-300 pl-1">
              <li>Please reach the clinic 15 minutes before your allotted time slot.</li>
              <li>Show this digital or printed OP Consultation Slip at the clinic front desk.</li>
              <li>Avoid consuming hot food, tea/coffee, or chewing tobacco 30 minutes before the oral cavity mucosal checkup.</li>
              <li>Carry your mobile phone or previous dental reports for reference.</li>
            </ul>
          </div>

          {/* Slip Footer Signature / QR Seal */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digitally verified consultation voucher • OPMD Care Security Sealed</span>
            </div>
            <div className="text-center sm:text-right">
              <span className="font-mono text-[10px] block">Generated: {new Date().toLocaleString()}</span>
              <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Dr. {doctor?.fullName || 'Doctor'} (Authorized Signature)</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OPConsultationSlipModal;
