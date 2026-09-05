'use strict';

const { Op } = require('sequelize');
const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const { CONTRACT_STATUS } = require('../../../config/constants');
const contractService = require('../services/contract.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.active_on) {
    where.start_date = { [Op.lte]: req.query.active_on };
    where[Op.or] = [{ end_date: null }, { end_date: { [Op.gte]: req.query.active_on } }];
  }

  const { rows, count } = await models.Contract.findAndCountAll({
    where,
    order: [['start_date', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.SalaryStructure, as: 'salary_structure', attributes: ['id', 'name', 'code'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const contract = await models.Contract.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.SalaryStructure, as: 'salary_structure' },
    ],
  });
  if (!contract) throw AppError.notFound('Contract not found');
  return success(res, contract);
}

async function create(req, res) {
  const payload = { ...req.body, organization_id: req.user.organizationId };

  if (payload.status === CONTRACT_STATUS.ACTIVE) {
    await contractService.assertNoOverlappingActiveContract({
      employeeId: payload.employee_id,
      startDate: payload.start_date,
      endDate: payload.end_date || null,
    });
  }

  const contract = await sequelize.transaction(async (transaction) => {
    if (payload.status === CONTRACT_STATUS.ACTIVE) {
      await contractService.endPreviousActiveContracts({
        employeeId: payload.employee_id,
        newStartDate: payload.start_date,
        transaction,
      });
    }
    return models.Contract.create(payload, { transaction });
  });

  return created(res, contract);
}

async function update(req, res) {
  const contract = await models.Contract.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!contract) throw AppError.notFound('Contract not found');

  const nextStatus = req.body.status || contract.status;
  const nextStart = req.body.start_date || contract.start_date;
  const nextEnd = req.body.end_date === undefined ? contract.end_date : req.body.end_date;

  if (nextStatus === CONTRACT_STATUS.ACTIVE) {
    await contractService.assertNoOverlappingActiveContract({
      employeeId: contract.employee_id,
      startDate: nextStart,
      endDate: nextEnd || null,
      excludeId: contract.id,
    });
  }

  await contract.update(req.body);
  return success(res, contract);
}

async function activate(req, res) {
  const contract = await models.Contract.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!contract) throw AppError.notFound('Contract not found');
  if (contract.status === CONTRACT_STATUS.ACTIVE) return success(res, contract);

  await contractService.assertNoOverlappingActiveContract({
    employeeId: contract.employee_id,
    startDate: contract.start_date,
    endDate: contract.end_date,
    excludeId: contract.id,
  });

  await sequelize.transaction(async (transaction) => {
    await contractService.endPreviousActiveContracts({
      employeeId: contract.employee_id,
      newStartDate: contract.start_date,
      transaction,
    });
    contract.status = CONTRACT_STATUS.ACTIVE;
    await contract.save({ transaction });
  });

  return success(res, contract);
}

async function terminate(req, res) {
  const contract = await models.Contract.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!contract) throw AppError.notFound('Contract not found');
  contract.status = CONTRACT_STATUS.TERMINATED;
  if (!contract.end_date) contract.end_date = new Date().toISOString().slice(0, 10);
  await contract.save();
  return success(res, contract);
}

async function remove(req, res) {
  const contract = await models.Contract.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!contract) throw AppError.notFound('Contract not found');
  await contract.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, activate, terminate, remove };
