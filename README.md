# IntelliView

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.2-1B222D?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)

> **IntelliView** is an AI-powered technical interview platform built for real-world, repeatable preparation. It replaces static question banks with a structured, adaptive workflow: context-aware question generation, interactive dual-mode assessment, and persistent progress intelligence.

Designed for continuous usage at scale, IntelliView provides developers with measurable improvement through structured feedback rather than one-time practice.

---

## Core Platform Capabilities

### Dynamic Session Orchestration
* **Targeted Generation:** Initiate interview sessions from two distinct entry points: contextual CV extraction (PDF parsing) or domain-specific topic prompts.
* **Mixed-Format Output:** Produce role-aligned question sets that seamlessly blend theoretical concepts with practical coding challenges.
* **Payload Normalization:** Transform raw LLM output into deterministic, strictly typed, and storable payloads.

### Dual-Mode Assessment Workspace
* **Unified Experience:** A seamless interface for handling both conceptual explanations and implementation-based responses.
* **Embedded Execution:** Integrated coding environment utilizing `@monaco-editor/react`.
* **Stateful Progression:** Sequential, client-side question flow with robust session progression tracking.

### AI Evaluation & Feedback Engine
* **Granular Classification:** Assigns definitive scores and proficiency levels per response.
* **Structured Remediation:** Delivers distinct feedback isolating technical strengths from missing architectural areas.
* **Optimal Benchmarking:** Generates benchmark answers for immediate post-submission remediation.

### Longitudinal Performance Tracking
* **Persistent Intelligence:** User-scoped session data ensures historical retrieval and replay capabilities.
* **Trend Visibility:** Aggregated analytics to support deliberate, data-driven skill progression over time.

---

## Product Architecture

IntelliView operates as a layered, full-stack TypeScript system with strict operational boundaries.

### 1. Client Layer
* Built on the **Next.js App Router** utilizing interactive client components.
* Responsive UI modules dedicated to onboarding, interview runtime, and historical analytics.

### 2. Orchestration & API Layer
* Next.js **Route Handlers** govern all backend operations.
* Complex prompt orchestration for both generation and evaluation lifecycles.
* Defensive parsing and strict validation layers to mitigate and handle malformed AI payloads.

### 3. Persistence Layer
* **PostgreSQL** (via Supabase) acts as the system of record.
* **Prisma ORM** enforces typed data access and seamless schema migrations.
* Relational model heavily anchored on `User`, `Session`, `Question`, and `RefreshToken` entities.

### 4. Identity & Session Layer
* Traditional Email/Password authentication coupled with **Google OAuth 2.0** federation.
* Custom Access/Refresh token lifecycle managed securely via HTTP-only cookies.

---

## Operating Model

### Session Generation Pipeline
1.  **Initiate:** User selects CV mode or Topic mode.
2.  **Contract:** Backend constructs the contextual prompt contract.
3.  **Generate:** Groq LLM returns structured question output.
4.  **Persist:** Output is normalized and persisted as a `Session` record.
5.  **Transition:** Client seamlessly transitions to the interview runtime.

### Evaluation Pipeline
1.  **Submit:** User submits a text or code answer.
2.  **Evaluate:** Backend invokes the evaluation model with the exact question context.
3.  **Store:** Score metrics and feedback artifacts are immediately persisted.
4.  **Render:** UI updates with quality signals and remediation guidance.

---

## Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16.1.6, React 19.2.3, TypeScript 5, Tailwind CSS 4, Monaco Editor |
| **Backend** | Next.js Route Handlers, Prisma 6.19.2 |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | Custom JWT Access/Refresh Model, Google OAuth 2.0 |
| **AI Integration** | Groq API (`llama-3.3-70b-versatile`) |

---

## Local Development Setup

### Prerequisites
* Node.js 20+ & npm
* PostgreSQL instance (Supabase recommended)
* Groq API Key

### 1. Environment Configuration
Clone the repository and create a `.env` file in the project root:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Prisma)
DATABASE_URL=postgresql://...                 # Pooled connection
DIRECT_URL=postgresql://...                   # Direct connection for migrations

# Authentication
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Orchestration
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile