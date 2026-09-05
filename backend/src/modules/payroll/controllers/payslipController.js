'use strict';

const fs = require('fs');
const { Op } = require('sequelize');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success } = require('../../../utils/response');
const { parsePagination, buildMeta } = require('../../../utils/pagination');
const { generatePdf } = require('../services/payslipPdf.service');

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.organizationId };
  if (req.query.payrun_id) where.payrun_id = req.query.payrun_id;
  if (req.query.employee_id) where.employee_id = req.query.employee_id;
  if (req.query.status) where.status = req.query.status;
  if (req.query.from) where.period_start = { [Op.gte]: req.query.from };
  if (req.query.to) where.period_end = { [Op.lte]: req.query.to };

  const { rows, count } = await models.Payslip.findAndCountAll({
    where,
    order: [['period_end', 'DESC']],
    limit,
    offset,
    include: [
      { model: models.Employee, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'employee_number'] },
      { model: models.Payrun, as: 'payrun', attributes: ['id', 'name', 'code'] },
    ],
  });
  return success(res, rows, 200, buildMeta({ page, limit, count }));
}

async function getOne(req, res) {
  const payslip = await models.Payslip.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.Payrun, as: 'payrun' },
      { model: models.Contract, as: 'contract' },
      { model: models.SalaryStructure, as: 'salary_structure' },
      { model: models.PayslipLine, as: 'lines' },
    ],
    order: [[{ model: models.PayslipLine, as: 'lines' }, 'sequence', 'ASC']],
  });
  if (!payslip) throw AppError.notFound('Payslip not found');
  return success(res, payslip);
}

async function downloadPdf(req, res) {
  const payslip = await models.Payslip.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!payslip) throw AppError.notFound('Payslip not found');
  const { path } = await generatePdf(payslip.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="payslip-${payslip.code}.pdf"`);
  const stream = fs.createReadStream(path);
  stream.pipe(res);
}

async function markSent(req, res) {
  const payslip = await models.Payslip.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!payslip) throw AppError.notFound('Payslip not found');
  payslip.sent_at = new Date();
  await payslip.save();
  return success(res, payslip);
}

module.exports = { list, getOne, downloadPdf, markSent };
