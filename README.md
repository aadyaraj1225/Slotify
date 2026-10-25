# Slotify: The Ancient One’s Trials

### Problem Statement
Scheduling campus recruitment interviews across hundreds of candidates, diverse interviewer panels, limited interview rooms, and multiple sequential rounds is complex and error-prone. Manual spreadsheet management frequently leads to double bookings, uneven interviewer workloads, room buffer violations, and cascading disruptions caused by last-minute cancellations or rescheduling requests.

### Solution
Slotify coordinates interview scheduling through availability management, constraint-based matching, candidate self-booking, and schedule recovery. The platform provides role-segregated workflows for Candidates, Interviewers, and Coordinators to ensure interviews adhere to round dependencies, panel capacities, and room turnaround buffers without schedule conflicts.

### Features

#### Implemented Features (Frontend Demo)
- **Role-Based Dashboards**: Tailored workspaces for Candidates (`/candidate`), Interviewers (`/interviewer`), and Coordinators (`/coordinator`).
- **Candidate Self-Booking & Availability**: Browse open interview slots with real-time overlap validation, book slots, and review schedule confirmations.
- **Calendar Invitations & In-App Notifications**: Download standard `.ics` calendar invitation files directly from interview cards and track in-app scheduling alerts.
- **Multi-Round Recruitment Management**: Coordinator interface to configure recruitment drives, manage candidate rosters, track stage progression, and inspect timetable conflicts.
- **Interviewer Schedule & Evaluations**: Daily interview matrices, assigned candidate queues, availability windows, and structured evaluation scorecards with hiring recommendations.
- **Preview Schedule Changes**: Modal previews for viewing proposed booking adjustments before confirmation.

#### Planned Features (Full-Stack Specification)
- **Constraint-Based Scheduling Engine**: Automated multi-variable optimization utilizing Google OR-Tools CP-SAT to balance interviewer workloads and room turnaround buffers.
- **Automated Rescheduling & Schedule Recovery**: Algorithmic recalculation to heal broken schedules following cancellations or interviewer unavailability.
- **Centralized Candidate Ranking**: Automated cross-round scorecard aggregation and ranking pipelines.
- **Server-Driven Email Invitations & Realtime Sync**: Automated calendar emails via Resend API and live multi-user schedule synchronization via database change streams.

### Tech Stack

#### Frontend
- **Implemented**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI primitives, Lucide React, React Router DOM
- **Planned / Extended**: FullCalendar, React Hook Form, Zod, Motion, TanStack Query, Recharts

#### Backend & Scheduling
- **Implemented**: Python 3.13, FastAPI, Pydantic, SQLAlchemy 2.0, Alembic, psycopg2-binary / psycopg 3
- **Planned / Extended**: Google OR-Tools CP-SAT

#### Database, Auth & Realtime
- **Implemented**: Supabase PostgreSQL schema with Alembic migrations, connection pooler support, and Pydantic validation schemas
- **Planned / Extended**: Supabase Auth, Supabase Realtime

#### Calendar & Notifications
- **Implemented**: Client-side `.ics` calendar generation and local state-backed in-app notifications
- **Planned Architecture**: Python `icalendar`, Resend API (email notifications), PostgreSQL-persisted notification feeds

### Setup and Run

#### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
4. Build for production:
   ```bash
   npm run build
   ```

#### Backend & Database (Supabase)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy environment configuration and configure `DATABASE_URL`:
   ```bash
   cp .env.example .env
   ```
5. Apply database migrations:
   ```bash
   alembic upgrade head
   ```
6. Run the API server:
   ```bash
   uvicorn main:app --reload
   ```
7. Run backend tests:
   ```bash
   pytest
   ```
