# Slotify Backend

FastAPI backend service with Supabase PostgreSQL database, JWT authentication, Google OR-Tools CP-SAT constraint engine, candidate self-booking, calendar generation, evaluation scoring, and automated schedule recovery for Slotify.

---

## Requirements
- Python 3.10+ (tested and verified on Python 3.13)
- PostgreSQL or Supabase project instance

---

## Setup & Virtual Environment

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (Command Prompt):**
     ```cmd
     .\venv\Scripts\activate.bat
     ```
   - **Linux / macOS:**
     ```bash
     source venv/bin/activate
     ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## Configuring Environment Variables

1. Copy the example configuration:
   ```bash
   cp .env.example .env
   ```
2. Configure settings in `.env`:
   - `DATABASE_URL`: Connection string for PostgreSQL / Supabase
   - `SUPABASE_URL`: Supabase project URL (`https://<project-ref>.supabase.co`)
   - `SUPABASE_ANON_KEY`: Supabase anon public key
   - `SUPABASE_JWT_SECRET`: JWT secret for validating user tokens on the backend
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (backend only, keep secret)
   - `ADMIN_PROVISION_SECRET`: Secret token for bootstrapping coordinators
   - `CORS_ORIGINS`: Allowed local frontend origin (`http://localhost:5173`)

> Note: `.env` is ignored by Git and must never contain committed passwords or production secrets.

---

## Database Migrations (Alembic)

1. **Apply migrations to latest schema version**:
   ```bash
   alembic upgrade head
   ```

2. **Roll back migrations**:
   ```bash
   # Revert last migration
   alembic downgrade -1

   # Revert all migrations
   alembic downgrade base
   ```

3. **Generate new migration revision**:
   ```bash
   alembic revision --autogenerate -m "describe_change"
   ```

---

## Starting the Backend Server

Start the FastAPI application with Uvicorn:
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API documentation (Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Alternative API documentation (ReDoc): [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## Testing

Run the automated test suite with Pytest:
```bash
pytest -v
```
The suite executes **60 automated tests** covering:
- Supabase JWT authentication & RBAC (`test_auth.py`)
- Candidate self-booking, race-condition prevention, and calendar downloads (`test_candidate_booking.py`)
- Core CRUD operations & cross-user isolation (`test_crud.py`)
- Database models & Alembic migrations (`test_database.py`)
- Interviewer evaluations & candidate multi-round progression (`test_evaluations.py`)
- Google OR-Tools CP-SAT constraint engine (`test_scheduling.py`, `test_scheduling_extended.py`)
- Automated schedule recovery and disruption resilience (`test_recovery.py`)
- Full end-to-end recruitment lifecycle integration (`test_e2e_integration.py`)
