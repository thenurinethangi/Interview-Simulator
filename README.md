# IntelliView

IntelliView is a production-grade interview simulation platform that combines LLM-driven question generation, structured answer evaluation, and persistent progress analytics in a single application workflow.

The system is designed as a real product, not a prototype. It is deployed, stateful, user-scoped, and engineered around clear boundaries between UI, API, authentication, and data persistence.

---

## 1) Product Thesis

Interview preparation fails when it is generic, unstructured, and impossible to measure.

IntelliView addresses this with a closed feedback loop:

1. Generate a focused session from CV context or a target topic.
2. Capture responses in text or code.
3. Evaluate quality with actionable feedback dimensions.
4. Persist outcomes and track progression over time.

This loop enables repeatable skill growth for undergraduates, early-career engineers, and developers preparing for transition interviews.

---

## 2) Key Capabilities

- CV-based session generation from uploaded PDF content
- Topic-based session generation for focused preparation
- Hybrid interview mode (theory + coding)
- Integrated code editor for coding responses
- AI evaluation with score, level, strengths, and missing areas
- Session history and replayability
- Email/password authentication and Google OAuth
- User-scoped data isolation across all session surfaces

---

## 3) Why This Is Production Grade

IntelliView includes practical production qualities that matter in live environments:

- Multi-user safety: strict user ownership filters on history/session resources
- Route and API protection: authenticated workflows are enforced server-side
- Durable persistence: PostgreSQL + Prisma migrations for controlled schema evolution
- Session security: access/refresh token model with HTTP-only cookie storage
- Error resilience: defensive handling for model/API failures and malformed responses
- Operational readiness: environment-based configuration and cloud-compatible architecture

---

## 4) Architecture Overview

### Application Layer

- Next.js App Router drives page composition and server/client boundaries
- Client components handle interaction-heavy flows (editor, interview progression)
- Route handlers under `/api/*` encapsulate backend actions

### Domain Layer

- Session lifecycle: creation, question persistence, evaluation, history retrieval
- Evaluation artifacts: score, level, narrative feedback, strengths, missing areas
- Auth lifecycle: credential flow + OAuth flow + token refresh/logout

### Data Layer

- PostgreSQL as system of record
- Prisma as typed ORM + migration system
- Relational model: User -> Session -> Question, plus RefreshToken

### AI Layer

- Groq-backed generation/evaluation endpoints
- Deterministic JSON normalization before persistence
- Validation and fallback behavior for non-compliant model responses

---

## 5) End-to-End Request Flow

### Session Generation Flow

1. User starts a session from CV or topic.
2. API route composes prompt context and requests structured output from Groq.
3. Output is validated and normalized.
4. Session + questions are persisted atomically.
5. Client navigates into interactive interview mode.

### Evaluation Flow

1. User submits answer (code or text).
2. API requests model evaluation against the current question context.
3. Structured evaluation payload is saved to the corresponding question.
4. UI renders score, quality signals, and improvement guidance.

### Progress Flow

1. User history queries fetch only owner-scoped records.
2. Aggregates and session-level metrics are derived server-side.
3. User reviews progression and continues deliberate practice.

---

## 6) Primary Users and Value

### Undergraduates

- Converts textbook knowledge into interview-ready answers
- Builds confidence before internships and campus placements
- Provides measurable feedback instead of binary correct/incorrect outputs

### Developers

- Supports fast refresh before interviews and role transitions
- Improves communication quality for conceptual questions
- Adds repeatable coding-question rehearsal in one environment

### Portfolio and Hiring Value

This project demonstrates:

- full-stack ownership,
- AI product integration,
- secure auth + data isolation,
- production deployment discipline,
- and maintainable system design.

---

## 7) Modern Tech Stack

### Frontend

- Next.js 16.1.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Monaco Editor (`@monaco-editor/react`)
- Lucide React

### Backend

- Next.js Route Handlers (Node runtime)
- Prisma 6.19.2
- JWT-based auth session model
- Google OAuth 2.0 integration

### Data and Infrastructure

- PostgreSQL (Supabase)
- Prisma migrations and typed client generation

### AI

- Groq API for question generation and answer evaluation

---

## 8) Repository Structure

- `src/app/`
	- App Router pages
	- API routes under `src/app/api/*`
- `src/components/`
	- Interview and navigation UI modules
- `src/lib/`
	- Shared service layer (`db`, `auth`, `groq`)
- `prisma/schema.prisma`
	- Data model and datasource configuration
- `prisma/migrations/`
	- Versioned migration history

---

## 9) Local Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (Supabase recommended)

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Configure environment

Create `.env` in the project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://...                # pooled connection
DIRECT_URL=postgresql://...                  # direct connection for migrations

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

GROQ_API_KEY=...
GROQ_MODEL=...                               # optional model override

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Step 3: Generate Prisma client

```bash
npx prisma generate
```

PowerShell fallback when script policy blocks `npx`:

```bash
npx.cmd prisma generate
```

### Step 4: Apply migrations

```bash
npx prisma migrate dev --name init
```

### Step 5: Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## 10) Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - run production build locally
- `npm run lint` - run lint checks

---

## 11) API Surface

### Interview

- `POST /api/upload-cv`
- `POST /api/generate-questions`
- `POST /api/evaluate-answer`
- `POST /api/generate-interview-answer`

### Sessions

- `GET /api/sessions`
- `DELETE /api/sessions`

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

---

## 12) Engineering Priorities

IntelliView is developed with the following priorities:

- correctness before complexity,
- secure-by-default user flows,
- maintainable module boundaries,
- predictable schema evolution,
- and practical product impact for real interview preparation.
