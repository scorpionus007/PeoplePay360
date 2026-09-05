'use strict';

const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const env = require('./env');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'PeoplePay360 API',
      version: '0.1.0',
      description:
        'Integrated HR and Payroll platform API. Modular MVC over Express with JWT auth ' +
        'and role plus permission based access control. All routes are namespaced under /api/v1.',
      contact: { name: 'PeoplePay360 Team', url: 'https://github.com/scorpionus007/PeoplePay360' },
      license: { name: 'Proprietary' },
    },
    servers: [
      { url: `http://localhost:${env.port}/api/v1`, description: 'Local development' },
      { url: 'https://staging.peoplepay360.example.com/api/v1', description: 'Staging' },
      { url: 'https://api.peoplepay360.example.com/api/v1', description: 'Production' },
    ],
    tags: [
      { name: 'System', description: 'Health and metadata' },
      { name: 'Auth', description: 'Authentication, tokens, and current user' },
      { name: 'Organizations', description: 'Tenant organization data' },
      { name: 'Departments', description: 'Departments and hierarchy' },
      { name: 'Employees', description: 'Employee master' },
      { name: 'HR: Working Schedules', description: 'Weekly work patterns' },
      { name: 'HR: Attendance', description: 'Check in, check out, corrections, summaries' },
      { name: 'HR: Time Off Types', description: 'Configurable leave policies' },
      { name: 'HR: Time Off Allocations', description: 'Per employee balances' },
      { name: 'HR: Time Off Requests', description: 'Requests and approvals' },
      { name: 'HR: Feedback', description: 'Employee feedback (supports anonymous)' },
      { name: 'HR: Requests', description: 'Employee to HR chat requests' },
      { name: 'HR: Announcements', description: 'Organization announcements' },
      { name: 'HR: Chat', description: 'AI chat surface stub' },
      { name: 'HR: Dashboard', description: 'HR KPI dashboard' },
      { name: 'Payroll: Salary Structures', description: 'Structure containers of rules' },
      { name: 'Payroll: Salary Rules', description: 'Individual computation rules' },
      { name: 'Payroll: Contracts', description: 'Employee contracts' },
      { name: 'Payroll: Payruns', description: 'Batch payroll processing' },
      { name: 'Payroll: Payslips', description: 'Per employee, per period payslips' },
      { name: 'Payroll: Salary Change Requests', description: 'HR to Payroll to Admin salary change workflow' },
      { name: 'Payroll: Advance Salary', description: 'Advance salary program' },
      { name: 'Payroll: Bonuses', description: 'One time bonus records' },
      { name: 'Payroll: Payment Methods', description: 'Per employee payment rails' },
      { name: 'Payroll: Dashboard', description: 'Payroll KPI dashboard' },
      { name: 'IT: Devices', description: 'Company managed device inventory' },
      { name: 'IT: Software', description: 'Software catalog and per device installs' },
      { name: 'IT: Baseline', description: 'Security baseline controls and posture' },
      { name: 'IT: EDR', description: 'EDR integrations and events' },
      { name: 'IT: Onboarding', description: 'Onboarding kits and provisioning' },
      { name: 'IT: Dashboard', description: 'IT KPI dashboard' },
      { name: 'Benefits: Providers', description: 'External benefit carriers and vendors' },
      { name: 'Benefits: Plans', description: 'Benefit plans offered to employees' },
      { name: 'Benefits: Enrollments', description: 'Employee enrollments and dependents' },
      { name: 'Benefits: Claims', description: 'Reimbursement and support claims' },
      { name: 'Benefits: Loans', description: 'Loan programs, applications, repayments' },
      { name: 'Benefits: Vouchers', description: 'Gift vouchers issue, deliver, redeem' },
      { name: 'Benefits: Discount Partners', description: 'External tie ups and discounts' },
      { name: 'Benefits: Dashboard', description: 'Benefits KPI dashboard' },
      { name: 'Hiring: Requisitions', description: 'Job requisitions and approvals' },
      { name: 'Hiring: Job Boards', description: 'External job board integrations' },
      { name: 'Hiring: Job Postings', description: 'Published job postings' },
      { name: 'Hiring: Candidates', description: 'Candidate profiles' },
      { name: 'Hiring: Applications', description: 'Applications and pipeline stages' },
      { name: 'Hiring: Interviews', description: 'Interview scheduling and feedback' },
      { name: 'Hiring: Offers', description: 'Offer lifecycle' },
      { name: 'Hiring: Referrals', description: 'Employee referrals' },
      { name: 'Hiring: Dashboard', description: 'Hiring KPI dashboard' },
      { name: 'Mobility: Location Standards', description: 'Country and region standards' },
      { name: 'Mobility: Partners', description: 'Immigration lawyers, relocation vendors, tax consultants' },
      { name: 'Mobility: Visa Sponsorships', description: 'Work visa cases and documents' },
      { name: 'Mobility: Relocations', description: 'Cross border relocations and expenses' },
      { name: 'Mobility: Immigration Cases', description: 'Permanent residency and family cases' },
      { name: 'Mobility: Travel Requests', description: 'Business travel approval and booking' },
      { name: 'Mobility: Dashboard', description: 'Mobility KPI dashboard' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token from POST /auth/login',
        },
      },
      parameters: {
        UuidId: {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        UuidEmployeeId: {
          name: 'employeeId',
          in: 'path',
          required: true,
          schema: { type: 'string', format: 'uuid' },
        },
        Page: {
          name: 'page',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        Limit: {
          name: 'limit',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 200, default: 25 },
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'UNAUTHORIZED' },
                message: { type: 'string', example: 'Missing authentication token' },
                details: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
        SuccessEnvelope: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
            meta: {
              type: 'object',
              properties: {
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer', example: 1 },
                    limit: { type: 'integer', example: 25 },
                    total: { type: 'integer', example: 42 },
                    totalPages: { type: 'integer', example: 2 },
                    hasNext: { type: 'boolean', example: true },
                    hasPrev: { type: 'boolean', example: false },
                  },
                },
              },
            },
          },
        },
        Money: {
          type: 'number',
          format: 'double',
          example: 5000.0,
          description: 'Amount stored as DECIMAL(18,4) in the database',
        },
        CurrencyCode: {
          type: 'string',
          minLength: 3,
          maxLength: 3,
          example: 'USD',
          description: 'ISO 4217 currency code',
        },
        Uuid: { type: 'string', format: 'uuid' },
        Iso8601: { type: 'string', format: 'date-time' },
        IsoDate: { type: 'string', format: 'date' },

        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 128 },
          },
        },
        LoginResponseData: {
          type: 'object',
          properties: {
            tokens: {
              type: 'object',
              properties: {
                access_token: { type: 'string' },
                refresh_token: { type: 'string' },
                token_id: { type: 'string' },
              },
            },
            user: { $ref: '#/components/schemas/CurrentUser' },
          },
        },
        CurrentUser: {
          type: 'object',
          properties: {
            id: { $ref: '#/components/schemas/Uuid' },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string' },
            organization_id: { $ref: '#/components/schemas/Uuid' },
            employee_id: { $ref: '#/components/schemas/Uuid' },
            is_active: { type: 'boolean' },
            mfa_enabled: { type: 'boolean' },
            roles: { type: 'array', items: { type: 'string' } },
            permissions: { type: 'array', items: { type: 'string' } },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Missing or invalid authentication token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Missing required role or permission',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ValidationError: {
          description: 'Request payload failed validation',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Conflict: {
          description: 'Conflicting state prevents the operation',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [
    path.join(__dirname, '..', 'docs', '*.openapi.js').replace(/\\/g, '/'),
    path.join(__dirname, '..', 'modules', '**', 'routes', '*.js').replace(/\\/g, '/'),
    path.join(__dirname, '..', 'modules', 'auth', '*.js').replace(/\\/g, '/'),
  ],
};

const spec = swaggerJsdoc(options);

function mount(app) {
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(spec);
  });
  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(spec, {
      explorer: true,
      customSiteTitle: 'PeoplePay360 API Docs',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    })
  );
}

module.exports = { spec, mount };
