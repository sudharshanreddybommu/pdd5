import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, AlertCircle, Sparkles, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';

interface BiometricFingerprintScannerProps {
  mode: 'ENROLL' | 'VERIFY';
  onComplete?: () => void;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const BiometricFingerprintScanner: React.FC<BiometricFingerprintScannerProps> = ({
  mode,
  onComplete,
  onSuccess,
  onError,
  loading = false,
  title,
  subtitle,
  className = ''
}) => {
  // Enrollment Progress: 0 -> 20 -> 40 -> 60 -> 80 -> 100
  const [progress, setProgress] = useState<number>(mode === 'ENROLL' ? 0 : 0);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [touchState, setTouchState] = useState<'IDLE' | 'SCANNING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const enrollSteps = [
    { text: 'Place finger on the sensor to begin', hint: 'Center of finger pad', pct: 0 },
    { text: 'Lift and place finger again (Center)', hint: 'Keep holding firmly', pct: 25 },
    { text: 'Adjust angle: tilt finger to scan upper ridge', hint: 'Upper edge', pct: 50 },
    { text: 'Adjust angle: tilt finger to scan left & right sides', hint: 'Side edges', pct: 75 },
    { text: 'Final scan: touch the tip of your finger', hint: 'Tip of finger', pct: 100 }
  ];

  // Trigger haptic vibration on mobile devices if supported
  const triggerHaptic = (pattern: number | number[] = 50) => {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignored
      }
    }
  };

  // Handle tap / press on fingerprint sensor during enrollment
  const handleSensorTouch = () => {
    if (loading) return;

    if (mode === 'ENROLL') {
      if (progress >= 100) return;

      setTouchState('SCANNING');
      triggerHaptic(40);

      setTimeout(() => {
        const nextStep = stepIndex + 1;
        const newPct = Math.min(100, (nextStep / (enrollSteps.length - 1)) * 100);
        setProgress(newPct);
        setStepIndex(nextStep);
        setTouchState('IDLE');
        triggerHaptic([40, 60, 40]);

        if (newPct >= 100) {
          setTouchState('SUCCESS');
          triggerHaptic([100, 50, 150]);
          if (onSuccess) onSuccess();
        }
      }, 400);
    } else {
      // VERIFY Mode
      setTouchState('SCANNING');
      setErrorMessage(null);
      triggerHaptic(60);

      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleReset = () => {
    setProgress(0);
    setStepIndex(0);
    setTouchState('IDLE');
    setErrorMessage(null);
  };

  // SVG circular stroke calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Background ambient lighting */}
      <div className={`absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-30 transition-all duration-700 pointer-events-none ${
        touchState === 'SUCCESS' || progress === 100
          ? 'bg-emerald-500'
          : touchState === 'ERROR'
          ? 'bg-rose-600'
          : 'bg-cyan-500'
      }`} />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="text-center mb-5 z-10">
        <h4 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center justify-center space-x-2">
          {mode === 'ENROLL' ? (
            <>
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <span>{title || 'Register Device Fingerprint'}</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>{title || 'Touch Fingerprint Sensor to Unlock'}</span>
            </>
          )}
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          {subtitle || (mode === 'ENROLL'
            ? 'Touch the sensor multiple times and adjust edges until 100% is reached.'
            : 'Place your registered finger firmly on the sensor to authenticate.')}
        </p>
      </div>

      {/* Interactive Sensor Ring */}
      <div className="relative my-3 flex items-center justify-center z-10">
        {/* SVG Progress Circle for Enrollment */}
        {mode === 'ENROLL' && (
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              className="text-slate-800"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                progress === 100 ? 'text-emerald-400' : 'text-cyan-400'
              }`}
              fill="transparent"
            />
          </svg>
        )}

        {/* Central Fingerprint Sensor Button */}
        <button
          type="button"
          onClick={handleSensorTouch}
          disabled={loading || (mode === 'ENROLL' && progress >= 100)}
          className={`absolute w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 focus:outline-none ${
            progress === 100 || touchState === 'SUCCESS'
              ? 'bg-emerald-950/80 border-2 border-emerald-400 shadow-xl shadow-emerald-500/30'
              : touchState === 'ERROR'
              ? 'bg-rose-950/80 border-2 border-rose-500 shadow-xl shadow-rose-500/30 animate-shake'
              : touchState === 'SCANNING'
              ? 'bg-cyan-950/90 border-2 border-cyan-400 shadow-2xl shadow-cyan-400/40 scale-105'
              : 'bg-slate-800/90 hover:bg-slate-800 border-2 border-slate-700/80 hover:border-cyan-500 shadow-lg'
          }`}
          title="Tap sensor to scan finger"
        >
          {/* Laser scanning beam animation */}
          {touchState === 'SCANNING' && (
            <div className="absolute inset-x-3 h-1 bg-cyan-300 shadow-[0_0_12px_#38bdf8] rounded-full animate-bounce" />
          )}

          {progress === 100 || touchState === 'SUCCESS' ? (
            <div className="animate-in zoom-in-75 duration-300 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              <span className="text-[11px] font-black text-emerald-300 mt-1 uppercase tracking-wider">
                100% Done
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Fingerprint
                className={`w-14 h-14 transition-colors ${
                  touchState === 'SCANNING'
                    ? 'text-cyan-300 animate-pulse'
                    : 'text-slate-400 group-hover:text-cyan-400'
                }`}
              />
              <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {mode === 'ENROLL' ? `${Math.round(progress)}%` : 'Tap to Scan'}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Progress & Instruction Guidance */}
      {mode === 'ENROLL' ? (
        <div className="mt-4 text-center z-10 w-full max-w-xs space-y-3">
          {progress < 100 ? (
            <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs">
              <p className="font-bold text-cyan-300">
                {enrollSteps[stepIndex]?.text || 'Place finger on sensor'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Area: {enrollSteps[stepIndex]?.hint || 'Adjust position'}
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-300 font-bold flex items-center justify-center space-x-2 animate-in fade-in">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Fingerprint Enrollment 100% Completed!</span>
            </div>
          )}

          {/* Action Button: Reset or Done */}
          <div className="flex items-center space-x-2 pt-1">
            {progress < 100 && progress > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-semibold flex items-center space-x-1"
                title="Restart fingerprint capture"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {progress >= 100 ? (
              <button
                type="button"
                onClick={onComplete}
                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                <span>Done & Finish Setup</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSensorTouch}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Touch to Scan ({Math.round(progress)}%)</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* VERIFY Mode Controls */
        <div className="mt-4 text-center z-10 w-full max-w-xs space-y-2">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-950/70 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSensorTouch}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all transform active:scale-95"
          >
            <Fingerprint className="w-4 h-4 text-cyan-200" />
            <span>{loading ? 'Verifying with Sensor...' : 'Scan Finger to Login'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BiometricFingerprintScanner;
