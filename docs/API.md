# 📋 Smart Expense Tracker — REST API Reference

Base URL: `http://localhost:8080/api`

All protected endpoints require `Authorization: Bearer <token>` header.

---

## 🔐 Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | Public | Create new account |
| `POST` | `/auth/login` | Public | Login with email/password |
| `POST` | `/auth/refresh` | Public | Refresh access token |
| `POST` | `/auth/logout` | ✅ | Logout (revoke refresh token) |
| `GET`  | `/auth/me` | ✅ | Get current user profile |

### Register Request
```json
{
  "fullName": "Arjun Sharma",
  "email": "arjun@example.com",
  "password": "Secure@123",
  "currency": "INR"
}
```

### Login Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "550e8400-...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": { "id": 1, "email": "...", "fullName": "..." }
  }
}
```

---

## 💸 Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/expenses?page=0&size=20&search=` | List expenses (paginated) |
| `GET`    | `/expenses/{id}` | Get single expense |
| `POST`   | `/expenses` | Create expense |
| `PUT`    | `/expenses/{id}` | Update expense |
| `DELETE` | `/expenses/{id}` | Delete expense |
| `POST`   | `/expenses/voice-parse` | Parse natural language text |
| `POST`   | `/expenses/scan-receipt` | Upload & OCR receipt (multipart) |

### Create Expense Request
```json
{
  "title": "Lunch at Swiggy",
  "amount": 450.00,
  "type": "EXPENSE",
  "date": "2024-07-04",
  "categoryId": 1,
  "paymentMethod": "UPI",
  "merchant": "Swiggy",
  "notes": "Office lunch"
}
```

### Voice Parse Request
```json
{ "text": "Spent 650 on groceries at DMart using UPI" }
```

---

## 🎯 Budgets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/budgets` | List active budgets |
| `POST`   | `/budgets` | Create budget |
| `PUT`    | `/budgets/{id}` | Update budget |
| `DELETE` | `/budgets/{id}` | Delete budget |

### Create Budget Request
```json
{
  "name": "Food & Dining",
  "amount": 8000.00,
  "categoryId": 1,
  "period": "MONTHLY",
  "startDate": "2024-07-01",
  "endDate": "2024-07-31",
  "alertThreshold": 80,
  "color": "#FF6B6B"
}
```

---

## 📊 Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Full dashboard data (stats, charts, alerts) |

**Response includes:**
- `financialHealthScore` (0–100)
- `healthScoreLabel` (Excellent / Good / Fair / Needs Improvement)
- `totalExpenses`, `totalIncome`, `netSavings`, `savingsRate`
- `monthlyTrend` (6-month area chart data)
- `categoryBreakdown` (pie chart data)
- `recentExpenses`, `budgetAlerts`, `upcomingBills`, `goals`

---

## 🤖 AI Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/chat` | Chat with AI (Gemini) |
| `GET`  | `/ai/chat/sessions` | List chat sessions |
| `GET`  | `/ai/chat/history/{sessionId}` | Load session history |
| `DELETE` | `/ai/chat/sessions/{sessionId}` | Delete session |
| `GET`  | `/ai/insights` | Get monthly AI insights |
| `GET`  | `/ai/forecast` | Get expense forecast |

### Chat Request
```json
{
  "message": "How can I reduce my food spending?",
  "sessionId": "optional-existing-session-id"
}
```

---

## 🔔 Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/subscriptions` | List all subscriptions |
| `POST`   | `/subscriptions` | Add subscription |
| `PATCH`  | `/subscriptions/{id}/status` | Pause/resume/cancel |
| `DELETE` | `/subscriptions/{id}` | Remove subscription |

---

## 📈 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports/summary?from=&to=` | Expense summary |
| `GET` | `/reports/export/csv?from=&to=` | Download CSV |
| `GET` | `/reports/export/excel?from=&to=` | Download Excel |

---

## 🏆 Financial Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/financial-goals` | List goals |
| `POST`   | `/financial-goals` | Create goal |
| `PUT`    | `/financial-goals/{id}` | Update goal |
| `DELETE` | `/financial-goals/{id}` | Delete goal |

---

## 🔔 Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`   | `/notifications?page=0&size=20` | List notifications |
| `GET`   | `/notifications/unread-count` | Unread badge count |
| `POST`  | `/notifications/read-all` | Mark all as read |
| `PATCH` | `/notifications/{id}/read` | Mark one as read |

---

## 📁 Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/categories` | List default + user categories |
| `POST` | `/categories` | Create custom category |

---

## 👤 User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT`  | `/users/profile` | Update profile |
| `POST` | `/users/avatar` | Upload avatar (multipart) |
| `PUT`  | `/users/change-password` | Change password |

---

## ❌ Error Response Format

```json
{
  "success": false,
  "error": "Resource not found",
  "timestamp": "2024-07-04T12:00:00"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request / validation error |
| `401` | Unauthenticated |
| `403` | Forbidden |
| `404` | Not found |
| `500` | Server error |
