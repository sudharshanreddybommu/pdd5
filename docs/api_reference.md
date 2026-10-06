# OPMD Care – REST API Reference

All requests to `/api/*` return JSON with standard `{ success: boolean, ... }` signatures.

## 1. Authentication (`/api/auth`)
- `POST /register/step1`: Initiates email verification and generates secure token.
- `POST /register/verify-email`: Validates verification token and activates email status.
- `POST /register/set-password`: Establishes password (min 8 chars, uppercase, lowercase, number, special char).
- `POST /register/patient-details`: Completes patient profile and oral health risk questionnaire.
- `POST /register/doctor-details`: Completes doctor credentials, hospital affiliation, and QR code.
- `POST /login`: Authenticates user and returns JWT + secure HTTP-only cookie.
- `POST /forgot-password`: Issues password reset token.
- `POST /reset-password`: Resets user password with valid token.
- `GET /me`: Returns currently authenticated user, profile, and hospital data.
- `POST /logout`: Clears session token.

## 2. Patient Services (`/api/patient`)
- `GET /profile`: Retrieves patient profile.
- `PUT /profile`: Updates patient profile.
- `GET /screenings`: Retrieves patient screening history with images and AI predictions.
- `GET /appointments`: Retrieves patient appointments with status and payment proof.

## 3. Doctor Services (`/api/doctor`)
- `GET /find`: Public doctor search with filters (`search`, `city`, `specialization`, `maxFee`).
- `GET /:id/public`: Retrieves public doctor profile and hospital coordinates.
- `GET /dashboard/stats`: Returns doctor metrics (New Requests, Accepted, Today's, Payment Verification, Completed).
- `GET /appointments/list`: Returns all doctor appointments.
- `POST /appointments/:id/action`: Accept, Reject, Reschedule, or Complete appointment.
- `PUT /profile/qr`: Updates doctor UPI QR code image URL.

## 4. Screening & AI Multimodal Assessment (`/api/screening`)
- `GET /symptoms/catalog`: Returns all 18 clinical OPMD symptoms.
- `POST /submit`: Submits 3 oral images + symptoms, triggers ML inference, generates Puppeteer PDF report.
- `GET /:id`: Retrieves full screening details and PDF URL.

## 5. Appointments & Payments (`/api/appointments` & `/api/payments`)
- `POST /appointments/request`: Patient requests consultation with doctor (Double booking prevention included).
- `GET /appointments/:id`: Retrieves appointment details with status history.
- `POST /payments/proof/submit`: Patient uploads UPI payment screenshot / PDF receipt.
- `POST /payments/verify`: Doctor verifies receipt -> status becomes `CONFIRMED` (or `PAYMENT_PENDING` if rejected).

## 6. Admin Portal (`/api/admin`)
- `GET /stats`: System-wide statistics.
- `GET /doctors`: Full doctor directory.
- `POST /doctors/:id/verify`: Verify or reject doctor registration.
- `GET /patients`: Registered patient directory.
- `GET /datasets`: Medical dataset catalog.
- `POST /datasets`: Upload, validate, and register training dataset.
- `GET /models`: ML models registry.
- `POST /models/:id/activate`: Activate model version.
- `GET /audit-logs`: System audit trail.
