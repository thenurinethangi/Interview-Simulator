# IntelliView

Launch-ready AI interview platform for CV-driven and topic-driven technical practice.

IntelliView provides a complete preparation workflow: generate interview sets, answer in a structured interface, receive actionable evaluation, and track progress over time. The product is built for daily use by students and developers who want practical interview improvement, not static question browsing.

---

## Product Launch Overview

Interview preparation is most effective when it is:

- personalized to user context,
- measurable over repeated sessions,
- and fast enough to use consistently.

IntelliView is designed around that standard. Users can begin from a resume or a target topic, practice in mixed-mode sessions (coding + theory), and receive evaluation feedback they can immediately apply in the next round.

---

## What Users Can Do

### 1) Start Smart Sessions

- Upload a resume (PDF) and generate targeted interview questions from extracted context.
- Enter a topic and generate focused question sets for fast revision.

### 2) Practice in Real Interview Format

- Handle conceptual and coding prompts in one flow.
- Write coding answers directly in an embedded editor.
- Submit responses question-by-question with continuous progression tracking.

### 3) Get Actionable Feedback

- Receive score and level indicators.
- Review strengths and improvement points.
- Access optimized responses for better answer patterns.

### 4) Track Longitudinal Progress

- Store completed sessions.
- Revisit past attempts.
- Use trend visibility to improve consistently over time.

---

## Why Teams and Users Choose IntelliView

- Personalization: practice sessions generated from user profile or specific technical domains.
- Clarity: feedback designed to explain how to improve, not only what score was assigned.
- Consistency: repeatable workflow for daily preparation.
- Reliability: persistent data, user-scoped records, and secure authenticated access.
- Accessibility: responsive interface that works across desktop and mobile.

---

## Platform Architecture

IntelliView is implemented as a full-stack TypeScript platform with clear boundaries between presentation, APIs, authentication, and persistence.

### Application Layer

- Next.js App Router for page and route composition.
- Client components for interactive interview flow and editor behavior.
- Route handlers (`/api/*`) for backend operations.

### Data Layer

- PostgreSQL (Supabase) as primary data store.
- Prisma ORM for typed data access and schema migrations.
- Relational model centered on users, sessions, questions, and refresh tokens.

### AI Layer

- Groq-powered generation and evaluation endpoints.
- Structured response normalization before persistence.
- Defensive checks for malformed model output.

### Identity Layer

- Email/password authentication.
- Google OAuth sign-in.
- Cookie-based JWT access/refresh lifecycle.

---

## System Workflow

### Session Generation

1. User selects CV mode or topic mode.
2. Backend composes AI prompt context.
3. Model returns normalized question payload.
4. Session and question set are persisted.
5. User enters guided interview flow.

### Evaluation

1. User submits text/code answer.
2. Backend evaluates using AI with current question context.
3. Score and feedback artifacts are saved.
4. UI renders outcome and next-step guidance.

### Progress

1. User opens history.
2. Server returns only owner-scoped sessions.
3. Aggregates and per-session details are presented for review.

---

## Technology Stack (Modern Web)

### Frontend

- Next.js 16.1.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4
- Monaco Editor (`@monaco-editor/react`)
- Lucide React

### Backend

- Next.js Route Handlers
- Prisma 6.19.2
- JWT-based session model
- Google OAuth 2.0 integration

### Data & Infra

- PostgreSQL (Supabase)
- Prisma migration system

### AI

- Groq API (generation + evaluation)

---

## Repository Layout

- `src/app/`
  - App Router pages
  - API endpoints in `src/app/api/*`
- `src/components/`
  - Interview and navigation modules
- `src/lib/`
  - Shared services (`db`, auth, Groq)
- `prisma/schema.prisma`
  - Data model and datasource definition
- `prisma/migrations/`
  - Schema migration history

---

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (Supabase recommended)

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Configure environment

Create `.env` in project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://...                # pooled connection
DIRECT_URL=postgresql://...                  # direct connection for migrations

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

GROQ_API_KEY=...
GROQ_MODEL=...                               # optional

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Step 3: Generate Prisma client

```bash
npx prisma generate
```

PowerShell fallback:

```bash
npx.cmd prisma generate
```

### Step 4: Run migrations

```bash
npx prisma migrate dev --name init
```

### Step 5: Start local server

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## API Surface

### Interview APIs

- `POST /api/upload-cv`
- `POST /api/generate-questions`
- `POST /api/evaluate-answer`
- `POST /api/generate-interview-answer`

### Session APIs

- `GET /api/sessions`
- `DELETE /api/sessions`

### Auth APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

---

## Scripts

- `npm run dev` - development server
- `npm run build` - production build
- `npm run start` - run built app
- `npm run lint` - lint checks
