# StrayLink

Connecting stray animals with rescuers. StrayLink is a mobile-first web application that
lets community members report stray animals in need of help and enables rescue volunteers
to track, claim, and resolve those reports in real time.

## Who It Is For

- **Reporters** — anyone who spots a stray animal and wants to get it help quickly.
- **Rescuers** — volunteers or shelter staff who respond to reports, update rescue statuses, and coordinate pickups.
- **Pet Owners** — people looking for shelters and services, or reporting a stray they have found.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   Vercel (single project)                    │
│                                                              │
│  ┌──────────────────┐    /api/*    ┌───────────────────┐     │
│  │  React Frontend  │ ──────────▶ │  FastAPI Backend   │     │
│  │  (Vite + TS)     │ ◀────────── │  (Python 3.11)     │     │
│  └──────────────────┘             └────────┬──────────┘     │
│        served as static build              │                │
│                                   ┌────────▼──────────┐     │
│                                   │     Supabase       │     │
│                                   │    (PostgreSQL)    │     │
│                                   └───────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

- **Frontend** — React 19, TypeScript, Vite, Tailwind CSS. Runs as a static SPA served by Vercel.
- **Backend** — Python 3.11, FastAPI, deployed as a Vercel Serverless Function (`api/index.py`).
- **Database** — Supabase-hosted PostgreSQL. Row Level Security is enabled; the backend bypasses RLS using a direct `DATABASE_URL` connection.
- **Auth** — Supabase Auth. The backend validates Bearer tokens and exposes login/signup endpoints to the frontend.
- **Deployment** — a single Vercel project with two builds: `@vercel/static-build` for the frontend and `@vercel/python` for the API.

## Folder Structure

```
straylink/
├── api/
│   └── index.py                  # Vercel serverless entry point (loads backend app)
├── backend/
│   ├── api/
│   │   ├── __init__.py
│   │   └── index.py              # FastAPI app — all routes and business logic
│   ├── sql/
│   │   └── setup.sql             # Idempotent database schema (tables, triggers, RLS)
│   ├── .env.example              # Required backend environment variables
│   ├── requirements.txt          # Python dependencies
│   ├── setup_database.py         # Run setup.sql against Supabase
│   └── test_database_connection.py  # Verify DB connectivity and tables
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts         # API client (fetch wrapper, token storage)
│   │   ├── components/
│   │   │   ├── ui/               # Reusable UI primitives (Button, Input, etc.)
│   │   │   ├── BottomNav.tsx
│   │   │   └── PhoneFrame.tsx
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── screens/
│   │   │   ├── ConfirmationScreen.tsx
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── OnboardingScreen.tsx
│   │   │   ├── ReportDetailsScreen.tsx
│   │   │   └── ReportLocationScreen.tsx
│   │   ├── App.tsx               # Root component and navigation
│   │   ├── main.tsx              # Vite entry point
│   │   ├── index.css
│   │   └── types.ts              # Shared TypeScript types
│   ├── .env.example              # Frontend environment variables
│   ├── .env.production
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .gitignore
├── requirements.txt              # Top-level Python deps (used by Vercel build)
└── vercel.json                   # Vercel routing and build configuration
```

## API Routes

All routes are prefixed with `/api`. The frontend calls them through a thin fetch wrapper (`frontend/src/api/client.ts`).

| Method   | Path                           | Auth   | Description                                                                 |
|----------|--------------------------------|--------|-----------------------------------------------------------------------------|
| `GET`    | `/api/health`                  | —      | Health check; returns `{"status": "ok"}`.                                   |
| `POST`   | `/api/auth/signup`             | —      | Create a new user. Body: `{email, password, full_name, role}`. Returns tokens + profile. |
| `POST`   | `/api/auth/login`              | —      | Authenticate an existing user. Body: `{email, password}`. Returns tokens + profile.      |
| `GET`    | `/api/auth/me`                 | Bearer | Return the authenticated user's profile.                                    |
| `POST`   | `/api/reports`                 | Bearer | Create a stray report. Body: `{animal_type, condition, description, location_label, latitude, longitude}`. |
| `GET`    | `/api/reports`                 | Bearer | List reports. Rescuers see all (newest first); reporters and pet-owners see only their own. |
| `PATCH`  | `/api/reports/{id}/status`     | Bearer | Rescuers only — update report status (`Claimed`, `En Route`, `Collected`, `At Vet`).      |
| `PATCH`  | `/api/reports/{id}/rating`     | Bearer | Report owner only — rate a completed report (1–5).                          |

### User Roles

| Role       | Can Report | Can View All Reports | Can Update Status |
|------------|-----------|---------------------|-------------------|
| `reporter` | ✔         | ✗ (own only)        | ✗                 |
| `rescuer`  | ✔         | ✔                   | ✔                 |
| `pet-owner`| ✔         | ✗ (own only)        | ✗                 |

## Environment Variables

### Backend (`backend/.env` — names only, no values committed)

| Variable                   | Purpose                                                        |
|----------------------------|----------------------------------------------------------------|
| `SUPABASE_URL`             | Supabase project URL (e.g. `https://<ref>.supabase.co`)       |
| `SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key for Auth calls                  |
| `DATABASE_URL`             | Direct Postgres connection string (used by the backend to bypass RLS) |

### Frontend (`frontend/.env.local` — names only)

| Variable            | Purpose                                                                  |
|---------------------|--------------------------------------------------------------------------|
| `VITE_API_BASE_URL` | Base URL for API calls during local development (default: `http://localhost:8000/api`) |

> In production (`frontend/.env.production`), `VITE_API_BASE_URL=/api` so the SPA calls the same-origin Vercel serverless function.

## Running Locally

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- A **Supabase** project (free tier works)

### 1. Clone and install

```powershell
git clone <repo-url>
cd straylink
```

### 2. Set up the backend

```powershell
cd backend
copy .env.example .env
# Fill in SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, and DATABASE_URL

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Initialize the database tables, indexes, and triggers
python setup_database.py

# (Optional) Verify connectivity
python test_database_connection.py
```

### 3. Start the backend server

From the **repository root** (not the backend folder) so the Vercel entry point can resolve imports:

```powershell
# Install deps at the root level (or ensure backend venv is active)
pip install -r requirements.txt
uvicorn api.index:app --reload --port 8000
```

### 4. Set up and start the frontend

```powershell
cd frontend
copy .env.example .env.local
# VITE_API_BASE_URL is already set to http://localhost:8000/api

npm install
npm run dev
```

The frontend starts at **http://localhost:5173** and proxies API requests to the backend at **http://localhost:8000**.

### 5. Open the app

Visit [http://localhost:5173](http://localhost:5173) in your browser. Sign up with any of the three roles and start reporting strays.

## Database Schema

The schema lives in `backend/sql/setup.sql` and is safe to run multiple times (idempotent). It creates:

- **`profiles`** — user profiles linked to Supabase Auth (`auth.users`). Automatically populated by a trigger on signup.
- **`reports`** — stray animal reports with animal type, condition, location, status, optional rescuer assignment, and rating.
- **Indexes** on `user_id`, `status`, and `created_at` for efficient queries.
- **Row Level Security** enabled on both tables with no public policies — the backend accesses data exclusively through the direct `DATABASE_URL` connection.