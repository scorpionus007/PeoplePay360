'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { models } = require('../../../models');
const AppError = require('../../../utils/AppError');

const OUTPUT_DIR = path.join(process.cwd(), 'generated', 'payslips');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function fmt(amount, currency) {
  const n = Number(amount || 0);
  return `${currency || ''} ${n.toFixed(2)}`.trim();
}

async function loadPayslipForPdf(id) {
  const payslip = await models.Payslip.findByPk(id, {
    include: [
      { model: models.Employee, as: 'employee' },
      { model: models.Payrun, as: 'payrun' },
      { model: models.Contract, as: 'contract' },
      { model: models.SalaryStructure, as: 'salary_structure' },
      { model: models.PayslipLine, as: 'lines' },
    ],
  });
  if (!payslip) throw AppError.notFound('Payslip not found');
  return payslip;
}

function drawHeader(doc, payslip) {
  doc.fontSize(18).text('PeoplePay360', { align: 'left' });
  doc.fontSize(10).fillColor('#555').text('Payslip', { align: 'left' });
  doc.moveDown(0.5);
  doc.fillColor('#000');
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
  doc.moveDown(0.5);

  const employeeName = payslip.employee
    ? `${payslip.employee.first_name} ${payslip.employee.last_name}`.trim()
    : 'Employee';

  const meta = [
    ['Employee', employeeName],
    ['Employee Number', payslip.employee ? payslip.employee.employee_number : ''],
    ['Payslip Code', payslip.code],
    ['Period', `${payslip.period_start} to ${payslip.period_end}`],
    ['Payrun', payslip.payrun ? payslip.payrun.name : ''],
    ['Structure', payslip.salary_structure ? payslip.salary_structure.name : ''],
    ['Currency', payslip.currency],
    ['Status', payslip.status],
  ];

  doc.fontSize(10);
  const colStart = 50;
  const colValue = 200;
  meta.forEach(([label, value]) => {
    doc.fillColor('#6b7280').text(label, colStart, doc.y, { continued: false });
    doc.fillColor('#111827').text(value || '-', colValue, doc.y - 12);
    doc.moveDown(0.15);
  });
  doc.moveDown(0.5);
}

function drawLinesTable(doc, payslip) {
  const rows = (payslip.lines || []).sort((a, b) => (a.sequence || 100) - (b.sequence || 100));
  doc.moveDown(0.4);
  doc.fontSize(12).fillColor('#111827').text('Salary Breakdown');
  doc.moveDown(0.2);

  const headers = ['Code', 'Description', 'Category', 'Amount'];
  const widths = [90, 220, 100, 90];
  const startX = 50;
  let y = doc.y;

  doc.fontSize(10).fillColor('#6b7280');
  headers.forEach((h, i) => {
    doc.text(h, startX + widths.slice(0, i).reduce((a, b) => a + b, 0), y);
  });
  y += 15;
  doc.moveTo(startX, y - 3).lineTo(545, y - 3).strokeColor('#e5e7eb').stroke();

  doc.fillColor('#111827');
  rows.forEach((line) => {
    const values = [
      line.rule_code,
      line.rule_name,
      line.category,
      fmt(line.amount, payslip.currency),
    ];
    values.forEach((v, i) => {
      doc.text(String(v), startX + widths.slice(0, i).reduce((a, b) => a + b, 0), y, {
        width: widths[i] - 5,
      });
    });
    y += 16;
    if (y > 720) {
      doc.addPage();
      y = 50;
    }
  });

  doc.y = y + 5;
}

function drawTotals(doc, payslip) {
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#111827').text('Summary');
  doc.moveDown(0.2);
  doc.fontSize(10);

  const totals = [
    ['Basic', payslip.basic_amount],
    ['Allowances', payslip.allowances_amount],
    ['Gross', payslip.gross_amount],
    ['Deductions', payslip.deductions_amount],
    ['Tax', payslip.tax_amount],
    ['Contributions', payslip.contribution_amount],
    ['Advance Recovery', payslip.advance_recovery_amount],
    ['Net Pay', payslip.net_amount],
  ];

  totals.forEach(([label, value]) => {
    doc.fillColor('#6b7280').text(label, 320, doc.y, { continued: false });
    doc.fillColor('#111827').text(fmt(value, payslip.currency), 460, doc.y - 12, {
      align: 'right',
      width: 85,
    });
    doc.moveDown(0.15);
  });
}

async function generatePdf(id) {
  ensureDir(OUTPUT_DIR);
  const payslip = await loadPayslipForPdf(id);
  const outPath = path.join(OUTPUT_DIR, `payslip-${payslip.code}.pdf`);

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outPath);
    doc.pipe(stream);
    drawHeader(doc, payslip);
    drawLinesTable(doc, payslip);
    drawTotals(doc, payslip);
    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  payslip.pdf_path = outPath;
  await payslip.save();
  return { path: outPath, payslip };
}

module.exports = { generatePdf, OUTPUT_DIR };
