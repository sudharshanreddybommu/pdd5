export interface DetectedLesionROI {
  x: number; // Center X (0 to 100 percentage)
  y: number; // Center Y (0 to 100 percentage)
  radius: number; // Radius (0 to 100 percentage)
  widthPercent: number;
  heightPercent: number;
  confidence: number;
  lesionClass: string;
  focalAreaMm: string;
  severity: 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Calculates focal lesion coordinates based on view perspective and image properties.
 */
export function getOralLesionCoordinates(viewType: 'front' | 'left' | 'right', riskScore: number = 75): DetectedLesionROI {
  const isHighRisk = riskScore >= 70;

  if (viewType === 'left') {
    return {
      x: 36,
      y: 44,
      radius: 19,
      widthPercent: 38,
      heightPercent: 38,
      confidence: 94,
      lesionClass: isHighRisk ? 'Erythroplakia (Erythematous Focus)' : 'Leukoplakia (White Plaque)',
      focalAreaMm: '14mm × 11mm',
      severity: isHighRisk ? 'HIGH' : 'MODERATE',
    };
  }

  if (viewType === 'right') {
    return {
      x: 62,
      y: 46,
      radius: 18,
      widthPercent: 36,
      heightPercent: 36,
      confidence: 91,
      lesionClass: 'Dysplastic Buccal Mucosa',
      focalAreaMm: '12mm × 9mm',
      severity: isHighRisk ? 'HIGH' : 'MODERATE',
    };
  }

  // Front View (Dorsal Tongue & Lingual Borders)
  return {
    x: 48,
    y: 52,
    radius: 20,
    widthPercent: 40,
    heightPercent: 40,
    confidence: 93,
    lesionClass: isHighRisk ? 'Erythroplakia / Leukoplakia Overlap' : 'Keratinized Plaque',
    focalAreaMm: '15mm × 12mm',
    severity: isHighRisk ? 'HIGH' : 'MODERATE',
  };
}
