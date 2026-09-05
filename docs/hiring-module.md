# Hiring Module

Owner: preranawagh (Prerana). Module of the PeoplePay360 platform.

## Scope

- Requisitions with draft, pending approval, approved, on hold, filled, cancelled lifecycle. Track hiring type (internal, external, intern, freelancer, auditor) and salary range.
- Job board integrations (LinkedIn, Indeed, Glassdoor, Monster, Naukri, Wellfound, custom) with credential ref (never returned in responses).
- Job postings per approved requisition. Publishable across careers site, referral only, or external boards. Applications count denormalized per posting.
- Candidates catalog with resume, portfolio, LinkedIn, background check status, blacklist flag.
- Applications with per requisition uniqueness and configurable pipeline stages (applied, screening, phone screen, assessment, interview, onsite, offer, hired, rejected, withdrawn, on hold). Every stage transition writes to ApplicationStageHistory.
- Interviews with rounds, panelists (JSON), scheduled range in a timezone, video or onsite. Cancellations preserve original schedule and mark status.
- Interview feedback per panelist with recommendation and per criterion scores. First feedback flips interview from scheduled to completed.
- Offers with draft, pending approval, extended, negotiating, accepted, declined, rescinded, expired. Accepting auto marks the application hired.
- Referrals from employees. Auto creates a candidate row on first submit, ties to an optional requisition, supports review, hired, bonus paid.
- Hiring dashboard aggregates open requisitions, published postings, applications by stage, upcoming interviews, offers, referrals.

## Roles and Permissions

- Talent Acquisition Lead (TA Lead): full CRUD across requisitions, postings, boards, candidates, applications, interviews, offers, referrals, plus requisition approval.
- HR Manager (Chief HR): read across every hiring surface, plus referral write to review or pay bonus on cross module referrals.
- HR: read across hiring so they can see all department activity, and suggest changes to the TA Lead through the HR requests channel.
- Employee: submit referrals, list their own referrals, list published postings.
- Admin: implicit superuser.

## Pipeline

```
applied -> screening -> phone_screen -> assessment -> interview -> onsite -> offer -> hired
                                                                                   \-> rejected
                                                                                   \-> withdrawn
```

The pipeline service enforces terminal state protection (no transitions out of hired, rejected, withdrawn) and writes a stage history row on every change.

## Offer Lifecycle

```
draft -> pending_approval -> extended -> accepted (auto marks application hired)
                                     \-> declined
                                     \-> rescinded (by TA)
extended -> negotiating -> accepted or declined
```

## Endpoints (v1)

Base path: `/api/v1/hiring`.

- Requisitions: `GET/POST /requisitions`, `GET/PATCH/DELETE /requisitions/:id`, `POST /requisitions/:id/submit|approve|hold|cancel`.
- Job boards: `GET/POST /job-boards`, `PATCH/DELETE /job-boards/:id`.
- Postings: `GET/POST /postings`, `GET/PATCH/DELETE /postings/:id`, `POST /postings/:id/publish|close`.
- Candidates: `GET/POST /candidates`, `GET/PATCH/DELETE /candidates/:id`.
- Applications: `GET /applications`, `POST /applications`, `GET /applications/:id`, `POST /applications/:id/progress|reject|withdraw`.
- Interviews: `GET /interviews`, `POST /interviews`, `GET /interviews/:id`, `PATCH /interviews/:id/reschedule`, `POST /interviews/:id/cancel|feedback`.
- Offers: `GET/POST /offers`, `GET/PATCH/DELETE /offers/:id`, `POST /offers/:id/submit|approve|extend|accept|decline|rescind`.
- Referrals: `GET /referrals`, `POST /referrals`, `GET /referrals/:id`, `POST /referrals/:id/review|pay-bonus`.
- Dashboard: `GET /dashboard/overview`.

## Notes

- Job board credentials are stored as `credentials_ref` (secret store pointer, not the secret). Read paths always strip that column.
- Candidate `email` is lowercased at write time; per organization uniqueness enforced by DB index.
- `hiring_applications` unique index on (candidate_id, requisition_id) prevents duplicate submissions.
- Auto candidate creation: submitting an application without a candidate id looks up by email and creates a new row if none exists; the same applies to referral submissions.
- The referral bonus flow depends on the application flow: a referral moves to hired automatically when the associated application reaches hired stage, and can then be marked bonus_paid with amount and currency.
