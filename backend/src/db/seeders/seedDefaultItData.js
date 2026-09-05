'use strict';

const { models, sequelize } = require('../../models');
const logger = require('../../config/logger');

const DEFAULT_CONTROLS = [
  { code: 'DISK_ENCRYPTION', name: 'Full disk encryption enabled', category: 'encryption', severity: 'critical' },
  { code: 'OS_PATCH_CURRENT', name: 'Operating system is fully patched', category: 'patch', severity: 'high' },
  { code: 'MFA_ENFORCED', name: 'MFA enforced on primary account', category: 'mfa', severity: 'critical' },
  { code: 'FIREWALL_ON', name: 'Host firewall enabled', category: 'firewall', severity: 'high' },
  { code: 'AV_RUNNING', name: 'Antivirus present and running', category: 'antivirus', severity: 'high' },
  { code: 'EDR_ACTIVE', name: 'EDR agent deployed and reporting', category: 'edr', severity: 'critical' },
  { code: 'AUTO_LOCK_ON', name: 'Screen auto lock configured', category: 'os_config', severity: 'medium' },
  { code: 'BACKUP_ENABLED', name: 'Endpoint backup enabled', category: 'backup', severity: 'medium' },
  { code: 'STRONG_PASSWORD', name: 'Password policy meets standard', category: 'password_policy', severity: 'medium' },
  { code: 'ADMIN_LEAST_PRIV', name: 'Local admin follows least privilege', category: 'access_control', severity: 'high' },
];

const DEFAULT_KITS = [
  {
    name: 'Standard Employee Laptop Kit',
    device_category: 'laptop',
    preferred_os_family: 'windows',
    specs: { ram_gb: 16, storage_gb: 512, cpu_class: 'i5 or better' },
    target_employee_types: ['full_time', 'contract'],
    is_default: true,
  },
  {
    name: 'Engineering Workstation Kit',
    device_category: 'laptop',
    preferred_os_family: 'macos',
    specs: { ram_gb: 32, storage_gb: 1024, cpu_class: 'M series or equivalent' },
    target_employee_types: ['full_time'],
  },
  {
    name: 'Intern Kit',
    device_category: 'laptop',
    preferred_os_family: 'windows',
    specs: { ram_gb: 8, storage_gb: 256 },
    target_employee_types: ['intern'],
  },
];

async function seed() {
  const orgs = await models.Organization.findAll();
  if (!orgs.length) return;

  for (const org of orgs) {
    await sequelize.transaction(async (transaction) => {
      for (const c of DEFAULT_CONTROLS) {
        await models.BaselineControl.findOrCreate({
          where: { organization_id: org.id, code: c.code },
          defaults: { ...c, organization_id: org.id, is_mandatory: true, is_active: true },
          transaction,
        });
      }
      for (const k of DEFAULT_KITS) {
        await models.OnboardingKit.findOrCreate({
          where: { organization_id: org.id, name: k.name },
          defaults: { ...k, organization_id: org.id, is_active: true },
          transaction,
        });
      }
    });
  }
  logger.info('IT default data seeded');
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
