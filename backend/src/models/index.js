'use strict';

const { sequelize, Sequelize } = require('../config/database');

// Core models
const Organization = require('./Organization')(sequelize);
const Role = require('./Role')(sequelize);
const Permission = require('./Permission')(sequelize);
const RolePermission = require('./RolePermission')(sequelize);
const UserRole = require('./UserRole')(sequelize);
const User = require('./User')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);
const Department = require('./Department')(sequelize);
const Employee = require('./Employee')(sequelize);
const Currency = require('./Currency')(sequelize);
const ExchangeRate = require('./ExchangeRate')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);

// Payroll module models
const SalaryStructure = require('../modules/payroll/models/SalaryStructure')(sequelize);
const SalaryRule = require('../modules/payroll/models/SalaryRule')(sequelize);
const SalaryStructureRule = require('../modules/payroll/models/SalaryStructureRule')(sequelize);
const Contract = require('../modules/payroll/models/Contract')(sequelize);
const Payrun = require('../modules/payroll/models/Payrun')(sequelize);
const Payslip = require('../modules/payroll/models/Payslip')(sequelize);
const PayslipLine = require('../modules/payroll/models/PayslipLine')(sequelize);
const SalaryChangeRequest = require('../modules/payroll/models/SalaryChangeRequest')(sequelize);
const AdvanceSalaryRequest = require('../modules/payroll/models/AdvanceSalaryRequest')(sequelize);
const AdvanceSalaryRepayment = require('../modules/payroll/models/AdvanceSalaryRepayment')(sequelize);
const BonusRecord = require('../modules/payroll/models/BonusRecord')(sequelize);
const PaymentMethod = require('../modules/payroll/models/PaymentMethod')(sequelize);
const TaxProfile = require('../modules/payroll/models/TaxProfile')(sequelize);
const PayrollTransaction = require('../modules/payroll/models/PayrollTransaction')(sequelize);

const models = {
  Organization,
  Role,
  Permission,
  RolePermission,
  UserRole,
  User,
  RefreshToken,
  Department,
  Employee,
  Currency,
  ExchangeRate,
  AuditLog,
  SalaryStructure,
  SalaryRule,
  SalaryStructureRule,
  Contract,
  Payrun,
  Payslip,
  PayslipLine,
  SalaryChangeRequest,
  AdvanceSalaryRequest,
  AdvanceSalaryRepayment,
  BonusRecord,
  PaymentMethod,
  TaxProfile,
  PayrollTransaction,
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, Sequelize, models };
