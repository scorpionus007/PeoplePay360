# Mobility Module

Owner: harin-faldu (Harin). Module of the PeoplePay360 platform. Feature scope operationally owned by HR and HR Manager.

## Scope

- Location standards: per country, per region rules covering weekly hours, minimum PTO and sick days, overtime multiplier, minimum wage, notice period, contribution rates, public holidays, work visa policy, remote work policy. Payroll and HR use these as the source of truth for compliance defaults per employee location.
- Mobility partners: immigration lawyers, relocation agencies, tax consultants, housing vendors, insurance, language training, travel agencies. Contract reference, contract end, rating.
- Visa sponsorships: full case lifecycle with typed status (initiated, documents_collecting, under_internal_review, filed, rfe_pending, approved, denied, expired, renewed, cancelled). Renewal creates a new case referencing the previous one and marks the previous as renewed.
- Visa documents: per case document tracker with type, title, file url, status (pending, uploaded, verified, rejected), expiry.
- Relocations: per employee cross border move with reason, budget vs spent tracking, target and actual move date, dependents count, approval flow.
- Relocation expenses: line items per case with category (flights, shipping, housing, temporary_stay, visa_fees, legal, transport, per_diem, other), auto increments spent_amount and flips budget_status to exhausted when at or over budget.
- Immigration cases: broader immigration matters (permanent residency, family sponsorship, citizenship, renewal, appeal) that may span multiple visa cases. Priority, next action due, assignee.
- Travel requests: business travel workflow (draft, submitted, approved, rejected, booked, in_progress, completed, cancelled) with itinerary JSON and booking reference.
- Mobility dashboard: KPIs across active visas, visas expiring in 30 days, active and completed relocations, open immigration cases, upcoming travel, active partners, configured location standards, relocation spend vs budget.

## Roles and Permissions

- HR Manager (Chief HR): full CRUD across every mobility surface plus visa and relocation approval.
- HR: same operational permissions since the module is HR owned per platform charter.
- Employee: read location standards, own visa cases, own relocations, own immigration cases, own travel; submit travel requests directly.
- Admin: implicit superuser.

## Visa Lifecycle

```
initiated -> documents_collecting -> under_internal_review -> filed -> approved
                                                                    \-> rfe_pending -> approved
                                                                    \-> denied
approved  -> expired -> renewed (creates a new case, previous flipped to renewed)
any        -> cancelled (until terminal)
```

## Relocation Lifecycle

```
requested -> approved -> in_progress -> completed (closes the budget)
                                     \-> cancelled
```

Budget state:
```
draft -> approved -> exhausted (when spent >= budget)
                  \-> closed (on completion)
```

## Travel Lifecycle

```
draft -> submitted -> approved -> booked -> in_progress -> completed
                              \-> rejected
                              \-> cancelled
```

## Endpoints (v1)

Base path: `/api/v1/mobility`.

- Location standards: `GET/POST/GET :id/PATCH :id/DELETE :id /location-standards`.
- Partners: `GET/POST/GET :id/PATCH :id/DELETE :id /partners`.
- Visas: `GET/POST/GET :id/DELETE :id /visas`, `POST /visas/:id/transition|renew`, `POST /visas/:id/documents`.
- Relocations: `GET/POST/GET :id /relocations`, `POST /relocations/:id/approve|transition`, `POST /relocations/:id/expenses`, `PATCH /relocations/:id/expenses/:expenseId/review`.
- Immigration cases: `GET/POST/GET :id/PATCH :id/DELETE :id /immigration-cases`, `POST /immigration-cases/:id/resolve`.
- Travel: `GET/POST/GET :id /travel`, `POST /travel/:id/approve|reject|book|complete|cancel`.
- Dashboard: `GET /dashboard/overview`.

## Data Notes

- Case codes are auto generated when omitted (`VS-<hex>`, `RL-<hex>`, `IM-<hex>`, `TR-<hex>`), and every table enforces per organization uniqueness on the case code column.
- Renewals link the new visa case to the previous via `renewal_of_case_id` and set the previous to `renewed`; the case timeline is preserved for compliance history.
- Expense budget accounting is transactional: adding an expense increments `spent_amount` on the parent relocation and flips `budget_status` to `exhausted` when the budget is met or exceeded.
- Location standards are used across payroll (default minimum wage checks), HR (PTO minimums), and this module (visa policy per country).

## Seed Data

The seeder registers eight default location standards (US, GB, DE, IN, SG, CA, AU, AE) and four default mobility partners (Fragomen, Cartus, Deloitte, Blueground) per organization.
