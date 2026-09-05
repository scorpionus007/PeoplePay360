'use strict';

const rolesSeeder = require('./seedRolesAndPermissions');
const orgSeeder = require('./seedDefaultOrgAndAdmin');
const hrSeeder = require('./seedDefaultHrData');
const logger = require('../../config/logger');

async function runAll() {
  await rolesSeeder.seed();
  await orgSeeder.seed();
  await hrSeeder.seed();
  logger.info('All seeders completed');
}

module.exports = { runAll };

if (require.main === module) {
  runAll()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(err);
      process.exit(1);
    });
}
