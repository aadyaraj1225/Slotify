# Slotify: The Ancient One's Trials

A constraint-based interview scheduling platform built for campus placement drives and high-throughput technical evaluations.

---

## 1. Project Overview

Slotify coordinates complex multi-round interview pipelines across students, interviewers, evaluation panels, and physical campus venues. The platform automates scheduling while enforcing critical invariants such as panelist workload limits, room turnaround buffers, candidate sequence prerequisites, and non-overlapping session constraints.

### Available Experiences
1. **Public Website (`/`)**: Compact responsive header, Hero with headline *"Every interview, in the right place."*, recruitment challenge overview, 3-step intake workflow, core invariants, and call to action.
2. **Unified Authentication (`/login`, `/signup`)**: Retro-digital authentication portal with show/hide password, form validation, and explicitly labeled evaluator demo bypasses.
3. **Candidate Dashboard (`/candidate/*`)**: Dedicated to student applicants. Review upcoming interviews, view session details, download calendar invitations (`.ics`), book open eligible slots with conflict checking, and manage real-time notifications.
4. **Interviewer Dashboard (`/interviewer/*`)**: Dedicated to faculty and evaluation panelists. View daily schedule, inspect assigned candidate sessions, submit rubric scorecards with recommendations, register availability time windows, and review completed evaluations.
5. **Coordinator Dashboard (`/coordinator/*`)**: Dedicated to placement cell teams. Create recruitment drives, manage candidate rosters, configure interviewer loads, set room capacities and equipment, and run the simulated constraint solver matrix with conflict inspection.

---

## 2. Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS (v3.4) with custom retro-digital tokens
- **Component Primitives**: Headless Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-slot`)
- **Routing**: React Router DOM (v7) with role-protected route guards (`ProtectedRoute`)
- **Icons**: Lucide React
- **Static Analysis**: Oxlint (0 errors)
- **Local Persistence**: React Context providers (`useAuth`, `useCoordinator`, `useCandidate`) backed by `localStorage` with seed datasets.

---

## 3. Application Routes

| Path | Access Level | Description |
| :--- | :--- | :--- |
| `/` | Public | Landing page with product overview and navigation |
| `/login` | Public | Portal sign in with credentials or evaluator demo buttons |
| `/signup` | Public | Account registration with role selection |
| `/candidate/overview` | Candidate | Journey overview, summary metrics, and upcoming sessions |
| `/candidate/interviews` | Candidate | My interviews, venue information, calendar downloads, cancellation |
| `/candidate/available-slots` | Candidate | Real-time open slot booking with overlap invariant validation |
| `/candidate/notifications` | Candidate | Alerts regarding schedule shifts and confirmations |
| `/interviewer/overview` | Interviewer | Panelist overview and next assigned candidate |
| `/interviewer/schedule` | Interviewer | Date-by-date timetable matrix of assigned panels |
| `/interviewer/interviews` | Interviewer | Candidate evaluation roster and scorecard submission modal |
| `/interviewer/availability` | Interviewer | Register and delete active time blocks |
| `/interviewer/evaluations` | Interviewer | Historical scorecards and rubric feedback |
| `/coordinator/overview` | Coordinator | Placement drive overview and summary metrics |
| `/coordinator/drives` | Coordinator | Drive creation, rounds configuration, stage pipelines |
| `/coordinator/candidates` | Coordinator | Student candidate roster and intake drawer |
| `/coordinator/interviewers` | Coordinator | Panelist workloads, department expertise, quotas |
| `/coordinator/rooms` | Coordinator | Room venue capacities and turnaround statuses |
| `/coordinator/schedule` | Coordinator | Timetable matrix, stream view, solver simulation, conflict inspector |
| `/coordinator/evaluations` | Coordinator | Cross-drive deliberation feed and advancement hold states |
| `/coordinator/settings` | Coordinator | Invariant configuration and local storage reset |

---

## 4. Setup and Development

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### Type-Check and Production Build
```bash
npm run build
```

### Static Analysis / Linter
```bash
npm run lint
```

---

## 5. Demonstration & Limitations Note

- **Demo Authentication**: The login screen provides one-click Evaluator Demo Access buttons for Candidate, Interviewer, and Coordinator roles. User sessions and role switches are persisted safely in client-side storage.
- **Backend Solver Integration**: In this frontend release, scheduling validation, conflict detection, and self-booking are executed via client-side constraint simulations. The future FastAPI backend will connect the Google OR-Tools CP-SAT solver endpoint directly.
