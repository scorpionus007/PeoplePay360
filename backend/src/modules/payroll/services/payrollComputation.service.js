'use strict';

const money = require('../../../utils/money');
const { SALARY_RULE_CATEGORY, SALARY_RULE_COMPUTE_TYPE } = require('../../../config/constants');

// Category aggregates that later rules can reference via percent_of_category.
const CATEGORY_TOTALS_KEYS = Object.values(SALARY_RULE_CATEGORY);

function initTotals() {
  const totals = {};
  for (const key of CATEGORY_TOTALS_KEYS) totals[key] = 0;
  return totals;
}

function safeFormula(formula, context) {
  // Very small allow list based sandbox. We intentionally do not use eval on raw input.
  // Supported tokens: numbers, + - * / ( ) . and identifier lookups from the context bag.
  const allowed = /^[\d+\-*/().\s\w]*$/;
  if (!allowed.test(formula)) return 0;

  // Replace identifiers with context values.
  const keys = Object.keys(context).sort((a, b) => b.length - a.length);
  let expression = formula;
  for (const key of keys) {
    const regex = new RegExp(`\\b${key}\\b`, 'g');
    expression = expression.replace(regex, String(money.toNumber(context[key])));
  }
  // If any word characters remain, treat as invalid.
  if (/[a-zA-Z_]/.test(expression)) return 0;
  try {
    // eslint-disable-next-line no-new-func
    const value = Function(`"use strict"; return (${expression});`)();
    return money.toNumber(value);
  } catch (_err) {
    return 0;
  }
}

function computeRuleAmount({ rule, structureRule, basic, totals, contract, workedDays, workedHours }) {
  const computeType = rule.compute_type;

  const overrideAmount = structureRule?.override_amount;
  const overridePercent = structureRule?.override_percent;

  if (computeType === SALARY_RULE_COMPUTE_TYPE.FIXED) {
    if (overrideAmount !== null && overrideAmount !== undefined) return money.toNumber(overrideAmount);
    return money.toNumber(rule.fixed_amount);
  }

  if (computeType === SALARY_RULE_COMPUTE_TYPE.PERCENT_OF_BASIC) {
    const pct = overridePercent ?? rule.percent_value ?? 0;
    return money.percentOf(basic, pct);
  }

  if (computeType === SALARY_RULE_COMPUTE_TYPE.PERCENT_OF_GROSS) {
    const pct = overridePercent ?? rule.percent_value ?? 0;
    return money.percentOf(totals[SALARY_RULE_CATEGORY.GROSS], pct);
  }

  if (computeType === SALARY_RULE_COMPUTE_TYPE.PERCENT_OF_CATEGORY) {
    const pct = overridePercent ?? rule.percent_value ?? 0;
    const cat = rule.percent_of_category || SALARY_RULE_CATEGORY.BASIC;
    return money.percentOf(totals[cat] || 0, pct);
  }

  if (computeType === SALARY_RULE_COMPUTE_TYPE.FORMULA) {
    const context = {
      BASIC: basic,
      GROSS: totals[SALARY_RULE_CATEGORY.GROSS],
      ALLOWANCE: totals[SALARY_RULE_CATEGORY.ALLOWANCE],
      DEDUCTION: totals[SALARY_RULE_CATEGORY.DEDUCTION],
      TAX: totals[SALARY_RULE_CATEGORY.TAX],
      CONTRIBUTION: totals[SALARY_RULE_CATEGORY.CONTRIBUTION],
      NET: totals[SALARY_RULE_CATEGORY.NET],
      WORKED_DAYS: money.toNumber(workedDays),
      WORKED_HOURS: money.toNumber(workedHours),
      WAGE: money.toNumber(contract?.wage_amount),
    };
    return safeFormula(rule.formula || '', context);
  }

  return 0;
}

function computePayslipBreakdown({ contract, structureRules, workedDays, workedHours, extras }) {
  // extras: [{ salary_rule_id, code, name, category, amount }]
  const totals = initTotals();
  const lines = [];

  const basicFromContract = money.toNumber(contract?.wage_amount);
  totals[SALARY_RULE_CATEGORY.BASIC] = basicFromContract;

  const sorted = [...structureRules].sort((a, b) => (a.sequence || 100) - (b.sequence || 100));

  for (const sr of sorted) {
    const rule = sr.rule;
    if (!rule || !rule.is_active || !sr.is_active) continue;

    const amount = computeRuleAmount({
      rule,
      structureRule: sr,
      basic: totals[SALARY_RULE_CATEGORY.BASIC] || basicFromContract,
      totals,
      contract,
      workedDays,
      workedHours,
    });

    lines.push({
      salary_rule_id: rule.id,
      sequence: sr.sequence || 100,
      rule_code: rule.code,
      rule_name: rule.name,
      category: rule.category,
      quantity: 1,
      rate: amount,
      amount,
    });

    totals[rule.category] = money.add(totals[rule.category] || 0, amount);
  }

  // Merge extras such as bonuses that the caller supplies.
  if (Array.isArray(extras)) {
    for (const extra of extras) {
      lines.push({
        salary_rule_id: extra.salary_rule_id || null,
        sequence: extra.sequence || 950,
        rule_code: extra.code,
        rule_name: extra.name,
        category: extra.category,
        quantity: 1,
        rate: money.toNumber(extra.amount),
        amount: money.toNumber(extra.amount),
        note: extra.note || null,
      });
      totals[extra.category] = money.add(totals[extra.category] || 0, extra.amount);
    }
  }

  const basic = totals[SALARY_RULE_CATEGORY.BASIC] || basicFromContract;
  const allowances = totals[SALARY_RULE_CATEGORY.ALLOWANCE] || 0;
  const gross =
    totals[SALARY_RULE_CATEGORY.GROSS] > 0
      ? totals[SALARY_RULE_CATEGORY.GROSS]
      : money.add(basic, allowances);
  const deductions = totals[SALARY_RULE_CATEGORY.DEDUCTION] || 0;
  const tax = totals[SALARY_RULE_CATEGORY.TAX] || 0;
  const contributions = totals[SALARY_RULE_CATEGORY.CONTRIBUTION] || 0;
  const net =
    totals[SALARY_RULE_CATEGORY.NET] > 0
      ? totals[SALARY_RULE_CATEGORY.NET]
      : money.subtract(gross, money.add(deductions, tax, contributions));

  return {
    lines,
    totals: {
      basic,
      allowances,
      gross,
      deductions,
      tax,
      contributions,
      net,
    },
  };
}

module.exports = { computePayslipBreakdown };
