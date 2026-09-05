'use strict';

const { APPLICATION_STAGE } = require('../src/config/constants');

describe('application stages enum', () => {
  test('includes all pipeline stages', () => {
    expect(APPLICATION_STAGE.APPLIED).toBe('applied');
    expect(APPLICATION_STAGE.HIRED).toBe('hired');
    expect(APPLICATION_STAGE.REJECTED).toBe('rejected');
    expect(APPLICATION_STAGE.WITHDRAWN).toBe('withdrawn');
  });

  test('stage set is stable (no accidental removals)', () => {
    const expected = [
      'applied',
      'screening',
      'phone_screen',
      'assessment',
      'interview',
      'onsite',
      'offer',
      'hired',
      'rejected',
      'withdrawn',
      'on_hold',
    ].sort();
    expect(Object.values(APPLICATION_STAGE).sort()).toEqual(expected);
  });
});
