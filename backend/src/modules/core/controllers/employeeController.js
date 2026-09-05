'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.search) {
    where[Op.or] = [
      { first_name: { [Op.iLike]: `%${req.query.search}%` } },
      { last_name: { [Op.iLike]: `%${req.query.search}%` } },
      { email_work: { [Op.iLike]: `%${req.query.search}%` } },
      { employee_number: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }
  if (req.query.department_id) where.department_id = req.query.department_id;
  if (req.query.employment_status) where.employment_status = req.query.employment_status;
  if (req.query.employment_type) where.employment_type = req.query.employment_type;

  const { rows, count } = await models.Employee.findAndCountAll({
    where,
    order: [['first_name', 'ASC']],
    limit,
    offset,
    include: [
      { model: models.Department, as: 'department', attributes: ['id', 'name', 'code'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const row = await models.Employee.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Department, as: 'department' },
      { model: models.Employee, as: 'manager', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
    ],
  });
  if (!row) throw AppError.notFound('Employee not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await models.Employee.create({ ...req.body, organization_id: req.user.organizationId });
  return created(res, row);
}

async function update(req, res) {
  const row = await models.Employee.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Employee not found');
  await row.update(req.body);
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.Employee.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Employee not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
