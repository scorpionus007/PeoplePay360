'use strict';

const { Op, fn, col, literal } = require('sequelize');
const { models } = require('../../../models');
const { success } = require('../../../utils/response');
const money = require('../../../utils/money');
const { PAYSLIP_STATUS } = require('../../../config/constants');

async function overview(req, res) {
  const orgId = req.user.organizationId;
  const { from, to, department_id, employee_type } = req.query;

  const payslipWhere = { organization_id: orgId };
  if (from) payslipWhere.period_start = { [Op.gte]: from };
  if (to) payslipWhere.period_end = { [Op.lte]: to };

  const employeeWhere = { organization_id: orgId };
  if (department_id) employeeWhere.department_id = department_id;
  if (employee_type) employeeWhere.employment_type = employee_type;

  const [totalPayslips, paidPayslips, employeeCount, structureCount, activeContracts] =
    await Promise.all([
      models.Payslip.count({ where: payslipWhere }),
      models.Payslip.count({ where: { ...payslipWhere, status: PAYSLIP_STATUS.PAID } }),
      models.Employee.count({ where: employeeWhere }),
      models.SalaryStructure.count({ where: { organization_id: orgId, is_active: true } }),
      models.Contract.count({ where: { organization_id: orgId, status: 'active' } }),
    ]);

  const totals = await models.Payslip.findOne({
    where: { ...payslipWhere, status: PAYSLIP_STATUS.PAID },
    attributes: [
      [fn('COALESCE', fn('SUM', col('net_amount')), 0), 'total_net'],
      [fn('COALESCE', fn('SUM', col('gross_amount')), 0), 'total_gross'],
      [fn('COALESCE', fn('SUM', col('tax_amount')), 0), 'total_tax'],
      [fn('COALESCE', fn('AVG', col('net_amount')), 0), 'avg_net'],
    ],
    raw: true,
  });

  const departmentBreakdown = await models.Payslip.findAll({
    where: { ...payslipWhere, status: PAYSLIP_STATUS.PAID },
    include: [
      {
        model: models.Employee,
        as: 'employee',
        attributes: [],
        include: [{ model: models.Department, as: 'department', attributes: [] }],
        required: true,
      },
    ],
    attributes: [
      [col('employee.department.name'), 'department'],
      [fn('COUNT', col('Payslip.id')), 'payslip_count'],
      [fn('COALESCE', fn('SUM', col('net_amount')), 0), 'total_net'],
    ],
    group: [literal('"employee->department"."name"')],
    raw: true,
  });

  return success(res, {
    kpis: {
      total_net_paid: money.round(Number(totals?.total_net || 0)),
      total_gross_paid: money.round(Number(totals?.total_gross || 0)),
      total_tax: money.round(Number(totals?.total_tax || 0)),
      average_net: money.round(Number(totals?.avg_net || 0)),
      payslips_generated: totalPayslips,
      payslips_paid: paidPayslips,
      active_contracts: activeContracts,
      employee_count: employeeCount,
      salary_structures: structureCount,
    },
    salary_cost_by_department: departmentBreakdown.map((row) => ({
      department: row.department || 'Unassigned',
      payslip_count: Number(row.payslip_count || 0),
      total_net: money.round(Number(row.total_net || 0)),
    })),
  });
}

module.exports = { overview };
