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

function computeRuleAmount({ rule, structureRule, basic, totals, contract, workedDays, workedHours, basicAmount }) {
  const computeType = rule.compute_type;

  const overrideAmount = structureRule?.override_amount;
  const overridePercent = structureRule?.override_percent;

  if (computeType === SALARY_RULE_COMPUTE_TYPE.FIXED) {
    if (overrideAmount !== null && overrideAmount !== undefined) return money.toNumber(overrideAmount);
    if (rule.fixed_amount !== null && rule.fixed_amount !== undefined) return money.toNumber(rule.fixed_amount);
    // A BASIC-category rule with no explicit amount represents the contract's
    // period basic, so the payslip line reflects the actual base salary.
    if (rule.category === SALARY_RULE_CATEGORY.BASIC) return money.toNumber(basicAmount);
    return 0;
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

function computePayslipBreakdown({ contract, structureRules, workedDays, workedHours, extras, periodBasic }) {
  // extras: [{ salary_rule_id, code, name, category, amount }]
  const totals = initTotals();
  const lines = [];

  // The period basic: caller may pass a wage_period-adjusted value; otherwise
  // fall back to the raw contract wage. Totals[BASIC] is NOT pre-seeded — a
  // BASIC-category rule contributes it so the payslip line reflects it.
  const basicAmount =
    periodBasic !== undefined && periodBasic !== null
      ? money.toNumber(periodBasic)
      : money.toNumber(contract?.wage_amount);

  const sorted = [...structureRules].sort((a, b) => (a.sequence || 100) - (b.sequence || 100));

  for (const sr of sorted) {
    const rule = sr.rule;
    if (!rule || !rule.is_active || !sr.is_active) continue;

    // Maintain a running gross (basic + allowances accrued so far) and running
    // net so percent_of_gross / formula rules that reference GROSS or NET see a
    // real value rather than 0. Rules are evaluated in sequence order, so a tax
    // rule sequenced after the allowances gets the correct gross.
    const runningBasic = totals[SALARY_RULE_CATEGORY.BASIC] || basicAmount;
    totals[SALARY_RULE_CATEGORY.GROSS] = money.add(runningBasic, totals[SALARY_RULE_CATEGORY.ALLOWANCE] || 0);
    totals[SALARY_RULE_CATEGORY.NET] = money.subtract(
      totals[SALARY_RULE_CATEGORY.GROSS],
      money.add(totals[SALARY_RULE_CATEGORY.DEDUCTION] || 0, totals[SALARY_RULE_CATEGORY.TAX] || 0, totals[SALARY_RULE_CATEGORY.CONTRIBUTION] || 0)
    );

    const amount = computeRuleAmount({
      rule,
      structureRule: sr,
      basic: runningBasic,
      totals,
      contract,
      workedDays,
      workedHours,
      basicAmount,
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

    // GROSS/NET are derived aggregates, not accumulated from rule lines.
    if (rule.category !== SALARY_RULE_CATEGORY.GROSS && rule.category !== SALARY_RULE_CATEGORY.NET) {
      totals[rule.category] = money.add(totals[rule.category] || 0, amount);
    }
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
      if (extra.category !== SALARY_RULE_CATEGORY.GROSS && extra.category !== SALARY_RULE_CATEGORY.NET) {
        totals[extra.category] = money.add(totals[extra.category] || 0, extra.amount);
      }
    }
  }

  // Definitive aggregates: gross is basic + allowances; net subtracts the rest.
  const basic = totals[SALARY_RULE_CATEGORY.BASIC] || basicAmount;
  const allowances = totals[SALARY_RULE_CATEGORY.ALLOWANCE] || 0;
  const gross = money.add(basic, allowances);
  const deductions = totals[SALARY_RULE_CATEGORY.DEDUCTION] || 0;
  const tax = totals[SALARY_RULE_CATEGORY.TAX] || 0;
  const contributions = totals[SALARY_RULE_CATEGORY.CONTRIBUTION] || 0;
  const net = money.subtract(gross, money.add(deductions, tax, contributions));

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
