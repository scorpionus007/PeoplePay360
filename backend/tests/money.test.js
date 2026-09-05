'use strict';

const money = require('../src/utils/money');

describe('money helpers', () => {
  test('add sums numbers and rounds to 4 decimals', () => {
    expect(money.add(1.1, 2.2, 3.3)).toBe(6.6);
  });

  test('percentOf computes percent correctly', () => {
    expect(money.percentOf(1000, 12.5)).toBe(125);
  });

  test('divide by zero returns 0 without throwing', () => {
    expect(money.divide(100, 0)).toBe(0);
  });
});
