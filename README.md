# IntelliView

IntelliView is an AI-powered technical interview platform built for real-world, repeatable preparation. It replaces static question banks with a structured, adaptive workflow: context-aware question generation, interactive dual-mode assessment, and persistent progress intelligence.

The product is designed for continuous usage at scale by students and developers who need measurable improvement, not one-time practice.

## Core Platform Capabilities

### Dynamic Session Orchestration

- Generate targeted interview sessions from two entry points:
  - CV context (PDF extraction)
  - Topic-defined prompts
- Produce role-aligned, mixed-format question sets (coding + theory)
- Normalize model output into deterministic, storable payloads

### Dual-Mode Assessment Workspace

- Unified experience for conceptual and implementation-based responses
- Integrated coding interface via Monaco Editor
- Sequential question flow with stateful session progression

### AI Evaluation and Feedback Engine

- Score and level classification per response
- Structured feedback with strengths and missing areas
- Optional benchmark/optimized answer generation for remediation

### Longitudinal Performance Tracking

- User-scoped session persistence
- Historical retrieval and replay of prior sessions
- Trend visibility to support deliberate skill progression

## Product Architecture

IntelliView is built as a layered, full-stack TypeScript system with clear operational boundaries.

### Client Layer

- Next.js App Router pages and interactive client components
- Responsive UI modules for onboarding, interview flow, and history
- Real-time editor interactions for coding assessments

### Orchestration and API Layer

- Route Handlers in Next.js for all backend operations
- Prompt orchestration for generation and evaluation flows
- Validation and defensive parsing to handle malformed AI payloads

### Persistence Layer

- PostgreSQL (Supabase) as the system of record
- Prisma ORM for typed data access and schema control
- Relational model anchored on User, Session, Question, and RefreshToken entities

### Identity and Session Layer

- Email/password authentication
- Google OAuth 2.0 federation
- Access/refresh token lifecycle managed through secure HTTP-only cookies

## Operating Model

### Session Generation Pipeline

1. User selects CV mode or topic mode.
2. Backend builds contextual prompt contract.
3. Groq returns structured question output.
4. Output is normalized and persisted as a session.
5. Client transitions to interview runtime.

### Evaluation Pipeline

1. User submits answer (text or code).
2. Backend invokes evaluation model with current question context.
3. Score and feedback artifacts are persisted.
4. UI renders immediate quality signals and remediation guidance.

### History and Analytics Pipeline

1. User opens history surface.
2. Server resolves only owner-scoped records.
3. Session-level and aggregate signals are computed for review.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4, Monaco Editor, Lucide React |
| Backend | Next.js Route Handlers, Prisma 6.19.2 |
| Database | PostgreSQL (Supabase) |
| Authentication | JWT Access/Refresh Model, Google OAuth 2.0 |
| AI Integration | Groq API (Generation and Evaluation Endpoints) |

## Repository Structure

```text
.
├── src/
│   ├── app/                # App Router pages, layouts, API route handlers
│   │   └── api/            # Backend endpoints
│   ├── components/         # Reusable UI + interview interaction modules
│   └── lib/                # Shared services (db, auth, groq)
├── prisma/
│   ├── schema.prisma       # Relational schema definition
│   └── migrations/         # Database migration history
├── middleware.ts           # Route protection and navigation enforcement
└── README.md
```

## Local Development Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL instance (Supabase recommended)
- Groq API key

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Prisma)
DATABASE_URL=postgresql://...                 # pooled connection
DIRECT_URL=postgresql://...                   # direct connection for migrations

# Authentication
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile            # optional
```

### 3. Initialize Prisma Client

```bash
npx prisma generate
```

PowerShell fallback:

```bash
npx.cmd prisma generate
```

### 4. Apply Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Run the Application

```bash
npm run dev
```

Application URL: `http://localhost:3000`

## API Surface Reference

### Interview Engine

- `POST /api/upload-cv`
- `POST /api/generate-questions`
- `POST /api/evaluate-answer`
- `POST /api/generate-interview-answer`

### Session Management

- `GET /api/sessions`
- `DELETE /api/sessions`

### Identity and Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

## Available Scripts

- `npm run dev` - start development runtime
- `npm run build` - compile for production
- `npm run start` - run built artifact
- `npm run lint` - execute lint checks
