# IntelliView

AI-powered technical interview practice platform with CV-based and topic-based sessions, instant answer evaluation, and progress history.

## Overview

IntelliView helps learners prepare for technical interviews by generating targeted questions, evaluating answers with actionable feedback, and tracking progress over time.

Core capabilities:

- CV-based session generation (PDF upload + extraction)
- Topic-based question generation
- Mixed interview format (coding + conceptual questions)
- AI evaluation with strengths, missing points, and score
- Session history and per-user data isolation
- Authentication with email/password and Google OAuth

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- Groq API for generation/evaluation
- Google OAuth 2.0

## Project Structure

- `src/app/` - App Router pages and API routes
- `src/components/` - shared UI components (`Sidebar`, `InterviewFlow`)
- `src/lib/` - database and auth utilities
- `prisma/schema.prisma` - data models and datasource
- `prisma/migrations/` - migration history

## Environment Variables

Create a `.env` file with the following keys:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL=postgresql://... (pooled URL)
DIRECT_URL=postgresql://... (direct URL)

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

GROQ_API_KEY=...
GROQ_MODEL=... # optional

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Notes:

- Use pooled URL in `DATABASE_URL` and direct URL in `DIRECT_URL` for Prisma migrations.
- For Supabase, include `sslmode=require` where applicable.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Run migrations:

```bash
npx prisma migrate dev --name init
```

4. Start dev server:

```bash
npm run dev
```

5. Open:

`http://localhost:3000`

## Auth & Access Rules

- Unauthenticated users are redirected from home (`/`) to landing (`/landing`).
- Authenticated users can access home, session pages, and history.
- History and session details are user-scoped.
- Protected APIs require a valid access token cookie.

## Deployment (Vercel + Supabase)

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add all environment variables in Vercel Project Settings.
4. Set:

`NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app`

5. Configure Google OAuth:

- Authorized JavaScript origin: `https://your-domain.vercel.app`
- Authorized redirect URI: `https://your-domain.vercel.app/api/auth/google/callback`

6. Deploy on Vercel.
7. Apply production migrations:

```bash
npx prisma migrate deploy
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run lint checks

## API Surface (High-Level)

- `POST /api/generate-questions`
- `POST /api/evaluate-answer`
- `POST /api/generate-interview-answer`
- `POST /api/upload-cv`
- `GET/DELETE /api/sessions`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/auth/google`
- `GET /api/auth/google/callback`

## License

This project is for educational and portfolio use.
