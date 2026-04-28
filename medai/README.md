# 🏥 MedAI — AI-Powered Multi-Disease Prediction & Medical Report Analysis

A full-stack, production-ready healthcare platform with AI disease prediction, PDF report analysis, chatbot, analytics, and premium futuristic UI.

---

## 📁 Project Structure

```
medai/
├── frontend/          # React.js + Tailwind CSS + Framer Motion
├── backend/           # Node.js + Express.js + MongoDB
├── ai-service/        # Python Flask + Scikit-learn
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- MongoDB Atlas account
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env    # Fill in your values

# Frontend
cd ../frontend
npm install
cp .env.example .env

# AI Service
cd ../ai-service
pip install -r requirements.txt
```

### 2. Train AI Models

```bash
cd ai-service
python training/train_all_models.py
```

### 3. Run All Services

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — AI Service (port 5001)
cd ai-service && python app.py

# Terminal 3 — Frontend (port 3000)
cd frontend && npm start
```

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → connect Vercel
```

### Backend → Render
- Connect GitHub repo
- Set environment variables
- Build: `npm install`, Start: `npm start`

### AI Service → Render (Python)
- Set start command: `gunicorn app:app`

---

## 🔑 Environment Variables

See `.env.example` in each folder.

---

## 📋 Features

- ✅ JWT Authentication + Role-Based Access
- ✅ 15+ Disease Predictions with AI
- ✅ PDF Medical Report Analysis
- ✅ AI Chatbot
- ✅ Health Dashboard + Analytics
- ✅ Doctor Recommendations
- ✅ Appointment Reminders
- ✅ Admin Panel
- ✅ Dark/Light Mode
- ✅ Fully Responsive

---

## 🧪 Test Credentials

After seeding:
- **Admin**: admin@medai.com / Admin@123
- **User**: user@medai.com / User@123

---

## 📜 License

MIT — Free for academic and personal use.
