import { Navigate, Route, Routes } from 'react-router-dom';
import { Calendar, Handshake, Laptop, Plane, MessageSquare } from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { AppShell } from './layout/AppShell';
import { LoginPage } from './pages/Login';
import { LandingPage } from './pages/Landing';
import { DashboardPage } from './pages/Dashboard';
import { NotFoundPage } from './pages/NotFound';
import { PlaceholderPage } from './pages/Placeholder';
import { EmployeesPage } from './pages/core/EmployeesPage';
import { DepartmentsPage } from './pages/core/DepartmentsPage';
import { SettingsPage } from './pages/core/SettingsPage';
import { PayrollDashboardPage } from './pages/payroll/PayrollDashboardPage';
import { SalaryRulesPage } from './pages/payroll/SalaryRulesPage';
import { SalaryStructuresPage } from './pages/payroll/SalaryStructuresPage';
import { SalaryStructureDetailPage } from './pages/payroll/SalaryStructureDetailPage';
import { ContractsPage } from './pages/payroll/ContractsPage';
import { PayrunsPage } from './pages/payroll/PayrunsPage';
import { PayrunDetailPage } from './pages/payroll/PayrunDetailPage';
import { PayslipsPage } from './pages/payroll/PayslipsPage';
import { PayslipDetailPage } from './pages/payroll/PayslipDetailPage';
import { AdvanceSalaryPage } from './pages/payroll/AdvanceSalaryPage';
import { BonusesPage } from './pages/payroll/BonusesPage';
import { SalaryChangesPage } from './pages/payroll/SalaryChangesPage';
import { BenefitsDashboardPage } from './pages/benefits/BenefitsDashboardPage';
import { BenefitPlansPage } from './pages/benefits/BenefitPlansPage';
import { BenefitEnrollmentsPage } from './pages/benefits/BenefitEnrollmentsPage';
import { BenefitClaimsPage } from './pages/benefits/BenefitClaimsPage';
import { LoansPage } from './pages/benefits/LoansPage';
import { VouchersPage } from './pages/benefits/VouchersPage';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="pp-skeleton" style={{ width: 260, height: 32 }} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/payroll/dashboard" element={<PayrollDashboardPage />} />
        <Route path="/payroll/salary-rules" element={<SalaryRulesPage />} />
        <Route path="/payroll/salary-structures" element={<SalaryStructuresPage />} />
        <Route path="/payroll/salary-structures/:id" element={<SalaryStructureDetailPage />} />
        <Route path="/payroll/contracts" element={<ContractsPage />} />
        <Route path="/payroll/payruns" element={<PayrunsPage />} />
        <Route path="/payroll/payruns/:id" element={<PayrunDetailPage />} />
        <Route path="/payroll/payslips" element={<PayslipsPage />} />
        <Route path="/payroll/payslips/:id" element={<PayslipDetailPage />} />
        <Route path="/payroll/advance-salary" element={<AdvanceSalaryPage />} />
        <Route path="/payroll/bonuses" element={<BonusesPage />} />
        <Route path="/payroll/salary-changes" element={<SalaryChangesPage />} />

        <Route path="/benefits/dashboard" element={<BenefitsDashboardPage />} />
        <Route path="/benefits/plans" element={<BenefitPlansPage />} />
        <Route path="/benefits/enrollments" element={<BenefitEnrollmentsPage />} />
        <Route path="/benefits/claims" element={<BenefitClaimsPage />} />
        <Route path="/benefits/loans" element={<LoansPage />} />
        <Route path="/benefits/vouchers" element={<VouchersPage />} />

        <Route path="/hr/*" element={<PlaceholderPage title="HR" subtitle="Attendance, time off, and people ops" module="HR" icon={<Calendar size={26} />} />} />
        <Route path="/hiring/*" element={<PlaceholderPage title="Hiring" subtitle="Requisitions, pipeline, offers, referrals" module="Hiring" icon={<Handshake size={26} />} />} />
        <Route path="/it/*" element={<PlaceholderPage title="IT Administration" subtitle="Devices, software, baseline, EDR" module="IT Administration" icon={<Laptop size={26} />} />} />
        <Route path="/mobility/*" element={<PlaceholderPage title="Mobility" subtitle="Visas, relocation, immigration, travel" module="Mobility" icon={<Plane size={26} />} />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
