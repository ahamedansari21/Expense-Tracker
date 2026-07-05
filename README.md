# 💰 Smart Expense Tracking AI Agent
### An Intelligent Personal Finance Management System

> A production-ready, AI-powered personal finance platform inspired by Stripe Dashboard, Notion, PhonePe, and Splitwise — built for job placements and startup portfolios.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-green) ![Java](https://img.shields.io/badge/Java-21-orange) ![MySQL](https://img.shields.io/badge/MySQL-8-blue) ![Gemini AI](https://img.shields.io/badge/Gemini-1.5-purple)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏥 Financial Health Score | Dynamic 0–100 score based on spending patterns |
| 🎙️ Voice Expense Entry | Natural language: "I spent ₹650 on groceries at Swiggy" |
| 📸 Receipt Scanner | OCR-based auto extraction from images/PDFs |
| 🤖 AI Categorization | Gemini-powered smart expense categorization |
| 📊 Budget Tracking | Real-time progress bars + overspend alerts |
| 🔔 Subscription Tracker | Bill reminders & recurring expense management |
| 💬 AI Financial Assistant | Chat with Gemini for financial advice |
| 📈 Expense Forecasting | Predictive analytics and savings suggestions |
| 👨‍👩‍👧 Group Expense Sharing | Splitwise-style group management |
| 📄 Reports Export | PDF, Excel, CSV exports |
| 🌙 Dark/Light Mode | Smooth theme transitions |

---

## 🏗️ Tech Stack

### Frontend
- **React 19** + TypeScript + Vite
- **Tailwind CSS** + shadcn/ui components
- **Framer Motion** — animations
- **Chart.js** + react-chartjs-2 — data visualization
- **Zustand** — state management
- **React Router v6** — routing

### Backend
- **Spring Boot 3.2** + Java 21 (Virtual Threads)
- **Spring Security** + JWT Authentication
- **Google OAuth 2.0** (social login)
- **Spring Data JPA** + Hibernate
- **MySQL 8** + Flyway migrations

### AI & Integrations
- **Google Gemini 1.5 Flash/Pro** — AI features
- **Tesseract OCR** — receipt scanning
- **Cloudinary** — image/file storage
- **iText7** — PDF generation
- **Apache POI** — Excel export

---

## 📁 Project Structure

```
smart-expense-tracker/
├── frontend/                 # React 19 + Vite app
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── stores/           # Zustand state stores
│   │   ├── services/         # API service layer
│   │   ├── hooks/            # Custom React hooks
│   │   ├── types/            # TypeScript type definitions
│   │   └── utils/            # Helper utilities
│   └── ...
├── backend/                  # Spring Boot 3 app
│   └── src/main/java/com/smartexpense/
│       ├── config/           # Security, CORS, OAuth config
│       ├── controller/       # REST API endpoints
│       ├── service/          # Business logic layer
│       ├── repository/       # JPA repositories
│       ├── entity/           # JPA entities
│       ├── dto/              # Request/Response DTOs
│       ├── security/         # JWT filters & handlers
│       └── ai/               # Gemini AI integration
├── database/                 # SQL migrations & seed data
└── docs/                     # API docs, architecture diagrams
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+, Java 21+, MySQL 8+
- Google Gemini API key
- Cloudinary account
- Google OAuth credentials

### 1. Clone & Setup
```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker
```

### 2. Database Setup
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p smart_expense < database/seed.sql
```

### 3. Backend Setup
```bash
cd backend
cp src/main/resources/application-example.yml src/main/resources/application-local.yml
# Edit application-local.yml with your credentials
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your API URL
npm install
npm run dev
```

---

## ☁️ Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
vercel --prod
```

### Backend → Render / Railway
1. Connect GitHub repo to Render/Railway
2. Set environment variables (see `backend/src/main/resources/application-example.yml`)
3. Use Docker: `docker build -t smart-expense-backend .`

### Database → Railway MySQL / PlanetScale
- Import `database/schema.sql`
- Update `DATABASE_URL` in backend env vars

---

## 🌐 Environment Variables

### Backend (application.yml)
| Variable | Description |
|---|---|
| `DB_URL` | MySQL JDBC URL |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | 256-bit JWT secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLOUDINARY_URL` | Cloudinary connection URL |
| `GOOGLE_CLIENT_ID` | OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |

### Frontend (.env)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## 📸 Screenshots

> Dashboard, Expense Tracker, AI Chat, Budget Manager, Reports — premium fintech UI

---

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## 📄 License

MIT License — free for personal and commercial use.

---

**Built with ❤️ for placement portfolios and startup MVPs**
