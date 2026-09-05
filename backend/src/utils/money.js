'use strict';

const DEFAULT_SCALE = 4;

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function round(value, scale = DEFAULT_SCALE) {
  const factor = Math.pow(10, scale);
  return Math.round(toNumber(value) * factor) / factor;
}

function add(...values) {
  return round(values.reduce((acc, v) => acc + toNumber(v), 0));
}

function subtract(a, b) {
  return round(toNumber(a) - toNumber(b));
}

function multiply(a, b) {
  return round(toNumber(a) * toNumber(b));
}

function divide(a, b) {
  const denom = toNumber(b);
  if (denom === 0) return 0;
  return round(toNumber(a) / denom);
}

function percentOf(base, percent) {
  return round((toNumber(base) * toNumber(percent)) / 100);
}

module.exports = {
  toNumber,
  round,
  add,
  subtract,
  multiply,
  divide,
  percentOf,
  DEFAULT_SCALE,
};
