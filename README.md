# Slotify: The Ancient One’s Trials

**Slotify** is an automated, constraint-driven recruitment timetable and interview coordination platform built with **React, TypeScript, FastAPI, Supabase PostgreSQL, and Google OR-Tools CP-SAT**.

---

### Problem Statement
Scheduling campus recruitment interviews across hundreds of candidates, diverse interviewer panels, limited interview cabins, and sequential evaluation rounds is complex and error-prone. Manual spreadsheet management frequently leads to double bookings, uneven interviewer workloads, room buffer violations, and cascading disruptions caused by last-minute cancellations or rescheduling requests.

### Solution
Slotify coordinates interview scheduling through availability management, mathematical constraint-based matching, candidate self-booking, multi-round progression, and automated schedule recovery. The platform provides role-segregated workflows for Candidates, Interviewers, and Coordinators to ensure interviews adhere to round dependencies, panel capacities, and turnaround buffers without schedule conflicts.

---

### Implemented Architecture & Features

#### 1. Google OR-Tools CP-SAT Scheduling Engine
- **Mathematical Optimization**: Formulated as integer programming with decision variables for candidate, time slot, interviewer, and room tuples.
- **Hard Constraints Enforced**:
  - No candidate double-booking or overlapping sessions.
  - No interviewer double-booking or overlapping intervals.
  - No room conflicts or simultaneous bookings.
  - Strict compliance with candidate and interviewer availability windows.
  - Interviewer technical skill requirements strictly enforced.
  - Interviewer daily workload quota limits respected.
  - Pre-existing confirmed bookings strictly preserved without collisions.
- **Soft Objectives**: Workload balancing across qualified panelists and minimal idle gaps.
- **Independent Invariant Gate**: Every solver schedule is mathematically verified by an independent validator before database persistence.

#### 2. Candidate Self-Booking & Coordination
- **Eligible Slot Discovery**: Candidates query available interview openings dynamically calculated from interviewer schedules and cabin availability.
- **Concurrency & Race-Condition Defense**: Transactional re-checking prevents double-booking if two candidates attempt to reserve the same slot simultaneously.
- **Idempotency**: Exact retries return the confirmed booking without generating duplicate rows.
- **Calendar Invitations**: Downloadable standard RFC 5545 `.ics` iCalendar files with UTC timezone timestamps, venue data, and stable UIDs.
- **In-App Notifications**: Real-time notifications for booking confirmations, cancellations, and reschedules with read/unread tracking.

#### 3. Interviewer Evaluations & Multi-Round Candidate Progression
- **Role-Gated Evaluations**: Interviewers only access sessions assigned to their panel; candidates and unassigned interviewers are blocked (HTTP 403).
- **Rubric Scoring & Weighting**: Supports customizable criterion weights (e.g. 60% coding, 40% problem-solving) with strict score bound validation $[0, \text{max\_score}]$.
- **Automated Round Progression**: Computes aggregate scores across panelists; advances candidates to `QUALIFIED` if score $\ge \text{min\_passing\_score}$ and no hard reject is recorded, or sets status to `REJECTED`.
- **Coordinator Results & CSV Export**: Real-time ranked leaderboards with multi-criteria tie-breaking and downloadable CSV outcome reports.

#### 4. Automatic Rescheduling & Cancellation Recovery
- **Disruption Resilience**: Handles interviewer emergencies, room facility outages, and candidate conflicts.
- **Preview Before Apply**: Generates proposed replacement assignments and diagnostics without altering live bookings.
- **Atomic Application**: Approved recovery plans are validated against live state, applied in a single database transaction, and trigger automated notifications.
- **Full Audit Trail**: Preserves disruption records, affected booking IDs, and timestamps.

---

### Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide React, React Router DOM.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2, Pydantic Settings.
- **Optimization**: Google OR-Tools CP-SAT (`ortools>=9.10.0`).
- **Database & Auth**: Supabase PostgreSQL, SQLAlchemy 2.0, Alembic migrations, PyJWT/python-jose.
- **Calendar & Formats**: Python `icalendar` (RFC 5545).
- **Testing**: Pytest, HTTPX, StaticPool SQLite in-memory isolated test suites (60 tests passed).

---

### Setup and Run

#### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (tested on Python 3.13)
- Git

#### 1. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Apply database migrations
alembic upgrade head

# Start API server (port 8000)
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

#### 2. Running Backend Tests
```bash
cd backend
.\venv\Scripts\pytest -v
```
*Executes all 60 tests covering RBAC, CRUD, CP-SAT solver, candidate self-booking, evaluation scoring, cancellation recovery, and full E2E lifecycle.*

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server (port 5173)
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

- Build for production:
  ```bash
  npm run build
  ```

---

### API Reference Overview

| Module | Method | Endpoint | Access |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/register` | Public (default `candidate`) |
| **Auth** | `GET` | `/auth/me` | Authenticated |
| **Scheduling** | `POST` | `/drives/{id}/schedule/generate` | Coordinator only |
| **Scheduling** | `GET` | `/drives/{id}/schedule` | Authenticated |
| **Booking** | `GET` | `/candidate/available-slots` | Candidate only |
| **Booking** | `POST` | `/bookings` | Candidate only |
| **Booking** | `GET` | `/bookings/my` | Authenticated |
| **Booking** | `POST` | `/bookings/{id}/cancel` | Owner / Coordinator |
| **Booking** | `GET` | `/bookings/{id}/calendar` | Owner / Coordinator |
| **Notifications** | `GET` | `/notifications` | Authenticated |
| **Notifications** | `PATCH` | `/notifications/{id}/read` | Owner only |
| **Evaluations** | `GET` | `/interviewer/my-interviews` | Interviewer only |
| **Evaluations** | `POST` | `/bookings/{id}/evaluations` | Assigned Panelist / Coord |
| **Rounds** | `POST` | `/drives/{id}/rounds` | Coordinator only |
| **Results** | `GET` | `/drives/{id}/results` | Coordinator only |
| **Results** | `GET` | `/drives/{id}/results/export` | Coordinator only |
| **Recovery** | `POST` | `/drives/{id}/schedule/recovery/preview` | Coordinator only |
| **Recovery** | `POST` | `/drives/{id}/schedule/recovery/{rec_id}/apply` | Coordinator only |
| **Recovery** | `GET` | `/drives/{id}/schedule/recovery/history` | Coordinator only |
