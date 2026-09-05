'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function list(req, res) {
  const rows = await models.Department.findAll({
    where: { organization_id: req.user.organizationId },
    order: [['name', 'ASC']],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.Department.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Department not found');
  return success(res, row);
}

async function assertParentValid(childId, parentId, orgId) {
  if (!parentId) return;
  if (childId && parentId === childId) throw AppError.unprocessable('A department cannot be its own parent');
  // Walk up the parent chain to reject cycles and confirm org ownership.
  let current = parentId;
  const seen = new Set(childId ? [childId] : []);
  while (current) {
    if (seen.has(current)) throw AppError.unprocessable('Parent assignment creates a department cycle');
    seen.add(current);
    const parent = await models.Department.findOne({
      where: { id: current, organization_id: orgId },
      attributes: ['id', 'parent_id'],
    });
    if (!parent) throw AppError.unprocessable('Parent department does not belong to your organization');
    current = parent.parent_id;
  }
}

async function create(req, res) {
  const orgId = req.user.organizationId;
  await assertParentValid(null, req.body.parent_id, orgId);
  const row = await models.Department.create({ ...req.body, organization_id: orgId });
  return created(res, row);
}

async function update(req, res) {
  const orgId = req.user.organizationId;
  const row = await models.Department.findOne({ where: { id: req.params.id, organization_id: orgId } });
  if (!row) throw AppError.notFound('Department not found');
  await assertParentValid(row.id, req.body.parent_id, orgId);
  await row.update(req.body);
  return success(res, row);
}

async function remove(req, res) {
  const orgId = req.user.organizationId;
  const row = await models.Department.findOne({ where: { id: req.params.id, organization_id: orgId } });
  if (!row) throw AppError.notFound('Department not found');
  const [employeeCount, childCount] = await Promise.all([
    models.Employee.count({ where: { organization_id: orgId, department_id: row.id } }),
    models.Department.count({ where: { organization_id: orgId, parent_id: row.id } }),
  ]);
  if (employeeCount > 0) throw AppError.conflict('Cannot delete a department that still has employees; reassign them first');
  if (childCount > 0) throw AppError.conflict('Cannot delete a department that has sub-departments; remove or reparent them first');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
