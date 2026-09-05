# PeoplePay360 Frontend

React + TypeScript + Vite single-page app for PeoplePay360. Deel-inspired design system with a dark sidebar, off-white content area, calm accents, and generous whitespace.

## Stack

- React 18, TypeScript, Vite
- React Router 6 for routing
- TanStack Query for server state
- Axios for HTTP with a JWT refresh interceptor
- lucide-react for iconography
- Plain CSS + CSS variables for the design system (no CSS framework)

## Layout

```
src/
  api/           Axios client, token storage, refresh flow
  auth/          AuthContext with login/logout/refresh, RBAC helpers
  components/    Design system (Button, Input, Card, DataTable, StatCard, Badge, Modal, Toast, Avatar, etc.)
  layout/        AppShell with Sidebar and Topbar
  pages/         Route pages grouped by module
    core/        Employees, Departments, Settings
    payroll/    Aryan's module screens (contracts, structures, rules, payruns, payslips, advance, bonuses, changes, dashboard)
    benefits/   Aryan's module screens (plans, enrollments, claims, loans, vouchers, dashboard)
    ...          HR, Hiring, IT, Mobility land in subsequent frontend pushes
  styles/        Tokens and global styles
  App.tsx        Routing
  main.tsx       Entry
```

## Getting started

```
cp .env.example .env   # optional; defaults use /api/v1 via Vite proxy
npm install
npm run dev
```

The dev server proxies `/api` to `http://localhost:4000` (the backend). Sign in with the default demo admin:

- Email: `admin@peoplepay360.local`
- Password: `ChangeMe!2026`

## Design tokens

All tokens live in `src/styles/tokens.css`. The palette is dark for the sidebar (`--pp-ink-950`), off white for the canvas (`--pp-ink-50`), with an indigo primary accent (`--pp-primary-600`). Card corners are 14 px, shadows are soft, motion is 120 to 180 ms cubic-bezier. Font is Inter.

## Route surface (Push 7)

- `/login`
- `/` dashboard home with cross module KPIs
- `/employees`, `/departments`, `/settings`
- `/payroll/*` full CRUD for contracts, structures, rules, payruns (with wizard), payslips, advance salary, bonuses, salary changes, dashboard
- `/benefits/*` plans, enrollments, claims, loans, vouchers, dashboard
- `/hr/*`, `/hiring/*`, `/it/*`, `/mobility/*` placeholder shells; full UIs ship in pushes 8 and 9
