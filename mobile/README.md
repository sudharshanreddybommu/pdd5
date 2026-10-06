# OPMD Care - React Native Mobile Application

This is the cross-platform React Native (Expo) mobile application for **OPMD Care** (Oral Potentially Malignant Disorders Screening and Clinical Management).

---

## 📱 Features Included

1. **Authentication & Roles**:
   - Patient & Doctor login / registration
   - Demo 1-click accounts for instant faculty reviews
   - Token & Profile persistence with `@react-native-async-storage/async-storage`

2. **Multistep AI Oral Lesion Screening**:
   - **Step 1**: Front oral view capture (Camera / Gallery / Sample Presets)
   - **Step 2**: Left buccal mucosa view
   - **Step 3**: Right buccal mucosa & palate view
   - **Step 4**: 18 Clinical Oral Symptoms checklist (YES / NO / UNSURE, duration, severity)
   - **Clinical Sample Presets**: Includes sample presets for *Leukoplakia*, *Erythroplakia*, and *OSMF* for quick offline/evaluator demonstrations.

3. **Diagnostic Report Viewer**:
   - Overall OPMD Risk percentage & severity levels (Low, Moderate, High Risk)
   - Suspected Lesion Classification & AI Model Confidence
   - Visual findings and clinical urgency
   - Actionable patient recommendations & 1-click share

4. **Find Specialists & Doctor Directory**:
   - Search Oral Pathologists and Surgical Oncologists
   - Consultation fee, experience, clinic location, and ratings
   - Book appointment modal

5. **Appointments Manager**:
   - Track Upcoming and Past clinical appointments
   - Status chips (`CONFIRMED`, `PENDING`, `CANCELLED`)
   - Cancel appointment flow

6. **Profile & Backend Configuration**:
   - Dynamic API Endpoint configuration (switch between localhost, Android emulator `10.0.2.2`, or local Wi-Fi IP for real physical devices)

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Start the App with Expo
```bash
npm run start
```

### 3. Open on Device or Emulator
- **Physical Phone**: Install the **Expo Go** app from Google Play Store or Apple App Store, and scan the QR code displayed in the terminal.
- **Android Emulator**: Press `a` in the terminal.
- **iOS Simulator**: Press `i` in the terminal.
- **Web Preview**: Press `w` in the terminal.

---

## 📁 Project Structure

```
mobile/
├── App.tsx                       # Main application entry point
├── app.json                      # Expo configuration
├── package.json                  # React Native dependencies
├── tsconfig.json                 # TypeScript configuration
└── src/
    ├── components/               # Reusable UI components (Header, CustomButton)
    ├── context/                  # Auth Context & State Management
    ├── navigation/               # AppNavigator (Tabs, Auth, Screening Stack)
    ├── screens/                  # Mobile screens (Home, Login, Register, Screening, Results, Doctors, Appointments, Profile)
    ├── services/                 # API client, Screening, Doctor & Appointment services
    └── theme/                    # Design tokens & color system
```
