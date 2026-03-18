# IntelliView

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.19.2-1B222D?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)

**IntelliView** is a comprehensive technical interview simulation platform engineered to facilitate adaptive, dual-mode (theoretical and practical) engineering assessments. 

By replacing static question repositories with a dynamic orchestration engine, the platform parses user context (via CV extraction or domain-specific inputs) to generate deterministic, role-aligned evaluation rubrics. It provides continuous, stateful execution of interview sessions alongside granular, AI-driven performance analytics.

---

## 1. System Architecture

IntelliView is constructed as a decoupled, layered full-stack application utilizing TypeScript across all operational boundaries.

* **Client Presentation Layer:** Built on the Next.js App Router, implementing React Server Components (RSC) where applicable for performance, and interactive client components for the assessment workspace. Integrates `@monaco-editor/react` for the embedded execution environment.
* **Orchestration & API Layer:** Next.js Route Handlers serve as the primary gateway, managing prompt engineering, AI model invocation, and rigorous payload normalization to ensure malformed LLM outputs are handled defensively.
* **Persistence Layer:** PostgreSQL (hosted via Supabase) operates as the system of record. The database schema is strictly managed via Prisma ORM, enforcing relational integrity across `User`, `Session`, `Question`, and authentication token entities.
* **Identity & Access Management:** Implements a custom JWT-based authentication lifecycle (Access and Refresh tokens) deployed via HTTP-only, secure cookies, supplemented by Google OAuth 2.0 federation.

---

## 2. Core Capabilities

### Context-Aware Session Orchestration
* **Initialization Vectors:** Sessions can be initialized via PDF parsing (extracting technical stack and experience from a CV) or via explicit domain-topic parameters.
* **Rubric Generation:** The system orchestrates the Groq API to compile a balanced matrix of conceptual inquiries and algorithmic challenges.
* **Anti-Repetition Engine:** Integrates the user's historical session data into the AI prompt logic, strictly enforcing the exclusion of previously asked questions to deliver a consistently novel and diverse interview experience upon every generated session.

### Dual-Mode Interactive Assessment
* **Unified Interface:** A singular, stateful workspace for handling both verbal/theoretical explanations and direct code implementation.
* **Session State Management:** Tracks sequential progression, ensuring answers are immutably committed prior to advancing the session state.

### AI Evaluation Engine
* **Deterministic Grading:** Analyzes user submissions against the generated rubric, returning a quantifiable proficiency score.
* **Granular Remediation:** Isolates architectural misunderstandings from execution errors, returning targeted improvement metrics alongside optimal benchmark solutions.

### Longitudinal Analytics
* **Persistent Intelligence:** All session artifacts are scoped and persisted, enabling the retrieval and historical replay of prior assessments.
* **Trend Analysis:** Aggregates response data to expose technical proficiencies and identify systemic skill gaps over time.

---

## 3. Technology Stack

| Domain | Infrastructure / Library |
| :--- | :--- |
| **Framework** | Next.js 16.1.6, React 19.2.3 |
| **Language** | TypeScript 5.0 |
| **Styling & UI** | Tailwind CSS 4, Lucide React, Monaco Editor |
| **Database & ORM** | PostgreSQL (Supabase), Prisma 6.19.2 |
| **Authentication** | Custom JWT Auth, Google OAuth 2.0 |
| **AI Orchestration** | Groq API (`llama-3.3-70b-versatile`) |

---

## 4. Local Development Environment

### Prerequisites
Ensure the following dependencies are installed in the host environment:
* Node.js (v20.x or later)
* npm
* A target PostgreSQL database instance
* Active Groq API credentials

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/thenurinethangi/Interview-Simulator.git
   cd intelliview
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**  
   Create a `.env` file in the project root and populate it with the following keys:
   ```env
   # Application Routing
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Database Configuration
   DATABASE_URL=postgresql://...                 # Pooled connection string
   DIRECT_URL=postgresql://...                   # Direct connection string for migrations

   # Cryptographic Secrets
   JWT_ACCESS_SECRET=your_secure_access_secret
   JWT_REFRESH_SECRET=your_secure_refresh_secret

   # OAuth Credentials
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Model Orchestration
   GROQ_API_KEY=your_groq_api_key
   GROQ_MODEL=llama-3.3-70b-versatile
   ```

4. **Initialize the database:**  
   Generate the Prisma client and execute schema migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
   > **Note:** Use `npx.cmd prisma generate` if operating within Windows PowerShell.

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will initialize at `http://localhost:3000`.

---

## 5. API Reference

The platform exposes a structured RESTful API for client-server communication.

### Interview Operations

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload-cv` | Accepts `multipart/form-data`. Parses PDF and extracts raw text context. |
| `POST` | `/api/generate-questions` | Accepts initialization context and returns a persisted session ID. |
| `POST` | `/api/evaluate-answer` | Grades a specific question payload and returns analytical feedback. |
| `POST` | `/api/generate-interview-answer` | Requests an optimal technical benchmark for a given prompt. |

### Session Data

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/sessions` | Returns an array of historical session metadata scoped to the authenticated user. |
| `DELETE` | `/api/sessions` | Purges a specific session record and its associated artifacts. |

### Identity Management

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Creates a new user record. |
| `POST` | `/api/auth/login` | Issues access and refresh tokens. |
| `POST` | `/api/auth/logout` | Invalidates the current session tokens. |
| `GET` | `/api/auth/me` | Validates the active access token and returns user context. |
| `GET` | `/api/auth/google` | Initiates the OAuth 2.0 authorization code flow. |
| `GET` | `/api/auth/google/callback` | Processes the OAuth callback and issues session tokens. |

---

## 6. CLI Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Initializes the local development environment. |
| `npm run build` | Compiles and optimizes the application for production deployment. |
| `npm run start` | Executes the compiled production artifact. |
| `npm run lint` | Runs ESLint to enforce code quality and stylistic guidelines. |

---

## 7. Project Screenshots

![Landing Page](public/Screenshot%20(1290).png)
![Authentication Screen](public/Screenshot%20(1291).png)
![Dashboard](public/Screenshot%20(1292).png)
![Interview Setup](public/Screenshot%20(1294).png)
![Question Workspace](public/Screenshot%20(1295).png)
![Code Editor View](public/Screenshot%20(1296).png)
![Evaluation Feedback](public/Screenshot%20(1297).png)
![Session Results](public/Screenshot%20(1298).png)
![History Page](public/Screenshot%20(1299).png)
![Profile and Sidebar](public/Screenshot%20(1300).png)
![Additional App Screen](public/Screenshot%20(1301).png)
![Additional App Screen](public/Screenshot%20(1302).png)