# Slotify Frontend

This directory contains the client application for **Slotify: The Ancient One's Trials**.

For complete project documentation, design system tokens, typography pairing details, and architecture guidelines, please refer to the root [README.md](../README.md).

## Quick Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run production build and type checking
npm run build

# Run linter
npm run lint
```

## Available Routes

### Public Routes
- `/`: Product Landing Page
- `/showcase`: Design System and UI Component Showcase
- `/overview`: Phase 1 Architecture Overview
- `/get-started`: Onboarding Status and Coordinator Gateway

### Coordinator Workspace (`/coordinator/*`)
- `/coordinator/overview`: Metrics and upcoming sessions
- `/coordinator/drives`: Recruitment drives and interview rounds
- `/coordinator/candidates`: Student roster and booking statuses
- `/coordinator/interviewers`: Panelist expertise and workload tracking
- `/coordinator/rooms`: Room inventory and availability windows
- `/coordinator/schedule`: Timetable matrix and demo schedule generator
- `/coordinator/evaluations`: Panelist scorecards and candidate progression
- `/coordinator/settings`: Constraint settings and demo data reset
