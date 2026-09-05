'use strict';

const { computeWeeklyHours } = require('../src/modules/hr/services/workingSchedule.service');

describe('working schedule weekly hours', () => {
  test('sums Monday to Friday 9 to 18 with 60 min break', () => {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri'].map((d) => ({
      day_of_week: d,
      start_time: '09:00',
      end_time: '18:00',
      break_minutes: 60,
      is_working: true,
    }));
    expect(computeWeeklyHours(days)).toBe(40);
  });

  test('skips non working days', () => {
    const days = [
      { day_of_week: 'mon', start_time: '10:00', end_time: '14:00', break_minutes: 0, is_working: true },
      { day_of_week: 'sat', start_time: '10:00', end_time: '14:00', break_minutes: 0, is_working: false },
    ];
    expect(computeWeeklyHours(days)).toBe(4);
  });

  test('ignores malformed times', () => {
    const days = [
      { day_of_week: 'mon', start_time: 'abc', end_time: '10:00', break_minutes: 0, is_working: true },
    ];
    expect(computeWeeklyHours(days)).toBe(0);
  });
});
