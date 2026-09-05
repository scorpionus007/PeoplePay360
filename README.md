# PeoplePay360

An integrated Human Resource and Payroll operations platform for the modern global workforce.

## Overview

PeoplePay360 is a modular, multi-tenant HR and payroll platform designed to run distributed teams end to end. The system covers the full employee lifecycle: master data, contracts, attendance, time off, payroll, benefits, hiring, IT device fleet, and international mobility. Data is centralized around the employee record, and every operational surface (attendance, leave, contract, payroll) is driven by live records rather than static configuration.

## Modules

1. Payroll: salary structures, salary rules, contracts, payruns, payslips, multi-currency processing, salary change workflow, advance salary, bonuses, international tax profiles, payment methods.
2. HR: employees, departments, working schedules, attendance, time off, requests, allocations, employee services, feedback and anonymous reporting, AI chat surface.
3. IT Administration: managed device inventory (buy or lease), application and access provisioning, baseline security posture, EDR integration channel, onboarding kits.
4. Benefits: insurance, maternity support, legal support, health, transportation, gift vouchers, retirement planning, loans, tie ups.
5. Hiring: internal, intern, freelancer and auditor hiring, external job board integrations, interview scheduling, referrals, lifecycle management.
6. Mobility: visa sponsorships, immigration support, location standards, relocation support.

## Roles

- Admin: platform administration, user and role management, policy approval.
- HR Manager (Chief HR): read across every module, suggests changes to module owners, approval touchpoints, request channel with employees and leads.
- HR: owns HR, Benefits, and Mobility tasks for their assigned departments.
- Payroll Manager: full CRUD over salary structures, rules, contracts, payruns, payslips.
- Payroll User: read across payroll data, releases funds.
- IT Admin: owns the IT administration module.
- Talent Acquisition Lead: owns the hiring module.
- Employee: self service views, requests, referrals.

## Tech Stack

- Backend: Node.js, Express, Sequelize ORM, PostgreSQL.
- Frontend: React (Vite), CSS modules with a Deel inspired design system.
- AI services: Python (FastAPI) microservice for chatbot and support automations, integrated over HTTP.
- Auth: JWT access tokens with refresh rotation, bcrypt hashed passwords, role and permission based access control.
- Infra: Docker Compose for local development, ready for VPC and microservice deployment.

## Repository Layout

```
PeoplePay360/
  backend/            Node.js API (MVC, modular)
  frontend/           React SPA (added in later pushes)
  ai/                 Python AI microservice (added in later pushes)
  docs/               Architecture and module documentation
  docker-compose.yml  Local dev orchestration
```

## Module Ownership

| Module            | Owner                 |
| ----------------- | --------------------- |
| Payroll           | scorpionus007 (Aryan) |
| Benefits          | scorpionus007 (Aryan) |
| HR                | preranawagh (Prerana) |
| Hiring            | preranawagh (Prerana) |
| IT Administration | harin-faldu (Harin)   |
| Mobility          | harin-faldu (Harin)   |

## Getting Started

Backend setup and run instructions live in `backend/README.md`. Local Postgres and API can be brought up together with `docker compose up`.

## Hackathon

Odoo Hackathon 2026 submission. Problem statement: HR and Payroll integrated operations platform.
