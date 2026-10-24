# Slotify: The Ancient One's Trials

A constraint-based recruitment interview scheduling platform built for campus placement drives and high-throughput technical evaluations.

---

## 1. Project Overview

Slotify coordinates complex multi-round interview pipelines across students, interviewers, evaluation panels, and interview venues. The platform automates scheduling while enforcing critical invariants such as panelist workload limits, room availability, interview track prerequisites, and mandatory buffer intervals between sessions.

This repository currently houses:
- **Phase 1: Project Setup, Design System, and Reusable UI Primitives**
- **Phase 2: Complete Landing Page and Navigation Foundation**
- **Phase 3: Coordinator Dashboard and Schedule Generator Workspace**

Backend algorithm implementations (FastAPI, Google OR-Tools constraint solver), live candidate self-booking interfaces, and database persistence will follow in Phase 4.

---

## 2. Technology Stack

The frontend stack is configured as follows:

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS (v3.4) with custom semantic design tokens
- **Component Primitives**: Accessible headless UI primitives built with Radix UI (`@radix-ui/react-select`, `@radix-ui/react-slot`) and customized to Slotify design tokens
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React (restricted strictly to functional indicators: calendar, clock, user, pin, alert, chevron, menu, briefcase, door, check)
- **Linter**: Oxlint for high-performance static analysis
- **State & Demo Persistence**: Centralized React Context (`useCoordinator`) backed by `localStorage` with initial baseline dataset and one-click reset.

---

## 3. Directory Structure

```
Slotify/
├── .gitignore
├── README.md
└── frontend/
    ├── .gitignore
    ├── .oxlintrc.json
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/
        ├── main.tsx
        ├── app/
        │   ├── App.tsx
        │   └── pages/
        │       ├── get-started.tsx
        │       ├── landing.tsx
        │       ├── overview.tsx
        │       ├── showcase.tsx
        │       └── coordinator/
        │           ├── candidates.tsx
        │           ├── drives.tsx
        │           ├── evaluations.tsx
        │           ├── interviewers.tsx
        │           ├── overview.tsx
        │           ├── rooms.tsx
        │           ├── schedule.tsx
        │           └── settings.tsx
        ├── components/
        │   ├── dashboard/
        │   │   └── dashboard-layout.tsx
        │   ├── landing/
        │   │   ├── approach-section.tsx
        │   │   ├── call-to-action.tsx
        │   │   ├── capabilities-section.tsx
        │   │   ├── footer.tsx
        │   │   ├── hero-section.tsx
        │   │   ├── navbar.tsx
        │   │   ├── problem-section.tsx
        │   │   ├── schedule-preview.tsx
        │   │   └── workflow-section.tsx
        │   ├── layout/
        │   │   ├── app-header.tsx
        │   │   └── app-layout.tsx
        │   ├── common/
        │   │   ├── constraint-alert.tsx
        │   │   └── interview-slot-card.tsx
        │   └── ui/
        │       ├── button.tsx
        │       ├── card.tsx
        │       ├── dialog.tsx
        │       ├── divider.tsx
        │       ├── input.tsx
        │       ├── page-container.tsx
        │       ├── select.tsx
        │       ├── status-indicator.tsx
        │       └── typography.tsx
        ├── config/
        │   └── tokens.ts
        ├── context/
        │   └── coordinator-context.tsx
        ├── lib/
        │   ├── coordinator-demo-data.ts
        │   ├── demo-scheduler.ts
        │   └── utils.ts
        ├── styles/
        │   └── index.css
        └── types/
            ├── coordinator.ts
            └── index.ts
```

---

## 4. Getting Started

### Prerequisites

- Node.js: v20.x or higher (tested on Node.js v22.19.0)
- npm: v10.x or higher (tested on npm 10.9.3)

### Installation

Clone the repository and install dependencies inside the `frontend/` directory:

```bash
cd frontend
npm install
```

### Local Development

Start the Vite development server:

```bash
npm run dev
```

The application runs locally at `http://localhost:5173`.

### Production Build

Compile TypeScript and generate an optimized production bundle:

```bash
npm run build
```

Build outputs are saved to `frontend/dist/`.

### Linting and Type Checking

To verify static code quality and formatting invariants:

```bash
# Type check and build
npm run build

# Run linter
npm run lint
```

---

## 5. Application Routing

The application provides public routes and an integrated coordinator workspace:

### Public Website Routes
1. **`/` (Landing Page)**: Full product website with in-page navigation anchors (`#overview`, `#problem`, `#approach`, `#how-it-works`, `#capabilities`, `#preview`, `#cta`).
2. **`/showcase` (Design System Showcase)**: Comprehensive catalog of color tokens, typography hierarchy, button variants, form inputs, Radix selects, status badges, and composite scheduling cards.
3. **`/overview` (Phase 1 Foundation Overview)**: Architectural pillars, status taxonomy summary, and foundational configuration details.
4. **`/get-started` (Onboarding Entry Notice)**: Direct gateway with one-click access into the Coordinator Dashboard.

### Coordinator Dashboard Routes (`/coordinator/*`)
1. **`/coordinator/overview`**: Summary metrics derived from the centralized state, upcoming interviews table, facility status, and pending tasks checklist.
2. **`/coordinator/drives`**: Recruitment drive management with search, status filtering, drive detail inspector, and a multi-step modal form for configuring new drives and sequential interview rounds.
3. **`/coordinator/candidates`**: Student roster table with search by roll number/email, drive filtering, booking status, and add/edit forms.
4. **`/coordinator/interviewers`**: Panelist list, expertise tags, workload capacity progress bars (`assigned / maxDailyLoad`), and detail inspector.
5. **`/coordinator/rooms`**: Two-tab workspace for managing physical interview rooms (capacity, availability toggle, equipment) and panelist availability time windows (with start/end time validation).
6. **`/coordinator/schedule`**: Operational timetable matrix and table stream with drive/room/interviewer filters, conflict inspection, and the **Generate Schedule** solver routine.
7. **`/coordinator/evaluations`**: Evaluation scorecards, panelist recommendations, and candidate advancement gates.
8. **`/coordinator/settings`**: Default interview duration, room cleaning buffer policy (15-minute default), and one-click demo data reset.

---

## 6. Schedule Generator & Conflict Detection

### 6.1 Schedule Generation Flow
1. Navigate to `/coordinator/schedule`.
2. Select the target recruitment drive from the top toolbar or drive filter.
3. Click **Generate Schedule**.
4. The system validates required inputs (available rooms, panelists with remaining capacity, unassigned candidates).
5. A simulated constraint solver routine (`runDemoScheduleGenerator`) evaluates assignments, applies mandatory 15-minute room buffers, updates interviewer loads, and allocates slots.
6. A results modal displays execution logs, newly confirmed appointments, and any unresolved candidates or room contention notices.

### 6.2 Invariant & Conflict Monitoring
The dashboard actively monitors and flags scheduling conflicts:
- **Room Buffer Violations**: Consecutive slots in the same venue without the required cleaning interval.
- **Interviewer Capacity Limits**: Panelists reaching their configured daily workload threshold.
- **Spatial Room Overlaps**: Overlapping sessions in identical rooms.
- **Unassigned Candidates**: Candidates requiring additional panels or dates to complete assessment rounds.

Conflicts can be inspected via the modal invariant viewer or dismissed directly by coordinators.

---

## 7. Demo Data Persistence & Limitations

- **Local Persistence**: All coordinator operations (adding drives, registering students, toggling room availability, generating schedules) persist in browser `localStorage` under `slotify_coordinator_data_v1`.
- **Baseline Reset**: Visit `/coordinator/settings` at any time to restore the initial clean baseline dataset.
- **Known Limitations**: The schedule generator currently executes frontend constraint logic simulating the solver. In Phase 4, this workflow will call the real FastAPI Google OR-Tools backend endpoint.

---

## 8. Development Roadmap

### Phase 1 (Completed)
- Project directory organization and build tooling.
- Approved color palette and typography token configuration.
- Reusable UI component library (Button, Input, Select, Card, StatusIndicator, PageContainer, Typography).
- Accessible layout shell and page routing.
- Interactive design system showcase.

### Phase 2 (Completed)
- Complete, responsive product landing page (Sections A through I).
- Responsive navigation bar with mobile drawer menu and keyboard controls.
- Editorial problem breakdown and constraint architecture comparison.
- 5-stage product workflow visualization.
- Interactive schedule workspace preview with day/track filters and slot inspector.

### Phase 3 (Completed)
- Coordinator dashboard layout with responsive sidebar and top drive switcher.
- Overview page with live dynamic metrics.
- Recruitment drive management and multi-round configuration modal.
- Candidate roster with search, filtering, and add/edit forms.
- Interviewer panel management with workload capacity monitoring.
- Room inventory and availability time window editor.
- Operational schedule timetable with view switcher and demo solver routine.
- Evaluation scorecards and settings page with local data reset.

### Phase 4 (Upcoming)
- FastAPI backend integration with Google OR-Tools constraint satisfaction engine.
- Student self-booking portal with authenticated slot confirmation.
- Interviewer portal for submitting available hours directly.
- Production PostgreSQL database persistence.
