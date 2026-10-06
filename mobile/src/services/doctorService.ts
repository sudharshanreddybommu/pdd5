import api from './api';

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  email?: string;
  specialization: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  clinicAddress?: string;
  city?: string;
  state?: string;
  phone?: string;
  bio?: string;
  rating?: number;
  hospital?: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode?: string;
    contactNumber?: string;
  };
  isAvailableToday?: boolean;
}

export const getDoctors = async (params?: { search?: string; city?: string; specialization?: string; maxFee?: string }) => {
  try {
    const res = await api.get('/doctor/find', { params });
    if (res.data?.success && Array.isArray(res.data.doctors)) {
      return res.data.doctors.map((d: any) => ({
        id: d.id,
        userId: d.userId,
        fullName: d.fullName,
        email: d.email,
        specialization: d.specialization || 'Oral Pathologist & Specialist',
        qualification: d.qualification || 'MDS',
        experienceYears: d.experienceYears || 8,
        consultationFee: d.consultationFee || 500,
        clinicAddress: d.hospital?.address || d.hospital?.name || d.clinicAddress || 'Dental & Oncology Clinic',
        city: d.hospital?.city || d.city || 'Hyderabad',
        state: d.hospital?.state || d.state || 'Telangana',
        phone: d.hospital?.contactNumber || d.phone || '',
        bio: d.bio || 'Specialist in early diagnosis of Oral Potentially Malignant Disorders (OPMD).',
        rating: d.rating || 4.9,
        hospital: d.hospital,
        isAvailableToday: d.isAvailableToday ?? true,
      }));
    }
    return [];
  } catch (error) {
    console.warn('Error querying doctors from backend:', error);
    return [];
  }
};
