import React, { useState, useRef } from 'react';
import { QrCode, UploadCloud, CheckCircle, AlertCircle, X, ShieldAlert, FileText } from 'lucide-react';
import api from '../services/api';

interface Props {
  appointment: any;
  onSuccess: () => void;
  onClose: () => void;
}

const PaymentModal: React.FC<Props> = ({ appointment, onSuccess, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const doctor = appointment?.doctor;
  const hospital = appointment?.hospital;
  const fee = appointment?.fee || doctor?.consultationFee || 500;
  const doctorQrUrl = doctor?.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=opmdcare@upi&pn=${encodeURIComponent(doctor?.fullName || 'Doctor')}&am=${fee}&cu=INR`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('pdf');
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedFile) {
      setErrorMsg('Please upload a screenshot or receipt of your transaction.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      // 1. Upload the file to server
      const formData = new FormData();
      formData.append('file', selectedFile);
      const uploadRes = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const fileUrl = uploadRes.data.url;

      // 2. Submit payment proof
      await api.post('/payments/proof/submit', {
        appointmentId: appointment.id,
        fileUrl,
        notes
      });

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit payment receipt.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Consultation Fee Payment Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Appointment #{appointment?.appointmentNumber} • {doctor?.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="px-6 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/40 flex items-center space-x-2 text-xs text-amber-800 dark:text-amber-300">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Payment receipt will be verified directly by the doctor's clinic before final booking confirmation.
          </span>
        </div>

        {/* Body Split: LEFT (QR & Info), RIGHT (Upload Proof) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
          
          {/* LEFT: QR Code & Bank Info */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
            <span className="text-xs uppercase font-bold tracking-wider text-cyan-600 dark:text-cyan-400 mb-2">
              Scan UPI / QR Code
            </span>
            <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 my-2">
              <img
                src={doctorQrUrl}
                alt="Doctor Payment QR"
                className="w-48 h-48 object-contain"
              />
            </div>
            <div className="mt-3 text-lg font-extrabold text-slate-900 dark:text-slate-100">
              ₹ {fee}.00
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Beneficiary: <strong>{doctor?.fullName}</strong>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Hospital: {hospital?.name || 'Authorized Cancer Clinic'}
            </div>
            <div className="mt-3 px-3 py-1 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 text-[11px] font-semibold rounded-full">
              Accepts GooglePay, PhonePe, Paytm, BHIM & All UPI Apps
            </div>
          </div>

          {/* RIGHT: Upload Screenshot */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 tracking-wider mb-2">
                Step 2: Upload Payment Proof / Transaction Screenshot
              </label>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/jpg, application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    {previewUrl === 'pdf' ? (
                      <div className="flex items-center space-x-2 text-cyan-600 font-semibold text-sm">
                        <FileText className="w-8 h-8" />
                        <span>{selectedFile?.name}</span>
                      </div>
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Payment Receipt Preview"
                        className="max-h-40 object-contain rounded-lg shadow"
                      />
                    )}
                    <span className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold mt-3">
                      Click to choose a different receipt
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Click to upload transaction receipt
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Supports PNG, JPG, JPEG, or PDF (Max 15MB)
                    </p>
                  </div>
                )}
              </div>

              {/* UTR / Transaction Notes */}
              <div className="mt-4">
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Transaction Reference / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. UPI Ref 42918402910"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {errorMsg && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedFile || submitting}
                onClick={handleSubmitProof}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{submitting ? 'Submitting Receipt...' : 'Submit Payment Proof'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
