'use strict';

/**
 * Comprehensive demo dataset for PeoplePay360.
 *
 * Seeds realistic, cross linked records across every module so the dashboard
 * and all list pages show meaningful data out of the box: departments,
 * employees with login accounts, payroll (structures, rules, contracts,
 * payruns, payslips, advances, bonuses), HR (allocations, time off,
 * attendance, requests, feedback, announcements), benefits (plans,
 * enrollments, claims, loans, vouchers, discounts), IT (software, devices,
 * baseline posture, EDR, onboarding) hiring (requisitions, postings,
 * candidates, applications, interviews, offers, referrals) and mobility
 * (visas, relocations, immigration, travel).
 *
 * Idempotent: if the demo employees already exist, it does nothing, so it is
 * safe to run on every non production boot.
 */

const { models, sequelize } = require('../../models');
const C = require('../../config/constants');
const { hashPassword } = require('../../utils/password');
const logger = require('../../config/logger');

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'ChangeMe!2026';

// ---- date helpers ---------------------------------------------------------
const DAY = 24 * 60 * 60 * 1000;
const now = () => new Date();
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysAhead = (n) => new Date(Date.now() + n * DAY);
const iso = (d) => new Date(d).toISOString().slice(0, 10);
const yearStart = () => `${new Date().getUTCFullYear()}-01-01`;
function monthRange(offsetMonths) {
  const d = new Date();
  const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offsetMonths, 1));
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offsetMonths + 1, 0));
  return { start: iso(start), end: iso(end) };
}
const round = (n) => Math.round(Number(n) * 100) / 100;

// ---- employee blueprint ---------------------------------------------------
// Every employee gets a login account so the whole team can sign in, and the
// role assignments cover all eight system roles for RBAC demos.
const EMPLOYEES = [
  { key: 'ava', first: 'Ava', last: 'Thompson', title: 'Chief Technology Officer', dept: 'Engineering', country: 'US', city: 'New York', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 18000, mgr: null, login: C.ROLES.ADMIN },
  { key: 'liam', first: 'Liam', last: 'Patel', title: 'Engineering Manager', dept: 'Engineering', country: 'US', city: 'Austin', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 12000, mgr: 'ava', login: C.ROLES.EMPLOYEE },
  { key: 'sofia', first: 'Sofia', last: 'Garcia', title: 'Senior Software Engineer', dept: 'Engineering', country: 'IN', city: 'Bengaluru', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 9000, mgr: 'liam', login: C.ROLES.EMPLOYEE },
  { key: 'noah', first: 'Noah', last: 'Kim', title: 'Software Engineer', dept: 'Engineering', country: 'IN', city: 'Hyderabad', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 6500, mgr: 'liam', login: C.ROLES.EMPLOYEE },
  { key: 'emma', first: 'Emma', last: 'Mueller', title: 'Product Manager', dept: 'Product', country: 'DE', city: 'Berlin', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 10000, mgr: 'ava', login: C.ROLES.EMPLOYEE },
  { key: 'oliver', first: 'Oliver', last: 'Smith', title: 'Product Designer', dept: 'Product', country: 'GB', city: 'London', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 7000, mgr: 'emma', login: C.ROLES.EMPLOYEE },
  { key: 'isabella', first: 'Isabella', last: 'Rossi', title: 'Sales Lead', dept: 'Sales', country: 'GB', city: 'Manchester', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 11000, mgr: 'ava', login: C.ROLES.EMPLOYEE },
  { key: 'lucas', first: 'Lucas', last: 'Silva', title: 'Account Executive', dept: 'Sales', country: 'US', city: 'Chicago', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 6000, mgr: 'isabella', login: C.ROLES.EMPLOYEE },
  { key: 'mia', first: 'Mia', last: 'Chen', title: 'People Operations Manager', dept: 'People Ops', country: 'US', city: 'San Francisco', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 9500, mgr: 'ava', login: C.ROLES.HR_MANAGER },
  { key: 'ethan', first: 'Ethan', last: 'Brown', title: 'HR Specialist', dept: 'People Ops', country: 'US', city: 'San Francisco', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 5500, mgr: 'mia', login: C.ROLES.HR },
  { key: 'diego', first: 'Diego', last: 'Fernandez', title: 'Talent Acquisition Lead', dept: 'People Ops', country: 'US', city: 'San Francisco', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 8000, mgr: 'mia', login: C.ROLES.TALENT_ACQUISITION_LEAD },
  { key: 'aria', first: 'Aria', last: 'Nakamura', title: 'Finance Manager', dept: 'Finance', country: 'US', city: 'Seattle', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 10500, mgr: 'ava', login: C.ROLES.PAYROLL_MANAGER },
  { key: 'priya', first: 'Priya', last: 'Sharma', title: 'Payroll Analyst', dept: 'Finance', country: 'IN', city: 'Pune', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 6000, mgr: 'aria', login: C.ROLES.PAYROLL_USER },
  { key: 'james', first: 'James', last: 'Wilson', title: 'IT Administrator', dept: 'IT', country: 'US', city: 'Denver', type: C.EMPLOYEE_TYPE.FULL_TIME, gross: 7500, mgr: 'ava', login: C.ROLES.IT_ADMIN },
];

const DEPARTMENTS = [
  { name: 'Engineering', code: 'ENG' },
  { name: 'Product', code: 'PROD' },
  { name: 'Sales', code: 'SALES' },
  { name: 'People Ops', code: 'PEOPLE' },
  { name: 'Finance', code: 'FIN' },
  { name: 'IT', code: 'IT' },
];

async function seed() {
  const org = await models.Organization.findOne({ order: [['created_at', 'ASC']] });
  if (!org) {
    logger.info('No organization found. Skipping demo data seed.');
    return;
  }

  const existing = await models.Employee.count({ where: { organization_id: org.id } });
  if (existing > 0) {
    logger.info('Demo data already present, skipping demo seed.');
    return;
  }

  const adminUser = await models.User.findOne({ where: { organization_id: org.id }, order: [['created_at', 'ASC']] });
  const adminId = adminUser ? adminUser.id : null;

  await sequelize.transaction(async (t) => {
    const orgId = org.id;
    const currency = org.base_currency || 'USD';

    // ---- Departments ----
    const deptByName = {};
    for (const d of DEPARTMENTS) {
      const dept = await models.Department.create(
        { organization_id: orgId, name: d.name, code: d.code, is_active: true },
        { transaction: t }
      );
      deptByName[d.name] = dept;
    }

    const schedule = await models.WorkingSchedule.findOne({ where: { organization_id: orgId }, transaction: t });

    // ---- Employees ----
    const empByKey = {};
    let empNum = 1;
    // first pass: create without managers
    for (const e of EMPLOYEES) {
      const emp = await models.Employee.create(
        {
          organization_id: orgId,
          department_id: deptByName[e.dept] ? deptByName[e.dept].id : null,
          working_schedule_id: schedule ? schedule.id : null,
          employee_number: `PP-${String(empNum).padStart(4, '0')}`,
          first_name: e.first,
          last_name: e.last,
          email_work: `${e.first}.${e.last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@peoplepay360.com',
          email_personal: `${e.first}.${e.last}`.toLowerCase().replace(/[^a-z.]/g, '') + '@example.com',
          phone: `+1-555-01${String(empNum).padStart(2, '0')}`,
          country_code: e.country,
          city: e.city,
          job_title: e.title,
          employment_type: e.type,
          employment_status: C.EMPLOYMENT_STATUS.ACTIVE,
          hire_date: iso(daysAgo(300 + empNum * 20)),
          base_currency: currency,
          tax_country: e.country,
          bank_name: 'Demo National Bank',
          bank_account_number: `00012345${String(empNum).padStart(4, '0')}`,
        },
        { transaction: t }
      );
      empByKey[e.key] = emp;
      empNum += 1;
    }
    // second pass: set managers
    for (const e of EMPLOYEES) {
      if (e.mgr && empByKey[e.mgr]) {
        await empByKey[e.key].update({ manager_id: empByKey[e.mgr].id }, { transaction: t });
      }
    }

    // ---- Login accounts + payment methods ----
    const passwordHash = await hashPassword(DEMO_PASSWORD);
    for (const e of EMPLOYEES) {
      const emp = empByKey[e.key];
      await models.PaymentMethod.create(
        {
          organization_id: orgId,
          employee_id: emp.id,
          method_type: e.country === 'IN' ? C.PAYMENT_METHOD_TYPE.UPI : C.PAYMENT_METHOD_TYPE.BANK_TRANSFER,
          currency,
          is_primary: true,
          is_active: true,
          account_holder_name: `${e.first} ${e.last}`,
          account_number: `00012345${e.key.length}`,
          bank_name: 'Demo National Bank',
          country_code: e.country,
        },
        { transaction: t }
      );

      if (e.login) {
        const role = await models.Role.findOne({ where: { key: e.login }, transaction: t });
        const user = await models.User.create(
          {
            organization_id: orgId,
            employee_id: emp.id,
            email: emp.email_work,
            password_hash: passwordHash,
            full_name: `${e.first} ${e.last}`,
            is_active: true,
            is_email_verified: true,
          },
          { transaction: t }
        );
        if (role) await user.addRole(role, { transaction: t });
      }
    }

    // ---- Payroll: salary rules + structure ----
    const ruleDefs = [
      { code: 'BASIC', name: 'Basic Salary', category: C.SALARY_RULE_CATEGORY.BASIC, compute_type: C.SALARY_RULE_COMPUTE_TYPE.FIXED, taxable: true, seq: 10 },
      { code: 'HRA', name: 'House Rent Allowance', category: C.SALARY_RULE_CATEGORY.ALLOWANCE, compute_type: C.SALARY_RULE_COMPUTE_TYPE.PERCENT_OF_BASIC, percent_value: 20, taxable: true, seq: 20 },
      { code: 'TRANSPORT', name: 'Transport Allowance', category: C.SALARY_RULE_CATEGORY.ALLOWANCE, compute_type: C.SALARY_RULE_COMPUTE_TYPE.FIXED, fixed_amount: 300, taxable: false, seq: 30 },
      { code: 'INCOME_TAX', name: 'Income Tax', category: C.SALARY_RULE_CATEGORY.TAX, compute_type: C.SALARY_RULE_COMPUTE_TYPE.PERCENT_OF_GROSS, percent_value: 12, taxable: false, seq: 40 },
      { code: 'SOCIAL_SEC', name: 'Social Security', category: C.SALARY_RULE_CATEGORY.CONTRIBUTION, compute_type: C.SALARY_RULE_COMPUTE_TYPE.PERCENT_OF_GROSS, percent_value: 6, taxable: false, seq: 50 },
    ];
    const ruleByCode = {};
    for (const r of ruleDefs) {
      ruleByCode[r.code] = await models.SalaryRule.create(
        {
          organization_id: orgId,
          code: r.code,
          name: r.name,
          category: r.category,
          compute_type: r.compute_type,
          fixed_amount: r.fixed_amount ?? null,
          percent_value: r.percent_value ?? null,
          taxable: r.taxable,
          is_active: true,
        },
        { transaction: t }
      );
    }
    const structure = await models.SalaryStructure.create(
      {
        organization_id: orgId,
        code: 'STD_GLOBAL',
        name: 'Standard Global Structure',
        description: 'Default structure: basic, HRA, transport, income tax, social security',
        currency,
        is_active: true,
        effective_from: yearStart(),
        created_by: adminId,
      },
      { transaction: t }
    );
    for (const r of ruleDefs) {
      await models.SalaryStructureRule.create(
        { salary_structure_id: structure.id, salary_rule_id: ruleByCode[r.code].id, sequence: r.seq, is_active: true },
        { transaction: t }
      );
    }

    // ---- Contracts ----
    const contractByKey = {};
    for (const e of EMPLOYEES) {
      const emp = empByKey[e.key];
      contractByKey[e.key] = await models.Contract.create(
        {
          organization_id: orgId,
          employee_id: emp.id,
          salary_structure_id: structure.id,
          working_schedule_id: schedule ? schedule.id : null,
          title: `${e.title} Contract`,
          department: e.dept,
          position: e.title,
          start_date: emp.hire_date,
          wage_amount: e.gross,
          wage_currency: currency,
          wage_period: 'monthly',
          notice_period_days: 30,
          status: C.CONTRACT_STATUS.ACTIVE,
        },
        { transaction: t }
      );
    }

    // ---- Tax profiles ----
    for (const tp of [
      { country_code: 'US', name: 'United States Federal', flat_percent: 12, social_security_percent: 6.2, employer_contribution_percent: 6.2 },
      { country_code: 'IN', name: 'India New Regime', flat_percent: 10, social_security_percent: 12, employer_contribution_percent: 12 },
    ]) {
      await models.TaxProfile.create(
        { organization_id: orgId, currency, is_active: true, effective_from: yearStart(), ...tp },
        { transaction: t }
      );
    }

    // ---- Payruns + payslips ----
    // helper to build payslip figures from a monthly gross
    const figuresFor = (gross) => {
      const basic = round(gross * 0.6);
      const hra = round(basic * 0.2);
      const transport = 300;
      const grossTotal = round(basic + hra + transport);
      const tax = round(grossTotal * 0.12);
      const social = round(grossTotal * 0.06);
      const net = round(grossTotal - tax - social);
      return { basic, hra, transport, grossTotal, tax, social, net };
    };

    async function buildPayrun(offsetMonths, code, name, status, paid) {
      const { start, end } = monthRange(offsetMonths);
      const payrun = await models.Payrun.create(
        {
          organization_id: orgId,
          name,
          code,
          salary_structure_id: structure.id,
          period_start: start,
          period_end: end,
          payment_date: paid ? iso(daysAgo(offsetMonths === -1 ? 5 : 0)) : end,
          currency,
          status,
          created_by: adminId,
          validated_by: adminId,
          validated_at: now(),
          released_by: paid ? adminId : null,
          released_at: paid ? now() : null,
        },
        { transaction: t }
      );
      let totalNet = 0;
      let totalGross = 0;
      let i = 0;
      for (const e of EMPLOYEES) {
        const emp = empByKey[e.key];
        const f = figuresFor(e.gross);
        totalNet += f.net;
        totalGross += f.grossTotal;
        const payslip = await models.Payslip.create(
          {
            organization_id: orgId,
            payrun_id: payrun.id,
            employee_id: emp.id,
            contract_id: contractByKey[e.key].id,
            salary_structure_id: structure.id,
            code: `${code}-${String(++i).padStart(3, '0')}`,
            period_start: start,
            period_end: end,
            currency,
            worked_days: 22,
            basic_amount: f.basic,
            allowances_amount: round(f.hra + f.transport),
            deductions_amount: 0,
            gross_amount: f.grossTotal,
            tax_amount: f.tax,
            contribution_amount: f.social,
            net_amount: f.net,
            status: paid ? C.PAYSLIP_STATUS.PAID : C.PAYSLIP_STATUS.VALIDATED,
            computed_at: now(),
            validated_at: now(),
            paid_at: paid ? now() : null,
          },
          { transaction: t }
        );
        const lines = [
          { code: 'BASIC', name: 'Basic Salary', category: C.SALARY_RULE_CATEGORY.BASIC, amount: f.basic, seq: 10 },
          { code: 'HRA', name: 'House Rent Allowance', category: C.SALARY_RULE_CATEGORY.ALLOWANCE, amount: f.hra, seq: 20 },
          { code: 'TRANSPORT', name: 'Transport Allowance', category: C.SALARY_RULE_CATEGORY.ALLOWANCE, amount: f.transport, seq: 30 },
          { code: 'INCOME_TAX', name: 'Income Tax', category: C.SALARY_RULE_CATEGORY.TAX, amount: -f.tax, seq: 40 },
          { code: 'SOCIAL_SEC', name: 'Social Security', category: C.SALARY_RULE_CATEGORY.CONTRIBUTION, amount: -f.social, seq: 50 },
          { code: 'NET', name: 'Net Salary', category: C.SALARY_RULE_CATEGORY.NET, amount: f.net, seq: 100 },
        ];
        for (const l of lines) {
          await models.PayslipLine.create(
            {
              payslip_id: payslip.id,
              salary_rule_id: ruleByCode[l.code] ? ruleByCode[l.code].id : null,
              sequence: l.seq,
              rule_code: l.code,
              rule_name: l.name,
              category: l.category,
              quantity: 1,
              rate: l.amount,
              amount: l.amount,
            },
            { transaction: t }
          );
        }
        if (paid) {
          await models.PayrollTransaction.create(
            {
              organization_id: orgId,
              payslip_id: payslip.id,
              payrun_id: payrun.id,
              employee_id: emp.id,
              transaction_type: 'salary',
              amount: f.net,
              currency,
              status: 'completed',
              initiated_by: adminId,
              completed_at: now(),
            },
            { transaction: t }
          );
        }
      }
      await payrun.update(
        { totals: { total_net: round(totalNet), total_gross: round(totalGross), employees: EMPLOYEES.length } },
        { transaction: t }
      );
      return payrun;
    }

    await buildPayrun(-1, `PR-${new Date().getUTCFullYear()}-M1`, 'Previous Month Payroll', C.PAYRUN_STATUS.PAID, true);
    await buildPayrun(0, `PR-${new Date().getUTCFullYear()}-M2`, 'Current Month Payroll', C.PAYRUN_STATUS.VALIDATED, false);

    // ---- Advance salary ----
    await models.AdvanceSalaryRequest.create(
      {
        organization_id: orgId, employee_id: empByKey.noah.id, contract_id: contractByKey.noah.id,
        requested_amount: 2000, approved_amount: 2000, currency, service_fee_percent: 0.5, service_fee_amount: 10,
        disbursement_amount: 1990, repayment_mode: C.ADVANCE_SALARY_REPAYMENT_MODE.EMI, emi_months: 4,
        outstanding_amount: 1500, reason: 'Medical emergency', status: C.ADVANCE_SALARY_STATUS.RECOVERING,
        approved_by: adminId, approved_at: daysAgo(40), disbursed_by: adminId, disbursed_at: daysAgo(38),
      },
      { transaction: t }
    );
    await models.AdvanceSalaryRequest.create(
      {
        organization_id: orgId, employee_id: empByKey.lucas.id, contract_id: contractByKey.lucas.id,
        requested_amount: 1000, currency, repayment_mode: C.ADVANCE_SALARY_REPAYMENT_MODE.SALARY_DEDUCTION,
        outstanding_amount: 0, reason: 'Relocation deposit', status: C.ADVANCE_SALARY_STATUS.REQUESTED,
      },
      { transaction: t }
    );

    // ---- Bonuses ----
    for (const b of [
      { key: 'sofia', type: C.BONUS_TYPE.PERFORMANCE, amount: 3000, status: 'paid' },
      { key: 'isabella', type: C.BONUS_TYPE.PERFORMANCE, amount: 5000, status: 'approved' },
      { key: 'oliver', type: C.BONUS_TYPE.FESTIVE, amount: 800, status: 'draft' },
    ]) {
      await models.BonusRecord.create(
        {
          organization_id: orgId, employee_id: empByKey[b.key].id, contract_id: contractByKey[b.key].id,
          bonus_type: b.type, amount: b.amount, currency, taxable: true, grant_date: iso(daysAgo(15)),
          reason: 'Recognised contribution', status: b.status, approved_by: b.status !== 'draft' ? adminId : null,
          approved_at: b.status !== 'draft' ? daysAgo(14) : null,
        },
        { transaction: t }
      );
    }

    // ---- Salary change requests ----
    await models.SalaryChangeRequest.create(
      {
        organization_id: orgId, employee_id: empByKey.sofia.id, current_contract_id: contractByKey.sofia.id,
        change_type: 'increment', suggested_by: adminId, suggested_percent: 10,
        suggested_reason: 'Promotion to Senior Engineer, market adjustment',
        status: C.CHANGE_REQUEST_STATUS.PENDING_PAYROLL_REVIEW, effective_from: iso(daysAhead(30)),
      },
      { transaction: t }
    );

    // ---- HR: time off allocations + requests ----
    const timeOffTypes = await models.TimeOffType.findAll({ where: { organization_id: orgId }, transaction: t });
    const annual = timeOffTypes.find((x) => x.code === 'ANNUAL');
    const sick = timeOffTypes.find((x) => x.code === 'SICK');
    const allocByEmpType = {};
    for (const e of EMPLOYEES) {
      const emp = empByKey[e.key];
      for (const type of [annual, sick].filter(Boolean)) {
        const alloc = await models.TimeOffAllocation.create(
          {
            organization_id: orgId, employee_id: emp.id, time_off_type_id: type.id,
            allocated_amount: type.code === 'ANNUAL' ? 20 : 10, taken_amount: 0, pending_amount: 0,
            valid_from: yearStart(), status: C.TIME_OFF_ALLOCATION_STATUS.APPROVED,
            approved_by: adminId, approved_at: daysAgo(200),
          },
          { transaction: t }
        );
        allocByEmpType[`${e.key}:${type.code}`] = alloc;
      }
    }
    const timeOffReqs = [
      { key: 'noah', start: daysAhead(7), end: daysAhead(11), status: C.TIME_OFF_REQUEST_STATUS.PENDING },
      { key: 'oliver', start: daysAhead(3), end: daysAhead(4), status: C.TIME_OFF_REQUEST_STATUS.PENDING },
      { key: 'sofia', start: daysAgo(20), end: daysAgo(16), status: C.TIME_OFF_REQUEST_STATUS.APPROVED },
      { key: 'lucas', start: daysAgo(50), end: daysAgo(49), status: C.TIME_OFF_REQUEST_STATUS.APPROVED },
      { key: 'ethan', start: daysAhead(14), end: daysAhead(18), status: C.TIME_OFF_REQUEST_STATUS.REFUSED },
    ];
    for (const r of timeOffReqs) {
      if (!annual) break;
      const duration = Math.round((new Date(r.end) - new Date(r.start)) / DAY) + 1;
      await models.TimeOffRequest.create(
        {
          organization_id: orgId, employee_id: empByKey[r.key].id, time_off_type_id: annual.id,
          time_off_allocation_id: allocByEmpType[`${r.key}:ANNUAL`] ? allocByEmpType[`${r.key}:ANNUAL`].id : null,
          start_date: iso(r.start), end_date: iso(r.end), duration, reason: 'Personal time off',
          status: r.status, submitted_at: daysAgo(5),
          approver_id: r.status === C.TIME_OFF_REQUEST_STATUS.PENDING ? null : adminId,
          decided_at: r.status === C.TIME_OFF_REQUEST_STATUS.PENDING ? null : daysAgo(4),
        },
        { transaction: t }
      );
    }

    // ---- HR: attendance (last 10 working days for first 6 employees) ----
    const attendKeys = ['sofia', 'noah', 'oliver', 'lucas', 'ethan', 'james'];
    for (const key of attendKeys) {
      const emp = empByKey[key];
      let placed = 0;
      let back = 1;
      while (placed < 10 && back < 20) {
        const d = daysAgo(back);
        const dow = d.getUTCDay();
        back += 1;
        if (dow === 0 || dow === 6) continue;
        const late = placed % 5 === 0;
        const checkIn = new Date(d); checkIn.setUTCHours(late ? 9 : 8, late ? 35 : 55, 0, 0);
        const checkOut = new Date(d); checkOut.setUTCHours(18, 5, 0, 0);
        await models.Attendance.create(
          {
            organization_id: orgId, employee_id: emp.id, work_date: iso(d),
            check_in: checkIn, check_out: checkOut, break_minutes: 60, worked_hours: 8,
            status: late ? C.ATTENDANCE_STATUS.LATE : C.ATTENDANCE_STATUS.PRESENT, source: 'self',
          },
          { transaction: t }
        );
        placed += 1;
      }
    }

    // ---- HR: requests + messages ----
    const hrReqDefs = [
      { key: 'noah', type: C.HR_REQUEST_TYPE.DOCUMENT, subject: 'Employment verification letter', status: C.HR_REQUEST_STATUS.OPEN },
      { key: 'oliver', type: C.HR_REQUEST_TYPE.SALARY_QUERY, subject: 'Question about tax deduction', status: C.HR_REQUEST_STATUS.IN_PROGRESS },
      { key: 'lucas', type: C.HR_REQUEST_TYPE.GENERAL, subject: 'Update emergency contact', status: C.HR_REQUEST_STATUS.RESOLVED },
    ];
    for (const r of hrReqDefs) {
      const req = await models.HRRequest.create(
        {
          organization_id: orgId, employee_id: empByKey[r.key].id, request_type: r.type,
          subject: r.subject, body: `Hello HR team, ${r.subject.toLowerCase()} please.`,
          status: r.status, priority: 'normal', assigned_to: adminId,
          resolved_at: r.status === C.HR_REQUEST_STATUS.RESOLVED ? daysAgo(2) : null,
          resolution_note: r.status === C.HR_REQUEST_STATUS.RESOLVED ? 'Completed and confirmed with employee.' : null,
        },
        { transaction: t }
      );
      await models.HRRequestMessage.create(
        { hr_request_id: req.id, sender_type: C.CHAT_SENDER_TYPE.EMPLOYEE, body: `Hello HR team, ${r.subject.toLowerCase()} please.` },
        { transaction: t }
      );
      if (r.status !== C.HR_REQUEST_STATUS.OPEN) {
        await models.HRRequestMessage.create(
          { hr_request_id: req.id, sender_user_id: adminId, sender_type: C.CHAT_SENDER_TYPE.HR, body: 'Thanks, we are looking into this now.' },
          { transaction: t }
        );
      }
    }

    // ---- HR: feedback ----
    for (const f of [
      { key: 'sofia', anon: false, cat: C.FEEDBACK_CATEGORY.APPRECIATION, subject: 'Great onboarding experience', status: C.FEEDBACK_STATUS.NEW },
      { key: null, anon: true, cat: C.FEEDBACK_CATEGORY.SUGGESTION, subject: 'Consider hybrid Fridays', status: C.FEEDBACK_STATUS.UNDER_REVIEW },
      { key: null, anon: true, cat: C.FEEDBACK_CATEGORY.POLICY, subject: 'Clarify expense policy', status: C.FEEDBACK_STATUS.ACTION_TAKEN },
    ]) {
      await models.FeedbackEntry.create(
        {
          organization_id: orgId, employee_id: f.anon ? null : empByKey[f.key].id, is_anonymous: f.anon,
          category: f.cat, subject: f.subject, body: `${f.subject}. Sharing this for the team to consider.`,
          status: f.status, priority: 'normal', handled_by: f.status !== C.FEEDBACK_STATUS.NEW ? adminId : null,
        },
        { transaction: t }
      );
    }

    // ---- HR: announcements ----
    for (const a of [
      { title: 'Q3 all hands next Friday', pinned: true },
      { title: 'New wellness benefit now available', pinned: false },
      { title: 'Office closed for public holiday', pinned: false },
    ]) {
      await models.HRAnnouncement.create(
        {
          organization_id: orgId, title: a.title, body: `${a.title}. Please check your email for details.`,
          audience: 'all', is_pinned: a.pinned, publish_at: daysAgo(3), published_by: adminId, status: 'published',
        },
        { transaction: t }
      );
    }

    // ---- Benefits: plans ----
    const providers = await models.BenefitProvider.findAll({ where: { organization_id: orgId }, transaction: t });
    const providerByCat = {};
    for (const p of providers) providerByCat[p.category] = p;
    const planDefs = [
      { code: 'HEALTH_PPO', name: 'Health PPO Plan', category: C.BENEFIT_CATEGORY.HEALTH_INSURANCE, employer: 400, employee: 80, coverage: 500000, providerCat: 'health_insurance' },
      { code: 'DENTAL_STD', name: 'Dental Standard', category: C.BENEFIT_CATEGORY.DENTAL_INSURANCE, employer: 40, employee: 10, coverage: 20000, providerCat: 'health_insurance' },
      { code: 'WELLNESS', name: 'Wellness and Fitness', category: C.BENEFIT_CATEGORY.WELLNESS, employer: 50, employee: 0, coverage: null, providerCat: 'wellness' },
      { code: 'RETIRE_401K', name: 'Retirement 401k Match', category: C.BENEFIT_CATEGORY.RETIREMENT, employer: 300, employee: 300, coverage: null, providerCat: 'life_insurance' },
    ];
    const planByCode = {};
    for (const p of planDefs) {
      planByCode[p.code] = await models.BenefitPlan.create(
        {
          organization_id: orgId, provider_id: providerByCat[p.providerCat] ? providerByCat[p.providerCat].id : null,
          code: p.code, name: p.name, category: p.category, currency,
          employer_cost_amount: p.employer, employee_cost_amount: p.employee, cost_frequency: 'per_month',
          coverage_amount: p.coverage, dependents_allowed: true, max_dependents: 4, requires_enrollment: true,
          approval_required: true, effective_from: yearStart(), total_seats: 100, seats_used: 0,
          status: C.BENEFIT_PLAN_STATUS.ACTIVE,
        },
        { transaction: t }
      );
    }

    // ---- Benefits: enrollments ----
    const enrollByEmp = {};
    const healthEnrollKeys = ['ava', 'liam', 'sofia', 'noah', 'emma', 'oliver', 'isabella', 'mia'];
    for (const key of healthEnrollKeys) {
      const plan = planByCode.HEALTH_PPO;
      const enr = await models.BenefitEnrollment.create(
        {
          organization_id: orgId, employee_id: empByKey[key].id, benefit_plan_id: plan.id,
          status: C.BENEFIT_ENROLLMENT_STATUS.ACTIVE, start_date: yearStart(), dependents_count: key === 'ava' ? 2 : 0,
          employee_monthly_cost: plan.employee_cost_amount, employer_monthly_cost: plan.employer_cost_amount, currency,
          approved_by: adminId, approved_at: daysAgo(180),
        },
        { transaction: t }
      );
      enrollByEmp[key] = enr;
    }
    for (const key of ['lucas', 'ethan']) {
      await models.BenefitEnrollment.create(
        {
          organization_id: orgId, employee_id: empByKey[key].id, benefit_plan_id: planByCode.DENTAL_STD.id,
          status: C.BENEFIT_ENROLLMENT_STATUS.PENDING_APPROVAL, start_date: iso(daysAhead(5)), dependents_count: 0,
          employee_monthly_cost: planByCode.DENTAL_STD.employee_cost_amount, employer_monthly_cost: planByCode.DENTAL_STD.employer_cost_amount, currency,
        },
        { transaction: t }
      );
    }
    for (const key of ['sofia', 'oliver', 'noah']) {
      await models.BenefitEnrollment.create(
        {
          organization_id: orgId, employee_id: empByKey[key].id, benefit_plan_id: planByCode.WELLNESS.id,
          status: C.BENEFIT_ENROLLMENT_STATUS.ACTIVE, start_date: yearStart(), dependents_count: 0,
          employee_monthly_cost: 0, employer_monthly_cost: planByCode.WELLNESS.employer_cost_amount, currency,
          approved_by: adminId, approved_at: daysAgo(120),
        },
        { transaction: t }
      );
    }

    // ---- Benefits: claims ----
    let claimNum = 1;
    for (const cdef of [
      { key: 'ava', subject: 'Annual health checkup', amount: 450, status: C.BENEFIT_CLAIM_STATUS.REIMBURSED },
      { key: 'liam', subject: 'Physiotherapy sessions', amount: 300, status: C.BENEFIT_CLAIM_STATUS.APPROVED },
      { key: 'sofia', subject: 'Prescription glasses', amount: 220, status: C.BENEFIT_CLAIM_STATUS.SUBMITTED },
    ]) {
      const enr = enrollByEmp[cdef.key];
      if (!enr) continue;
      await models.BenefitClaim.create(
        {
          organization_id: orgId, employee_id: empByKey[cdef.key].id, benefit_enrollment_id: enr.id, benefit_plan_id: enr.benefit_plan_id,
          claim_code: `CLM-${String(claimNum++).padStart(4, '0')}`, subject: cdef.subject, incurred_on: iso(daysAgo(20)),
          claim_amount: cdef.amount, currency, status: cdef.status,
          approved_amount: cdef.status === C.BENEFIT_CLAIM_STATUS.SUBMITTED ? null : cdef.amount,
          reimbursed_amount: cdef.status === C.BENEFIT_CLAIM_STATUS.REIMBURSED ? cdef.amount : null,
          reviewed_by: cdef.status === C.BENEFIT_CLAIM_STATUS.SUBMITTED ? null : adminId,
          reviewed_at: cdef.status === C.BENEFIT_CLAIM_STATUS.SUBMITTED ? null : daysAgo(10),
          reimbursed_at: cdef.status === C.BENEFIT_CLAIM_STATUS.REIMBURSED ? daysAgo(5) : null,
        },
        { transaction: t }
      );
    }

    // ---- Benefits: loans ----
    const loanProgram = await models.LoanProgram.findOne({ where: { organization_id: orgId }, transaction: t });
    if (loanProgram) {
      const loan1 = await models.Loan.create(
        {
          organization_id: orgId, employee_id: empByKey.noah.id, loan_program_id: loanProgram.id, code: 'LN-0001',
          requested_amount: 6000, approved_amount: 6000, currency, tenure_months: 12,
          interest_mode: C.LOAN_INTEREST_MODE.ZERO, interest_rate_percent: 0, processing_fee_amount: 30,
          monthly_installment: 500, total_repayable: 6000, outstanding_amount: 4000, salary_deduction: true,
          reason: 'Home appliance purchase', status: C.LOAN_STATUS.REPAYING,
          manager_reviewer_id: adminId, manager_reviewed_at: daysAgo(90), admin_reviewer_id: adminId, admin_reviewed_at: daysAgo(88),
          disbursed_at: daysAgo(85), disbursed_by: adminId,
        },
        { transaction: t }
      );
      for (let m = 0; m < 4; m += 1) {
        await models.LoanRepayment.create(
          { loan_id: loan1.id, mode: 'salary_deduction', amount: 500, currency, recorded_at: daysAgo(85 - m * 20), note: `Installment ${m + 1}` },
          { transaction: t }
        );
      }
      await models.Loan.create(
        {
          organization_id: orgId, employee_id: empByKey.lucas.id, loan_program_id: loanProgram.id, code: 'LN-0002',
          requested_amount: 2400, approved_amount: 2400, currency, tenure_months: 6,
          interest_mode: C.LOAN_INTEREST_MODE.ZERO, interest_rate_percent: 0, processing_fee_amount: 12,
          monthly_installment: 400, total_repayable: 2400, outstanding_amount: 0, salary_deduction: true,
          reason: 'Education fees', status: C.LOAN_STATUS.CLOSED, disbursed_at: daysAgo(260), disbursed_by: adminId, closed_at: daysAgo(30),
        },
        { transaction: t }
      );
    }

    // ---- Benefits: vouchers + discount partners ----
    let vNum = 1;
    for (const v of [
      { key: 'sofia', partner: 'Amazon', amount: 100, status: C.VOUCHER_STATUS.REDEEMED },
      { key: 'oliver', partner: 'Amazon', amount: 50, status: C.VOUCHER_STATUS.DELIVERED },
      { key: 'noah', partner: 'Uber Eats', amount: 40, status: C.VOUCHER_STATUS.ISSUED },
    ]) {
      await models.GiftVoucher.create(
        {
          organization_id: orgId, employee_id: empByKey[v.key].id, code: `GV-${String(vNum++).padStart(4, '0')}`,
          partner_name: v.partner, category: 'shopping', amount: v.amount, currency, status: v.status,
          valid_from: yearStart(), valid_to: iso(daysAhead(120)), issued_by: adminId,
          delivered_at: v.status !== C.VOUCHER_STATUS.ISSUED ? daysAgo(10) : null,
          redeemed_at: v.status === C.VOUCHER_STATUS.REDEEMED ? daysAgo(3) : null,
        },
        { transaction: t }
      );
    }
    for (const d of [
      { name: 'FitZone Gyms', category: 'fitness', pct: 25, code: 'PP-FIT25' },
      { name: 'CloudLearn Courses', category: 'learning', pct: 40, code: 'PP-LEARN40' },
      { name: 'CityCabs', category: 'transport', pct: 15, code: 'PP-RIDE15' },
    ]) {
      await models.DiscountPartner.create(
        {
          organization_id: orgId, name: d.name, category: d.category, discount_percent: d.pct, discount_code: d.code,
          website: `https://${d.name.toLowerCase().replace(/[^a-z]/g, '')}.example.com`, is_active: true, valid_from: yearStart(),
        },
        { transaction: t }
      );
    }

    // ---- IT: software catalog ----
    const softwareDefs = [
      { name: 'Microsoft 365', vendor: 'Microsoft', category: 'productivity', version: '2024', seats: 60 },
      { name: 'Slack', vendor: 'Salesforce', category: 'communication', version: 'latest', seats: 60 },
      { name: 'Figma', vendor: 'Figma', category: 'design', version: 'latest', seats: 15 },
      { name: 'Jira', vendor: 'Atlassian', category: 'project_management', version: 'cloud', seats: 40 },
      { name: 'Zoom', vendor: 'Zoom', category: 'communication', version: '6.0', seats: 60 },
      { name: 'GitHub Enterprise', vendor: 'GitHub', category: 'development', version: 'cloud', seats: 30 },
    ];
    const softwareList = [];
    for (const s of softwareDefs) {
      const item = await models.SoftwareCatalogItem.create(
        {
          organization_id: orgId, name: s.name, vendor: s.vendor, category: s.category, version: s.version,
          license_type: C.SOFTWARE_LICENSE_TYPE.SUBSCRIPTION, unit_cost: 12, currency, total_seats: s.seats,
          seats_allocated: Math.floor(s.seats * 0.6), renewal_date: iso(daysAhead(200)), is_managed: true,
        },
        { transaction: t }
      );
      softwareList.push(item);
    }

    // ---- IT: devices + assignments + software + baseline ----
    const baselineControls = await models.BaselineControl.findAll({ where: { organization_id: orgId }, transaction: t });
    const deviceAssignKeys = EMPLOYEES.map((e) => e.key); // one device per employee (12)
    let devNum = 1;
    const manufacturers = [
      { manu: 'Apple', model: 'MacBook Pro 14', os: C.OS_FAMILY.MACOS, osv: '14.5' },
      { manu: 'Dell', model: 'Latitude 7440', os: C.OS_FAMILY.WINDOWS, osv: '11 Pro' },
      { manu: 'Lenovo', model: 'ThinkPad X1', os: C.OS_FAMILY.WINDOWS, osv: '11 Pro' },
    ];
    for (const key of deviceAssignKeys) {
      const emp = empByKey[key];
      const spec = manufacturers[(devNum - 1) % manufacturers.length];
      const device = await models.Device.create(
        {
          organization_id: orgId, assigned_employee_id: emp.id, asset_tag: `PP-LT-${String(devNum).padStart(3, '0')}`,
          hostname: `pp-${key}-lt`, serial_number: `SN${String(100000 + devNum)}`, category: C.DEVICE_CATEGORY.LAPTOP,
          manufacturer: spec.manu, model: spec.model, os_family: spec.os, os_version: spec.osv,
          cpu: 'Intel i7 / M3', ram_gb: 16, storage_gb: 512, ownership: C.DEVICE_OWNERSHIP.OWNED, status: C.DEVICE_STATUS.ASSIGNED,
          purchase_date: iso(daysAgo(200)), purchase_cost: 1800, currency, warranty_end: iso(daysAhead(500)),
          location: emp.city, last_seen_at: daysAgo(devNum % 3), agent_installed: true, edr_installed: true,
        },
        { transaction: t }
      );
      await models.DeviceAssignment.create(
        { device_id: device.id, employee_id: emp.id, assigned_at: daysAgo(190), checkout_condition: 'new', assigned_by: adminId },
        { transaction: t }
      );
      // install 3 software items
      for (const item of softwareList.slice(0, 3)) {
        await models.DeviceSoftware.create(
          { device_id: device.id, software_catalog_item_id: item.id, installed_at: daysAgo(185), version: item.version, status: C.DEVICE_SOFTWARE_STATUS.INSTALLED, installed_by: adminId },
          { transaction: t }
        );
      }
      // baseline checks: mostly pass, some fail/warn to show posture < 100%
      let ci = 0;
      for (const ctrl of baselineControls) {
        let status = C.BASELINE_STATUS.PASS;
        if (devNum % 4 === 0 && ci === 1) status = C.BASELINE_STATUS.FAIL;
        else if (devNum % 3 === 0 && ci === 2) status = C.BASELINE_STATUS.WARN;
        await models.DeviceBaselineCheck.create(
          { device_id: device.id, baseline_control_id: ctrl.id, status, checked_at: daysAgo(1), source: 'agent' },
          { transaction: t }
        );
        ci += 1;
      }
      devNum += 1;
    }
    // spare / non assigned devices
    for (const spare of [
      { tag: 'PP-LT-101', status: C.DEVICE_STATUS.IN_STOCK, manu: 'Dell', model: 'Latitude 5440' },
      { tag: 'PP-LT-102', status: C.DEVICE_STATUS.IN_STOCK, manu: 'Apple', model: 'MacBook Air 13' },
      { tag: 'PP-LT-103', status: C.DEVICE_STATUS.IN_REPAIR, manu: 'Lenovo', model: 'ThinkPad T14' },
    ]) {
      await models.Device.create(
        {
          organization_id: orgId, asset_tag: spare.tag, category: C.DEVICE_CATEGORY.LAPTOP, manufacturer: spare.manu, model: spare.model,
          os_family: C.OS_FAMILY.WINDOWS, ownership: C.DEVICE_OWNERSHIP.OWNED, status: spare.status, ram_gb: 16, storage_gb: 512,
          purchase_date: iso(daysAgo(120)), purchase_cost: 1500, currency, location: 'HQ Store',
        },
        { transaction: t }
      );
    }

    // ---- IT: EDR integration + events ----
    const edr = await models.EdrIntegration.create(
      {
        organization_id: orgId, vendor: C.EDR_VENDOR.CROWDSTRIKE, display_name: 'CrowdStrike Falcon',
        api_base_url: 'https://api.crowdstrike.example.com', credentials_ref: 'vault://edr/crowdstrike', status: 'connected',
        last_synced_at: daysAgo(0), is_active: true,
      },
      { transaction: t }
    );
    const anyDevice = await models.Device.findOne({ where: { organization_id: orgId, status: C.DEVICE_STATUS.ASSIGNED }, transaction: t });
    const edrEvents = [
      { type: 'agent_heartbeat', sev: C.EDR_EVENT_SEVERITY.INFO, title: 'Agent healthy', status: 'resolved' },
      { type: 'suspicious_login', sev: C.EDR_EVENT_SEVERITY.LOW, title: 'Login from new location', status: 'triaged' },
      { type: 'usb_blocked', sev: C.EDR_EVENT_SEVERITY.MEDIUM, title: 'Unapproved USB blocked', status: 'in_progress' },
      { type: 'malware_detected', sev: C.EDR_EVENT_SEVERITY.HIGH, title: 'Potential malware quarantined', status: 'new' },
      { type: 'ransomware_behavior', sev: C.EDR_EVENT_SEVERITY.CRITICAL, title: 'Ransomware behavior contained', status: 'resolved' },
    ];
    for (const ev of edrEvents) {
      await models.EdrEvent.create(
        {
          organization_id: orgId, edr_integration_id: edr.id, device_id: anyDevice ? anyDevice.id : null,
          event_type: ev.type, severity: ev.sev, occurred_at: daysAgo(2), title: ev.title,
          summary: `${ev.title} detected by CrowdStrike Falcon.`, status: ev.status,
          resolved_at: ev.status === 'resolved' ? daysAgo(1) : null,
        },
        { transaction: t }
      );
    }

    // ---- IT: onboarding provisions ----
    const kit = await models.OnboardingKit.findOne({ where: { organization_id: orgId }, transaction: t });
    if (kit) {
      const provDevice = await models.Device.findOne({ where: { organization_id: orgId, status: C.DEVICE_STATUS.IN_STOCK }, transaction: t });
      await models.OnboardingProvision.create(
        {
          organization_id: orgId, employee_id: empByKey.ethan.id, onboarding_kit_id: kit.id, device_id: provDevice ? provDevice.id : null,
          status: C.ONBOARDING_PROVISION_STATUS.ACTIVATED, shipping_address: '500 Market St, San Francisco', estimated_ready_date: iso(daysAgo(30)),
          dispatched_at: daysAgo(35), delivered_at: daysAgo(32), activated_at: daysAgo(30), requested_by: adminId,
        },
        { transaction: t }
      );
      await models.OnboardingProvision.create(
        {
          organization_id: orgId, employee_id: empByKey.lucas.id, onboarding_kit_id: kit.id,
          status: C.ONBOARDING_PROVISION_STATUS.PREPARING, shipping_address: '233 Wacker Dr, Chicago', estimated_ready_date: iso(daysAhead(4)), requested_by: adminId,
        },
        { transaction: t }
      );
    }

    // ---- Hiring: requisitions ----
    const reqDefs = [
      { code: 'REQ-001', title: 'Senior Backend Engineer', dept: 'Engineering', mgr: 'liam', status: C.REQUISITION_STATUS.APPROVED, headcount: 2, filled: 0, min: 120000, max: 160000, seniority: 'senior' },
      { code: 'REQ-002', title: 'Product Designer', dept: 'Product', mgr: 'emma', status: C.REQUISITION_STATUS.APPROVED, headcount: 1, filled: 0, min: 90000, max: 120000, seniority: 'mid' },
      { code: 'REQ-003', title: 'Sales Executive', dept: 'Sales', mgr: 'isabella', status: C.REQUISITION_STATUS.FILLED, headcount: 1, filled: 1, min: 70000, max: 95000, seniority: 'mid' },
      { code: 'REQ-004', title: 'Data Analyst', dept: 'Finance', mgr: 'aria', status: C.REQUISITION_STATUS.DRAFT, headcount: 1, filled: 0, min: 80000, max: 100000, seniority: 'mid' },
    ];
    const reqByCode = {};
    for (const r of reqDefs) {
      reqByCode[r.code] = await models.Requisition.create(
        {
          organization_id: orgId, department_id: deptByName[r.dept] ? deptByName[r.dept].id : null,
          hiring_manager_id: empByKey[r.mgr] ? empByKey[r.mgr].id : null, ta_owner_id: empByKey.mia.id,
          code: r.code, title: r.title, hiring_track: C.HIRING_TRACK.EXTERNAL, seniority: r.seniority,
          headcount: r.headcount, headcount_filled: r.filled, employment_type: 'full_time',
          description: `We are hiring a ${r.title} to join the ${r.dept} team.`, requirements: '3+ years relevant experience.',
          location: 'Remote / HQ', remote_allowed: true, currency, salary_min: r.min, salary_max: r.max, salary_period: 'yearly',
          priority: 'high', status: r.status, requested_by: empByKey[r.mgr] ? empByKey[r.mgr].id : adminId,
          approved_by: r.status === C.REQUISITION_STATUS.DRAFT ? null : adminId,
          approved_at: r.status === C.REQUISITION_STATUS.DRAFT ? null : daysAgo(45),
        },
        { transaction: t }
      );
    }

    // ---- Hiring: job postings ----
    const postingByReq = {};
    for (const code of ['REQ-001', 'REQ-002', 'REQ-003']) {
      const req = reqByCode[code];
      const posting = await models.JobPosting.create(
        {
          organization_id: orgId, requisition_id: req.id, channel: 'careers_site', title: req.title,
          slug: req.title.toLowerCase().replace(/[^a-z]+/g, '-'), published_content: `${req.title} - join us.`,
          published_at: daysAgo(40), status: C.JOB_POSTING_STATUS.PUBLISHED, applications_count: 0,
        },
        { transaction: t }
      );
      postingByReq[code] = posting;
      await models.JobPosting.create(
        {
          organization_id: orgId, requisition_id: req.id, channel: 'linkedin', title: req.title,
          external_url: 'https://linkedin.com/jobs/view/000', published_at: daysAgo(38), status: C.JOB_POSTING_STATUS.PUBLISHED,
        },
        { transaction: t }
      );
    }

    // ---- Hiring: candidates ----
    const candDefs = [
      { first: 'Grace', last: 'Hopper', title: 'Backend Engineer', exp: 8 },
      { first: 'Alan', last: 'Turing', title: 'Software Engineer', exp: 6 },
      { first: 'Katherine', last: 'Johnson', title: 'Backend Engineer', exp: 7 },
      { first: 'Ada', last: 'Lovelace', title: 'Product Designer', exp: 5 },
      { first: 'Charles', last: 'Babbage', title: 'UX Designer', exp: 9 },
      { first: 'Margaret', last: 'Hamilton', title: 'Account Executive', exp: 4 },
      { first: 'Tim', last: 'Berners', title: 'Sales Executive', exp: 6 },
      { first: 'Radia', last: 'Perlman', title: 'Data Analyst', exp: 5 },
    ];
    const candList = [];
    for (let i = 0; i < candDefs.length; i += 1) {
      const cd = candDefs[i];
      const cand = await models.Candidate.create(
        {
          organization_id: orgId, first_name: cd.first, last_name: cd.last,
          email: `${cd.first}.${cd.last}`.toLowerCase() + '@example.com', phone: `+1-555-90${String(i).padStart(2, '0')}`,
          current_title: cd.title, current_company: 'Prior Corp', location: 'Remote', years_of_experience: cd.exp,
          expected_salary_min: 90000, expected_salary_max: 140000, expected_currency: currency, notice_period_days: 30,
          background_check_status: 'not_requested',
        },
        { transaction: t }
      );
      candList.push(cand);
    }

    // ---- Hiring: applications + stage history ----
    const appStages = [
      { cand: 0, req: 'REQ-001', stage: C.APPLICATION_STAGE.INTERVIEW, source: C.APPLICATION_SOURCE.JOB_BOARD },
      { cand: 1, req: 'REQ-001', stage: C.APPLICATION_STAGE.SCREENING, source: C.APPLICATION_SOURCE.DIRECT },
      { cand: 2, req: 'REQ-001', stage: C.APPLICATION_STAGE.OFFER, source: C.APPLICATION_SOURCE.REFERRAL },
      { cand: 3, req: 'REQ-002', stage: C.APPLICATION_STAGE.ONSITE, source: C.APPLICATION_SOURCE.JOB_BOARD },
      { cand: 4, req: 'REQ-002', stage: C.APPLICATION_STAGE.APPLIED, source: C.APPLICATION_SOURCE.SOURCED },
      { cand: 5, req: 'REQ-003', stage: C.APPLICATION_STAGE.HIRED, source: C.APPLICATION_SOURCE.AGENCY },
      { cand: 6, req: 'REQ-003', stage: C.APPLICATION_STAGE.REJECTED, source: C.APPLICATION_SOURCE.DIRECT },
    ];
    const appList = [];
    for (const a of appStages) {
      const req = reqByCode[a.req];
      const app = await models.Application.create(
        {
          organization_id: orgId, candidate_id: candList[a.cand].id, requisition_id: req.id,
          job_posting_id: postingByReq[a.req] ? postingByReq[a.req].id : null, source: a.source,
          current_stage: a.stage, applied_at: daysAgo(30 - a.cand), assigned_recruiter_id: empByKey.mia.id,
          internal_rating: 4.0, rejected_at: a.stage === C.APPLICATION_STAGE.REJECTED ? daysAgo(5) : null,
          rejection_reason: a.stage === C.APPLICATION_STAGE.REJECTED ? 'Not a fit for the role level.' : null,
        },
        { transaction: t }
      );
      appList.push({ app, def: a });
      await models.ApplicationStageHistory.create(
        { application_id: app.id, from_stage: null, to_stage: C.APPLICATION_STAGE.APPLIED, changed_by: adminId, changed_at: daysAgo(30) },
        { transaction: t }
      );
      if (a.stage !== C.APPLICATION_STAGE.APPLIED) {
        await models.ApplicationStageHistory.create(
          { application_id: app.id, from_stage: C.APPLICATION_STAGE.APPLIED, to_stage: a.stage, changed_by: adminId, changed_at: daysAgo(10), note: `Advanced to ${a.stage}` },
          { transaction: t }
        );
      }
    }

    // ---- Hiring: interviews + feedback ----
    const interviewApps = appList.filter((x) => [C.APPLICATION_STAGE.INTERVIEW, C.APPLICATION_STAGE.ONSITE, C.APPLICATION_STAGE.OFFER].includes(x.def.stage));
    for (let i = 0; i < interviewApps.length; i += 1) {
      const { app } = interviewApps[i];
      const upcoming = i === 0;
      const start = upcoming ? daysAhead(3 + i) : daysAgo(6 - i);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const interview = await models.Interview.create(
        {
          organization_id: orgId, application_id: app.id, round_index: 1,
          interview_type: C.INTERVIEW_TYPE.VIDEO, title: 'Technical interview', scheduled_start: start, scheduled_end: end,
          timezone: 'UTC', video_url: 'https://meet.example.com/abc', panelists: [empByKey.liam.id],
          status: upcoming ? C.INTERVIEW_STATUS.SCHEDULED : C.INTERVIEW_STATUS.COMPLETED, candidate_confirmed: true, scheduled_by: empByKey.mia.id,
        },
        { transaction: t }
      );
      if (!upcoming && adminId) {
        await models.InterviewFeedback.create(
          {
            interview_id: interview.id, panelist_user_id: adminId, panelist_role: 'Engineering Manager', overall_rating: 4.2,
            recommendation: C.INTERVIEW_RECOMMENDATION.HIRE, strengths: 'Strong problem solving and communication.',
            concerns: 'Limited experience with our stack.',
          },
          { transaction: t }
        );
      }
    }
    // one extra upcoming interview to populate the dashboard metric
    {
      const app = appList.find((x) => x.def.stage === C.APPLICATION_STAGE.SCREENING);
      if (app) {
        const start = daysAhead(5);
        await models.Interview.create(
          {
            organization_id: orgId, application_id: app.app.id, round_index: 1, interview_type: C.INTERVIEW_TYPE.PHONE,
            title: 'Phone screen', scheduled_start: start, scheduled_end: new Date(start.getTime() + 30 * 60 * 1000), timezone: 'UTC',
            status: C.INTERVIEW_STATUS.SCHEDULED, candidate_confirmed: false, scheduled_by: empByKey.mia.id,
          },
          { transaction: t }
        );
      }
    }

    // ---- Hiring: offers ----
    const offerApp = appList.find((x) => x.def.stage === C.APPLICATION_STAGE.OFFER);
    const hiredApp = appList.find((x) => x.def.stage === C.APPLICATION_STAGE.HIRED);
    if (offerApp) {
      await models.Offer.create(
        {
          organization_id: orgId, application_id: offerApp.app.id, candidate_id: offerApp.app.candidate_id, requisition_id: offerApp.app.requisition_id,
          title: 'Senior Backend Engineer', department_id: deptByName.Engineering.id, manager_id: empByKey.liam.id,
          base_salary: 150000, currency, salary_period: 'yearly', sign_on_bonus: 10000, annual_bonus_percent: 12,
          start_date: iso(daysAhead(45)), status: C.OFFER_STATUS.EXTENDED, approved_by: adminId, approved_at: daysAgo(3), extended_at: daysAgo(2),
        },
        { transaction: t }
      );
    }
    if (hiredApp) {
      await models.Offer.create(
        {
          organization_id: orgId, application_id: hiredApp.app.id, candidate_id: hiredApp.app.candidate_id, requisition_id: hiredApp.app.requisition_id,
          title: 'Sales Executive', department_id: deptByName.Sales.id, manager_id: empByKey.isabella.id,
          base_salary: 85000, currency, salary_period: 'yearly', start_date: iso(daysAgo(20)), status: C.OFFER_STATUS.ACCEPTED,
          approved_by: adminId, approved_at: daysAgo(30), extended_at: daysAgo(28), responded_at: daysAgo(25),
        },
        { transaction: t }
      );
    }

    // ---- Hiring: referrals ----
    for (const r of [
      { by: 'sofia', first: 'Dennis', last: 'Ritchie', status: C.REFERRAL_STATUS.SUBMITTED },
      { by: 'liam', first: 'Ken', last: 'Thompson', status: C.REFERRAL_STATUS.IN_REVIEW },
      { by: 'emma', first: 'Barbara', last: 'Liskov', status: C.REFERRAL_STATUS.HIRED },
    ]) {
      await models.Referral.create(
        {
          organization_id: orgId, referrer_employee_id: empByKey[r.by].id, requisition_id: reqByCode['REQ-001'].id,
          candidate_first_name: r.first, candidate_last_name: r.last, candidate_email: `${r.first}.${r.last}`.toLowerCase() + '@example.com',
          relationship: 'Former colleague', recommendation: 'Excellent engineer, highly recommend.', status: r.status,
          bonus_amount: r.status === C.REFERRAL_STATUS.HIRED ? 2000 : null, bonus_currency: r.status === C.REFERRAL_STATUS.HIRED ? currency : null,
          reviewer_id: r.status !== C.REFERRAL_STATUS.SUBMITTED ? empByKey.mia.id : null,
          reviewed_at: r.status !== C.REFERRAL_STATUS.SUBMITTED ? daysAgo(6) : null,
        },
        { transaction: t }
      );
    }

    // ---- Mobility: partners lookup ----
    const partners = await models.MobilityPartner.findAll({ where: { organization_id: orgId }, transaction: t });
    const partnerByCat = {};
    for (const p of partners) partnerByCat[p.category] = p;

    // ---- Mobility: visa sponsorships + documents ----
    const visaDefs = [
      { key: 'sofia', type: C.VISA_TYPE.WORK_VISA, country: 'US', status: C.VISA_STATUS.APPROVED, validTo: daysAhead(25) },
      { key: 'noah', type: C.VISA_TYPE.WORK_VISA, country: 'GB', status: C.VISA_STATUS.FILED, validTo: null },
      { key: 'emma', type: C.VISA_TYPE.PERMANENT_RESIDENCY, country: 'US', status: C.VISA_STATUS.INITIATED, validTo: null },
    ];
    let visaNum = 1;
    for (const v of visaDefs) {
      const visa = await models.VisaSponsorship.create(
        {
          organization_id: orgId, employee_id: empByKey[v.key].id, mobility_partner_id: partnerByCat.immigration_lawyer ? partnerByCat.immigration_lawyer.id : null,
          case_code: `VISA-${String(visaNum++).padStart(4, '0')}`, visa_type: v.type, country_code: v.country, status: v.status,
          requested_at: daysAgo(60), filed_at: v.status === C.VISA_STATUS.INITIATED ? null : daysAgo(40),
          decision_at: v.status === C.VISA_STATUS.APPROVED ? daysAgo(20) : null,
          valid_from: v.status === C.VISA_STATUS.APPROVED ? iso(daysAgo(20)) : null, valid_to: v.validTo ? iso(v.validTo) : null,
          priority: 'high', total_cost_amount: 4500, currency, approved_by: v.status === C.VISA_STATUS.APPROVED ? adminId : null,
          approved_at: v.status === C.VISA_STATUS.APPROVED ? daysAgo(20) : null,
        },
        { transaction: t }
      );
      for (const doc of [
        { type: 'passport', title: 'Passport scan', status: 'verified' },
        { type: 'employment_letter', title: 'Employment letter', status: 'uploaded' },
        { type: 'photo', title: 'Passport photo', status: 'pending' },
      ]) {
        await models.VisaDocument.create(
          { visa_sponsorship_id: visa.id, document_type: doc.type, title: doc.title, status: doc.status, uploaded_by: adminId },
          { transaction: t }
        );
      }
    }

    // ---- Mobility: relocations + expenses ----
    const reloDefs = [
      { key: 'sofia', from: 'IN', fromCity: 'Bengaluru', to: 'US', toCity: 'New York', status: C.RELOCATION_STATUS.IN_PROGRESS, budget: 20000, spent: 8500 },
      { key: 'noah', from: 'IN', fromCity: 'Hyderabad', to: 'GB', toCity: 'London', status: C.RELOCATION_STATUS.COMPLETED, budget: 18000, spent: 17200 },
    ];
    let reloNum = 1;
    for (const r of reloDefs) {
      const relo = await models.RelocationCase.create(
        {
          organization_id: orgId, employee_id: empByKey[r.key].id, mobility_partner_id: partnerByCat.relocation_agency ? partnerByCat.relocation_agency.id : null,
          case_code: `RELO-${String(reloNum++).padStart(4, '0')}`, from_country_code: r.from, from_city: r.fromCity, to_country_code: r.to, to_city: r.toCity,
          reason: 'new_role', status: r.status, budget_amount: r.budget, budget_currency: currency, spent_amount: r.spent,
          budget_status: C.RELOCATION_BUDGET_STATUS.APPROVED, target_move_date: iso(daysAhead(20)),
          actual_move_date: r.status === C.RELOCATION_STATUS.COMPLETED ? iso(daysAgo(15)) : null, dependents_count: 1,
          requested_by: adminId, approved_by: adminId, approved_at: daysAgo(70),
        },
        { transaction: t }
      );
      for (const ex of [
        { cat: 'flights', desc: 'Relocation flights', amount: r.status === C.RELOCATION_STATUS.COMPLETED ? 3200 : 3000 },
        { cat: 'shipping', desc: 'Household shipping', amount: 4500 },
        { cat: 'temporary_stay', desc: 'Temporary housing 30 days', amount: r.status === C.RELOCATION_STATUS.COMPLETED ? 6000 : 1000 },
      ]) {
        await models.RelocationExpense.create(
          {
            relocation_case_id: relo.id, category: ex.cat, description: ex.desc, amount: ex.amount, currency, incurred_on: iso(daysAgo(25)),
            status: r.status === C.RELOCATION_STATUS.COMPLETED ? 'reimbursed' : 'approved', reviewed_by: adminId, reviewed_at: daysAgo(20),
          },
          { transaction: t }
        );
      }
    }

    // ---- Mobility: immigration cases ----
    let immNum = 1;
    for (const im of [
      { key: 'sofia', type: C.IMMIGRATION_CASE_TYPE.WORK_VISA, country: 'US', status: C.IMMIGRATION_CASE_STATUS.IN_PROGRESS },
      { key: 'emma', type: C.IMMIGRATION_CASE_TYPE.PERMANENT_RESIDENCY, country: 'US', status: C.IMMIGRATION_CASE_STATUS.OPEN },
    ]) {
      await models.ImmigrationCase.create(
        {
          organization_id: orgId, employee_id: empByKey[im.key].id, mobility_partner_id: partnerByCat.immigration_lawyer ? partnerByCat.immigration_lawyer.id : null,
          case_code: `IMM-${String(immNum++).padStart(4, '0')}`, case_type: im.type, country_code: im.country, status: im.status,
          priority: 'normal', dependents_count: 1, opened_at: daysAgo(50), next_action_due: iso(daysAhead(10)),
          summary: 'Ongoing immigration matter handled with external counsel.', assigned_to: adminId,
        },
        { transaction: t }
      );
    }

    // ---- Mobility: travel requests ----
    const travelDefs = [
      { key: 'isabella', to: 'US', toCity: 'New York', depart: daysAhead(10), ret: daysAhead(13), status: C.TRAVEL_STATUS.BOOKED, cost: 2200 },
      { key: 'lucas', to: 'GB', toCity: 'London', depart: daysAhead(5), ret: daysAhead(8), status: C.TRAVEL_STATUS.APPROVED, cost: 1800 },
      { key: 'emma', to: 'US', toCity: 'San Francisco', depart: daysAhead(20), ret: daysAhead(24), status: C.TRAVEL_STATUS.SUBMITTED, cost: 2500 },
      { key: 'ava', to: 'SG', toCity: 'Singapore', depart: daysAgo(20), ret: daysAgo(15), status: C.TRAVEL_STATUS.COMPLETED, cost: 3800 },
      { key: 'oliver', to: 'DE', toCity: 'Berlin', depart: daysAgo(2), ret: daysAhead(2), status: C.TRAVEL_STATUS.IN_PROGRESS, cost: 1500 },
    ];
    let travelNum = 1;
    for (const tr of travelDefs) {
      await models.TravelRequest.create(
        {
          organization_id: orgId, employee_id: empByKey[tr.key].id, code: `TRV-${String(travelNum++).padStart(4, '0')}`,
          purpose: 'Client and team meetings', trip_type: 'business', from_country_code: empByKey[tr.key].country_code, from_city: empByKey[tr.key].city,
          to_country_code: tr.to, to_city: tr.toCity, depart_date: iso(tr.depart), return_date: iso(tr.ret), estimated_cost: tr.cost,
          actual_cost: tr.status === C.TRAVEL_STATUS.COMPLETED ? tr.cost : null, currency, requires_visa: false, status: tr.status,
          approver_id: [C.TRAVEL_STATUS.SUBMITTED].includes(tr.status) ? null : adminId,
          approved_at: [C.TRAVEL_STATUS.SUBMITTED].includes(tr.status) ? null : daysAgo(6),
          booking_reference: [C.TRAVEL_STATUS.BOOKED, C.TRAVEL_STATUS.COMPLETED, C.TRAVEL_STATUS.IN_PROGRESS].includes(tr.status) ? `PNR-${travelNum}XY` : null,
        },
        { transaction: t }
      );
    }
  });

  logger.info('Demo data seeded across all modules');
}

module.exports = { seed };

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}
