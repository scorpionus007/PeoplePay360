export interface Organization {
  id: string;
  name: string;
  base_currency: string;
}

export interface EmployeeProfile {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  work_email: string;
  department_name?: string;
  job_title?: string;
  employment_type?: string;
  employment_status?: string;
  avatar_initials?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  organization: Organization | null;
  employee_id: string | null;
  employee: EmployeeProfile | null;
  is_active: boolean;
  mfa_enabled: boolean;
  roles: string[];
  permissions: string[];
}

export interface Contract {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'expired' | 'terminated';
  wage_amount: number;
  wage_currency: string;
  wage_type: 'fixed' | 'hourly';
  start_date: string;
  end_date?: string | null;
  salary_structure_name?: string;
}

export interface AttendanceRecord {
  id: string;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  worked_hours: number;
  status: 'present' | 'late' | 'early_leave' | 'absent' | 'on_leave';
  source?: string;
}

export interface TimeOffType {
  id: string;
  name: string;
  code: string;
  unit: 'days' | 'hours';
  requires_allocation: boolean;
}

export interface TimeOffAllocation {
  id: string;
  time_off_type_id: string;
  time_off_type?: TimeOffType;
  allocated_amount: number;
  taken_amount: number;
  remaining_amount: number;
  valid_from?: string;
  valid_until?: string;
}

export interface TimeOffRequest {
  id: string;
  time_off_type_id: string;
  time_off_type?: TimeOffType;
  start_date: string;
  end_date: string;
  duration_days: number;
  status: 'draft' | 'pending' | 'approved' | 'refused' | 'cancelled';
  reason?: string;
  created_at: string;
}

export interface PayslipLine {
  id: string;
  name: string;
  code: string;
  category: 'basic' | 'allowance' | 'gross' | 'deduction' | 'tax' | 'net';
  amount: number;
  sequence: number;
}

export interface Payslip {
  id: string;
  code: string;
  payrun_name?: string;
  period_start: string;
  period_end: string;
  gross_amount: number;
  net_amount: number;
  currency: string;
  status: 'draft' | 'computed' | 'validated' | 'paid' | 'cancelled';
  payment_date?: string;
  lines?: PayslipLine[];
}

export interface AdvanceSalaryRequest {
  id: string;
  requested_amount: number;
  approved_amount?: number;
  fee_amount?: number;
  net_disbursed_amount?: number;
  currency: string;
  repayment_mode: 'salary_deduction' | 'direct_transfer' | 'emi';
  emi_months?: number;
  status: 'requested' | 'approved' | 'disbursed' | 'recovering' | 'settled' | 'rejected';
  reason?: string;
  created_at: string;
}

export interface ITDevice {
  id: string;
  device_name: string;
  category: 'laptop' | 'desktop' | 'mobile' | 'monitor' | 'accessory';
  serial_number: string;
  os_family: string;
  os_version: string;
  status: 'assigned' | 'in_repair' | 'in_stock';
  compliance_status: 'pass' | 'warn' | 'fail';
  assigned_date: string;
}

export interface PartnerReward {
  id: string;
  partner_name: string;
  title: string;
  description: string;
  category: 'travel' | 'wellness' | 'tech' | 'lifestyle';
  discount_code?: string;
  badge_text: string;
  accent_color: string;
}

export interface VisaCase {
  id: string;
  visa_type: string;
  country: string;
  status: 'initiated' | 'documents_collecting' | 'under_internal_review' | 'filed' | 'approved';
  filing_date?: string;
  expiry_date?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  initials: string;
}
