# OPMD Care – Python FastAPI ML Service

The ML service is situated in `/ml-service` and provides real-time multimodal inference combining visual features from oral mucosal images and tabular symptoms.

## Architecture
- **Image Stream**: EfficientNetB0 backbone evaluating color distribution, erythema index, texture variance, and ulcer boundary irregularity.
- **Tabular Stream**: XGBoost classifier trained on the 18 clinical symptoms, duration, severity, and habit risk factors.
- **Ensemble Synthesizer**: Produces weighted risk probability, confidence score, and categorical assignment:
  - `LOWER RISK` (< 0.32 probability)
  - `REQUIRES PROFESSIONAL EVALUATION` (0.32 – 0.65 probability)
  - `HIGHER RISK` (> 0.65 probability)

## Endpoints
- `GET /health`: Model status and version metadata.
- `GET /models`: Returns active and available model registry entries.
- `POST /quality-check`: Validates image blur variance, brightness (35-230/255), and resolution.
- `POST /predict`: Multimodal screening endpoint accepting `front_image`, `left_image`, `right_image`, `symptoms_json`, and `patient_factors_json`.

## Retraining with Custom Datasets
When new clinical cohorts are uploaded through the Admin Portal, the model weights can be retrained and activated dynamically through the Model Registry without modifying frontend or backend application code.
