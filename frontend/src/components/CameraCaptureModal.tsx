import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  X,
  UploadCloud,
  Eye,
  ShieldCheck,
  ShieldX,
  Sparkles
} from 'lucide-react';
import { validateOralCavityCanvas, OralValidationResult } from '../utils/oralImageValidator';
import InvalidImageModal from './InvalidImageModal';

interface Props {
  viewTitle: string; // e.g. "Front View (Tongue & Palate)"
  viewKey: 'front' | 'left' | 'right';
  currentImage?: string;
  onImageCaptured: (imageUrl: string, qualityPassed: boolean) => void;
  onClose: () => void;
}

const CameraCaptureModal: React.FC<Props> = ({
  viewTitle,
  viewKey,
  currentImage,
  onImageCaptured,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(currentImage || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<OralValidationResult | null>(null);
  const [showInvalidModal, setShowInvalidModal] = useState<boolean>(false);

  // Initialize camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      setCameraError('Camera access denied or unavailable. Please enable camera permissions or upload an image from your device.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const validation = validateOralCavityCanvas(canvas);
      setValidationResult(validation);
      setCapturedUrl(dataUrl);
      stopCamera();

      if (!validation.isValidOralImage) {
        setShowInvalidModal(true);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const dataUrl = event.target?.result as string;
          const validation = validateOralCavityCanvas(canvas);
          setValidationResult(validation);
          setCapturedUrl(dataUrl);
          stopCamera();

          if (!validation.isValidOralImage) {
            setShowInvalidModal(true);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so user can choose another file if needed
    e.target.value = '';
  };

  const retake = () => {
    setCapturedUrl(null);
    setValidationResult(null);
    setShowInvalidModal(false);
    startCamera();
  };

  const confirmImage = () => {
    if (capturedUrl && validationResult?.isValidOralImage) {
      onImageCaptured(capturedUrl, true);
      onClose();
    } else {
      setShowInvalidModal(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-cyan-600 dark:text-cyan-400">
                  AI ORAL CAVITY ACQUISITION
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  Strict Anatomical Filtering
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{viewTitle}</h3>
            </div>
            <button
              onClick={() => { stopCamera(); onClose(); }}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Viewport / Camera Body */}
          <div className="relative bg-slate-950 flex items-center justify-center min-h-[360px] max-h-[480px] overflow-hidden">
            
            {/* Live Video */}
            {!capturedUrl && isCameraActive && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Anatomical positioning overlay guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center border-4 border-dashed border-cyan-400/50 m-6 rounded-3xl">
                  <div className="text-center bg-slate-950/80 px-4 py-2 rounded-full text-xs text-cyan-200 backdrop-blur-md shadow-lg border border-cyan-500/30">
                    {viewKey === 'front' && '👄 Position open mouth & tongue in center'}
                    {viewKey === 'left' && '🔍 Position left cheek / buccal mucosa clearly'}
                    {viewKey === 'right' && '🔍 Position right cheek / buccal mucosa clearly'}
                  </div>
                </div>

                {/* Live Scanning Laser Effect */}
                <div className="absolute left-0 right-0 h-0.5 bg-cyan-400/70 shadow-[0_0_12px_2px_rgba(6,182,212,0.8)] scan-beam pointer-events-none" />
              </>
            )}

            {/* Captured Preview */}
            {capturedUrl && (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <img
                  src={capturedUrl}
                  alt="Captured oral view"
                  className="max-h-[360px] w-auto object-contain rounded-2xl shadow-xl border border-slate-800"
                />

                {/* Floating Validation Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  {validationResult?.isValidOralImage ? (
                    <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 text-xs font-bold flex items-center space-x-1.5 shadow-lg backdrop-blur-md">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Valid Oral Cavity Photo ({validationResult.mucosaScore}% match)</span>
                    </div>
                  ) : (
                    <div className="px-3.5 py-1.5 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500/60 text-xs font-bold flex items-center space-x-1.5 shadow-lg backdrop-blur-md">
                      <ShieldX className="w-4 h-4 text-rose-400 animate-pulse" />
                      <span>Invalid Non-Oral Image Detected</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error / Fallback message */}
            {!isCameraActive && !capturedUrl && (
              <div className="p-8 text-center text-slate-300 space-y-4">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-400" />
                <p className="text-sm max-w-sm mx-auto">{cameraError || 'Camera inactive. Click start or upload from device.'}</p>
                <button
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Retry Camera Access
                </button>
              </div>
            )}

          </div>

          {/* Quality & Anatomical Feedback Banner */}
          {validationResult && (
            <div className={`p-4 border-t text-xs flex items-center justify-between ${
              validationResult.isValidOralImage
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-center space-x-2">
                {validationResult.isValidOralImage ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>
                  {validationResult.isValidOralImage
                    ? 'Oral tissue features verified. Ready for multimodal AI screening.'
                    : validationResult.rejectionReason}
                </span>
              </div>

              <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-white/60 dark:bg-slate-800/60 border">
                Tissue Score: {validationResult.mucosaScore}%
              </span>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between flex-wrap gap-3">
            
            {/* Left Controls: File Upload & Hidden Canvas */}
            <div className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
              <canvas ref={canvasRef} className="hidden" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700/70 flex items-center space-x-2 transition-colors"
              >
                <UploadCloud className="w-4 h-4 text-cyan-600" />
                <span>Upload From Device</span>
              </button>
            </div>

            {/* Right Controls: Capture / Retake / Confirm */}
            <div className="flex items-center space-x-2">
              {!capturedUrl && isCameraActive && (
                <button
                  type="button"
                  onClick={captureFrame}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 flex items-center space-x-2 active:scale-95 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capture Photo</span>
                </button>
              )}

              {capturedUrl && (
                <>
                  <button
                    type="button"
                    onClick={retake}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-1.5 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake</span>
                  </button>

                  <button
                    type="button"
                    disabled={!validationResult?.isValidOralImage}
                    onClick={confirmImage}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center space-x-2 active:scale-95 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Use Photo</span>
                  </button>
                </>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Invalid Image Popup Dialog Modal */}
      <InvalidImageModal
        isOpen={showInvalidModal}
        rejectionReason={validationResult?.rejectionReason || 'Only oral cavity, mouth, and tongue photos are allowed.'}
        rejectionReasonTe={validationResult?.rejectionReasonTe}
        mucosaScore={validationResult?.mucosaScore}
        onClose={() => setShowInvalidModal(false)}
        onRetry={retake}
        onProceedAnyway={() => {
          if (capturedUrl) {
            onImageCaptured(capturedUrl, true);
            onClose();
          }
        }}
      />
    </>
  );
};

export default CameraCaptureModal;
