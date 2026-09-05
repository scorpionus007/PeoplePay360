'use strict';

const { Op } = require('sequelize');
const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const money = require('../../../utils/money');
const {
  PAYRUN_STATUS,
  PAYSLIP_STATUS,
  EMPLOYMENT_STATUS,
  ADVANCE_SALARY_STATUS,
  ADVANCE_SALARY_REPAYMENT_MODE,
  SALARY_RULE_CATEGORY,
  CONTRACT_STATUS,
} = require('../../../config/constants');
const contractService = require('./contract.service');
const { computePayslipBreakdown } = require('./payrollComputation.service');

async function listEligibleEmployees({ organizationId, periodStart, periodEnd, departmentIds, employeeTypes }) {
  const where = {
    organization_id: organizationId,
    employment_status: { [Op.in]: [EMPLOYMENT_STATUS.ACTIVE, EMPLOYMENT_STATUS.ON_LEAVE] },
  };
  if (Array.isArray(departmentIds) && departmentIds.length) where.department_id = { [Op.in]: departmentIds };
  if (Array.isArray(employeeTypes) && employeeTypes.length) where.employment_type = { [Op.in]: employeeTypes };

  const employees = await models.Employee.findAll({
    where,
    include: [
      {
        model: models.Contract,
        as: 'contracts',
        required: false,
        where: {
          status: CONTRACT_STATUS.ACTIVE,
          start_date: { [Op.lte]: periodEnd },
          [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: periodStart } }],
        },
      },
    ],
    order: [['first_name', 'ASC']],
  });

  return employees.map((emp) => ({
    id: emp.id,
    employee_number: emp.employee_number,
    full_name: `${emp.first_name} ${emp.last_name}`.trim(),
    department_id: emp.department_id,
    employment_type: emp.employment_type,
    active_contract: emp.contracts && emp.contracts[0] ? emp.contracts[0] : null,
  }));
}

async function createPayrun({
  organizationId,
  name,
  code,
  salaryStructureId,
  periodStart,
  periodEnd,
  paymentDate,
  currency,
  employeeIds,
  departmentScope,
  employeeTypeScope,
  createdBy,
}) {
  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    throw AppError.badRequest('At least one employee must be selected');
  }
  if (!periodStart || !periodEnd) throw AppError.badRequest('Period start and end are required');
  if (new Date(periodStart) > new Date(periodEnd)) {
    throw AppError.badRequest('Period start must be before period end');
  }

  return sequelize.transaction(async (transaction) => {
    const payrun = await models.Payrun.create(
      {
        organization_id: organizationId,
        name,
        code,
        salary_structure_id: salaryStructureId || null,
        period_start: periodStart,
        period_end: periodEnd,
        payment_date: paymentDate || null,
        currency: currency || 'USD',
        status: PAYRUN_STATUS.DRAFT,
        department_scope: departmentScope || null,
        employee_type_scope: employeeTypeScope || null,
        created_by: createdBy || null,
      },
      { transaction }
    );

    for (const employeeId of employeeIds) {
      await models.Payslip.create(
        {
          organization_id: organizationId,
          payrun_id: payrun.id,
          employee_id: employeeId,
          period_start: periodStart,
          period_end: periodEnd,
          currency: currency || 'USD',
          code: `${code}-${employeeId.slice(0, 8)}`,
          status: PAYSLIP_STATUS.DRAFT,
        },
        { transaction }
      );
    }

    return payrun;
  });
}

async function computePayrun(payrunId) {
  return sequelize.transaction(async (transaction) => {
    const payrun = await models.Payrun.findByPk(payrunId, {
      include: [{ model: models.SalaryStructure, as: 'salary_structure' }],
      transaction,
    });
    if (!payrun) throw AppError.notFound('Payrun not found');
    if (![PAYRUN_STATUS.DRAFT, PAYRUN_STATUS.COMPUTED].includes(payrun.status)) {
      throw AppError.conflict('Payrun cannot be computed in current state');
    }

    const payslips = await models.Payslip.findAll({
      where: { payrun_id: payrunId },
      include: [{ model: models.Employee, as: 'employee' }],
      transaction,
    });

    const warnings = [];
    const runTotals = {
      basic: 0,
      allowances: 0,
      gross: 0,
      deductions: 0,
      tax: 0,
      contributions: 0,
      net: 0,
      advance_recovery: 0,
    };

    for (const payslip of payslips) {
      const contract = await contractService.getActiveContractForPeriod({
        employeeId: payslip.employee_id,
        periodStart: payrun.period_start,
        periodEnd: payrun.period_end,
      });

      if (!contract) {
        warnings.push({
          code: 'NO_ACTIVE_CONTRACT',
          payslip_id: payslip.id,
          employee_id: payslip.employee_id,
          message: `No active contract for employee ${payslip.employee_id} in period`,
        });
        payslip.warnings = [{ code: 'NO_ACTIVE_CONTRACT', message: 'No active contract for the period' }];
        payslip.status = PAYSLIP_STATUS.DRAFT;
        await payslip.save({ transaction });
        continue;
      }

      const structureId = payrun.salary_structure_id || contract.salary_structure_id;
      const structureRules = structureId
        ? await models.SalaryStructureRule.findAll({
            where: { salary_structure_id: structureId, is_active: true },
            include: [{ model: models.SalaryRule, as: 'rule' }],
            order: [['sequence', 'ASC']],
            transaction,
          })
        : [];

      // Bonuses that fall in this period and are approved but not yet paid.
      const bonuses = await models.BonusRecord.findAll({
        where: {
          employee_id: payslip.employee_id,
          status: 'approved',
          [Op.or]: [
            { payout_period: { [Op.between]: [payrun.period_start, payrun.period_end] } },
            { grant_date: { [Op.between]: [payrun.period_start, payrun.period_end] } },
          ],
        },
        transaction,
      });

      const extras = bonuses.map((b) => ({
        salary_rule_id: null,
        code: `BONUS_${b.bonus_type.toUpperCase()}`,
        name: `Bonus (${b.bonus_type})`,
        category: b.taxable ? SALARY_RULE_CATEGORY.ALLOWANCE : SALARY_RULE_CATEGORY.ALLOWANCE,
        amount: money.toNumber(b.amount),
        note: b.reason || null,
      }));

      const breakdown = computePayslipBreakdown({
        contract,
        structureRules,
        workedDays: null,
        workedHours: null,
        extras,
      });

      // Advance salary recovery: settle outstanding for this employee.
      const advances = await models.AdvanceSalaryRequest.findAll({
        where: {
          employee_id: payslip.employee_id,
          status: { [Op.in]: [ADVANCE_SALARY_STATUS.DISBURSED, ADVANCE_SALARY_STATUS.RECOVERING] },
          repayment_mode: { [Op.in]: [ADVANCE_SALARY_REPAYMENT_MODE.SALARY_DEDUCTION, ADVANCE_SALARY_REPAYMENT_MODE.EMI] },
        },
        transaction,
      });

      let recoveryTotal = 0;
      for (const adv of advances) {
        let installment = 0;
        if (adv.repayment_mode === ADVANCE_SALARY_REPAYMENT_MODE.SALARY_DEDUCTION) {
          installment = money.toNumber(adv.outstanding_amount);
        } else if (adv.repayment_mode === ADVANCE_SALARY_REPAYMENT_MODE.EMI) {
          const months = Math.max(1, parseInt(adv.emi_months || 1, 10));
          installment = money.divide(money.toNumber(adv.approved_amount || adv.requested_amount), months);
          installment = Math.min(installment, money.toNumber(adv.outstanding_amount));
        }
        if (installment > 0) {
          recoveryTotal = money.add(recoveryTotal, installment);
          breakdown.lines.push({
            salary_rule_id: null,
            sequence: 990,
            rule_code: 'ADV_RECOVERY',
            rule_name: 'Advance salary recovery',
            category: SALARY_RULE_CATEGORY.DEDUCTION,
            quantity: 1,
            rate: installment,
            amount: installment,
            note: `Recovery for advance ${adv.id}`,
          });
        }
      }

      const deductionsWithRecovery = money.add(breakdown.totals.deductions, recoveryTotal);
      const netFinal = money.subtract(
        breakdown.totals.gross,
        money.add(deductionsWithRecovery, breakdown.totals.tax, breakdown.totals.contributions)
      );

      // Reset lines and status.
      await models.PayslipLine.destroy({ where: { payslip_id: payslip.id }, transaction });
      for (const line of breakdown.lines) {
        await models.PayslipLine.create({ ...line, payslip_id: payslip.id }, { transaction });
      }

      const payslipWarnings = [];
      if (!payslip.employee.bank_account_number && !payslip.employee.iban) {
        payslipWarnings.push({ code: 'MISSING_BANK_DETAILS', message: 'Employee has no bank details on file' });
      }
      if (netFinal <= 0) {
        payslipWarnings.push({ code: 'NON_POSITIVE_NET', message: 'Computed net salary is not positive' });
      }

      payslip.contract_id = contract.id;
      payslip.salary_structure_id = structureId || null;
      payslip.basic_amount = breakdown.totals.basic;
      payslip.allowances_amount = breakdown.totals.allowances;
      payslip.deductions_amount = deductionsWithRecovery;
      payslip.gross_amount = breakdown.totals.gross;
      payslip.tax_amount = breakdown.totals.tax;
      payslip.contribution_amount = breakdown.totals.contributions;
      payslip.net_amount = netFinal;
      payslip.advance_recovery_amount = recoveryTotal;
      payslip.warnings = payslipWarnings;
      payslip.status = PAYSLIP_STATUS.COMPUTED;
      payslip.computed_at = new Date();
      await payslip.save({ transaction });

      runTotals.basic = money.add(runTotals.basic, breakdown.totals.basic);
      runTotals.allowances = money.add(runTotals.allowances, breakdown.totals.allowances);
      runTotals.gross = money.add(runTotals.gross, breakdown.totals.gross);
      runTotals.deductions = money.add(runTotals.deductions, deductionsWithRecovery);
      runTotals.tax = money.add(runTotals.tax, breakdown.totals.tax);
      runTotals.contributions = money.add(runTotals.contributions, breakdown.totals.contributions);
      runTotals.net = money.add(runTotals.net, netFinal);
      runTotals.advance_recovery = money.add(runTotals.advance_recovery, recoveryTotal);

      if (payslipWarnings.length) {
        for (const w of payslipWarnings) {
          warnings.push({ ...w, payslip_id: payslip.id, employee_id: payslip.employee_id });
        }
      }
    }

    // Detect duplicate payslips across payruns for the same period + employee.
    for (const payslip of payslips) {
      const duplicate = await models.Payslip.findOne({
        where: {
          organization_id: payslip.organization_id,
          employee_id: payslip.employee_id,
          period_start: payslip.period_start,
          period_end: payslip.period_end,
          id: { [Op.ne]: payslip.id },
        },
        transaction,
      });
      if (duplicate) {
        warnings.push({
          code: 'DUPLICATE_PAYSLIP',
          payslip_id: payslip.id,
          employee_id: payslip.employee_id,
          duplicate_payslip_id: duplicate.id,
          message: 'Another payslip exists for the same employee and period',
        });
      }
    }

    payrun.warnings = warnings;
    payrun.totals = runTotals;
    payrun.status = PAYRUN_STATUS.COMPUTED;
    await payrun.save({ transaction });

    return payrun;
  });
}

async function validatePayrun({ id, validatedBy }) {
  const payrun = await models.Payrun.findByPk(id);
  if (!payrun) throw AppError.notFound('Payrun not found');
  if (payrun.status !== PAYRUN_STATUS.COMPUTED) {
    throw AppError.conflict('Only computed payruns can be validated');
  }
  const blocking = (payrun.warnings || []).filter((w) => w.code === 'NO_ACTIVE_CONTRACT' || w.code === 'NON_POSITIVE_NET');
  if (blocking.length) {
    throw AppError.unprocessable('Payrun has blocking warnings', { warnings: blocking });
  }
  payrun.status = PAYRUN_STATUS.VALIDATED;
  payrun.validated_by = validatedBy;
  payrun.validated_at = new Date();
  await payrun.save();
  await models.Payslip.update(
    { status: PAYSLIP_STATUS.VALIDATED, validated_at: new Date() },
    { where: { payrun_id: id, status: PAYSLIP_STATUS.COMPUTED } }
  );
  return payrun;
}

async function markPaid({ id, releasedBy }) {
  return sequelize.transaction(async (transaction) => {
    const payrun = await models.Payrun.findByPk(id, { transaction });
    if (!payrun) throw AppError.notFound('Payrun not found');
    if (payrun.status !== PAYRUN_STATUS.VALIDATED) {
      throw AppError.conflict('Only validated payruns can be marked as paid');
    }

    const payslips = await models.Payslip.findAll({ where: { payrun_id: id }, transaction });
    const now = new Date();

    for (const payslip of payslips) {
      payslip.status = PAYSLIP_STATUS.PAID;
      payslip.paid_at = now;
      await payslip.save({ transaction });

      await models.PayrollTransaction.create(
        {
          organization_id: payslip.organization_id,
          payslip_id: payslip.id,
          payrun_id: payrun.id,
          employee_id: payslip.employee_id,
          transaction_type: 'salary',
          amount: money.toNumber(payslip.net_amount),
          currency: payslip.currency,
          status: 'completed',
          initiated_by: releasedBy,
          initiated_at: now,
          completed_at: now,
        },
        { transaction }
      );

      // Reflect advance recovery via repayment records for anything deducted here.
      const recovery = money.toNumber(payslip.advance_recovery_amount);
      if (recovery > 0) {
        const advances = await models.AdvanceSalaryRequest.findAll({
          where: {
            employee_id: payslip.employee_id,
            status: { [Op.in]: [ADVANCE_SALARY_STATUS.DISBURSED, ADVANCE_SALARY_STATUS.RECOVERING] },
            repayment_mode: { [Op.in]: [ADVANCE_SALARY_REPAYMENT_MODE.SALARY_DEDUCTION, ADVANCE_SALARY_REPAYMENT_MODE.EMI] },
          },
          transaction,
        });
        let remaining = recovery;
        for (const adv of advances) {
          if (remaining <= 0) break;
          const outstanding = money.toNumber(adv.outstanding_amount);
          const applied = Math.min(outstanding, remaining);
          if (applied > 0) {
            await models.AdvanceSalaryRepayment.create(
              {
                advance_salary_request_id: adv.id,
                payslip_id: payslip.id,
                mode: adv.repayment_mode,
                amount: applied,
                currency: adv.currency,
                note: `Auto recovered on payslip ${payslip.code}`,
              },
              { transaction }
            );
            const newOutstanding = Math.max(0, money.subtract(outstanding, applied));
            adv.outstanding_amount = newOutstanding;
            if (newOutstanding <= 0) {
              adv.status = ADVANCE_SALARY_STATUS.SETTLED;
              adv.settled_at = now;
            } else {
              adv.status = ADVANCE_SALARY_STATUS.RECOVERING;
            }
            await adv.save({ transaction });
            remaining = money.subtract(remaining, applied);
          }
        }
      }
    }

    payrun.status = PAYRUN_STATUS.PAID;
    payrun.released_by = releasedBy;
    payrun.released_at = now;
    await payrun.save({ transaction });

    return payrun;
  });
}

module.exports = {
  listEligibleEmployees,
  createPayrun,
  computePayrun,
  validatePayrun,
  markPaid,
};
