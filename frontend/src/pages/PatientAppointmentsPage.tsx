import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Building, CreditCard, CheckCircle, AlertTriangle, FileText, ArrowRight, Printer, FileCheck } from 'lucide-react';
import api from '../services/api';
import PaymentModal from '../components/PaymentModal';
import OPConsultationSlipModal from '../components/OPConsultationSlipModal';

const PatientAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedForPayment, setSelectedForPayment] = useState<any | null>(null);
  const [selectedForOpSlip, setSelectedForOpSlip] = useState<any | null>(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patient/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">CONFIRMED</span>;
      case 'PAYMENT_SUBMITTED':
        return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">PAYMENT SUBMITTED</span>;
      case 'ACCEPTED':
      case 'PAYMENT_PENDING':
        return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">ACTION REQUIRED: PAY FEE</span>;
      case 'PENDING':
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs">PENDING DOCTOR ACCEPTANCE</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs">REJECTED</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold text-xs">COMPLETED</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
            CONSULTATIONS & BOOKINGS
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            My Appointments & Payment History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track appointment approvals, submit UPI QR payments, and download confirmation receipts.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No appointments scheduled yet.</p>
            <p className="text-xs mt-1">Browse our verified oral specialists to book a consultation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const doctor = apt.doctor;
              const hospital = apt.hospital;
              const canPay = apt.status === 'ACCEPTED' || apt.status === 'PAYMENT_PENDING';

              return (
                <div
                  key={apt.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {apt.appointmentNumber}
                      </span>
                      {getStatusBadge(apt.status)}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Dr. {doctor?.fullName} • {doctor?.specialization}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{new Date(apt.preferredDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-cyan-600" />
                        <span>{apt.preferredTime}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hospital?.name || 'Authorized Clinic'}</span>
                      </span>
                    </div>

                    {apt.reason && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                        <strong>Reason:</strong> {apt.reason}
                      </p>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Fee</span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        ₹ {apt.fee || doctor?.consultationFee || 500}.00
                      </span>
                    </div>

                    {canPay && (
                      <button
                        type="button"
                        onClick={() => setSelectedForPayment(apt)}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center space-x-2"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay via Doctor QR</span>
                      </button>
                    )}

                    {(apt.status === 'CONFIRMED' || apt.status === 'COMPLETED') && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-xl flex items-center space-x-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{apt.status === 'COMPLETED' ? 'Completed' : 'Booking Confirmed'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedForOpSlip(apt)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 flex items-center space-x-1.5 transition-all active:scale-95"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>View OP Form (ఓపీ రసీదు)</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Payment Proof Upload Modal */}
      {selectedForPayment && (
        <PaymentModal
          appointment={selectedForPayment}
          onSuccess={() => {
            setSelectedForPayment(null);
            fetchAppointments();
          }}
          onClose={() => setSelectedForPayment(null)}
        />
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

export default PatientAppointmentsPage;
