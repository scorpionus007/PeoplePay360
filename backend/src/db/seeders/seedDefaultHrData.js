'use strict';

const { models, sequelize } = require('../../models');
const logger = require('../../config/logger');

const DEFAULT_TYPES = [
  { code: 'ANNUAL', name: 'Annual Leave', color: '#2563eb', unit: 'days', requires_allocation: true, default_allocation: 20 },
  { code: 'SICK', name: 'Sick Leave', color: '#dc2626', unit: 'days', requires_allocation: true, default_allocation: 10 },
  { code: 'CASUAL', name: 'Casual Leave', color: '#f59e0b', unit: 'days', requires_allocation: true, default_allocation: 8 },
  { code: 'MATERNITY', name: 'Maternity Leave', color: '#db2777', unit: 'days', requires_allocation: false },
  { code: 'PATERNITY', name: 'Paternity Leave', color: '#7c3aed', unit: 'days', requires_allocation: false },
  { code: 'UNPAID', name: 'Unpaid Leave', color: '#6b7280', unit: 'days', requires_allocation: false, paid: false },
  { code: 'COMP_OFF', name: 'Compensatory Off', color: '#059669', unit: 'days', requires_allocation: true, default_allocation: 0 },
];

const DEFAULT_SCHEDULE_DAYS = [
  { day_of_week: 'mon', start_time: '09:00', end_time: '18:00', break_minutes: 60 },
  { day_of_week: 'tue', start_time: '09:00', end_time: '18:00', break_minutes: 60 },
  { day_of_week: 'wed', start_time: '09:00', end_time: '18:00', break_minutes: 60 },
  { day_of_week: 'thu', start_time: '09:00', end_time: '18:00', break_minutes: 60 },
  { day_of_week: 'fri', start_time: '09:00', end_time: '18:00', break_minutes: 60 },
];

async function seed() {
  const orgs = await models.Organization.findAll();
  if (!orgs.length) {
    logger.info('No organizations found. Skipping HR default data seed.');
    return;
  }

  for (const org of orgs) {
    await sequelize.transaction(async (transaction) => {
      for (const t of DEFAULT_TYPES) {
        await models.TimeOffType.findOrCreate({
          where: { organization_id: org.id, code: t.code },
          defaults: { ...t, organization_id: org.id, is_active: true },
          transaction,
        });
      }

      const [schedule, createdSchedule] = await models.WorkingSchedule.findOrCreate({
        where: { organization_id: org.id, code: 'STANDARD_9_18' },
        defaults: {
          organization_id: org.id,
          name: 'Standard 9 to 18',
          code: 'STANDARD_9_18',
          schedule_type: 'standard',
          timezone: org.timezone || 'UTC',
          weekly_hours: 40,
          is_active: true,
          description: 'Monday to Friday, 9 to 18 with a 60 minute break',
        },
        transaction,
      });
      if (createdSchedule) {
        for (const day of DEFAULT_SCHEDULE_DAYS) {
          await models.WorkingScheduleDay.create(
            { ...day, working_schedule_id: schedule.id, block_index: 1, is_working: true },
            { transaction }
          );
        }
      }
    });
  }
  logger.info('HR default data seeded');
}

module.exports = { seed };

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}
