# Slotify: The Ancient One’s Trials

### Problem Statement
Coordinating campus recruitment drives is chaotic. Placement teams must balance hundreds of students across sequential evaluation rounds, faculty panelists with strict daily quotas, and limited physical interview rooms with mandatory turnaround buffers. Traditional spreadsheets quickly result in double bookings, prerequisite violations, and evaluator burnout.

### Solution
Slotify organizes and automates campus interview scheduling with deterministic constraint rules. It provides role-specific dashboards for coordinators, faculty interviewers, and student candidates, ensuring valid prerequisite sequences, room cleaning intervals, and load-balanced evaluations with zero clashes.

### Features
- **Candidate Portal**: View scheduled sessions, download calendar invitations (`.ics`), browse available openings, self-book with instant overlap validation, and review notifications.
- **Interviewer Hub**: Daily schedule matrix, assigned student rosters, rubric evaluation forms with scorecard recommendations, and availability time window management.
- **Coordinator Console**: Recruitment drive setup, multi-round stage sequencing, candidate roster management, panelist workload tracking, room inventory, and timetable conflict inspection.
- **Role-Based Routing & Session State**: Dedicated protected dashboard experiences for Candidates (`/candidate`), Interviewers (`/interviewer`), and Coordinators (`/coordinator`).

### Tech Stack
- **Frontend**: React 19, TypeScript, Vite 8, React Router DOM v7
- **Styling**: Tailwind CSS v3.4 with custom retro-digital tokens
- **UI Components**: Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-slot`), Lucide React
- **Static Analysis**: Oxlint (0 errors)

### Setup and Run
1. Navigate into the frontend workspace:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
4. Run the production build and type-checker:
   ```bash
   npm run build
   ```
5. Run the linter:
   ```bash
   npm run lint
   ```

### Demo or Test Login
The Sign In page (`/login`) includes an **Explore Demo** section for project evaluators. Select one of the three roles to launch its corresponding dashboard without entering credentials:
- **Candidate**: Pre-configured as *Aarav Patel* (navigates to `/candidate/overview`)
- **Interviewer**: Pre-configured as *Dr. Vikram Sethi* (navigates to `/interviewer/overview`)
- **Coordinator**: Pre-configured as *Head Placement Lead* (navigates to `/coordinator/overview`)

*Note: Demo access simulates authentication in client-side storage for local demonstration.*
