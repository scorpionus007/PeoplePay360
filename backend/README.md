# PeoplePay360 Backend

Modular Node.js and Express API backing the PeoplePay360 platform. Uses Sequelize ORM against PostgreSQL, JWT based authentication, and a role plus permission driven access model.

## Layout

```
src/
  app.js              Express app factory
  server.js           HTTP entry point
  config/             Env, database, logger, constants
  middleware/         Auth, RBAC, validation, rate limiting, error handling
  utils/              Shared helpers
  models/             Core cross module models (User, Organization, Employee)
  modules/
    auth/             Login, refresh, logout, current user
    core/             Organizations, users, employees, departments
    payroll/          Contracts, salary structures, salary rules, payruns, payslips,
                      salary change requests, advance salary, bonuses
  db/                 Migrations and seeders (auto sync in dev)
  routes/             Root router assembling all module routers
tests/                Jest test suites
```

## Prerequisites

- Node.js 18 or newer
- PostgreSQL 14 or newer (or run the shipped `docker-compose.yml` at the repo root)

## Setup

```
cp .env.example .env
npm install
npm run dev
```

The default configuration expects a local Postgres reachable on `localhost:5432` with database `peoplepay360`. Adjust `.env` to match your environment.

Health check:

```
GET http://localhost:4000/api/v1/health
```

## Development Notes

- The app auto syncs Sequelize models in development. In production, migrations should be authored under `src/db/migrations/` and applied with `npm run db:migrate`.
- Auth uses short lived access tokens plus refresh tokens. Refresh tokens are rotated on every use and revoked on logout.
- RBAC is enforced by the `requirePermission` middleware, which checks the caller's aggregated permissions built from role assignments.
- All money values are stored as `DECIMAL(18, 4)` and paired with an ISO 4217 currency code. Cross currency conversions are performed via the `ExchangeRate` table.

## Modules In This Repo

- Payroll: shipped in this initial baseline push.
- Benefits, HR, Hiring, IT Administration, Mobility: added in subsequent module pushes.
