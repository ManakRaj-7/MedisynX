# 🏥 MedisynX — AI-Powered Healthcare Ecosystem

<p align="center">
  <a href="https://medisyn-x.vercel.app">
    <img src="https://img.shields.io/badge/Live%20Demo-MedisynX-06b6d4?style=for-the-badge&logo=vercel&labelColor=0f172a" />
  </a>
  <img src="https://img.shields.io/badge/MedisynX-v2.5-00d4ff?style=for-the-badge&labelColor=0f172a" />
  <img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8b5cf6?style=for-the-badge&labelColor=0f172a" />
</p>

> **Industry-grade AI medical SaaS platform** featuring a comprehensive Doctor Dashboard, MERN stack architecture, Gemini 2.5 Flash clinical insights, and a secure, installable PWA experience.

---

### 🌐 Live Deployment
*   **Frontend**: [https://medisyn-x.vercel.app](https://medisyn-x.vercel.app) (Hosted on **Vercel**)
*   **Backend**: Hosted on **Render** (Auto-scaling Node.js API)
*   **Database**: MongoDB Atlas (Cloud-native NoSQL)

---

## ✨ Features

### 🧠 AI Clinical Decision Support
- **Gemini 2.5 Flash** — Real-time symptom analysis with structured clinical insights
- **Confidence Scoring** — AI returns a confidence percentage with reasoning
- **Comprehensive Reports** — Potential assessment, recommended tests, diet plans, red flags
- **Smart Caching** — Responses are cached to reduce API calls and improve speed
- **Fallback System** — Local pattern matching when AI service is unavailable

### 🔐 Authentication & Security
- **JWT + Refresh Tokens** — Secure stateless authentication
- **bcrypt** password hashing with salt rounds
- **Helmet** — HTTP security headers
- **express-rate-limit** — API & auth rate limiting (200/15min general, 20/15min auth)
- **express-mongo-sanitize** — NoSQL injection prevention
- **hpp** — HTTP parameter pollution protection
- **CORS** — Configured origin whitelisting

### 📊 Clinical Dashboard
- Real-time stats (patients, appointments, pending bills)
- Dynamic greeting with logged-in doctor's name
- Quick action buttons for common workflows
- System status panel (AI, Database, Auth status)
- Loading skeletons for premium UX

### 👥 Patient Management
- Full CRUD with search & filtering
- Collapsible registration form
- Medical history tracking
- Gender badges and clean data tables

### 📅 Appointment Scheduling
- Patient dropdown (no raw IDs!)
- Date/time picker with symptoms field
- Status management (Scheduled → Completed → Cancelled)
- Status-colored badges

### 💳 Billing & Invoicing
- Revenue tracking with stats cards
- PDF invoice generation (pdfkit)
- Payment method tracking
- Status management with inline selects

### 🎨 Premium UI/UX
- **Glassmorphism** design system with backdrop blur
- **Progressive Web App (PWA)** — Installable on Desktop/Mobile with offline caching
- **Modern typography** — Outfit (headings) + Inter (body)
- Dark mode with sapphire/cyan/violet palette
- Persistent sidebar navigation with active states
- Responsive layout (desktop → tablet → mobile)
- Loading skeletons, empty states, error alerts
- Micro-animations and hover effects

### 🩺 Doctor Profile & Preferences
- **Professional Identity** — Medical license, qualification, and hospital affiliation management
- **Avatar System** — Professional presets or compressed image uploads (WebP optimized)
- **AI Personalization** — Control Gemini model (Flash/Pro), response styles, and confidence thresholds
- **Security Hub** — Active session tracking and secure password management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 8, Lucide Icons, React Markdown |
| **Backend** | Node.js, Express 5 |
| **AI Engine** | Google Generative AI (Gemini 2.5 Flash) |
| **Database** | MongoDB Atlas |
| **Auth** | JWT, bcrypt, refresh tokens |
| **Security** | Helmet, rate-limit, mongo-sanitize, hpp |
| **PDF** | pdfkit |
| **Styling** | Vanilla CSS, Glassmorphism, Google Fonts |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google AI Studio API key

### 1. Clone & Setup
```bash
git clone https://github.com/ManakRaj-7/MedisynX.git
cd MedisynX
```

### 2. Server
```bash
cd server
npm install
```
Create `server/.env`:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=1d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
CLIENT_URL=http://localhost:5173
```
```bash
npm run dev
```

### 3. Client
```bash
cd ../client
npm install
npm run dev
```

### 4. Open
Visit **http://localhost:5173** — create an account and start using the platform.

---

## 📁 Project Structure
```
MedisynX/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/            # API helpers
│   │   ├── components/     # Sidebar, shared components
│   │   ├── pages/          # Dashboard, Patients, AI, Billing, etc.
│   │   ├── utils/          # Auth helpers
│   │   └── style.css       # Design system
│   └── vite.config.js
├── server/                  # Express backend
│   ├── ai-service/         # Gemini 2.5 Flash integration
│   ├── config/             # Database config
│   ├── controllers/        # Business logic
│   ├── middleware/          # Auth, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   └── server.js           # Entry point with security
└── README.md
```

---

## 📜 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/v1/auth/signup` | ❌ | Register doctor |
| POST | `/api/v1/auth/login` | ❌ | Login |
| GET | `/api/v1/auth/me` | ✅ | Get current user |
| POST | `/api/v1/auth/refresh` | ❌ | Refresh JWT |
| GET/POST | `/api/v1/patients` | ✅ | Patient CRUD |
| GET/POST/PATCH | `/api/v1/appointments` | ✅ | Appointment management |
| GET/POST/PATCH | `/api/v1/billing` | ✅ | Billing + PDF generation |
| POST | `/api/v1/ai/diagnose` | ✅ | AI clinical analysis |
| GET | `/api/v1/demo/data` | ❌ | Guest demo data |

---

## 📄 License
ISC License

---

<p align="center">
  <strong>Built with ❤️ for the future of healthcare intelligence.</strong>
</p>