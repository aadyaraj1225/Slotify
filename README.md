# Slotify: The Ancient One's Trials

A constraint-based recruitment interview scheduling platform built for campus placement drives and high-throughput technical evaluations.

---

## 1. Project Overview

Slotify coordinates complex multi-round interview pipelines across students, interviewers, evaluation panels, and interview venues. The platform automates scheduling while enforcing critical invariants such as panelist workload limits, room availability, interview track prerequisites, and mandatory buffer intervals between sessions.

This repository currently houses **Frontend Phase 1: Project Setup, Design System, Reusable UI Components, and Development Foundation**.

Backend algorithm implementations (FastAPI, Google OR-Tools constraint solver), database layers, authentication, and booking mutations will follow in subsequent phases.

---

## 2. Technology Stack

The Phase 1 frontend stack is configured as follows:

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS (v3.4) with custom semantic design tokens
- **Component Primitives**: Accessible headless UI primitives built with Radix UI (`@radix-ui/react-select`, `@radix-ui/react-slot`) and customized to Slotify design tokens
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React (restricted strictly to functional indicators: calendar, clock, user, pin, alert, chevron)
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
        │       ├── overview.tsx
        │       └── showcase.tsx
        ├── components/
        │   ├── ui/
        │   │   ├── button.tsx
        │   │   ├── card.tsx
        │   │   ├── divider.tsx
        │   │   ├── input.tsx
        │   │   ├── page-container.tsx
        │   │   ├── select.tsx
        │   │   ├── status-indicator.tsx
        │   │   └── typography.tsx
        │   ├── layout/
        │   │   ├── app-header.tsx
        │   │   └── app-layout.tsx
        │   └── common/
        │       ├── constraint-alert.tsx
        │       └── interview-slot-card.tsx
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

## 5. Approved Design System

### 5.1 Color Palette

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

### 5.2 Typography System

The interface pairs two purposeful sans-serif typefaces:

- **Display Headings**: `Plus Jakarta Sans` (weights: 500, 600, 700, 800). Provides geometric clarity and structural distinction for page titles, section titles, and modal headers.
- **Interface and Body Text**: `DM Sans` (weights: 400, 500, 600, 700). Delivers legibility in dense tabular views, schedules, and form layouts.
- **Code, Slot Timestamps, and Constraint Keys**: `JetBrains Mono` (weights: 400, 500). Used for scheduling IDs, timestamps, and error codes.
- **Reliable Fallbacks**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`.

Fonts are imported via optimized Google Fonts links in `index.html` with preconnect hints.

---

## 6. Reusable UI Components

The following components are implemented in `src/components/ui/` and styled with Slotify design tokens:

1. **Button** (`src/components/ui/button.tsx`):
   - Variants: `primary`, `secondary`, `outline`, `destructive`, `ghost`.
   - Sizes: `sm` (h-8), `md` (h-10), `lg` (h-11).
   - Features: Accessible keyboard focus ring, loading spinner state, disabled state, and high-contrast hover styles.

2. **Input** (`src/components/ui/input.tsx`):
   - Form field with explicit label association, optional helper text, validation error state (`role="alert"`), and disabled styling.

3. **Select** (`src/components/ui/select.tsx`):
   - Accessible dropdown built upon Radix UI primitives.
   - Includes custom trigger, scroll buttons, portal dropdown, and high-level `SelectField` wrapper for rapid form composition.

4. **Card and Panel** (`src/components/ui/card.tsx`):
   - Neutral white surface, soft border (`#E4E3DD`), restrained shadow, and modular subcomponents (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `Panel`).

5. **Status Indicator** (`src/components/ui/status-indicator.tsx`):
   - Multi-channel status display supporting `confirmed`, `pending`, `conflict`, and `cancelled`.
   - Never relies on color alone: integrates icon indicators, semantic color tints, and explicit text labels.

6. **Page Container** (`src/components/ui/page-container.tsx`):
   - Responsive layout container with configurable maximum width (`narrow`, `default`, `wide`, `full`) and standardized horizontal padding.

7. **Typography Helpers** (`src/components/ui/typography.tsx`):
   - Standardized typographic primitives (`PageTitle`, `SectionHeading`, `SubsectionHeading`, `BodyText`, `SecondaryText`, `FieldLabel`, `MonoBadge`).

8. **Divider** (`src/components/ui/divider.tsx`):
   - Clean horizontal or vertical divider with optional text label.

---

## 7. Component Showcase

A dedicated development showcase route is available to preview all design tokens and UI components:

- **Showcase URL**: `http://localhost:5173/showcase`
- **Route Definition**: Defined in `src/app/App.tsx` pointing to `src/app/pages/showcase.tsx`.
- **Contents**:
  - Full color palette matrix with hex codes, semantic roles, and contrast checks.
  - Typographic scale demonstration.
  - Button matrix across variants, sizes, and states (active, disabled, loading).
  - Form controls with interactive validation states.
  - Status indicators and constraint alert boxes.
  - Realistic interview scheduling composite cards with interactive slot selection.

---

## 8. Development Roadmap

### Phase 1 (Completed)
- Project directory organization and build tooling.
- Approved color palette and typography token configuration.
- Reusable UI component library.
- Accessible layout shell and page routing.
- Interactive design system showcase.

### Phase 2 (Upcoming)
- Interviewer availability intake forms.
- Candidate slot selection and booking flows.
- FastAPI backend integration.
- Google OR-Tools constraint satisfaction engine.
- Conflict resolution workspace and administrative overview.
