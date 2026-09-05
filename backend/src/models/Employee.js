'use strict';

const { DataTypes } = require('sequelize');
const { EMPLOYMENT_STATUS, EMPLOYEE_TYPE } = require('../config/constants');

module.exports = (sequelize) => {
  const Employee = sequelize.define(
    'Employee',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      organization_id: { type: DataTypes.UUID, allowNull: false },
      department_id: { type: DataTypes.UUID, allowNull: true },
      manager_id: { type: DataTypes.UUID, allowNull: true },
      working_schedule_id: { type: DataTypes.UUID, allowNull: true },
      employee_number: { type: DataTypes.STRING(50), allowNull: false },
      first_name: { type: DataTypes.STRING(100), allowNull: false },
      last_name: { type: DataTypes.STRING(100), allowNull: false },
      email_work: { type: DataTypes.STRING(200), allowNull: false },
      email_personal: { type: DataTypes.STRING(200), allowNull: true },
      phone: { type: DataTypes.STRING(40), allowNull: true },
      date_of_birth: { type: DataTypes.DATEONLY, allowNull: true },
      gender: { type: DataTypes.STRING(20), allowNull: true },
      country_code: { type: DataTypes.STRING(2), allowNull: true },
      city: { type: DataTypes.STRING(120), allowNull: true },
      address_line1: { type: DataTypes.STRING(255), allowNull: true },
      address_line2: { type: DataTypes.STRING(255), allowNull: true },
      postal_code: { type: DataTypes.STRING(30), allowNull: true },
      job_title: { type: DataTypes.STRING(150), allowNull: true },
      employment_type: {
        type: DataTypes.ENUM(...Object.values(EMPLOYEE_TYPE)),
        allowNull: false,
        defaultValue: EMPLOYEE_TYPE.FULL_TIME,
      },
      employment_status: {
        type: DataTypes.ENUM(...Object.values(EMPLOYMENT_STATUS)),
        allowNull: false,
        defaultValue: EMPLOYMENT_STATUS.ACTIVE,
      },
      hire_date: { type: DataTypes.DATEONLY, allowNull: true },
      termination_date: { type: DataTypes.DATEONLY, allowNull: true },
      base_currency: { type: DataTypes.STRING(3), allowNull: false, defaultValue: 'USD' },
      tax_country: { type: DataTypes.STRING(2), allowNull: true },
      tax_identifier: { type: DataTypes.STRING(80), allowNull: true },
      bank_account_number: { type: DataTypes.STRING(80), allowNull: true },
      bank_routing_number: { type: DataTypes.STRING(80), allowNull: true },
      bank_name: { type: DataTypes.STRING(150), allowNull: true },
      iban: { type: DataTypes.STRING(50), allowNull: true },
      swift_bic: { type: DataTypes.STRING(20), allowNull: true },
      metadata: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    },
    {
      tableName: 'employees',
      indexes: [
        { fields: ['organization_id'] },
        { fields: ['organization_id', 'employee_number'], unique: true },
        { fields: ['department_id'] },
        { fields: ['employment_status'] },
      ],
    }
  );

  Employee.associate = (models) => {
    Employee.belongsTo(models.Organization, { as: 'organization', foreignKey: 'organization_id' });
    Employee.belongsTo(models.Department, { as: 'department', foreignKey: 'department_id' });
    Employee.belongsTo(models.Employee, { as: 'manager', foreignKey: 'manager_id' });
    Employee.hasMany(models.Employee, { as: 'reports', foreignKey: 'manager_id' });
    Employee.hasOne(models.User, { as: 'user_account', foreignKey: 'employee_id' });

    Employee.hasMany(models.Contract, { as: 'contracts', foreignKey: 'employee_id' });
    Employee.hasMany(models.Payslip, { as: 'payslips', foreignKey: 'employee_id' });
    Employee.hasMany(models.AdvanceSalaryRequest, { as: 'advance_requests', foreignKey: 'employee_id' });
    Employee.hasMany(models.BonusRecord, { as: 'bonuses', foreignKey: 'employee_id' });
    Employee.hasMany(models.PaymentMethod, { as: 'payment_methods', foreignKey: 'employee_id' });

    if (models.WorkingSchedule) {
      Employee.belongsTo(models.WorkingSchedule, {
        as: 'working_schedule',
        foreignKey: 'working_schedule_id',
      });
    }
    if (models.Attendance) {
      Employee.hasMany(models.Attendance, { as: 'attendances', foreignKey: 'employee_id' });
    }
    if (models.TimeOffAllocation) {
      Employee.hasMany(models.TimeOffAllocation, {
        as: 'time_off_allocations',
        foreignKey: 'employee_id',
      });
    }
    if (models.TimeOffRequest) {
      Employee.hasMany(models.TimeOffRequest, {
        as: 'time_off_requests',
        foreignKey: 'employee_id',
      });
    }
    if (models.HRRequest) {
      Employee.hasMany(models.HRRequest, { as: 'hr_requests', foreignKey: 'employee_id' });
    }
    if (models.FeedbackEntry) {
      Employee.hasMany(models.FeedbackEntry, { as: 'feedback_entries', foreignKey: 'employee_id' });
    }
    if (models.BenefitEnrollment) {
      Employee.hasMany(models.BenefitEnrollment, {
        as: 'benefit_enrollments',
        foreignKey: 'employee_id',
      });
    }
    if (models.BenefitClaim) {
      Employee.hasMany(models.BenefitClaim, { as: 'benefit_claims', foreignKey: 'employee_id' });
    }
    if (models.Loan) {
      Employee.hasMany(models.Loan, { as: 'loans', foreignKey: 'employee_id' });
    }
    if (models.GiftVoucher) {
      Employee.hasMany(models.GiftVoucher, { as: 'gift_vouchers', foreignKey: 'employee_id' });
    }
    if (models.Referral) {
      Employee.hasMany(models.Referral, {
        as: 'referrals_submitted',
        foreignKey: 'referrer_employee_id',
      });
    }
  };

  Employee.prototype.fullName = function fullName() {
    return `${this.first_name} ${this.last_name}`.trim();
  };

  return Employee;
};
