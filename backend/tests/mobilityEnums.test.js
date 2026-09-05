'use strict';

const { VISA_STATUS, RELOCATION_STATUS, TRAVEL_STATUS } = require('../src/config/constants');

describe('mobility enums', () => {
  test('visa statuses include the full lifecycle', () => {
    for (const s of ['initiated', 'documents_collecting', 'filed', 'approved', 'denied', 'expired', 'renewed', 'cancelled']) {
      expect(Object.values(VISA_STATUS)).toContain(s);
    }
  });

  test('relocation statuses include the full lifecycle', () => {
    for (const s of ['requested', 'approved', 'in_progress', 'completed', 'cancelled']) {
      expect(Object.values(RELOCATION_STATUS)).toContain(s);
    }
  });

  test('travel statuses include the full lifecycle', () => {
    for (const s of ['draft', 'submitted', 'approved', 'rejected', 'booked', 'in_progress', 'completed', 'cancelled']) {
      expect(Object.values(TRAVEL_STATUS)).toContain(s);
    }
  });
});
