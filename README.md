# IntelliView

IntelliView is a production-grade AI interview simulation platform engineered for serious technical preparation. It combines CV-aware and topic-aware question orchestration, structured answer evaluation, and longitudinal practice analytics in a unified workflow.

Built as a full-stack TypeScript system on modern web infrastructure, the platform is designed for low-friction iteration, strong data consistency, and clean operational deployment.

## Product Scope

- Multi-mode interview session generation (CV-driven and topic-driven)
- Hybrid question model (conceptual + coding prompts)
- AI evaluation pipeline with structured feedback artifacts
- Session persistence, replayability, and history analytics
- Credential auth plus federated Google OAuth flow
- Consistent responsive UI for desktop and mobile

## Engineering Profile

- App Router-first architecture with server and client boundary discipline
- Relational persistence with Prisma schema governance and migrations
- API route design optimized for deterministic JSON contracts
- Cookie-based JWT session model with refresh-token lifecycle management
- Strict user-data ownership model across session and history surfaces
- Production-targeted code organization with clear domain separation

## Modern Tech Stack

### Runtime and Framework

- Next.js 16.1.6
- React 19.2.3
- TypeScript 5

### Data and Persistence

- PostgreSQL (Supabase)
- Prisma 6.19.2

### AI and Evaluation

- Groq API (LLM-backed generation and assessment)

### Authentication and Security

- JWT access + refresh token model
- Google OAuth 2.0
- HTTP-only secure cookie strategy

### Frontend and Developer Experience

- Tailwind CSS 4
- Monaco Editor integration for coding responses
- ESLint 9 with Next.js config

## Repository Structure

- `src/app/` - App Router pages and backend API routes
- `src/components/` - core UI modules (`InterviewFlow`, `Sidebar`, app shell)
- `src/lib/` - shared infrastructure (`db`, auth, model clients)
- `prisma/schema.prisma` - relational schema and datasource config
- `prisma/migrations/` - migration history

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env` with the required values:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://...          # pooled connection
DIRECT_URL=postgresql://...            # direct connection for migrations

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

GROQ_API_KEY=...
GROQ_MODEL=...                         # optional override

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3) Generate Prisma client

```bash
npx prisma generate
```

### 4) Apply database migrations

```bash
npx prisma migrate dev --name init
```

### 5) Start the application

```bash
npm run dev
```

Open `http://localhost:3000`.

## NPM Scripts

- `npm run dev` - run local development server
- `npm run build` - create production build
- `npm run start` - start production server
- `npm run lint` - run static lint checks

## API Surface

- `POST /api/upload-cv`
- `POST /api/generate-questions`
- `POST /api/evaluate-answer`
- `POST /api/generate-interview-answer`
- `GET /api/sessions`
- `DELETE /api/sessions`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
