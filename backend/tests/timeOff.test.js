'use strict';

const timeOff = require('../src/modules/hr/services/timeOff.service');

describe('time off duration calculation', () => {
  test('single day in days unit', () => {
    expect(timeOff.durationFrom({ startDate: '2026-01-05', endDate: '2026-01-05', unit: 'days' })).toBe(1);
  });

  test('half day override', () => {
    expect(
      timeOff.durationFrom({ startDate: '2026-01-05', endDate: '2026-01-05', isHalfDay: true, unit: 'days' })
    ).toBe(0.5);
  });

  test('multi day range', () => {
    expect(timeOff.durationFrom({ startDate: '2026-01-05', endDate: '2026-01-07', unit: 'days' })).toBe(3);
  });

  test('hours unit uses 8 hour days', () => {
    expect(timeOff.durationFrom({ startDate: '2026-01-05', endDate: '2026-01-06', unit: 'hours' })).toBe(16);
  });

  test('reversed range returns zero', () => {
    expect(timeOff.durationFrom({ startDate: '2026-01-10', endDate: '2026-01-05', unit: 'days' })).toBe(0);
  });
});
