# HR Module

Owner: preranawagh (Prerana). Module of the PeoplePay360 platform.

## Scope

- Working schedules with per day, per block start and end times, break minutes, and computed weekly hours.
- Attendance records with self service check in and check out, geolocation and IP capture, corrections by authorized users, overtime detection, and per range summaries.
- Time off types with unit (days or hours), allocation requirement, approval requirement, payroll impact, and default allocation policy.
- Time off allocations with pending approval workflow, `taken`, `pending`, and `remaining` balances tracked live.
- Time off requests linked to allocations, with reserve on submit, consume on approve, and release on refuse or cancel.
- Feedback entries with anonymous submission (SHA-256 salted fingerprint, no identity leak), category, priority, and full status lifecycle.
- HR request channel between employees and HR (per request thread with messages, internal notes, assignment, and status).
- Announcements pinned to the org, audience filtered.
- AI chat surface stub that the Python AI service will replace in a later push, keeping the transport shape stable for the frontend today.
- HR dashboard aggregating KPIs across attendance, time off, HR requests, and feedback.

## Roles and Permissions

- HR Manager (Chief HR): read across every module plus HR ownership, approves time off allocations and requests, corrects attendance, manages types and schedules.
- HR: department scoped operations, same HR permissions as HR Manager on their scope, cannot see other modules by default.
- Employee: self service check in and out, submit time off requests, submit feedback (optionally anonymous), open HR requests, ask the AI chat.
- Admin: implicit superuser.

## Attendance Flow

- `POST /hr/attendance/check-in` creates or updates today's record with the check in timestamp, IP, source, and optional geolocation. A second check in for the same day is rejected.
- `POST /hr/attendance/check-out` computes `worked_hours` from `check_in` to now minus `break_minutes`, sets overtime past 9 hours, and derives the status.
- `PATCH /hr/attendance/:id/correct` accepts a partial `patch` and a `note`, recomputes derived fields, and stamps `is_corrected`, `corrected_by`, `corrected_at`.
- `GET /hr/attendance/summary` returns totals over a range: days present, late, absent, on leave, missing checkout, total worked hours, overtime hours, manually edited count.

## Time Off Lifecycle

```
allocation:  draft -> pending_approval -> approved -> expired
                                       \-> refused
request:     draft -> pending -> approved -> (consumed from allocation)
                            \-> refused    \-> cancelled (returns balance)
```

- Submitting a request that requires allocation immediately reserves the duration under `pending_amount` on the applicable allocation, so overlapping requests cannot double book.
- Approving moves the reserved amount to `taken_amount`.
- Refusing or cancelling releases the reservation.
- If a type does not require approval, the request is auto approved and consumed on submit.

## Endpoints (v1)

Base path: `/api/v1/hr`.

- Working schedules: `GET/POST/GET :id/PATCH :id/DELETE :id /working-schedules`.
- Attendance: `GET /attendance`, `GET /attendance/summary`, `POST /attendance/check-in`, `POST /attendance/check-out`, `GET /attendance/:id`, `PATCH /attendance/:id/correct`, `DELETE /attendance/:id`.
- Time off types: `GET/POST/GET :id/PATCH :id/DELETE :id /time-off/types`.
- Time off allocations: `GET/POST/GET :id/DELETE :id /time-off/allocations`, `POST /time-off/allocations/:id/approve`, `POST /time-off/allocations/:id/refuse`.
- Time off requests: `GET /time-off/requests`, `POST /time-off/requests`, `GET /time-off/requests/:id`, `POST /time-off/requests/:id/approve`, `POST /time-off/requests/:id/refuse`, `POST /time-off/requests/:id/cancel`.
- Feedback: `GET /feedback`, `POST /feedback`, `GET /feedback/:id`, `PATCH /feedback/:id/status`. Anonymous submissions are stripped of employee identity on read.
- HR requests: `GET /requests`, `POST /requests`, `GET /requests/:id`, `POST /requests/:id/messages`, `PATCH /requests/:id/status`.
- Announcements: `GET /announcements`, `POST /announcements`, `PATCH /announcements/:id`, `DELETE /announcements/:id`.
- AI chat: `POST /chat/ask` (stub, real AI wired in the AI push).
- Dashboard: `GET /dashboard/overview`.

## Data Model Notes

- Working schedule weekly hours are computed in the service layer from days, so the field on the row is always consistent even after edits.
- Anonymous feedback stores a salted SHA-256 fingerprint of `(orgId, ip, userAgent)` so HR can detect burst spam without ever seeing the reporter's identity. The `is_anonymous` flag drives strip logic on read; the `employee_id` is `null` on the row.
- Attendance overtime threshold is a service constant, kept out of the DB for now so it stays easy to tweak per org later.
- Time off request duration uses inclusive day math and half day override, and hour units default to 8 hours per day when it needs to bridge units.
