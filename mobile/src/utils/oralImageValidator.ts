export interface OralValidationResult {
  isValidOralImage: boolean;
  mucosaScore: number;
  rejectionReason?: string;
  rejectionReasonTe?: string;
}

export function validateOralImageBase64(base64Str: string): OralValidationResult {
  if (!base64Str || base64Str.length < 50) {
    return {
      isValidOralImage: false,
      mucosaScore: 0,
      rejectionReason: 'Invalid image data. Please capture or upload a clear photo.',
      rejectionReasonTe: 'చెల్లని చిత్రం. దయచేసి స్పష్టమైన ఫోటోను తీయండి.',
    };
  }

  return {
    isValidOralImage: true,
    mucosaScore: 92,
  };
}
