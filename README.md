# OPMD Care – Oral Potentially Malignant Disorders Screening & Consultation Platform

**OPMD Care** is a complete, production-ready full-stack web application for early AI screening of Oral Potentially Malignant Disorders (Leukoplakia, Erythroplakia, Oral Submucous Fibrosis, Lichen Planus) and seamless tele-oncology consultation with verified oral specialists.

---

## 🚀 Key Features

1. **Patient Registration & Auth Flow**:
   - Step 1: Email verification token with Nodemailer.
   - Step 2: Secure password establishment (uppercase, lowercase, number, special character).
   - Step 3: Patient profile & oral health habit questionnaire (tobacco, smoking, alcohol, prior lesions).

2. **Step-by-Step Oral Screening Wizard**:
   - Step 1: Front view (Tongue, Palate, Floor of Mouth).
   - Step 2: Left buccal mucosa view.
   - Step 3: Right buccal mucosa view.
   - Live browser camera with anatomical positioning guide & real-time blur/brightness validation.
   - Step 4: 18-symptom clinical checklist with duration and severity.
   - Step 5: Dual-stream AI Multimodal inference with risk categorization (`LOWER RISK`, `REQUIRES PROFESSIONAL EVALUATION`, `HIGHER RISK`), confidence score, and clear **"DEMO MODEL – NOT FOR MEDICAL USE"** disclaimer.

3. **Clinical PDF Report Generation**:
   - Puppeteer-generated clinical screening summary with images, symptom breakdown, risk score, and medical disclaimer.

4. **Find Doctors & Google Maps Integration**:
   - Search by Doctor name, Hospital, City, Specialization, Fee.
   - Integrated Google Maps modal with hospital location, patient geolocation, route, distance calculation, and direct navigation.

5. **Appointment Booking & Double-Booking Prevention**:
   - Unique appointment numbers (e.g., `OPMD-APT-2026-000001`).
   - Server-side slot conflict validation.

6. **Doctor QR Code & Payment Verification**:
   - Doctor UPI QR code display.
   - Patient uploads payment receipt / screenshot.
   - Doctor verifies receipt before confirming booking.

7. **Doctor Portal**:
   - Metrics: New Requests, Accepted, Today's Appointments, Payment Verification, Completed.
   - Request management: Accept, Reject, Reschedule.
   - QR code manager.

8. **Admin Portal**:
   - Doctor verification & rejection.
   - Patient directory.
   - Dataset Management: Upload CSV/Excel, view class distribution & missing values.
   - ML Model Management: Accuracy, Precision, Recall, F1, Sensitivity, Specificity, AUC metrics, and version activation.
   - Security Audit Logging.

9. **Multilingual & Theme Support**:
   - English, Telugu (తెలుగు), Tamil (தமிழ்), Hindi (हिन्दी) via `i18next`.
   - Light, Dark, and System themes.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, i18next, Lucide icons.
- **Backend**: Node.js, Express.js, TypeScript, REST API, Prisma ORM, PostgreSQL, bcryptjs, JWT, Nodemailer, Puppeteer.
- **Machine Learning**: Python, FastAPI, EfficientNetB0 oral image feature representations, XGBoost tabular classifier.
- **Testing**: Vitest, React Testing Library, Supertest.
- **Deployment**: Docker, Docker Compose.

---

## 🔑 Demo Test Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@opmdcare.org` | `Admin@12345` | Full administrative controls |
| **Doctor (Verified)** | `dr.sharma@opmdcare.org` | `Doctor@12345` | Dr. Rajesh Sharma, MDS Oral Oncology |
| **Doctor (Verified)** | `dr.priya@opmdcare.org` | `Doctor@12345` | Dr. Priya Sundaram, Oral Pathology |
| **Doctor (Pending)** | `dr.anand@opmdcare.org` | `Doctor@12345` | Pending admin verification |
| **Patient** | `patient@opmdcare.org` | `Patient@12345` | Rahul Verma, Hyderabad |

---

## ⚡ Quick Start Instructions

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# ML Service (Optional for local Python server)
cd ../ml-service
pip install -r requirements.txt
```

### 2. Environment Setup
```bash
# Copy sample environment configuration
cp .env.example .env
cp .env.example backend/.env
```

### 3. Start Backend Server (Port 5000)
```bash
cd backend
npm run dev
```

### 4. Start Frontend Client (Port 5173)
```bash
cd frontend
npm run dev
```

### 5. Start Python FastAPI ML Service (Port 8000)
```bash
cd ml-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 6. Or Run with Docker
```bash
docker-compose up --build
```
