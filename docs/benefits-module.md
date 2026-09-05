# Benefits Module

Owner: scorpionus007 (Aryan). Module of the PeoplePay360 platform. Feature scope owned operationally by HR and HR Manager.

## Scope

- Benefit providers: external carriers and vendors (health insurers, wellness, legal support, gift program partners).
- Benefit plans: per organization plan definitions with cost split, coverage, seats, eligibility, effective range, and status lifecycle.
- Enrollments: employees join plans, optionally with dependents. Approvals are mandatory unless the plan opts out.
- Dependents: spouse, child, parent, sibling, domestic partner, other. Capped by the plan.
- Claims: reimbursement lifecycle from submit through review, approve, reimburse, or reject.
- Loan programs: interest free, flat, or reducing balance. Amounts, tenure, processing fee, approval requirements.
- Loans: apply, manager review, admin review, disburse, and repayments (salary deduction, direct transfer, external).
- Gift vouchers: issue, deliver, redeem, cancel, expire.
- Discount partners: external tie ups with codes, terms, and validity.
- Benefits dashboard aggregating active plans, enrollments, claims by status, loans outstanding, and vouchers in circulation.

## Roles and Permissions

- HR Manager (Chief HR): full CRUD across benefit providers, plans, enrollments, claims, loans, vouchers, and discount partners.
- HR: department scoped reads and writes on plans (read only), enrollments, claims, and read on loans and vouchers.
- Payroll Manager: read on plans and providers, read plus write on enrollments and claims, plus read on loans (payroll integrates loan recovery on the payslip in a later push).
- Payroll User: implicit; owns loan disbursement.
- Employee: read plans and their own enrollments, submit claims, apply for loans, view own vouchers and partner discount codes.
- Admin: implicit superuser.

## Lifecycles

Enrollment:
```
pending_approval -> active
                 \-> declined
                 \-> waived (by employee)
active           -> terminated
```

Claim:
```
submitted -> under_review -> approved -> reimbursed
                         \-> rejected
any        -> cancelled (until terminal)
```

Loan:
```
submitted -> approved                (single approval)
          \-> under_review -> approved (two step approval)
          \-> rejected
approved  -> disbursed -> repaying -> closed
```

Voucher:
```
issued -> delivered -> redeemed
                    \-> expired
any    -> cancelled (until terminal)
```

## Endpoints (v1)

Base path: `/api/v1/benefits`.

- Providers: `GET /providers`, `POST /providers`, `GET /providers/:id`, `PATCH /providers/:id`, `DELETE /providers/:id`.
- Plans: `GET /plans`, `POST /plans`, `GET /plans/:id`, `PATCH /plans/:id`, `DELETE /plans/:id`.
- Enrollments: `GET /enrollments`, `POST /enrollments`, `GET /enrollments/:id`, `POST /enrollments/:id/approve|decline|waive|terminate`.
- Claims: `GET /claims`, `POST /claims`, `GET /claims/:id`, `POST /claims/:id/start-review|approve|reject|reimburse|cancel`.
- Loan programs: `GET/POST /loans/programs`, `PATCH /loans/programs/:id`, `DELETE /loans/programs/:id`.
- Loans: `GET /loans`, `POST /loans`, `GET /loans/:id`, `POST /loans/:id/manager-review|admin-review|disburse`, `POST /loans/:id/repayments`.
- Vouchers: `GET /vouchers`, `POST /vouchers`, `POST /vouchers/:id/deliver|redeem|cancel`.
- Discount partners: `GET/POST/GET/PATCH/DELETE /discount-partners[/:id]`.
- Dashboard: `GET /dashboard/overview`.

## Notes

- Enrollment seat management is transactional. Approving consumes a seat; terminating releases it.
- Loan EMI is computed on submit using the selected interest mode; manager review recomputes if the approved amount changes.
- Vouchers use a random 12 character hex code (`GV-` prefix). Redeem refuses expired vouchers and flips their status accordingly.
- The dashboard aggregates in raw SQL for KPI performance; time filters apply to reimbursed claim totals.
