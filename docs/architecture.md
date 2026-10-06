# OPMD Care – Architectural Overview

## 1. System Topology & Dual-Stream Multimodal AI

OPMD Care is designed specifically for early screening of Oral Potentially Malignant Disorders (Leukoplakia, Erythroplakia, Oral Submucous Fibrosis, Lichen Planus) and seamless tele-oncology consultation.

```
                  +----------------------------------------------+
                  |              React + Vite Frontend           |
                  | (Tailwind CSS, i18next, Lucide, Web Camera)  |
                  +-----------------------+----------------------+
                                          |
                                    REST API / JSON
                                          |
                  +-----------------------v----------------------+
                  |        Node.js + Express.js Backend          |
                  |     (JWT, BCrypt, Multer, Puppeteer)         |
                  +-----------+----------------------+-----------+
                              |                      |
                    Prisma ORM / SQL           FastAPI / JSON
                              |                      |
            +-----------------v----+   +-------------v--------------------+
            | PostgreSQL Database  |   |        Python FastAPI ML         |
            | (Prisma Data Models) |   |  - EfficientNetB0 (Oral Images)  |
            +----------------------+   |  - XGBoost (Structured Symptoms) |
                                       +----------------------------------+
```

## 2. Authentication & Role-Based Access Control (RBAC)

Three distinct roles with granular authorization:
1. **PATIENT**:
   - Access to step-by-step oral cavity imaging wizard (front, left, right views with blur/lighting quality checks).
   - 18-symptom clinical checklist with duration and severity.
   - AI risk estimation (`LOWER RISK`, `REQUIRES PROFESSIONAL EVALUATION`, `HIGHER RISK`).
   - Find verified oral oncologists with Google Maps routing.
   - Book appointments and submit UPI QR payment receipts.
   - Download Puppeteer-generated clinical PDF reports.

2. **DOCTOR**:
   - Multi-step registration with medical council license validation.
   - Clinic/Hospital profile with Google Maps coordinates.
   - Incoming patient request queue (Accept, Reject, Reschedule).
   - QR code payment management & receipt verification.
   - Scheduled consultation management.

3. **ADMIN**:
   - Doctor verification & credential validation.
   - Patient & Doctor management.
   - Dataset upload & distribution analysis.
   - ML Model Registry with clinical performance metrics (Accuracy, Precision, Recall, F1, Sensitivity, Specificity, AUC) and version activation.
   - Full security audit logging.

## 3. Multimodal Ensemble Pipeline

1. **Vision Stream**:
   - Processes Front, Left Buccal Mucosa, and Right Buccal Mucosa oral views.
   - Convolutional feature representations evaluating mucosal redness (erythema), leucocytic patches (leukoplakia), and structural ulcerations.
   - Image quality validation (blur variance, brightness, resolution).

2. **Tabular Stream**:
   - XGBoost classifier processing the 18 clinical symptom indicators, chronicity duration, severity, and habit risk factors (tobacco, betel nut/paan, smoking, prior lesions).

3. **Ensemble Synthesizer**:
   - Blends visual predictions (45%) and clinical tabular scores (55%) into unified risk categorization with confidence scoring.
   - Includes mandatory clinical disclaimer: **"DEMO MODEL – NOT FOR MEDICAL USE"**.
