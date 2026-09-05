'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');
const workingScheduleService = require('../services/workingSchedule.service');

async function list(req, res) {
  const rows = await models.WorkingSchedule.findAll({
    where: { organization_id: req.user.organizationId },
    include: [{ model: models.WorkingScheduleDay, as: 'days' }],
    order: [
      ['name', 'ASC'],
      [{ model: models.WorkingScheduleDay, as: 'days' }, 'day_of_week', 'ASC'],
    ],
  });
  return success(res, rows);
}

async function getOne(req, res) {
  const row = await models.WorkingSchedule.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [{ model: models.WorkingScheduleDay, as: 'days' }],
    order: [[{ model: models.WorkingScheduleDay, as: 'days' }, 'day_of_week', 'ASC']],
  });
  if (!row) throw AppError.notFound('Working schedule not found');
  return success(res, row);
}

async function create(req, res) {
  const row = await workingScheduleService.create({
    organizationId: req.user.organizationId,
    payload: req.body,
  });
  return created(res, row);
}

async function update(req, res) {
  const row = await workingScheduleService.update({
    organizationId: req.user.organizationId,
    id: req.params.id,
    payload: req.body,
  });
  return success(res, row);
}

async function remove(req, res) {
  const row = await models.WorkingSchedule.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Working schedule not found');
  await row.destroy();
  return noContent(res);
}

module.exports = { list, getOne, create, update, remove };
