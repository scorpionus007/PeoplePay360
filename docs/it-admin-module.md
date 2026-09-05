# IT Administration Module

Owner: harin-faldu (Harin). Module of the PeoplePay360 platform.

## Scope

- Central device inventory covering owned and leased hardware with purchase or lease terms, warranty, asset tag, hostname, serial, category, OS, hardware specs, location, and status lifecycle.
- Device assignment history: every checkout to an employee opens an assignment record and closes it on return.
- Software catalog with license type, seat counts, renewal date, and per install seat tracking on devices.
- Security baseline controls with per device check results (agent, manual, edr, external), remediation guidance, and posture aggregation per device and per organization.
- EDR integration channel: register a vendor connector, ingest normalized events, list, and triage.
- Onboarding kits (device specs, software list, baseline controls) with per employee provision flow that auto assigns the device to the employee on activation.
- IT dashboard aggregating fleet counts, ownership and category distributions, active EDR integrations, open high severity events, pending provisions, and baseline pass rate.

## Roles and Permissions

- IT Admin: full CRUD across devices, software, baseline, EDR, and onboarding.
- HR Manager (Chief HR): read only across every IT surface so oversight is possible without granting mutation rights.
- Admin: implicit superuser.

## Lifecycles

Device status:
```
in_stock -> assigned -> in_stock (on unassign)
in_stock -> in_repair -> in_stock
in_stock -> retired
in_stock -> lost
any      -> quarantined (EDR reaction)
```

Onboarding provision status:
```
requested -> preparing -> dispatched -> delivered -> activated
                                                  \-> (auto assigns device on activated)
                                                  cancelled at any step
```

## Endpoints (v1)

Base path: `/api/v1/it`.

- Devices: `GET /devices`, `POST /devices`, `GET /devices/:id`, `PATCH /devices/:id`, `DELETE /devices/:id`, `POST /devices/:id/assign`, `POST /devices/:id/unassign`.
- Software: `GET/POST/GET :id/PATCH :id/DELETE :id /software`, `GET /devices/:deviceId/software`, `POST /devices/:deviceId/software`, `DELETE /devices/:deviceId/software/:id`.
- Baseline: `GET/POST /baseline/controls`, `GET/PATCH/DELETE /baseline/controls/:id`, `POST /devices/:deviceId/baseline-checks`, `GET /devices/:deviceId/baseline-posture`, `GET /baseline/posture`.
- EDR: `GET/POST /edr/integrations`, `GET/PATCH/DELETE /edr/integrations/:id`, `POST /edr/integrations/:id/events`, `GET /edr/events`, `PATCH /edr/integrations/:id/events/:eventId/status`.
- Onboarding: `GET/POST /onboarding/kits`, `GET/PATCH/DELETE /onboarding/kits/:id`, `GET /onboarding/provisions`, `POST /onboarding/provisions`, `PATCH /onboarding/provisions/:id/status`.
- Dashboard: `GET /dashboard/overview`.

## Data Notes

- Software seats are allocated in a single transaction with the device install upsert so racing installs cannot oversell a license.
- Assigning a device is transactional: it opens a new `DeviceAssignment` and updates the `Device.status` and `assigned_employee_id` in one step. Unassign closes the same open assignment and returns the device to `in_stock`.
- Baseline check is an upsert keyed by `(device_id, baseline_control_id)`. The most recent status wins, but the pass rate aggregates across all controls that have ever been checked on the device.
- EDR credentials are stored in `credentials_ref` (a pointer to a secret store, not the secret itself). The read paths strip that column so it is never sent back through the API.
- Onboarding activation auto assigns the referenced device to the employee without a second API call, inside a transaction.

## Seed Data

The seeder registers ten baseline controls (disk encryption, patching, MFA, firewall, AV, EDR, autolock, backup, password policy, admin least privilege) and three onboarding kits (standard laptop, engineering workstation, intern) per organization.
