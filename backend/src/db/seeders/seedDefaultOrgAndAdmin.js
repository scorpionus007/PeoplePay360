'use strict';

const { models, sequelize } = require('../../models');
const { ROLES } = require('../../config/constants');
const { hashPassword } = require('../../utils/password');
const logger = require('../../config/logger');

const DEFAULT_ORG_NAME = 'PeoplePay360 Demo Organization';
const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@peoplepay360.local';
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe!2026';

async function seed() {
  await sequelize.transaction(async (transaction) => {
    const [org] = await models.Organization.findOrCreate({
      where: { name: DEFAULT_ORG_NAME },
      defaults: {
        name: DEFAULT_ORG_NAME,
        base_currency: 'USD',
        timezone: 'UTC',
        is_active: true,
      },
      transaction,
    });

    const adminRole = await models.Role.findOne({ where: { key: ROLES.ADMIN }, transaction });
    if (!adminRole) throw new Error('Admin role missing. Run seedRolesAndPermissions first.');

    const existing = await models.User.findOne({ where: { email: DEFAULT_ADMIN_EMAIL }, transaction });
    if (existing) {
      logger.info('Default admin already present, skipping creation');
      return;
    }

    const passwordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);
    const user = await models.User.create(
      {
        organization_id: org.id,
        email: DEFAULT_ADMIN_EMAIL,
        password_hash: passwordHash,
        full_name: 'Platform Admin',
        is_active: true,
        is_email_verified: true,
      },
      { transaction }
    );
    await user.addRole(adminRole, { transaction });
    logger.info(`Default admin seeded: ${DEFAULT_ADMIN_EMAIL}`);
  });
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
