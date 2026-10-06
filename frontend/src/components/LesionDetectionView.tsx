import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, Sparkles, Activity, Target } from 'lucide-react';
import { detectLesionCoordinates, DetectedLesionROI } from '../utils/lesionDetector';

interface Props {
  imageUrl?: string;
  title: string;
  viewType: 'front' | 'left' | 'right';
  lesionType?: string;
  riskCategory?: string;
  probability?: number;
}

export const LesionDetectionView: React.FC<Props> = ({
  imageUrl,
  title,
  viewType,
  lesionType = 'Erythroplakia / Leukoplakia Patch',
  riskCategory = 'HIGHER RISK',
  probability = 0.85,
}) => {
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDetecting, setIsDetecting] = useState<boolean>(true);
  const [detectedROI, setDetectedROI] = useState<DetectedLesionROI>({
    x: 50,
    y: 50,
    radius: 18,
    widthPercent: 36,
    heightPercent: 36,
    confidence: 91,
    lesionClass: 'Erythroplakia (Erythema)',
    focalAreaMm: '13mm × 10mm',
    severity: 'HIGH',
    detectedPixelsCount: 12,
  });

  // Dynamically analyze the uploaded image and pinpoint exact lesion coordinates
  useEffect(() => {
    if (!imageUrl) return;

    let isMounted = true;
    setIsDetecting(true);

    detectLesionCoordinates(imageUrl).then((roi) => {
      if (isMounted) {
        setDetectedROI(roi);
        setIsDetecting(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  if (!imageUrl) {
    return (
      <div className="w-full h-64 bg-slate-100 dark:bg-slate-800/60 rounded-2xl flex flex-col items-center justify-center border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 text-xs">
        <span>No {title} photo captured</span>
      </div>
    );
  }

  const isHighRisk = riskCategory.includes('HIGH') || probability >= 0.70;
  const isModRisk = riskCategory.includes('EVALUATION') || (probability >= 0.40 && probability < 0.70);

  const ringColor = isHighRisk
    ? '#EF4444' // Rose 500
    : isModRisk
    ? '#F59E0B' // Amber 500
    : '#10B981'; // Emerald 500

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex flex-col space-y-2 shadow-sm">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>{title}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setShowOverlay(!showOverlay)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all ${
              showOverlay
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {showOverlay ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>{showOverlay ? 'AI Circle ON' : 'AI Circle OFF'}</span>
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(zoomLevel === 1 ? 1.4 : 1)}
            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Zoom"
          >
            {zoomLevel === 1 ? <ZoomIn className="w-3 h-3" /> : <ZoomOut className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Image with Dynamic AI Lesion Coordinate Overlay */}
      <div className="relative w-full h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center select-none group">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300"
          style={{ transform: `scale(${zoomLevel})` }}
        />

        {/* Circular AI Lesion Target Reticle Pinpointed to Exact Lesion (X%, Y%) */}
        {showOverlay && (
          <div
            className="absolute pointer-events-none transition-all duration-500"
            style={{
              left: `${detectedROI.x}%`,
              top: `${detectedROI.y}%`,
              width: `${detectedROI.radius * 2}%`,
              height: `${detectedROI.radius * 2}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Glowing Pulsating Outer Ring */}
            <div
              className="w-full h-full rounded-full border-2 border-dashed animate-pulse relative flex items-center justify-center"
              style={{
                borderColor: ringColor,
                boxShadow: `0 0 24px ${ringColor}88, inset 0 0 16px ${ringColor}44`,
                backgroundColor: `${ringColor}18`,
              }}
            >
              {/* Center Crosshair Target Marker */}
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: ringColor }}
              />
              <div
                className="absolute w-6 h-0.5"
                style={{ backgroundColor: ringColor }}
              />
              <div
                className="absolute h-6 w-0.5"
                style={{ backgroundColor: ringColor }}
              />

              {/* Outer Precision Target Brackets */}
              <div
                className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2"
                style={{ borderColor: ringColor }}
              />
              <div
                className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2"
                style={{ borderColor: ringColor }}
              />
              <div
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2"
                style={{ borderColor: ringColor }}
              />
              <div
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2"
                style={{ borderColor: ringColor }}
              />
            </div>

            {/* Dynamic Detected Coordinates Floating Tag Badge */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-xl flex items-center space-x-1 backdrop-blur-md"
              style={{
                backgroundColor: isHighRisk ? 'rgba(225, 29, 72, 0.95)' : 'rgba(217, 119, 6, 0.95)',
              }}
            >
              <Target className="w-3 h-3" />
              <span>⭕ Lesion ROI ({detectedROI.x}%, {detectedROI.y}%)</span>
            </div>
          </div>
        )}

        {/* Live Detection Status Badge in corner */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md text-[10px] font-semibold text-white flex items-center space-x-1.5 border border-white/10 shadow-sm">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: ringColor }}
          />
          <span>{isDetecting ? 'Segmenting...' : `Localized (${detectedROI.confidence}%)`}</span>
        </div>
      </div>

      {/* Dynamic Lesion Classification & Focal Area Footer */}
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <div>
          <span className="text-slate-400 block text-[10px]">Detected Pathology Focus</span>
          <strong className="text-slate-800 dark:text-slate-200">{detectedROI.lesionClass}</strong>
        </div>
        <div className="text-right">
          <span className="text-slate-400 block text-[10px]">Estimated Lesion Size</span>
          <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">{detectedROI.focalAreaMm}</span>
        </div>
      </div>
    </div>
  );
};

export default LesionDetectionView;
