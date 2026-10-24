# Slotify: The Ancient One's Trials

A constraint-based recruitment interview scheduling platform built for campus placement drives and high-throughput technical evaluations.

---

## 1. Project Overview

Slotify coordinates complex multi-round interview pipelines across students, interviewers, evaluation panels, and interview venues. The platform automates scheduling while enforcing critical invariants such as panelist workload limits, room availability, interview track prerequisites, and mandatory buffer intervals between sessions.

This repository currently houses:
- **Phase 1: Project Setup, Design System, and Reusable UI Primitives**
- **Phase 2: Complete Landing Page and Navigation Foundation**

Backend algorithm implementations (FastAPI, Google OR-Tools constraint solver), database layers, authentication, and live candidate self-booking portals will follow in subsequent phases.

---

## 2. Technology Stack

The frontend stack is configured as follows:

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS (v3.4) with custom semantic design tokens
- **Component Primitives**: Accessible headless UI primitives built with Radix UI (`@radix-ui/react-select`, `@radix-ui/react-slot`) and customized to Slotify design tokens
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React (restricted strictly to functional indicators: calendar, clock, user, pin, alert, chevron, menu, arrow)
- **Linter**: Oxlint for high-performance static analysis

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
        │       └── showcase.tsx
        ├── components/
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
        │       ├── divider.tsx
        │       ├── input.tsx
        │       ├── page-container.tsx
        │       ├── select.tsx
        │       ├── status-indicator.tsx
        │       └── typography.tsx
        ├── config/
        │   └── tokens.ts
        ├── lib/
        │   └── utils.ts
        ├── styles/
        │   └── index.css
        └── types/
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

## 5. Routes and Navigation

The Phase 2 application provides four primary routes:

1. **`/` (Landing Page)**: Complete product website with in-page navigation anchors (`#overview`, `#problem`, `#approach`, `#how-it-works`, `#capabilities`, `#preview`, `#cta`).
2. **`/showcase` (Design System Showcase)**: Interactive catalog of color tokens, typography hierarchy, button variants, form inputs, Radix selects, status badges, and composite scheduling cards.
3. **`/overview` (Phase 1 Foundation Overview)**: Architectural pillars, status taxonomy summary, and foundational configuration details.
4. **`/get-started` (Onboarding Entry Notice)**: Transparent onboarding page explaining the current prototype status, available exploratory tools, and upcoming Phase 3 drive creation flows.
5. **`*` (Wildcard Fallback)**: Automatically redirects unknown routes back to `/`.

---

## 6. Landing Page Sections (Phase 2)

The landing page (`/`) incorporates nine dedicated sections:

- **Section A: Navigation Bar (`Navbar`)**: Wordmark, smooth-scrolling section links, link to the design showcase, functional primary action ("Get started"), and a responsive mobile drawer menu with keyboard Escape support.
- **Section B: Hero Section (`HeroSection`)**: Clear headline ("Every interview, in the right place."), concise supporting copy, dual CTA buttons ("Explore Slotify", "See how it works"), and a realistic multi-track scheduling workspace preview.
- **Section C: The Problem (`ProblemSection`)**: Contextual breakdown of placement drive scale, addressing double bookings, fragmented interviewer availability, uneven loads, cancellations, and manual spreadsheet failure.
- **Section D: The Slotify Approach (`ApproachSection`)**: Clear distinction between mandatory requirements (zero overlap, round qualification, room capacity, sequence integrity) and optimization goals (load balancing, candidate preferences, minimal gap, low-disruption recovery).
- **Section E: How It Works (`WorkflowSection`)**: Structured 5-stage lifecycle: Drive Setup, Availability Intake, Schedule Generation, Candidate Booking, and Cancellation Recovery.
- **Section F: Product Capabilities (`CapabilitiesSection`)**: Asymmetric feature grid highlighting constraint solvers, real-time recovery, student self-booking, panel workload tracking, multi-round gates, and candidate evaluation progression.
- **Section G: Interactive Product Preview (`SchedulePreview`)**: Multi-day scheduling calendar with track filters (Software, Systems, Data), interactive slot selection, conflict alerts, and a detailed slot inspector panel using labeled sample data.
- **Section H: Closing Call to Action (`CallToAction`)**: Focused closing message ("Make interview scheduling easier to coordinate.") guiding users to explore the live components or review repository source.
- **Section I: Footer (`Footer`)**: Wordmark, product summary, section navigation links, GitHub repository link, and copyright notice.

---

## 7. Approved Design System

### 7.1 Color Palette

The Slotify visual language follows a light-first aesthetic designed for readability and sustained focus during high-density scheduling operations:

| Token Name | HEX Value | Purpose and Semantic Mapping |
|---|---|---|
| Warm Ivory | `#F7F6F2` | Main background surface across all pages (`--background`) |
| White | `#FFFFFF` | Panels, cards, modal surfaces, and inputs (`--surface`) |
| Charcoal | `#202321` | Primary text and headings (`--foreground`) |
| Slate Gray | `#626A70` | Secondary text, helper labels, and timestamps (`--muted-foreground`) |
| Muted Cobalt | `#3559C7` | Primary buttons, active tabs, and focus rings (`--primary`) |
| Pale Blue | `#E9EEFC` | Selected interview slots and subtle highlights (`--accent`) |
| Soft Border | `#E4E3DD` | Dividers, card borders, and input outlines (`--border`) |
| Success Green | `#26734D` | Confirmed interview slots and verified candidate status (`--success`) |
| Warning Amber | `#996515` | Pending confirmations and panel capacity alerts (`--warning`) |
| Error Red | `#B93838` | Schedule conflicts, room collisions, and input errors (`--destructive`) |

All color values are defined in `src/config/tokens.ts` and exposed as Tailwind CSS utility classes and CSS variables.

### 7.2 Typography System

The interface pairs two purposeful sans-serif typefaces:

- **Display Headings**: `Plus Jakarta Sans` (weights: 500, 600, 700, 800). Provides geometric clarity and structural distinction for page titles, section titles, and modal headers.
- **Interface and Body Text**: `DM Sans` (weights: 400, 500, 600, 700). Delivers legibility in dense tabular views, schedules, and form layouts.
- **Code, Slot Timestamps, and Constraint Keys**: `JetBrains Mono` (weights: 400, 500). Used for scheduling IDs, timestamps, and error codes.
- **Reliable Fallbacks**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.

Fonts are imported via optimized Google Fonts links in `index.html` with preconnect hints.

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
- Transparent onboarding route (`/get-started`).

### Phase 3 (Upcoming)
- Placement coordinator drive setup and recruitment track editor.
- Interviewer availability intake forms and capacity limits.
- Student authentication and self-booking interface.
- FastAPI backend integration with Google OR-Tools constraint satisfaction engine.
- Cancellation recovery resolution workspace.
