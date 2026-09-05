'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function listForEmployee(req, res) {
  const methods = await models.PaymentMethod.findAll({
    where: { organization_id: req.user.organizationId, employee_id: req.params.employeeId },
    order: [['is_primary', 'DESC'], ['created_at', 'DESC']],
  });
  return success(res, methods);
}

async function create(req, res) {
  const payload = { ...req.body, organization_id: req.user.organizationId, employee_id: req.params.employeeId };
  const method = await sequelize.transaction(async (transaction) => {
    if (payload.is_primary) {
      await models.PaymentMethod.update(
        { is_primary: false },
        { where: { employee_id: payload.employee_id }, transaction }
      );
    }
    return models.PaymentMethod.create(payload, { transaction });
  });
  return created(res, method);
}

async function update(req, res) {
  const method = await models.PaymentMethod.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!method) throw AppError.notFound('Payment method not found');
  await sequelize.transaction(async (transaction) => {
    if (req.body.is_primary) {
      await models.PaymentMethod.update(
        { is_primary: false },
        { where: { employee_id: method.employee_id }, transaction }
      );
    }
    await method.update(req.body, { transaction });
  });
  return success(res, method);
}

async function remove(req, res) {
  const method = await models.PaymentMethod.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!method) throw AppError.notFound('Payment method not found');
  await method.destroy();
  return noContent(res);
}

module.exports = { listForEmployee, create, update, remove };
