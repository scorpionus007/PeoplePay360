'use strict';

const crypto = require('crypto');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { VOUCHER_STATUS } = require('../../../config/constants');

function newVoucherCode() {
  return `GV-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

async function issue({ organizationId, employeeId, partnerName, category, amount, currency, validFrom, validTo, note, issuedBy }) {
  return models.GiftVoucher.create({
    organization_id: organizationId,
    employee_id: employeeId || null,
    code: newVoucherCode(),
    partner_name: partnerName || null,
    category: category || null,
    amount,
    currency: currency || 'USD',
    status: VOUCHER_STATUS.ISSUED,
    valid_from: validFrom || null,
    valid_to: validTo || null,
    note: note || null,
    issued_by: issuedBy || null,
  });
}

async function markDelivered({ organizationId, id }) {
  const voucher = await models.GiftVoucher.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!voucher) throw AppError.notFound('Voucher not found');
  if (voucher.status !== VOUCHER_STATUS.ISSUED) {
    throw AppError.conflict('Only issued vouchers can be marked delivered');
  }
  voucher.status = VOUCHER_STATUS.DELIVERED;
  voucher.delivered_at = new Date();
  await voucher.save();
  return voucher;
}

async function redeem({ organizationId, id, redemptionReference }) {
  const voucher = await models.GiftVoucher.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!voucher) throw AppError.notFound('Voucher not found');
  if (![VOUCHER_STATUS.ISSUED, VOUCHER_STATUS.DELIVERED].includes(voucher.status)) {
    throw AppError.conflict('Voucher cannot be redeemed in current state');
  }
  if (voucher.valid_to && new Date(voucher.valid_to) < new Date()) {
    voucher.status = VOUCHER_STATUS.EXPIRED;
    await voucher.save();
    throw AppError.conflict('Voucher has expired');
  }
  voucher.status = VOUCHER_STATUS.REDEEMED;
  voucher.redeemed_at = new Date();
  voucher.redemption_reference = redemptionReference || null;
  await voucher.save();
  return voucher;
}

async function cancel({ organizationId, id }) {
  const voucher = await models.GiftVoucher.findOne({
    where: { id, organization_id: organizationId },
  });
  if (!voucher) throw AppError.notFound('Voucher not found');
  if ([VOUCHER_STATUS.REDEEMED, VOUCHER_STATUS.EXPIRED].includes(voucher.status)) {
    throw AppError.conflict('Voucher is already terminal');
  }
  voucher.status = VOUCHER_STATUS.CANCELLED;
  await voucher.save();
  return voucher;
}

module.exports = { issue, markDelivered, redeem, cancel };
