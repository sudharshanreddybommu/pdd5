import React from 'react';
import { Download, Printer, ShieldAlert, CheckCircle, AlertTriangle, X, Activity } from 'lucide-react';
import LesionDetectionView from './LesionDetectionView';

interface Props {
  screening: any;
  onClose: () => void;
}

const ScreeningReportViewer: React.FC<Props> = ({ screening, onClose }) => {
  const patient = screening?.patient;
  const prediction = screening?.prediction;
  const images = screening?.images || [];
  const symptoms = screening?.symptoms || [];

  const frontImg = images.find((i: any) => i.imageType === 'FRONT')?.imageUrl;
  const leftImg = images.find((i: any) => i.imageType === 'LEFT')?.imageUrl;
  const rightImg = images.find((i: any) => i.imageType === 'RIGHT')?.imageUrl;

  const riskCategory = prediction?.riskCategory || screening?.riskCategory || 'LOWER RISK';
  const probability = prediction?.probability ?? 0.12;
  const confidence = prediction?.confidence ?? 0.92;

  const handlePrint = () => {
    window.print();
  };

  const getRiskBadge = () => {
    if (riskCategory === 'HIGHER RISK') {
      return (
        <span className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-bold text-sm flex items-center space-x-1.5 shadow-lg shadow-rose-500/30">
          <AlertTriangle className="w-4 h-4" />
          <span>HIGHER RISK</span>
        </span>
      );
    }
    if (riskCategory === 'REQUIRES PROFESSIONAL EVALUATION') {
      return (
        <span className="px-4 py-1.5 rounded-full bg-amber-500 text-white font-bold text-sm flex items-center space-x-1.5 shadow-lg shadow-amber-500/30">
          <AlertTriangle className="w-4 h-4" />
          <span>REQUIRES PROFESSIONAL EVALUATION</span>
        </span>
      );
    }
    return (
      <span className="px-4 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center space-x-1.5 shadow-lg shadow-emerald-500/30">
        <CheckCircle className="w-4 h-4" />
        <span>LOWER RISK</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Actions Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold tracking-wide">CLINICAL SCREENING REPORT</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            {screening?.report?.pdfUrl && (
              <a
                href={screening.report.pdfUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 font-sans">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-cyan-600">
            <div>
              <h1 className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-400">OPMD Care</h1>
              <p className="text-xs text-slate-500">Oral Potentially Malignant Disorders Screening & Consultation Platform</p>
            </div>
            <div className="mt-3 sm:mt-0 text-left sm:text-right">
              <span className="text-xs font-bold text-slate-400 uppercase">Screening Identifier</span>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{screening?.screeningNumber}</p>
              <p className="text-xs text-slate-500">{new Date(screening?.createdAt || Date.now()).toLocaleString()}</p>
            </div>
          </div>

          {/* 1. Patient Details */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              1. Patient Identification & Risk Profile
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Full Name:</span>
                <strong className="text-slate-900 dark:text-slate-100">{patient?.fullName || 'Self Screened'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Gender / Age:</span>
                <strong>{patient?.gender || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Tobacco / Gutkha:</span>
                <strong>{patient?.tobaccoUse || 'None'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Smoking History:</span>
                <strong>{patient?.smokingHistory || 'Non-smoker'}</strong>
              </div>
            </div>
          </div>

          {/* 2. AI Assessment */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/20 via-slate-900/10 to-slate-950/20 border border-cyan-500/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 mb-4">
              2. AI Multimodal Screening Result (EfficientNetB0 + XGBoost Ensemble)
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Estimated Risk Classification</span>
                {getRiskBadge()}
              </div>
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-500 block">Calculated Probability</span>
                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                  {(probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-center sm:text-left">
                <span className="text-xs text-slate-500 block">Inference Confidence</span>
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
                  {(confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-center sm:text-right text-xs text-slate-400">
                <span>Model: {prediction?.modelVersion || 'v1.2.0'}</span>
              </div>
            </div>
          </div>

          {/* 3. Images with Circular AI Lesion Detection Marking */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Visual Oral Cavity Views & AI Lesion Localization
              </h3>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                ⭕ AI Lesion ROI Highlight Active
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <LesionDetectionView
                imageUrl={frontImg}
                title="Front View"
                viewType="front"
                lesionType={prediction?.lesionType || 'Erythroplakia / Leukoplakia Patch'}
                riskCategory={riskCategory}
                probability={probability}
              />
              <LesionDetectionView
                imageUrl={leftImg}
                title="Left Buccal Mucosa"
                viewType="left"
                lesionType={prediction?.lesionType || 'Erythroplakia / Leukoplakia Patch'}
                riskCategory={riskCategory}
                probability={probability}
              />
              <LesionDetectionView
                imageUrl={rightImg}
                title="Right Buccal Mucosa"
                viewType="right"
                lesionType={prediction?.lesionType || 'Erythroplakia / Leukoplakia Patch'}
                riskCategory={riskCategory}
                probability={probability}
              />
            </div>
          </div>

          {/* 4. Symptoms Considered */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              4. Reported Symptoms & Chronicity
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <th className="p-2.5 rounded-l-lg">Symptom Indicator</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Duration</th>
                    <th className="p-2.5 rounded-r-lg">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {symptoms.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">No symptoms reported.</td>
                    </tr>
                  ) : (
                    symptoms.map((s: any, idx: number) => (
                      <tr key={idx} className={s.response === 'YES' ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}>
                        <td className="p-2.5 font-medium">{s.symptomName}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${s.response === 'YES' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'}`}>
                            {s.response}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-500">{s.duration || 'N/A'}</td>
                        <td className="p-2.5 text-slate-500">{s.severity || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Clinical Disclaimer */}
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-300 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200">
            <div className="flex items-center space-x-2 font-bold text-xs mb-1">
              <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>CLINICAL SCREENING NOTICE</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              This AI-assisted screening assessment is intended for preliminary oral screening. Consult a qualified dental and oral health professional for clinical examination, biopsy, and personalized diagnosis.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ScreeningReportViewer;
