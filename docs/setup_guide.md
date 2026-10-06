# OPMD Care – Setup & Installation Guide

## 1. Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0+
- **Python**: v3.10+ (for FastAPI ML service)
- **PostgreSQL**: v14+ (optional for production, local JSON memory fallback built-in)
- **Git**

---

## 2. Environment Configuration

Copy the sample environment variables:
```bash
cp .env.example .env
cp .env.example backend/.env
```

### Key Environment Variables (`.env`):
```ini
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/opmd_care?schema=public"
JWT_SECRET=super_secret_opmd_jwt_key_2026_dev_secure
JWT_EXPIRES_IN=7d

# Nodemailer / SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="OPMD Care Team <noreply@opmdcare.org>"

# Cloudinary (Optional, local /uploads fallback active)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Maps API Key
GOOGLE_MAPS_API_KEY=AIzaSy...

# Python FastAPI ML Service
ML_API_URL=http://localhost:8000
```

---

## 3. Database Initialization (PostgreSQL + Prisma)

Generate Prisma client & sync schema:
```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## 4. Install Dependencies

### Backend:
```bash
cd backend
npm install
```

### Frontend:
```bash
cd frontend
npm install
```

### Python ML Service:
```bash
cd ml-service
pip install -r requirements.txt
```

---

## 5. Starting the Application

### Option A: Run All Concurrently (Recommended)
From root:
```bash
npm run dev
```

### Option B: Start Each Service Separately

**1. Start Backend API Server (Port 5000):**
```bash
cd backend
npm run dev
```

**2. Start Frontend Vite Dev Server (Port 5173):**
```bash
cd frontend
npm run dev
```

**3. Start Python FastAPI ML Service (Port 8000):**
```bash
cd ml-service
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 6. Docker Deployment (Optional)

Start all services (PostgreSQL, Backend, Frontend, ML Service) with one command:
```bash
docker-compose up --build
```
