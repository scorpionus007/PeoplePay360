import { apiClient, setAuthToken, extractErrorMessage } from './client';
import {
  AuthUser,
  AttendanceRecord,
  TimeOffAllocation,
  TimeOffRequest,
  Payslip,
  AdvanceSalaryRequest,
  ITDevice,
  PartnerReward,
  VisaCase,
  TeamMember,
} from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const res = await apiClient.post('/auth/login', { email, password });
    const data = res.data?.data;
    if (data?.tokens?.access_token) {
      setAuthToken(data.tokens.access_token);
    }
    return {
      user: data.user,
      token: data?.tokens?.access_token,
    };
  },

  async me(): Promise<AuthUser> {
    const res = await apiClient.get('/auth/me');
    return res.data?.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      setAuthToken(null);
    }
  },
};

export const attendanceService = {
  async checkIn(notes?: string): Promise<AttendanceRecord> {
    const res = await apiClient.post('/hr/attendance/check-in', {
      source: 'mobile_app',
      notes: notes || 'Clock in from PeoplePay Android App',
    });
    return res.data?.data;
  },

  async checkOut(notes?: string): Promise<AttendanceRecord> {
    const res = await apiClient.post('/hr/attendance/check-out', {
      notes: notes || 'Clock out from PeoplePay Android App',
    });
    return res.data?.data;
  },
};

export const timeOffService = {
  async getAllocations(): Promise<TimeOffAllocation[]> {
    const res = await apiClient.get('/hr/time-off/allocations');
    return res.data?.data || [];
  },

  async getRequests(): Promise<TimeOffRequest[]> {
    const res = await apiClient.get('/hr/time-off/requests');
    return res.data?.data || [];
  },

  async submitRequest(payload: {
    time_off_type_id: string;
    start_date: string;
    end_date: string;
    duration_days: number;
    reason: string;
  }): Promise<TimeOffRequest> {
    const res = await apiClient.post('/hr/time-off/requests', payload);
    return res.data?.data;
  },
};

export const payrollService = {
  async getContract() {
    const res = await apiClient.get('/payroll/contracts');
    return res.data?.data?.[0] || null;
  },

  async getPayslips(): Promise<Payslip[]> {
    const res = await apiClient.get('/payroll/payslips');
    return res.data?.data || [];
  },

  async getPayslip(id: string): Promise<Payslip> {
    const res = await apiClient.get(`/payroll/payslips/${id}`);
    return res.data?.data;
  },

  async getAdvanceRequests(): Promise<AdvanceSalaryRequest[]> {
    const res = await apiClient.get('/payroll/advance-salary-requests');
    return res.data?.data || [];
  },

  async requestAdvanceSalary(payload: {
    requested_amount: number;
    repayment_mode: 'salary_deduction' | 'direct_transfer' | 'emi';
    emi_months?: number;
    reason: string;
  }): Promise<AdvanceSalaryRequest> {
    const res = await apiClient.post('/payroll/advance-salary-requests', payload);
    return res.data?.data;
  },
};

export const itService = {
  async getDevices(): Promise<ITDevice[]> {
    const res = await apiClient.get('/it/devices');
    return res.data?.data || [];
  },
};

export const benefitsService = {
  async getRewards(): Promise<PartnerReward[]> {
    const res = await apiClient.get('/benefits/discount-partners');
    return res.data?.data || [];
  },

  async submitExpenseClaim(payload: {
    category: string;
    amount: number;
    description: string;
  }): Promise<{ id: string; status: string }> {
    const res = await apiClient.post('/benefits/claims', payload);
    return res.data?.data;
  },
};

export const mobilityService = {
  async getVisaCase(): Promise<VisaCase | null> {
    const res = await apiClient.get('/mobility/visas');
    return res.data?.data?.[0] || null;
  },
};

export const teamService = {
  async getTeamMembers(): Promise<TeamMember[]> {
    const res = await apiClient.get('/employees');
    const employees = res.data?.data || [];
    return employees.map((emp: any) => ({
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      role: emp.job_title || emp.employment_type || 'Employee',
      department: emp.department?.name || 'General',
      initials: `${(emp.first_name || '')[0] || ''}${(emp.last_name || '')[0] || ''}`.toUpperCase(),
    }));
  },
};

export const aiAssistantService = {
  async askQuestion(question: string): Promise<string> {
    try {
      const res = await apiClient.post('/hr/chat/ask', { message: question });
      if (res.data?.data?.reply) return res.data.data.reply;
    } catch {
      // Fallback to helpful default
    }
    return 'I am your PeoplePay360 HR and Payroll assistant. I can help you with salary advance requests, payslip breakdowns, leave balance inquiries, IT equipment support, and corporate perks. Please connect to the backend server for full AI assistance.';
  },
};
