# IntelliView

IntelliView is a full-stack AI interview practice platform built to help students and developers prepare for real technical interviews with structured, repeatable practice.

It is not a demo-only app. It is designed and deployed as a real product with secure authentication, persistent user data, role-aware session generation, and a complete end-to-end workflow from question generation to review and improvement.

## Why This Project Matters

Most interview preparation tools are either:

- generic question lists with no personalization, or
- expensive products with limited transparency.

IntelliView solves this by combining practical AI workflows with a clean engineering foundation.

Users can start from their own CV or from a specific topic, answer coding/theory questions, receive actionable feedback, and track progress over time.

## Who This Helps

### Undergraduate Students

- Turn classroom knowledge into interview-ready communication
- Practice both conceptual and coding questions in one flow
- Understand gaps early before placements and internship interviews

### Early-Career Developers

- Refresh fundamentals quickly before job switches
- Simulate real interview pressure in focused sessions
- Improve answer quality with targeted feedback, not only scores

### Independent Learners

- Build discipline using repeatable practice cycles
- Track growth through saved sessions and history

## Core Product Features

- CV-based interview generation from uploaded PDF resume
- Topic-based interview generation for focused study areas
- Mixed question sets (theory + coding)
- In-app coding response editor (Monaco)
- AI scoring with strengths and improvement points
- Session history with progress visibility
- Secure login with email/password and Google OAuth

## What Makes It Production-Grade

IntelliView follows practical product standards that matter in real usage:

- User data isolation: one user cannot view another user’s sessions
- Protected routes and protected APIs for authenticated workflows
- Persistent relational storage with migration history (Prisma + PostgreSQL)
- Token-based session model with refresh lifecycle
- Error handling for AI/service failures and invalid input cases
- Stable deploy architecture and environment-based configuration
- Responsive UI that works across desktop and mobile

## High-Level System Flow

1. User authenticates.
2. User starts session by CV upload or topic input.
3. Backend generates questions via Groq.
4. Questions are stored in PostgreSQL through Prisma.
5. User submits answers (text/code).
6. AI evaluates answers and stores feedback + score.
7. User reviews session and history for iterative improvement.

## Modern Tech Stack

### Frontend

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide icons
- Monaco Editor (`@monaco-editor/react`)

### Backend

- Next.js API Routes (server runtime)
- Prisma ORM
- JWT authentication (access + refresh tokens)
- Google OAuth 2.0 integration

### Data and Infrastructure

- PostgreSQL (Supabase)
- Prisma migrations for schema versioning

### AI Layer

- Groq API for question generation and answer evaluation

## Codebase Structure

- `src/app`:
	- App Router pages
	- API routes (`/api/*`)
- `src/components`:
	- UI modules (`InterviewFlow`, `Sidebar`, shell components)
- `src/lib`:
	- Shared services (`db`, auth, Groq client)
- `prisma/schema.prisma`:
	- Data models and datasource configuration
- `prisma/migrations`:
	- Database migration history

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL database (Supabase recommended)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create `.env` in project root:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://...          # pooled connection
DIRECT_URL=postgresql://...            # direct connection for migrations

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

GROQ_API_KEY=...
GROQ_MODEL=...                         # optional

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3) Generate Prisma client

```bash
npx prisma generate
```

If PowerShell blocks `npx`, use:

```bash
npx.cmd prisma generate
```

### 4) Run database migrations

```bash
npx prisma migrate dev --name init
```

### 5) Start development server

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start local development
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run lint checks

## API Endpoints

### Interview Workflow

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

## Quality Goals

This project prioritizes:

- clear user experience,
- secure and correct data handling,
- maintainable code organization,
- and realistic product behavior for real users.

IntelliView is intended as a serious, long-term portfolio product that demonstrates both software engineering capability and practical AI product thinking.
