# Payroll Module

Owner: scorpionus007 (Aryan). Module of the PeoplePay360 platform.

## Scope

- Salary structures and rules, including sequenced computation with fixed amounts, percent of basic, percent of any category, percent of gross, and safe formulas.
- Contracts tied to employees, with historical retention and enforcement that only one contract is active per period per employee.
- Payruns as batch containers over a period and a salary structure, with an explicit two step creation flow: scope, then employee selection.
- Payslips generated from the active contract for the payrun period, with warnings for missing bank details, non positive nets, duplicate payslips, and missing contracts.
- Salary change workflow: HR suggests, Payroll Manager decides, Admin approves, Payroll applies. The application ends previous active contracts and creates a new active contract with the decided wage.
- Advance salary program: service fee percent, disbursement, EMI or salary deduction repayment modes, automatic recovery on the next payslip, and ledger of repayments.
- Bonuses that flow into the next matching payrun as allowances on the payslip.
- Payment methods per employee, primary flag, multiple currencies and rails including bank transfer, wire, ACH, SEPA, UPI, PayPal, crypto.
- Multi currency support with a currency table and an exchange rate table used for conversions.
- Payslip PDF generation and per payslip download.
- Payroll dashboard aggregating KPIs and salary cost by department.

## Roles and Permissions

- Payroll Manager: full CRUD across structures, rules, contracts, payruns, payslips, bonuses, advance approvals, and salary change decisions.
- Payroll User: read across payroll and payment release on validated payruns.
- HR Manager (Chief HR): read across payroll and can suggest salary changes.
- HR: department scoped, can suggest salary changes.
- Admin: implicit superuser, approves salary changes and can act as any of the above.
- Employee: can request advance salary for themselves.

## Payrun Lifecycle

```
draft -> computed -> validated -> paid
                 \-> cancelled
```

- Compute: reads the active contract for each selected employee, evaluates the salary structure rules in sequence, applies bonuses that fall in the period, adds advance recovery deductions, and writes payslip lines and totals. Warnings are attached to each payslip and rolled up on the payrun.
- Validate: refuses to progress if there are blocking warnings such as missing contracts or non positive net. Marks all computed payslips as validated.
- Mark paid: writes payroll transactions, moves payslips to paid, and applies matching advance repayments.

## Endpoints (v1)

Base path: `/api/v1/payroll`.

- `GET /salary-structures`, `POST /salary-structures`, `GET /salary-structures/:id`, `PATCH /salary-structures/:id`, `DELETE /salary-structures/:id`, `PUT /salary-structures/:id/rules`.
- `GET /salary-rules`, `POST /salary-rules`, `GET /salary-rules/:id`, `PATCH /salary-rules/:id`, `DELETE /salary-rules/:id`.
- `GET /contracts`, `POST /contracts`, `GET /contracts/:id`, `PATCH /contracts/:id`, `POST /contracts/:id/activate`, `POST /contracts/:id/terminate`, `DELETE /contracts/:id`.
- `GET /payruns`, `GET /payruns/eligible-employees`, `POST /payruns`, `GET /payruns/:id`, `POST /payruns/:id/compute`, `POST /payruns/:id/validate`, `POST /payruns/:id/mark-paid`, `POST /payruns/:id/cancel`, `DELETE /payruns/:id`.
- `GET /payslips`, `GET /payslips/:id`, `GET /payslips/:id/pdf`, `POST /payslips/:id/mark-sent`.
- `GET /salary-change-requests`, `POST /salary-change-requests/suggest`, `GET /salary-change-requests/:id`, `POST /salary-change-requests/:id/payroll-decision`, `POST /salary-change-requests/:id/admin-approve`, `POST /salary-change-requests/:id/reject`, `POST /salary-change-requests/:id/apply`.
- `GET /advance-salary-requests`, `POST /advance-salary-requests`, `GET /advance-salary-requests/:id`, `POST /advance-salary-requests/:id/approve`, `POST /advance-salary-requests/:id/reject`, `POST /advance-salary-requests/:id/disburse`, `POST /advance-salary-requests/:id/repayments`, `POST /advance-salary-requests/:id/convert-to-emi`.
- `GET /bonuses`, `POST /bonuses`, `POST /bonuses/:id/approve`, `POST /bonuses/:id/cancel`, `DELETE /bonuses/:id`.
- `GET /employees/:employeeId/payment-methods`, `POST /employees/:employeeId/payment-methods`, `PATCH /employees/:employeeId/payment-methods/:id`, `DELETE /employees/:employeeId/payment-methods/:id`.
- `GET /dashboard/overview`.

## Salary Rule Compute Types

- `fixed`: uses fixed_amount or structure override_amount.
- `percent_of_basic`: percent applied to the current basic.
- `percent_of_category`: percent applied to the running total of a given category. Later rules in the structure sequence can reference categories accumulated earlier.
- `percent_of_gross`: percent applied to the current gross bucket.
- `formula`: a small allow list based formula that can reference BASIC, GROSS, ALLOWANCE, DEDUCTION, TAX, CONTRIBUTION, NET, WORKED_DAYS, WORKED_HOURS, and WAGE. Only digits, arithmetic operators, parentheses, and these identifiers are allowed. Unknown identifiers result in zero.

## Data Model Notes

- Money fields use `DECIMAL(18, 4)` paired with an ISO 4217 currency code.
- The `Contract` model enforces at most one active contract in a period through the service helper `assertNoOverlappingActiveContract` used from every write path.
- Advance salary recovery is written both onto the payslip as a deduction line and, on payrun mark paid, as `AdvanceSalaryRepayment` entries that reduce the request outstanding balance.
