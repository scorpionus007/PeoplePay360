'use strict';

const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const voucher = require('../services/voucher.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.status) where.status = req.query.status;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  const { rows, count } = await models.GiftVoucher.findAndCountAll({
    where,
    order: [['issued_at', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function issue(req, res) {
  const row = await voucher.issue({
    organizationId: req.user.organizationId,
    employeeId: req.body.employee_id || null,
    partnerName: req.body.partner_name,
    category: req.body.category,
    amount: req.body.amount,
    currency: req.body.currency,
    validFrom: req.body.valid_from,
    validTo: req.body.valid_to,
    note: req.body.note,
    issuedBy: req.user.id,
  });
  return created(res, row);
}

async function markDelivered(req, res) {
  const row = await voucher.markDelivered({
    organizationId: req.user.organizationId,
    id: req.params.id,
  });
  return success(res, row);
}

async function redeem(req, res) {
  const row = await voucher.redeem({
    organizationId: req.user.organizationId,
    id: req.params.id,
    redemptionReference: req.body.redemption_reference,
  });
  return success(res, row);
}

async function cancel(req, res) {
  const row = await voucher.cancel({
    organizationId: req.user.organizationId,
    id: req.params.id,
  });
  return success(res, row);
}

module.exports = { list, issue, markDelivered, redeem, cancel };
