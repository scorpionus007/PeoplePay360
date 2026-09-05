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

async function assertOrgOwned(model, id, orgId, label) {
  if (!id) return;
  const found = await model.findOne({ where: { id, organization_id: orgId } });
  if (!found) throw AppError.unprocessable(`${label} does not belong to your organization`);
}

// Walk the manager chain to ensure setting employeeId's manager to managerId
// does not create a cycle (A manages B manages ... manages A).
async function assertNoManagerCycle(employeeId, managerId, orgId) {
  let current = managerId;
  const seen = new Set(employeeId ? [employeeId] : []);
  while (current) {
    if (seen.has(current)) throw AppError.unprocessable('Manager assignment creates a reporting cycle');
    seen.add(current);
    const mgr = await models.Employee.findOne({ where: { id: current, organization_id: orgId }, attributes: ['id', 'manager_id'] });
    current = mgr ? mgr.manager_id : null;
  }
}

async function create(req, res) {
  const orgId = req.user.organizationId;
  await assertOrgOwned(models.Department, req.body.department_id, orgId, 'Department');
  await assertOrgOwned(models.Employee, req.body.manager_id, orgId, 'Manager');
  if (req.body.manager_id) await assertNoManagerCycle(null, req.body.manager_id, orgId);
  const row = await models.Employee.create({ ...req.body, organization_id: orgId });
  return created(res, row);
}

async function update(req, res) {
  const orgId = req.user.organizationId;
  const row = await models.Employee.findOne({ where: { id: req.params.id, organization_id: orgId } });
  if (!row) throw AppError.notFound('Employee not found');
  await assertOrgOwned(models.Department, req.body.department_id, orgId, 'Department');
  await assertOrgOwned(models.Employee, req.body.manager_id, orgId, 'Manager');
  if (req.body.manager_id) {
    if (req.body.manager_id === row.id) throw AppError.unprocessable('An employee cannot be their own manager');
    await assertNoManagerCycle(row.id, req.body.manager_id, orgId);
  }
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
