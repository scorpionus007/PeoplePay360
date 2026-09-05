'use strict';

const { Op } = require('sequelize');
const { models } = require('../../../models');
const money = require('../../../utils/money');

async function getRate({ from, to, asOf }) {
  if (!from || !to) return 1;
  if (from === to) return 1;

  const where = { base_currency: from, quote_currency: to };
  if (asOf) where.as_of_date = { [Op.lte]: asOf };

  const rate = await models.ExchangeRate.findOne({
    where,
    order: [['as_of_date', 'DESC']],
  });

  if (rate) return money.toNumber(rate.rate);

  // Try inverse
  const inverse = await models.ExchangeRate.findOne({
    where: {
      base_currency: to,
      quote_currency: from,
      ...(asOf ? { as_of_date: { [Op.lte]: asOf } } : {}),
    },
    order: [['as_of_date', 'DESC']],
  });
  if (inverse && money.toNumber(inverse.rate) > 0) {
    return money.divide(1, money.toNumber(inverse.rate));
  }

  return 1;
}

async function convert({ amount, from, to, asOf }) {
  const rate = await getRate({ from, to, asOf });
  return money.multiply(amount, rate);
}

module.exports = { getRate, convert };
