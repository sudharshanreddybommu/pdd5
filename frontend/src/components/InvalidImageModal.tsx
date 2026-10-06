import React from 'react';
import { AlertOctagon, X, Camera, RefreshCw, CheckCircle2, ShieldX } from 'lucide-react';

interface Props {
  isOpen: boolean;
  rejectionReason: string;
  rejectionReasonTe?: string;
  mucosaScore?: number;
  onClose: () => void;
  onRetry: () => void;
  onProceedAnyway?: () => void;
}

const InvalidImageModal: React.FC<Props> = ({
  isOpen,
  rejectionReason,
  rejectionReasonTe,
  mucosaScore,
  onClose,
  onRetry,
  onProceedAnyway
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-2 border-rose-500 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white flex items-start justify-between shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-lg flex-shrink-0 animate-pulse border border-white/30">
              <ShieldX className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-black tracking-widest text-rose-100">
                🚨 ORAL CAVITY CHECK
              </span>
              <h3 className="text-xl font-black text-white">
                Oral Image Verification
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Main Rejection Box */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-xs sm:text-sm text-rose-900 dark:text-rose-200 leading-relaxed font-semibold">
            <p className="font-extrabold text-rose-700 dark:text-rose-300 mb-1.5 text-sm sm:text-base flex items-center space-x-1.5">
              <span>⚠️</span>
              <span>{rejectionReason || 'Only oral cavity, mouth, and tongue photographs are accepted.'}</span>
            </p>
            <p className="text-xs text-rose-800 dark:text-rose-300 mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/60">
              {rejectionReasonTe || 'చెల్లని చిత్రం: ఈ ఫోటోలో నోరు లేదా నాలుక భాగం తగినంత స్పష్టంగా గుర్తించబడలేదు. దయచేసి సరైన నోరు లేదా నాలుక ఫోటోను మాత్రమే అప్‌లోడ్ చేయండి.'}
            </p>
          </div>

          {/* Tissue Match indicator */}
          {typeof mucosaScore === 'number' && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-bold">
                Oral Tissue Recognition:
              </span>
              <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm">
                {mucosaScore}%
              </span>
            </div>
          )}

          {/* Guidelines */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Accepted Clinical Photos:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Tongue (protruded, dorsal, lateral borders, ulcers)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Open mouth wide showing teeth, palate, or gums</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Inner cheek lining (Left or Right buccal mucosa)</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-end gap-2">
          {onProceedAnyway && (
            <button
              type="button"
              onClick={() => {
                onProceedAnyway();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            >
              ✓ Confirm Oral Image & Proceed
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              onClose();
              onRetry();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 flex items-center space-x-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Select Another Photo</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvalidImageModal;
