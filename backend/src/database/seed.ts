import { memoryDb } from './db.js';
import { hashPassword } from '../utils/hash.js';

export async function seedInitialData(reset: boolean = false) {
  if (reset) {
    memoryDb.users = [];
    memoryDb.patientProfiles = [];
    memoryDb.doctorProfiles = [];
    memoryDb.hospitals = [];
    memoryDb.webauthnCredentials = [];
    memoryDb.webauthnChallenges.clear();
    memoryDb.symptoms = [];
    memoryDb.mlModels = [];
  }

  console.log('🌱 Initializing OPMD Care platform data (Patients, Symptoms Catalog)...');

  // 1. Patient Account: Rahul Verma
  if (!memoryDb.users.some(u => u.phone === '9876543210' || u.phone === '+919876543210' || u.email === 'patient@opmdcare.org')) {
    const patientPasswordHash = await hashPassword('Patient@12345');
    const patientUserId = 'usr-pat-001';
    const patientProfId = 'pat-prof-001';

    memoryDb.users.push({
      id: patientUserId,
      email: 'patient@opmdcare.org',
      phone: '9876543210',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    memoryDb.patientProfiles.push({
      id: patientProfId,
      userId: patientUserId,
      fullName: 'Rahul Verma',
      dob: '1988-06-15T00:00:00.000Z',
      gender: 'Male',
      phone: '9876543210',
      address: 'Plot 42, Madhapur, Hitech City',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      emergencyContact: '+91 98765 43219',
      tobaccoUse: 'Yes - Chewable Gutkha (5 years, stopped 6 months ago)',
      smokingHistory: 'Occasional (1-2 cigarettes/day for 3 years)',
      alcoholUse: 'Social (1-2 times/month)',
      previousOralLesions: 'White patch on left buccal mucosa noticed 3 weeks ago',
      previousOralSurgery: 'None',
      familyHistory: 'No history of oral or head and neck cancer',
      medicalConditions: 'Mild Hypertension',
      currentMedication: 'Amlodipine 5mg',
      allergies: 'Penicillin allergy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 3. Clinical Symptoms Catalog
  const symptomList = [
    { name: "Red patches (Erythroplakia)", code: "red_patches", category: "Color & Lesion", isCommon: true },
    { name: "White patches (Leukoplakia)", code: "white_patches", category: "Color & Lesion", isCommon: true },
    { name: "Red and white patches (Erythroleukoplakia)", code: "red_and_white_patches", category: "Color & Lesion", isCommon: true },
    { name: "Persistent mouth ulcer (> 2 weeks)", code: "persistent_mouth_ulcer", category: "Ulceration", isCommon: true },
    { name: "Difficulty swallowing (Dysphagia)", code: "difficulty_swallowing", category: "Functional", isCommon: false },
    { name: "Difficulty chewing", code: "difficulty_chewing", category: "Functional", isCommon: false },
    { name: "Mouth pain or soreness", code: "mouth_pain", category: "Sensory", isCommon: true },
    { name: "Burning sensation with spicy foods", code: "burning_sensation", category: "Sensory", isCommon: true },
    { name: "Persistent irritation or roughness", code: "persistent_irritation", category: "Sensory", isCommon: false },
    { name: "Lump or localized swelling", code: "lump_swelling", category: "Tissue Growth", isCommon: true },
    { name: "Thickened or hardened oral tissue", code: "thickened_oral_tissue", category: "Tissue Growth", isCommon: true },
    { name: "Unexplained bleeding in mouth", code: "bleeding", category: "Vascular", isCommon: false },
    { name: "Numbness in tongue, lips, or mouth", code: "numbness", category: "Neurological", isCommon: false },
    { name: "Restricted mouth opening (Trismus / OSMF)", code: "restricted_mouth_opening", category: "Functional", isCommon: true },
    { name: "Persistent sore throat / hoarseness", code: "persistent_sore_throat", category: "Throat", isCommon: false },
    { name: "Change in oral tissue texture / velvety feel", code: "change_in_oral_texture", category: "Tissue Growth", isCommon: false },
    { name: "Unexplained weight loss", code: "unexplained_weight_loss", category: "Systemic", isCommon: false },
    { name: "Persistent chronic symptoms (> 3 weeks)", code: "persistent_symptoms", category: "Chronicity", isCommon: true }
  ];

  if (memoryDb.symptoms.length === 0) {
    symptomList.forEach((s, idx) => {
      memoryDb.symptoms.push({
        id: `sym-${idx + 1}`,
        name: s.name,
        code: s.code,
        description: `Evaluation for ${s.name} in oral cavity`,
        isCommon: s.isCommon,
        category: s.category,
        createdAt: new Date().toISOString()
      });
    });
  }

  // 4. Demonstration ML Model metadata
  if (memoryDb.mlModels.length === 0) {
    memoryDb.mlModels.push({
      id: 'ml-mod-001',
      name: 'OPMD-EfficientNetB0-XGBoost-Ensemble',
      version: 'v1.2.0-demo',
      datasetVersion: 'OPMD-OralCancer-Atlas-v1',
      accuracy: 0.942,
      precision: 0.928,
      recall: 0.951,
      f1: 0.939,
      sensitivity: 0.956,
      specificity: 0.931,
      auc: 0.968,
      isActive: true,
      isDemo: true,
      weightsUrl: '/weights/efficientnet_b0_opmd_v1.2.h5',
      notes: 'Multimodal ensemble demonstration model for academic/screening reference.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  memoryDb.save();
  console.log('✅ OPMD Care platform data seeded successfully (Only registered doctor bommu).');
}
