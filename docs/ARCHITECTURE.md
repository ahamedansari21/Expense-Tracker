# 🏗️ Architecture Overview

## System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React 19 + Vite)                  │
│                                                              │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐ │
│  │Dashboard │  │ Expenses   │  │ Budgets  │  │ AI Chat  │ │
│  │ Charts   │  │ Voice/OCR  │  │ Progress │  │ Gemini   │ │
│  └──────────┘  └────────────┘  └──────────┘  └──────────┘ │
│                                                              │
│  Zustand (State) │ React Router │ Axios (API) │ Framer     │
└───────────────────────────────────────────────┬─────────────┘
                                                │ REST / JSON
                                                │ JWT Bearer
┌──────────────────────────────────────────────▼─────────────┐
│                   Spring Boot 3 API Server                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Spring Security (JWT + OAuth2)            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Controllers → Services → Repositories → JPA Entities       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Expense  │  │  Budget  │  │    AI    │  │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────┬─────┘  │
│                                                   │         │
│  ┌─────────────────────┐   ┌──────────────────────▼──────┐ │
│  │   Cloudinary CDN    │   │   Google Gemini 1.5 API     │ │
│  │   (Receipt Images)  │   │   (AI / NLP / Insights)     │ │
│  └─────────────────────┘   └─────────────────────────────┘ │
│                                                              │
└───────────────────────────────┬─────────────────────────────┘
                                │ JDBC / JPA
                    ┌───────────▼───────────┐
                    │   MySQL 8.0 Database   │
                    │                        │
                    │  users · expenses      │
                    │  budgets · categories  │
                    │  subscriptions · goals │
                    │  notifications · chat  │
                    └───────────────────────┘
```

## Key Design Patterns

### Backend
- **Clean Architecture**: Controller → Service → Repository
- **SOLID Principles**: Single Responsibility, Open/Closed throughout
- **DTO Pattern**: Request/Response DTOs separate from entities
- **Repository Pattern**: Spring Data JPA repositories
- **Strategy Pattern**: AI service for different generation tasks
- **Async Processing**: `@Async` for notifications and budget updates

### Frontend
- **Flux Pattern**: Zustand stores for unidirectional data flow
- **Container/Presentational**: Pages as containers, components as presenters
- **Service Layer**: All API calls abstracted in `services/`
- **Custom Hooks**: `useAuth`, `useCategories` for logic reuse

## Security Architecture

```
Request → CORS Filter → JWT Filter → Spring Security → Controller
           ↓
    Extract Bearer Token
           ↓
    Validate with JJWT
           ↓
    Load UserDetails from DB
           ↓
    Set SecurityContext
           ↓
    @AuthenticationPrincipal User
```

## AI Integration Flow

```
User Input (Text/Voice/Receipt)
         ↓
  GeminiService.generate()
         ↓
  WebClient → Gemini 1.5 Flash/Pro API
         ↓
  Parse JSON response
         ↓
  Map to domain object (CategorySuggestion / VoiceExpenseParsed / etc.)
         ↓
  Return to Controller → Client
```

## Database Schema (Simplified)

```
users ──< expenses >── categories
  │                       ↑
  ├──< budgets >──────────┘
  ├──< subscriptions
  ├──< financial_goals
  ├──< notifications
  ├──< ai_chat_history
  └──< refresh_tokens

expense_groups ──< group_members >── users
expense_groups ──< group_expenses ──< expense_splits
```
