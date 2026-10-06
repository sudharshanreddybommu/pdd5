from typing import List, Dict, Any
import numpy as np

# High-risk symptoms for Oral Potentially Malignant Disorders (OPMD)
HIGH_RISK_SYMPTOMS = {
    "red_patches": 3.0,
    "white_patches": 2.8,
    "red_and_white_patches": 3.5, # Erythroleukoplakia - highest malignant transformation
    "persistent_mouth_ulcer": 2.5,
    "thickened_oral_tissue": 2.2,
    "restricted_mouth_opening": 2.6, # Oral Submucous Fibrosis (OSMF)
    "lump_swelling": 2.4,
    "bleeding": 2.0,
    "numbness": 2.2,
    "difficulty_swallowing": 1.8,
    "difficulty_chewing": 1.6,
    "burning_sensation": 1.5,
    "persistent_irritation": 1.4,
    "mouth_pain": 1.2,
    "persistent_sore_throat": 1.3,
    "change_in_oral_texture": 1.5,
    "unexplained_weight_loss": 2.0,
    "persistent_symptoms": 1.7
}

DURATION_WEIGHTS = {
    "Less than 1 week": 0.5,
    "1–2 weeks": 1.0,
    "2–4 weeks": 1.8,
    "More than 1 month": 2.5
}

SEVERITY_WEIGHTS = {
    "Mild": 1.0,
    "Moderate": 1.8,
    "Severe": 2.8
}

def encode_structured_features(symptoms: List[Dict[str, Any]], patient_factors: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Transforms structured symptom survey answers and habit risk factors into clinical scores.
    """
    if patient_factors is None:
        patient_factors = {}
        
    symptom_risk_score = 0.0
    positive_count = 0
    high_risk_flag = False
    
    for item in symptoms:
        name = str(item.get("symptomName", "")).lower().replace(" ", "_").replace("/", "_").replace("-", "_")
        response = str(item.get("response", "NO")).upper()
        duration = item.get("duration", "1–2 weeks")
        severity = item.get("severity", "Mild")
        
        if response == "YES":
            positive_count += 1
            # Base weight for symptom
            base_weight = 1.0
            for key, weight in HIGH_RISK_SYMPTOMS.items():
                if key in name or name in key:
                    base_weight = weight
                    if weight >= 2.5:
                        high_risk_flag = True
                    break
                    
            dur_mult = DURATION_WEIGHTS.get(duration, 1.0)
            sev_mult = SEVERITY_WEIGHTS.get(severity, 1.0)
            
            symptom_risk_score += (base_weight * dur_mult * sev_mult)
        elif response == "NOT_SURE":
            symptom_risk_score += 0.3

    # Factor in habits (Tobacco, Smoking, Alcohol, Prior Lesions)
    habit_risk = 0.0
    tobacco = str(patient_factors.get("tobaccoUse", "")).lower()
    smoking = str(patient_factors.get("smokingHistory", "")).lower()
    alcohol = str(patient_factors.get("alcoholUse", "")).lower()
    prior_lesions = str(patient_factors.get("previousOralLesions", "")).lower()
    
    if "daily" in tobacco or "yes" in tobacco or "chew" in tobacco or "gutkha" in tobacco or "paan" in tobacco:
        habit_risk += 2.5
    if "current" in smoking or "yes" in smoking or "heavy" in smoking:
        habit_risk += 2.0
    if "regular" in alcohol or "heavy" in alcohol or "yes" in alcohol:
        habit_risk += 1.5
    if "yes" in prior_lesions or "leukoplakia" in prior_lesions or "erythroplakia" in prior_lesions or "osmf" in prior_lesions:
        habit_risk += 3.0
        
    total_clinical_score = symptom_risk_score + habit_risk
    
    return {
        "symptom_risk_score": round(float(symptom_risk_score), 2),
        "habit_risk_score": round(float(habit_risk), 2),
        "total_clinical_score": round(float(total_clinical_score), 2),
        "positive_symptoms_count": positive_count,
        "high_risk_flag": high_risk_flag
    }
