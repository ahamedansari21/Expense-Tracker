# 🚀 Deployment Guide

## Option 1 — Local Development (Fastest)

### Prerequisites
```
Node.js 20+, Java 21+, MySQL 8.0+
```

### 1. Clone & configure
```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker
cp .env.example .env
# Edit .env with your credentials
```

### 2. Database
```bash
mysql -u root -p -e "source database/schema.sql"
```

### 3. Backend
```bash
cd backend

# Copy and edit your local config
cp src/main/resources/application-example.yml src/main/resources/application-local.yml
# Fill in: DB credentials, GEMINI_API_KEY, CLOUDINARY_*, GOOGLE_CLIENT_*

mvn spring-boot:run -Dspring-boot.run.profiles=local
# Server starts on http://localhost:8080
```

### 4. Frontend
```bash
cd frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:8080/api

npm install
npm run dev
# App runs on http://localhost:5173
```

---

## Option 2 — Docker Compose (Full Stack)

```bash
cp .env.example .env
# Fill in ALL variables in .env

docker-compose up -d

# Verify services
docker-compose ps
docker-compose logs -f backend
```

App runs at:
- **Frontend**: http://localhost
- **Backend**: http://localhost:8080/api
- **MySQL**: localhost:3306

---

## Option 3 — Production Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Connect your repo at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` = your backend URL
4. Deploy — `vercel.json` handles routing automatically

```bash
# Or via CLI
cd frontend
npm run build
vercel --prod
```

### Backend → Render.com

1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set build command: `cd backend && mvn package -DskipTests`
4. Set start command: `java -jar backend/target/*.jar`
5. Add environment variables:

| Key | Value |
|-----|-------|
| `DB_URL` | `jdbc:mysql://your-db-host:3306/smart_expense` |
| `DB_USERNAME` | your username |
| `DB_PASSWORD` | your password |
| `JWT_SECRET` | (256-bit random string) |
| `GEMINI_API_KEY` | from Google AI Studio |
| `CLOUDINARY_CLOUD_NAME` | from cloudinary.com |
| `CLOUDINARY_API_KEY` | from cloudinary.com |
| `CLOUDINARY_API_SECRET` | from cloudinary.com |
| `FRONTEND_URL` | your Vercel URL |

### Database → Railway MySQL

1. Create a new MySQL service on [railway.app](https://railway.app)
2. Import schema: `mysql -u root -p smart_expense < database/schema.sql`
3. Copy the connection string into your backend `DB_URL`

### Database → PlanetScale (Serverless)

```bash
# Install PlanetScale CLI
pscale auth login
pscale database create smart-expense
pscale shell smart-expense main < database/schema.sql
```

---

## Environment Variables Reference

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `DB_URL` | ✅ | JDBC MySQL URL |
| `DB_USERNAME` | ✅ | Database user |
| `DB_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | Min 32-char secret |
| `GEMINI_API_KEY` | ✅ | Google AI Studio key |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloudinary account |
| `CLOUDINARY_API_KEY` | ✅ | Cloudinary key |
| `CLOUDINARY_API_SECRET` | ✅ | Cloudinary secret |
| `GOOGLE_CLIENT_ID` | Optional | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Optional | For Google OAuth |
| `FRONTEND_URL` | ✅ | CORS allowed origin |
| `PORT` | Optional | Default: 8080 |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | ✅ | Backend base URL |
| `VITE_GOOGLE_CLIENT_ID` | Optional | For Google sign-in |

---

## Getting API Keys

### Google Gemini API
1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key" → "Create API Key"
3. Copy key to `GEMINI_API_KEY`

### Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
2. Dashboard → Account Details
3. Copy Cloud name, API Key, API Secret

### Google OAuth
1. [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URIs:
   - `http://localhost:8080/api/auth/oauth2/callback/google`
   - `https://your-backend.com/api/auth/oauth2/callback/google`

---

## Health Check

```bash
curl http://localhost:8080/api/actuator/health
# {"status":"UP"}
```

---

## Production Checklist

- [ ] JWT_SECRET is a strong random 256-bit key
- [ ] Database uses SSL in production
- [ ] CORS allowed-origins locked to your domains only
- [ ] Cloudinary upload presets restricted
- [ ] Gemini API key has appropriate quota limits
- [ ] Docker images built with non-root user (already configured)
- [ ] Environment variables NOT committed to git
- [ ] HTTPS enabled on all production endpoints
