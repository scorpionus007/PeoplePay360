'use strict';

const { models, sequelize } = require('../../models');
const logger = require('../../config/logger');

const DEFAULT_STANDARDS = [
  { country_code: 'US', display_name: 'United States', currency: 'USD', timezone: 'America/New_York', standard_weekly_hours: 40, minimum_pto_days: 15, minimum_sick_days: 10, notice_period_days: 14 },
  { country_code: 'GB', display_name: 'United Kingdom', currency: 'GBP', timezone: 'Europe/London', standard_weekly_hours: 37.5, minimum_pto_days: 28, minimum_sick_days: 28, notice_period_days: 30 },
  { country_code: 'DE', display_name: 'Germany', currency: 'EUR', timezone: 'Europe/Berlin', standard_weekly_hours: 40, minimum_pto_days: 24, minimum_sick_days: 42, notice_period_days: 30 },
  { country_code: 'IN', display_name: 'India', currency: 'INR', timezone: 'Asia/Kolkata', standard_weekly_hours: 48, minimum_pto_days: 21, minimum_sick_days: 12, notice_period_days: 90 },
  { country_code: 'SG', display_name: 'Singapore', currency: 'SGD', timezone: 'Asia/Singapore', standard_weekly_hours: 44, minimum_pto_days: 14, minimum_sick_days: 14, notice_period_days: 30 },
  { country_code: 'CA', display_name: 'Canada', currency: 'CAD', timezone: 'America/Toronto', standard_weekly_hours: 40, minimum_pto_days: 10, minimum_sick_days: 10, notice_period_days: 14 },
  { country_code: 'AU', display_name: 'Australia', currency: 'AUD', timezone: 'Australia/Sydney', standard_weekly_hours: 38, minimum_pto_days: 20, minimum_sick_days: 10, notice_period_days: 28 },
  { country_code: 'AE', display_name: 'United Arab Emirates', currency: 'AED', timezone: 'Asia/Dubai', standard_weekly_hours: 48, minimum_pto_days: 30, minimum_sick_days: 90, notice_period_days: 30 },
];

const DEFAULT_PARTNERS = [
  { name: 'Fragomen Immigration Advisory', category: 'immigration_lawyer' },
  { name: 'Cartus Relocation Services', category: 'relocation_agency' },
  { name: 'Deloitte Global Tax Advisory', category: 'tax_consultant' },
  { name: 'Blueground Corporate Housing', category: 'housing' },
];

async function seed() {
  const orgs = await models.Organization.findAll();
  if (!orgs.length) return;

  for (const org of orgs) {
    await sequelize.transaction(async (transaction) => {
      for (const s of DEFAULT_STANDARDS) {
        await models.LocationStandard.findOrCreate({
          where: { organization_id: org.id, country_code: s.country_code, region_code: null },
          defaults: { ...s, organization_id: org.id, is_active: true, public_holidays: [] },
          transaction,
        });
      }
      for (const p of DEFAULT_PARTNERS) {
        await models.MobilityPartner.findOrCreate({
          where: { organization_id: org.id, name: p.name },
          defaults: { ...p, organization_id: org.id, is_active: true },
          transaction,
        });
      }
    });
  }
  logger.info('Mobility default data seeded');
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
