import React, { useState } from 'react';
import { Smartphone, QrCode, X, Wifi, Check, ExternalLink, ShieldCheck, Edit3 } from 'lucide-react';

interface MobileAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  localIp?: string;
  port?: number;
}

export const MobileAccessModal: React.FC<MobileAccessModalProps> = ({
  isOpen,
  onClose,
  localIp = '10.236.114.42',
  port = 5173
}) => {
  // Auto-detect hostname if opened via IP or use default current Wi-Fi IP
  const defaultIp = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? window.location.hostname
    : '10.236.114.42';

  const [ipAddress, setIpAddress] = useState(defaultIp);
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const mobileUrl = `http://${ipAddress}:${port}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(mobileUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/25">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Open on Mobile Phone
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Connect your phone to the same Wi-Fi & scan this QR code.
          </p>
        </div>

        {/* QR Code Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center my-3">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100">
            <img
              src={qrApiUrl}
              alt="Scan to Open on Mobile Phone"
              className="w-48 h-48 rounded-lg object-contain"
            />
          </div>

          <div className="mt-3 w-full text-center">
            {isEditing ? (
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value.trim())}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-cyan-500 bg-white dark:bg-slate-900 text-xs font-mono text-center text-slate-800 dark:text-white"
                  placeholder="e.g. 10.236.114.42"
                />
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold"
                >
                  Set
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <a
                  href={mobileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-200 dark:border-cyan-800 inline-flex items-center space-x-1 hover:underline"
                >
                  <span>{mobileUrl}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400"
                  title="Edit IP"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start space-x-2.5">
            <Wifi className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>Ensure your phone is connected to the same Wi-Fi network.</span>
          </div>
          <div className="flex items-start space-x-2.5">
            <QrCode className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
            <span>Open phone camera or QR scanner to scan the code.</span>
          </div>
          <div className="flex items-start space-x-2.5">
            <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>Or directly open <strong>http://10.236.114.42:5173</strong> in your phone's browser.</span>
          </div>
        </div>

        {/* Done Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MobileAccessModal;
