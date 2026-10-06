import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Activity,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  Search,
  ShieldAlert,
  Loader2,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Stethoscope,
  Info
} from 'lucide-react';
import CameraCaptureModal from '../components/CameraCaptureModal';
import ScreeningReportViewer from '../components/ScreeningReportViewer';
import InvalidImageModal from '../components/InvalidImageModal';
import LesionDetectionView from '../components/LesionDetectionView';
import { validateOralImageDataUrl, OralValidationResult } from '../utils/oralImageValidator';
import api from '../services/api';

interface SymptomState {
  symptomName: string;
  response: 'YES' | 'NO' | 'NOT_SURE';
  duration?: string;
  severity?: string;
}

const DEFAULT_SYMPTOMS = [
  "Red patches (Erythroplakia)",
  "White patches (Leukoplakia)",
  "Red and white patches (Erythroleukoplakia)",
  "Persistent mouth ulcer (> 2 weeks)",
  "Difficulty swallowing (Dysphagia)",
  "Difficulty chewing",
  "Mouth pain or soreness",
  "Burning sensation with spicy foods",
  "Persistent irritation or roughness",
  "Lump or localized swelling",
  "Thickened or hardened oral tissue",
  "Unexplained bleeding in mouth",
  "Numbness in tongue or lips",
  "Restricted mouth opening (Trismus / OSMF)",
  "Persistent sore throat or hoarseness",
  "Change in oral tissue texture",
  "Unexplained weight loss",
  "Persistent symptoms (> 3 weeks)"
];

// Verified Clinical Sample Photos for Quick Evaluation
const SAMPLE_ORAL_PRESETS = [
  {
    name: 'Leukoplakia (White Patch)',
    tag: 'Precancerous Keratinized Lesion',
    front: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    left: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
    symptomIndices: [1, 7, 8] // White patches, burning sensation, irritation
  },
  {
    name: 'Erythroplakia (Red Velvet Lesion)',
    tag: 'High-Risk Dysplastic Plaque',
    front: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80',
    left: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    symptomIndices: [0, 3, 6] // Red patches, persistent ulcer, pain
  },
  {
    name: 'Oral Submucous Fibrosis (OSMF)',
    tag: 'Fibrotic Trismus Disorder',
    front: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    left: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
    symptomIndices: [7, 10, 13] // Burning sensation, thickened tissue, restricted opening
  }
];

const OralScreeningWizard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Images state
  const [images, setImages] = useState<{
    front?: string;
    left?: string;
    right?: string;
  }>({});

  const [imageQualityFlags, setImageQualityFlags] = useState<{
    front: boolean;
    left: boolean;
    right: boolean;
  }>({ front: false, left: false, right: false });

  // Camera Modal state
  const [activeCameraModal, setActiveCameraModal] = useState<'front' | 'left' | 'right' | null>(null);

  // Invalid Image Dialog State
  const [invalidModalData, setInvalidModalData] = useState<{
    isOpen: boolean;
    reason: string;
    reasonTe?: string;
    mucosaScore?: number;
    pendingView?: 'front' | 'left' | 'right';
    pendingUrl?: string;
  }>({ isOpen: false, reason: '' });

  // Symptoms state
  const [symptomsData, setSymptomsData] = useState<SymptomState[]>(
    DEFAULT_SYMPTOMS.map((name) => ({
      symptomName: name,
      response: 'NO',
      duration: '1–2 weeks',
      severity: 'Mild'
    }))
  );

  const [otherSymptoms, setOtherSymptoms] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // ML Results state
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [screeningResult, setScreeningResult] = useState<any | null>(null);
  const [showFullReport, setShowFullReport] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle validated image capture from modal
  const handleImageSet = (view: 'front' | 'left' | 'right', url: string, passed: boolean) => {
    setImages((prev) => ({ ...prev, [view]: url }));
    setImageQualityFlags((prev) => ({ ...prev, [view]: passed }));
    setErrorMessage(null);
  };

  const deleteImage = (view: 'front' | 'left' | 'right') => {
    setImages((prev) => {
      const copy = { ...prev };
      delete copy[view];
      return copy;
    });
    setImageQualityFlags((prev) => ({ ...prev, [view]: false }));
  };

  // Direct file upload validation
  const handleDirectFileUpload = async (view: 'front' | 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const validation = await validateOralImageDataUrl(dataUrl);

      if (!validation.isValidOralImage) {
        setInvalidModalData({
          isOpen: true,
          reason: validation.rejectionReason || 'Uploaded image does not appear to be an oral cavity/tongue photograph.',
          reasonTe: validation.rejectionReasonTe,
          mucosaScore: validation.mucosaScore,
          pendingView: view,
          pendingUrl: dataUrl
        });
        return;
      }

      handleImageSet(view, dataUrl, true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Quick Preset Sample Loader
  const loadOralSamplePreset = (preset: typeof SAMPLE_ORAL_PRESETS[0]) => {
    setImages({
      front: preset.front,
      left: preset.left,
      right: preset.right
    });
    setImageQualityFlags({ front: true, left: true, right: true });

    // Mark relevant symptoms as YES
    setSymptomsData((prev) =>
      prev.map((s, idx) => ({
        ...s,
        response: preset.symptomIndices.includes(idx) ? 'YES' : 'NO'
      }))
    );
    setErrorMessage(null);
  };

  // Symptom radio selector handler
  const handleSymptomResponseChange = (index: number, response: 'YES' | 'NO' | 'NOT_SURE') => {
    setSymptomsData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], response };
      return updated;
    });
  };

  const handleSymptomDetailChange = (index: number, field: 'duration' | 'severity', val: string) => {
    setSymptomsData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  // Step 4 -> 5 AI Multimodal Analysis
  const submitToAI = async () => {
    // Strict image check
    if (!images.front && !images.left && !images.right) {
      setErrorMessage('Please capture or upload at least one valid oral cavity photograph.');
      setStep(1);
      return;
    }

    setAnalyzing(true);
    setErrorMessage(null);

    try {
      const payload = {
        images,
        symptoms: symptomsData,
        otherSymptoms,
        notes: additionalNotes
      };

      const res = await api.post('/screening/submit', payload);
      if (res.data.success) {
        const detailsRes = await api.get(`/screening/${res.data.screeningId}`);
        setScreeningResult(detailsRes.data.screening);
        setStep(5);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Error processing AI screening.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wizard Progress Stepper */}
        <div className="mb-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
            <span className={step >= 1 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>{t('screening.stepper1')}</span>
            <span className={step >= 2 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>{t('screening.stepper2')}</span>
            <span className={step >= 3 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>{t('screening.stepper3')}</span>
            <span className={step >= 4 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>{t('screening.stepper4')}</span>
            <span className={step >= 5 ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : ''}>{t('screening.stepper5')}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-600 via-teal-500 to-blue-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Oral Anatomy Verification Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center space-x-3 text-cyan-900 dark:text-cyan-200 text-xs shadow-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          <div className="leading-relaxed">
            {t('screening.strictOralCheck')}
          </div>
        </div>

        {/* Quick Clinical Oral Preset Selector for Easy Testing */}
        {step <= 3 && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {t('screening.quickPresetsTitle')}
                </span>
              </div>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                {t('screening.quickPresetsSubtitle')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_ORAL_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => loadOralSamplePreset(p)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-cyan-200 dark:border-cyan-800 text-left hover:border-cyan-500 hover:shadow-sm transition-all"
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{p.tag}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center space-x-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: FRONT VIEW */}
        {step === 1 && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-cyan-600 tracking-wider">STEP 1 OF 5</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                  {t('screening.step1Subtitle')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t('screening.step1Title')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('screening.step1Desc')}
              </p>
            </div>

            {/* Instruction Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>{t('screening.lightingCheck')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>{t('screening.blurCheck')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                <span>{t('screening.tongueCheck')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{t('screening.filterCheck')}</span>
              </div>
            </div>

            {/* View Preview Box */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[260px] text-center bg-slate-50/50 dark:bg-slate-800/20">
              {images.front ? (
                <div className="relative group max-w-sm">
                  <img
                    src={images.front}
                    alt="Front view preview"
                    className="w-full h-56 object-cover rounded-2xl shadow-md border border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1.5">
                    <button
                      onClick={() => deleteImage('front')}
                      className="p-2 rounded-xl bg-rose-600 text-white shadow hover:bg-rose-500 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveCameraModal('front')}
                      className="p-2 rounded-xl bg-slate-900/80 text-white shadow hover:bg-slate-900 transition-colors"
                      title="Retake Image"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('screening.verifiedOralImg')}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {t('screening.noFrontImage')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t('screening.onlyMouthAccepted')}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveCameraModal('front')}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-cyan-500/20 inline-flex items-center space-x-2 hover:opacity-90 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('screening.openCamera')}</span>
                    </button>

                    <label className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer inline-flex items-center space-x-2 active:scale-95">
                      <UploadCloud className="w-4 h-4 text-cyan-600" />
                      <span>{t('screening.uploadImage')}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleDirectFileUpload('front', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="button"
                disabled={!images.front}
                onClick={() => {
                  if (!images.front) {
                    setErrorMessage('Please capture or upload a valid Front View oral photo before proceeding.');
                    return;
                  }
                  setStep(2);
                }}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center space-x-2 active:scale-95 transition-all"
              >
                <span>{t('screening.proceedLeft')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LEFT VIEW */}
        {step === 2 && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-cyan-600 tracking-wider">STEP 2 OF 5</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                  {t('screening.step2Subtitle')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t('screening.step2Title')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('screening.step2Desc')}
              </p>
            </div>

            {/* View Preview Box */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[260px] text-center bg-slate-50/50 dark:bg-slate-800/20">
              {images.left ? (
                <div className="relative group max-w-sm">
                  <img
                    src={images.left}
                    alt="Left view preview"
                    className="w-full h-56 object-cover rounded-2xl shadow-md border border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1.5">
                    <button
                      onClick={() => deleteImage('left')}
                      className="p-2 rounded-xl bg-rose-600 text-white shadow hover:bg-rose-500 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveCameraModal('left')}
                      className="p-2 rounded-xl bg-slate-900/80 text-white shadow hover:bg-slate-900 transition-colors"
                      title="Retake Image"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('screening.verifiedOralImg')}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {t('screening.noLeftImage')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t('screening.onlyMouthAccepted')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveCameraModal('left')}
                      className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 inline-flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('screening.openCamera')}</span>
                    </button>

                    <label className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer inline-flex items-center space-x-2">
                      <UploadCloud className="w-4 h-4 text-teal-600" />
                      <span>{t('screening.uploadImage')}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleDirectFileUpload('left', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('screening.back')}</span>
              </button>
              <button
                type="button"
                disabled={!images.left}
                onClick={() => {
                  if (!images.left) {
                    setErrorMessage('Please capture or upload a valid Left View oral photo before proceeding.');
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center space-x-2"
              >
                <span>{t('screening.proceedRight')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: RIGHT VIEW */}
        {step === 3 && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-cyan-600 tracking-wider">STEP 3 OF 5</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {t('screening.step3Subtitle')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t('screening.step3Title')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('screening.step3Desc')}
              </p>
            </div>

            {/* View Preview Box */}
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[260px] text-center bg-slate-50/50 dark:bg-slate-800/20">
              {images.right ? (
                <div className="relative group max-w-sm">
                  <img
                    src={images.right}
                    alt="Right view preview"
                    className="w-full h-56 object-cover rounded-2xl shadow-md border border-slate-200 dark:border-slate-700"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1.5">
                    <button
                      onClick={() => deleteImage('right')}
                      className="p-2 rounded-xl bg-rose-600 text-white shadow hover:bg-rose-500 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveCameraModal('right')}
                      className="p-2 rounded-xl bg-slate-900/80 text-white shadow hover:bg-slate-900 transition-colors"
                      title="Retake Image"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('screening.verifiedOralImg')}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {t('screening.noRightImage')}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {t('screening.onlyMouthAccepted')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveCameraModal('right')}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{t('screening.openCamera')}</span>
                    </button>

                    <label className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer inline-flex items-center space-x-2">
                      <UploadCloud className="w-4 h-4 text-blue-600" />
                      <span>{t('screening.uploadImage')}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleDirectFileUpload('right', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('screening.back')}</span>
              </button>
              <button
                type="button"
                disabled={!images.right}
                onClick={() => {
                  if (!images.right) {
                    setErrorMessage('Please capture or upload a valid Right View oral photo before proceeding.');
                    return;
                  }
                  setStep(4);
                }}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl flex items-center space-x-2"
              >
                <span>{t('screening.proceedSymptoms')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CLINICAL SYMPTOMS CHECKLIST */}
        {step === 4 && (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-cyan-600 tracking-wider">STEP 4 OF 5</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {t('screening.step4Subtitle')}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {t('screening.step4Title')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('screening.step4Desc')}
              </p>
            </div>

            {/* Symptoms Grid */}
            <div className="space-y-3">
              {symptomsData.map((symptom, idx) => (
                <div
                  key={symptom.symptomName}
                  className={`p-4 rounded-2xl border transition-all ${
                    symptom.response === 'YES'
                      ? 'bg-cyan-50/80 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {idx + 1}. {symptom.symptomName}
                    </div>

                    {/* Radio Options */}
                    <div className="flex items-center space-x-2">
                      {(['YES', 'NO', 'NOT_SURE'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSymptomResponseChange(idx, opt)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            symptom.response === opt
                              ? opt === 'YES'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : opt === 'NO'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-700 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {opt === 'NOT_SURE' ? 'Unsure' : opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration & Severity if YES */}
                  {symptom.response === 'YES' && (
                    <div className="mt-3 pt-3 border-t border-cyan-200/60 dark:border-cyan-900/40 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Duration:</label>
                        <select
                          value={symptom.duration}
                          onChange={(e) => handleSymptomDetailChange(idx, 'duration', e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <option value="< 1 week">Less than 1 week</option>
                          <option value="1–2 weeks">1–2 weeks</option>
                          <option value="3–4 weeks">3–4 weeks</option>
                          <option value="> 1 month">More than 1 month</option>
                          <option value="Chronic (&gt; 3 months)">Chronic (&gt; 3 months)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-1">Severity / Pain:</label>
                        <select
                          value={symptom.severity}
                          onChange={(e) => handleSymptomDetailChange(idx, 'severity', e.target.value)}
                          className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <option value="Mild (Painless / Slight irritation)">Mild (Painless / Slight)</option>
                          <option value="Moderate (Noticeable burning/soreness)">Moderate (Noticeable burning)</option>
                          <option value="Severe (Intense pain / restricted function)">Severe (Intense / restricted)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Additional Notes */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('screening.additionalNotesLabel')}
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder={t('screening.notesPlaceholder')}
                rows={3}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Navigation */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('screening.back')}</span>
              </button>

              <button
                type="button"
                disabled={analyzing}
                onClick={submitToAI}
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-700 hover:from-cyan-500 hover:to-teal-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-all active:scale-95"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('screening.analyzing')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('screening.runAIAnalysis')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: AI SCREENING RESULT & CLINICAL REPORT */}
        {step === 5 && screeningResult && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Risk Category Card */}
            <div className={`p-8 rounded-3xl border shadow-xl ${
              screeningResult.riskCategory === 'HIGHER RISK'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 glow-rose'
                : screeningResult.riskCategory === 'REQUIRES PROFESSIONAL EVALUATION'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 glow-amber'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 glow-emerald'
            }`}>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[11px] uppercase font-mono font-bold tracking-wider text-slate-500">
                    SCREENING ID: {screeningResult.screeningNumber}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {t('screening.riskCategoryLabel')}: {screeningResult.riskCategory}
                  </h2>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-900/80 border shadow-sm">
                    {t('screening.confidenceLabel')}: {Math.round((screeningResult.confidence || 0.92) * 100)}%
                  </span>
                </div>
              </div>

              {/* Multimodal Probability Gauge */}
              <div className="my-6">
                <div className="flex items-center justify-between text-xs font-bold mb-2 text-slate-700 dark:text-slate-300">
                  <span>{t('screening.preMalignantProb')}:</span>
                  <span className="font-mono text-sm">{Math.round((screeningResult.overallScore || 0.5) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      screeningResult.riskCategory === 'HIGHER RISK'
                        ? 'bg-rose-600'
                        : screeningResult.riskCategory === 'REQUIRES PROFESSIONAL EVALUATION'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.round((screeningResult.overallScore || 0.5) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Visual Oral Cavity Views with Circular AI Lesion Localization */}
              <div className="my-6 pt-4 border-t border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase font-bold text-slate-700 dark:text-slate-300">
                    ⭕ AI Lesion Segmentation & Circular ROI Localization
                  </span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                    Live Marker Active
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <LesionDetectionView
                    imageUrl={images.front}
                    title="Front View"
                    viewType="front"
                    lesionType={screeningResult.lesionType || 'Erythroplakia / Leukoplakia Patch'}
                    riskCategory={screeningResult.riskCategory}
                    probability={screeningResult.overallScore || 0.85}
                  />
                  <LesionDetectionView
                    imageUrl={images.left}
                    title="Left Buccal View"
                    viewType="left"
                    lesionType={screeningResult.lesionType || 'Erythroplakia / Leukoplakia Patch'}
                    riskCategory={screeningResult.riskCategory}
                    probability={screeningResult.overallScore || 0.85}
                  />
                  <LesionDetectionView
                    imageUrl={images.right}
                    title="Right Buccal View"
                    viewType="right"
                    lesionType={screeningResult.lesionType || 'Erythroplakia / Leukoplakia Patch'}
                    riskCategory={screeningResult.riskCategory}
                    probability={screeningResult.overallScore || 0.85}
                  />
                </div>
              </div>

              {/* Action Buttons: Find Doctors & View PDF Summary */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/find-doctors"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-500/20 flex items-center space-x-2 transition-transform hover:scale-105"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>{t('screening.findDoctorsBtn')}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowFullReport(true)}
                  className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <FileText className="w-4 h-4 text-cyan-600" />
                  <span>{t('screening.viewReport')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setScreeningResult(null);
                    setImages({});
                  }}
                  className="px-4 py-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold"
                >
                  {t('screening.startNewScreening')}
                </button>
              </div>

            </div>

            {/* Screening Summary Breakdown Viewer Modal */}
            {showFullReport && (
              <ScreeningReportViewer
                screening={screeningResult}
                onClose={() => setShowFullReport(false)}
              />
            )}

          </div>
        )}

      </div>

      {/* Camera Capture Modal */}
      {activeCameraModal && (
        <CameraCaptureModal
          viewKey={activeCameraModal}
          viewTitle={
            activeCameraModal === 'front'
              ? 'Front View (Tongue & Palate)'
              : activeCameraModal === 'left'
              ? 'Left Buccal Mucosa & Cheek Lining'
              : 'Right Buccal Mucosa & Cheek Lining'
          }
          currentImage={images[activeCameraModal]}
          onImageCaptured={(url, passed) => handleImageSet(activeCameraModal, url, passed)}
          onClose={() => setActiveCameraModal(null)}
        />
      )}

      {/* Invalid Image Rejection Alert Dialog Modal */}
      <InvalidImageModal
        isOpen={invalidModalData.isOpen}
        rejectionReason={invalidModalData.reason}
        rejectionReasonTe={invalidModalData.reasonTe}
        mucosaScore={invalidModalData.mucosaScore}
        onClose={() => setInvalidModalData({ isOpen: false, reason: '' })}
        onRetry={() => setInvalidModalData({ isOpen: false, reason: '' })}
        onProceedAnyway={() => {
          if (invalidModalData.pendingView && invalidModalData.pendingUrl) {
            handleImageSet(invalidModalData.pendingView, invalidModalData.pendingUrl, true);
          }
        }}
      />

    </div>
  );
};

export default OralScreeningWizard;
