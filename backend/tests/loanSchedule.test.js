'use strict';

const { computeSchedule } = require('../src/modules/benefits/services/loan.service');

describe('loan schedule computation', () => {
  test('zero interest splits principal into equal installments', () => {
    const s = computeSchedule({ principal: 1200, tenureMonths: 12, interestMode: 'zero', ratePercent: 0, feePercent: 0 });
    expect(s.monthly_installment).toBe(100);
    expect(s.total_repayable).toBe(1200);
    expect(s.processing_fee_amount).toBe(0);
  });

  test('flat interest adds proportional interest over tenure', () => {
    const s = computeSchedule({ principal: 1200, tenureMonths: 12, interestMode: 'flat', ratePercent: 12, feePercent: 0 });
    expect(s.total_repayable).toBeCloseTo(1344, 2);
    expect(s.monthly_installment).toBeCloseTo(112, 2);
  });

  test('reducing balance uses standard EMI formula', () => {
    const s = computeSchedule({
      principal: 100000,
      tenureMonths: 12,
      interestMode: 'reducing_balance',
      ratePercent: 12,
      feePercent: 0,
    });
    expect(s.monthly_installment).toBeCloseTo(8884.88, 1);
  });

  test('processing fee is added to total repayable', () => {
    const s = computeSchedule({ principal: 1000, tenureMonths: 10, interestMode: 'zero', ratePercent: 0, feePercent: 2 });
    expect(s.processing_fee_amount).toBe(20);
    expect(s.total_repayable).toBe(1020);
  });
});
