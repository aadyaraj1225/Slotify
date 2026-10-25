# Slotify Backend

FastAPI backend service, Supabase PostgreSQL database, authentication, and REST CRUD API layer for Slotify.

## Requirements
- Python 3.10+ (tested on Python 3.13)
- PostgreSQL / Supabase project instance

## Setup and Virtual Environment

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

## Configuring Supabase Environment Variables

1. Copy the example configuration:
   ```bash
   cp .env.example .env
   ```
2. Configure environment variables in `.env`:
   - `DATABASE_URL`: Connection string for PostgreSQL / Supabase
   - `SUPABASE_URL`: Supabase project URL (`https://<project-ref>.supabase.co`)
   - `SUPABASE_ANON_KEY`: Supabase anon public key
   - `SUPABASE_JWT_SECRET`: JWT secret for validating user tokens on the backend
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (backend only, keep secret)
   - `ADMIN_PROVISION_SECRET`: Secret token for bootstrapping coordinators

> Note: `.env` is ignored by Git and must never contain committed passwords or production secrets.

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

## Starting the Backend Server

Start the FastAPI application with Uvicorn:
```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation is available at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

---

## API Endpoints and Permissions

### 1. Authentication & Role Management (`/auth`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `POST` | `/auth/sync-profile` | Public / All | Sync user profile after Supabase signup. Rejects public attempts to self-assign coordinator. |
| `POST` | `/auth/admin/provision-coordinator` | Admin Secret | Elevate a user to coordinator using `ADMIN_PROVISION_SECRET`. |
| `GET` | `/auth/me` | Authenticated | Return the current verified user profile and role from the database. |
| `GET` | `/auth/candidate` | Candidate only | Candidate verification endpoint. Returns 403 for other roles. |
| `GET` | `/auth/interviewer` | Interviewer only | Interviewer verification endpoint. Returns 403 for other roles. |
| `GET` | `/auth/coordinator` | Coordinator only | Coordinator verification endpoint. Returns 403 for other roles. |

### 2. Recruitment Drives (`/drives`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/drives` | Authenticated | List all recruitment drives with optional `status` filter and pagination (`skip`, `limit`). |
| `POST` | `/drives` | Coordinator only | Create a new recruitment drive. |
| `GET` | `/drives/{drive_id}` | Authenticated | View details of a specific recruitment drive. |
| `PATCH` | `/drives/{drive_id}` | Coordinator only | Update drive title, description, or status (`draft`, `active`, `paused`, `completed`, `archived`). |
| `DELETE`| `/drives/{drive_id}` | Coordinator only | Delete a recruitment drive. |

### 3. Candidates (`/candidates`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/candidates` | Coordinator only | List all candidates with pagination (`skip`, `limit`) and department filter. |
| `POST` | `/candidates` | Coordinator only | Create a candidate record linked to an existing profile. |
| `GET` | `/candidates/me` | Authenticated | Return current authenticated user's candidate record. |
| `GET` | `/candidates/{candidate_id}` | Owner or Coordinator | View candidate details. Non-coordinators can only view their own record. |
| `PATCH` | `/candidates/{candidate_id}` | Owner or Coordinator | Update candidate details (student_id, department, graduation_year, resume_url, extra_details). |
| `DELETE`| `/candidates/{candidate_id}` | Coordinator only | Delete candidate record. |

### 4. Interviewers (`/interviewers`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/interviewers` | Coordinator only | List all interviewers with pagination and department filtering. |
| `POST` | `/interviewers` | Coordinator only | Create interviewer record linked to an existing profile. |
| `GET` | `/interviewers/me` | Authenticated | Return current authenticated user's interviewer record. |
| `GET` | `/interviewers/{interviewer_id}` | Owner or Coordinator | View interviewer details. |
| `PATCH` | `/interviewers/{interviewer_id}` | Owner or Coordinator | Update interviewer details. **Workload limit modification is restricted to Coordinators.** |
| `DELETE`| `/interviewers/{interviewer_id}` | Coordinator only | Delete interviewer record. |

### 5. Rooms (`/rooms`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/rooms` | Authenticated | List rooms with capacity filter (`min_capacity`) and pagination. |
| `POST` | `/rooms` | Coordinator only | Create interview room. Enforces unique room names. |
| `GET` | `/rooms/{room_id}` | Authenticated | View room details. |
| `PATCH` | `/rooms/{room_id}` | Coordinator only | Update room name, location, and capacity. |
| `DELETE`| `/rooms/{room_id}` | Coordinator only | Delete room. |

### 6. Availability (`/availability`)
| Method | Endpoint | Allowed Roles | Description |
|---|---|---|---|
| `GET` | `/availability` | Authenticated | List availability windows. Non-coordinators only view their own; coordinators can query any profile. |
| `POST` | `/availability` | Authenticated | Create an availability window. Enforces `end_time > start_time`. |
| `GET` | `/availability/{availability_id}` | Owner or Coordinator | View availability window details. |
| `PATCH` | `/availability/{availability_id}` | Owner or Coordinator | Update start_time, end_time, or status. Enforces `end_time > start_time`. |
| `DELETE`| `/availability/{availability_id}` | Owner or Coordinator | Delete availability window. |

---

## Running Tests

Run the complete test suite using pytest:
```bash
pytest
```
Test suite coverage:
- **`test_main.py`**: Root endpoint, health endpoint, CORS allowed/disallowed origins (4 tests).
- **`test_database.py`**: Model definitions, foreign keys, relationships, check constraints, Pydantic schemas, and Alembic migrations upgrade/downgrade (6 tests).
- **`test_auth.py`**: Token validation (missing, malformed, expired), public coordinator denial, role tampering prevention, coordinator provisioning, and endpoint authorization checks (8 tests).
- **`test_crud.py`**: Full CRUD operations for drives, candidates, interviewers, rooms, availability; cross-user isolation; time constraint validation; and coordinator-only privilege restrictions (5 comprehensive suites).
