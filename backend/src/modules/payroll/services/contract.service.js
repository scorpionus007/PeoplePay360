'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { CONTRACT_STATUS } = require('../../../config/constants');

async function getActiveContractForPeriod({ employeeId, periodStart, periodEnd }) {
  return models.Contract.findOne({
    where: {
      employee_id: employeeId,
      status: CONTRACT_STATUS.ACTIVE,
      start_date: { [Op.lte]: periodEnd },
      [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: periodStart } }],
    },
    order: [['start_date', 'DESC']],
    include: [{ model: models.SalaryStructure, as: 'salary_structure' }],
  });
}

async function assertNoOverlappingActiveContract({ employeeId, startDate, endDate, excludeId }) {
  const where = {
    employee_id: employeeId,
    status: CONTRACT_STATUS.ACTIVE,
    start_date: { [Op.lte]: endDate || '9999-12-31' },
    [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: startDate } }],
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  const overlap = await models.Contract.findOne({ where });
  if (overlap) {
    throw AppError.conflict('An active contract already covers this period for the employee', {
      conflicting_contract_id: overlap.id,
    });
  }
}

async function endPreviousActiveContracts({ employeeId, newStartDate, transaction }) {
  const dayBefore = new Date(newStartDate);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const cutoff = dayBefore.toISOString().slice(0, 10);

  await models.Contract.update(
    { status: CONTRACT_STATUS.EXPIRED, end_date: cutoff },
    {
      where: {
        employee_id: employeeId,
        status: CONTRACT_STATUS.ACTIVE,
        start_date: { [Op.lt]: newStartDate },
        [Op.or]: [{ end_date: null }, { end_date: { [Op.gte]: newStartDate } }],
      },
      transaction,
    }
  );
}

module.exports = {
  getActiveContractForPeriod,
  assertNoOverlappingActiveContract,
  endPreviousActiveContracts,
};
