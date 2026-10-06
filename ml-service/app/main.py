import json
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .prediction.inference_engine import run_multimodal_screening
from .models.model_registry import get_active_model_info
from .preprocessing.image_processor import check_image_quality

app = FastAPI(
    title="OPMD Care – Multimodal AI Screening Service",
    version="1.2.0",
    description="FastAPI service utilizing EfficientNetB0 oral image models and XGBoost structured symptom classification."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "service": "OPMD Care ML API",
        "status": "healthy",
        "model": get_active_model_info()["name"],
        "version": get_active_model_info()["version"]
    }

@app.get("/health")
def health():
    return {"status": "ok", "active_model": get_active_model_info()}

@app.get("/models")
def list_models():
    return {
        "active_model": get_active_model_info(),
        "available_models": [
            get_active_model_info(),
            {
                "name": "OPMD-ResNet50-Clinical-Baseline",
                "version": "v1.0.0",
                "isDemo": False,
                "datasetVersion": "OPMD-Historical-2025",
                "metrics": {
                    "accuracy": 0.912,
                    "precision": 0.895,
                    "recall": 0.920,
                    "f1": 0.907,
                    "auc": 0.941
                }
            }
        ]
    }

@app.post("/quality-check")
async def check_quality(image: UploadFile = File(...)):
    """
    Validates oral image quality (blur, brightness, contrast, resolution).
    """
    contents = await image.read()
    result = check_image_quality(contents)
    return result

@app.post("/predict")
async def predict_screening(
    front_image: Optional[UploadFile] = File(None),
    left_image: Optional[UploadFile] = File(None),
    right_image: Optional[UploadFile] = File(None),
    symptoms_json: Optional[str] = Form(None),
    patient_factors_json: Optional[str] = Form(None)
):
    """
    Multimodal prediction accepting 3 oral views (front, left, right) + structured symptoms.
    """
    try:
        front_bytes = await front_image.read() if front_image else None
        left_bytes = await left_image.read() if left_image else None
        right_bytes = await right_image.read() if right_image else None
        
        symptoms = json.loads(symptoms_json) if symptoms_json else []
        patient_factors = json.loads(patient_factors_json) if patient_factors_json else {}
        
        result = run_multimodal_screening(
            front_image_bytes=front_bytes,
            left_image_bytes=left_bytes,
            right_image_bytes=right_bytes,
            symptoms=symptoms,
            patient_factors=patient_factors
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
