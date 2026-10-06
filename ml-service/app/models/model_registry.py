import os
import json
from typing import Dict, Any

ACTIVE_MODEL_META = {
    "name": "OPMD-EfficientNetB0-XGBoost-Ensemble",
    "version": "v1.2.0-demo",
    "isDemo": True,
    "architecture": "EfficientNetB0 (Image Branch) + XGBoost Classifier (Tabular Branch)",
    "datasetVersion": "OPMD-OralCancer-Atlas-v1",
    "metrics": {
        "accuracy": 0.942,
        "precision": 0.928,
        "recall": 0.951,
        "f1": 0.939,
        "sensitivity": 0.956,
        "specificity": 0.931,
        "auc": 0.968
    },
    "disclaimer": "DEMO MODEL – NOT FOR MEDICAL USE. This AI-based result is a screening assessment and is not a confirmed medical diagnosis. Please consult a qualified dental/oral-health professional for clinical evaluation."
}

def get_active_model_info() -> Dict[str, Any]:
    return ACTIVE_MODEL_META
