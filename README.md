# Student Result Tracking & Performance Analytics System

## Project purpose
Schools often juggle spreadsheets and ad-hoc documents to manage student performance, making it difficult for teachers and leaders to understand progress or share standardised reports. This project delivers a full-stack reference implementation that streamlines mark entry, analytics, and PDF report cards through a secure portal with role-based access.

Key features:
- JWT-protected login with **ADMIN**, **TEACHER**, and **STUDENT** roles.
- CRUD management for classes, students, subjects, assessments, and marks.
- Analytics APIs powering student trends, class subject averages, and overview dashboards.
- On-demand PDF report cards with grades and comments.
- SQLite-backed FastAPI API and a Next.js frontend with chart visualisations.

## System architecture
```
Next.js (frontend)  →  FastAPI (backend)  →  SQLite (database via SQLAlchemy)
```
Major modules:
- **auth**: JWT issuance, password hashing, role guards.
- **students/classes/subjects/assessments/marks**: CRUD routers and schemas.
- **analytics**: Aggregations for trends, subject averages, class overview, top performers.
- **reports**: PDF generation using reportlab.
- **frontend**: Next.js app router pages for login, dashboards, students, marks entry, analytics.

## Tech stack
- **FastAPI** for quick, typed web APIs.
- **SQLAlchemy** ORM over **SQLite** for a lightweight database.
- **Passlib** for secure password hashing.
- **python-jose** for JWT creation/verification.
- **reportlab** to generate PDF report cards.
- **Next.js + React (TypeScript)** for the SPA/SSR frontend.
- **react-chartjs-2 / Chart.js** for analytics visualisations.

## Setup instructions
### Prerequisites
- Python 3.12+
- Node.js 18+
- (Recommended) a Python virtual environment

### Backend setup (`/backend`)
1. Install dependencies:
   ```bash
   python -m venv .venv && source .venv/bin/activate
   python -m pip install -r backend/requirements.txt
   ```
2. Create a `.env` (optional – defaults are sensible):
   ```bash
   DATABASE_URL=sqlite:///./school.db
   JWT_SECRET=devsecret
   ACCESS_TOKEN_EXPIRE_MINUTES=120
   CORS_ORIGINS=http://localhost:3000
   ```
3. Initialise the database and seed demo data:
   ```bash
   python -m backend.seed
   ```
4. Run the API:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

### Frontend setup (`/frontend`)
1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE=http://localhost:8000
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs on http://localhost:3000.

### Running tests
```bash
pytest backend/tests
```

## How the system works
- **Admin**: log in, create classes/subjects/students (via API or simple UI), view dashboard counts.
- **Teacher**: create assessments, enter marks, review analytics dashboards, download student reports.
- **Student**: log in to view their trend chart and download their PDF report card.

Percentages = `(marks_obtained / maximum_marks) * 100`; grades follow thresholds A≥85, B≥70, C≥55, D≥40, else E. Analytics charts show trends per assessment, subject-wise averages, pass-rate doughnut, and top students.

## API overview
- **Auth**: `POST /auth/register`, `POST /auth/login` (returns JWT, role, name). Use `Authorization: Bearer <token>`.
- **Students**: `GET/POST/PUT/DELETE /students` for listing and CRUD.
- **Classes**: `GET/POST/PUT/DELETE /classes`.
- **Subjects**: `GET/POST/PUT/DELETE /subjects`.
- **Assessments**: `GET/POST/PUT/DELETE /assessments`.
- **Marks**: `GET/POST/PUT/DELETE /marks`.
- **Analytics**:
  - `GET /analytics/student/{id}/trend`
  - `GET /analytics/class/{class_id}/subjects-summary`
  - `GET /analytics/class/{class_id}/overview`
- **Reports**: `GET /reports/student/{id}?term=Term 1` streams a PDF.

## Limitations and future enhancements
- Single-school scope, minimal validation, and basic UI styling.
- No parent portal or notifications.
- CSV import/export and richer analytics (growth models, cohort comparisons) would add value.
- Integration hooks for SIS/LMS platforms could streamline identity and roster sync.
