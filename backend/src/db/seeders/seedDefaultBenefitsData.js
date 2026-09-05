'use strict';

const { models, sequelize } = require('../../models');
const logger = require('../../config/logger');

const DEFAULT_PROVIDERS = [
  { name: 'Aetna Global Health', category: 'health_insurance', country_code: 'US' },
  { name: 'MetLife Life Insurance', category: 'life_insurance', country_code: 'US' },
  { name: 'ClassPass Wellness', category: 'wellness', country_code: 'US' },
  { name: 'LegalShield Advisory', category: 'legal_support', country_code: 'US' },
  { name: 'Amazon Gift Program', category: 'gift_voucher', country_code: 'US' },
];

const DEFAULT_LOAN_PROGRAM = {
  code: 'STAFF_EMERGENCY',
  name: 'Staff Emergency Loan',
  description: 'Interest free short term staff loan repayable over up to 12 months',
  currency: 'USD',
  min_amount: 100,
  max_amount: 10000,
  min_tenure_months: 1,
  max_tenure_months: 12,
  interest_mode: 'zero',
  interest_rate_percent: 0,
  processing_fee_percent: 0.5,
  requires_manager_approval: true,
  requires_admin_approval: true,
  salary_deduction_default: true,
  is_active: true,
};

async function seed() {
  const orgs = await models.Organization.findAll();
  if (!orgs.length) return;
  for (const org of orgs) {
    await sequelize.transaction(async (transaction) => {
      for (const p of DEFAULT_PROVIDERS) {
        await models.BenefitProvider.findOrCreate({
          where: { organization_id: org.id, name: p.name },
          defaults: { ...p, organization_id: org.id, is_active: true },
          transaction,
        });
      }
      await models.LoanProgram.findOrCreate({
        where: { organization_id: org.id, code: DEFAULT_LOAN_PROGRAM.code },
        defaults: { ...DEFAULT_LOAN_PROGRAM, organization_id: org.id },
        transaction,
      });
    });
  }
  logger.info('Benefits default data seeded');
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
