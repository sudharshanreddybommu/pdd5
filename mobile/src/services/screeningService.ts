import api from './api';

export interface SymptomItem {
  symptomName: string;
  response: 'YES' | 'NO' | 'NOT_SURE';
  duration?: string;
  severity?: string;
}

export interface ScreeningSubmission {
  images: {
    front?: string;
    left?: string;
    right?: string;
  };
  symptoms: SymptomItem[];
  otherSymptoms?: string;
  notes?: string;
}

export const DEFAULT_ORAL_SYMPTOMS = [
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

export const SAMPLE_ORAL_PRESETS = [
  {
    name: 'Leukoplakia (White Patch)',
    tag: 'Precancerous Keratinized Lesion',
    front: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    left: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
    symptomIndices: [1, 7, 8]
  },
  {
    name: 'Erythroplakia (Red Velvet Lesion)',
    tag: 'High-Risk Dysplastic Plaque',
    front: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&auto=format&fit=crop&q=80',
    left: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    symptomIndices: [0, 3, 6]
  },
  {
    name: 'Oral Submucous Fibrosis (OSMF)',
    tag: 'Fibrotic Trismus Disorder',
    front: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80',
    left: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=600&auto=format&fit=crop&q=80',
    symptomIndices: [7, 10, 13]
  }
];

export const submitScreening = async (data: ScreeningSubmission) => {
  const res = await api.post('/screening/submit', data);
  return res.data;
};

export const getScreeningDetails = async (id: string) => {
  const res = await api.get(`/screening/${id}`);
  return res.data;
};

export const getPatientScreenings = async () => {
  const res = await api.get('/patient/screenings');
  return res.data;
};
