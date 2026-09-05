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

// HR module models
const WorkingSchedule = require('../modules/hr/models/WorkingSchedule')(sequelize);
const WorkingScheduleDay = require('../modules/hr/models/WorkingScheduleDay')(sequelize);
const Attendance = require('../modules/hr/models/Attendance')(sequelize);
const TimeOffType = require('../modules/hr/models/TimeOffType')(sequelize);
const TimeOffAllocation = require('../modules/hr/models/TimeOffAllocation')(sequelize);
const TimeOffRequest = require('../modules/hr/models/TimeOffRequest')(sequelize);
const FeedbackEntry = require('../modules/hr/models/FeedbackEntry')(sequelize);
const HRRequest = require('../modules/hr/models/HRRequest')(sequelize);
const HRRequestMessage = require('../modules/hr/models/HRRequestMessage')(sequelize);
const HRAnnouncement = require('../modules/hr/models/HRAnnouncement')(sequelize);

// IT Administration module models
const Device = require('../modules/itAdmin/models/Device')(sequelize);
const DeviceAssignment = require('../modules/itAdmin/models/DeviceAssignment')(sequelize);
const SoftwareCatalogItem = require('../modules/itAdmin/models/SoftwareCatalogItem')(sequelize);
const DeviceSoftware = require('../modules/itAdmin/models/DeviceSoftware')(sequelize);
const BaselineControl = require('../modules/itAdmin/models/BaselineControl')(sequelize);
const DeviceBaselineCheck = require('../modules/itAdmin/models/DeviceBaselineCheck')(sequelize);
const EdrIntegration = require('../modules/itAdmin/models/EdrIntegration')(sequelize);
const EdrEvent = require('../modules/itAdmin/models/EdrEvent')(sequelize);
const OnboardingKit = require('../modules/itAdmin/models/OnboardingKit')(sequelize);
const OnboardingProvision = require('../modules/itAdmin/models/OnboardingProvision')(sequelize);

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
  WorkingSchedule,
  WorkingScheduleDay,
  Attendance,
  TimeOffType,
  TimeOffAllocation,
  TimeOffRequest,
  FeedbackEntry,
  HRRequest,
  HRRequestMessage,
  HRAnnouncement,
  Device,
  DeviceAssignment,
  SoftwareCatalogItem,
  DeviceSoftware,
  BaselineControl,
  DeviceBaselineCheck,
  EdrIntegration,
  EdrEvent,
  OnboardingKit,
  OnboardingProvision,
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
