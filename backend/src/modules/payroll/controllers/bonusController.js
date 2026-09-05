'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.bonus_type) where.bonus_type = req.query.bonus_type;

  const { rows, count } = await models.BonusRecord.findAndCountAll({
    where,
    order: [['grant_date', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function create(req, res) {
  const payload = { ...req.body, organization_id: req.user.organizationId };
  const bonus = await models.BonusRecord.create(payload);
  return created(res, bonus);
}

async function approve(req, res) {
  const bonus = await models.BonusRecord.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!bonus) throw AppError.notFound('Bonus not found');
  bonus.status = 'approved';
  bonus.approved_by = req.user.id;
  bonus.approved_at = new Date();
  await bonus.save();
  return success(res, bonus);
}

async function cancel(req, res) {
  const bonus = await models.BonusRecord.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!bonus) throw AppError.notFound('Bonus not found');
  bonus.status = 'cancelled';
  await bonus.save();
  return success(res, bonus);
}

async function remove(req, res) {
  const bonus = await models.BonusRecord.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!bonus) throw AppError.notFound('Bonus not found');
  await bonus.destroy();
  return noContent(res);
}

module.exports = { list, create, approve, cancel, remove };
