import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { AppShell } from './layout/AppShell';
import { LoginPage } from './pages/Login';
import { LandingPage } from './pages/Landing';
import { DashboardPage } from './pages/Dashboard';
import { NotFoundPage } from './pages/NotFound';
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
import { HRDashboardPage } from './pages/hr/HRDashboardPage';
import { AttendancePage } from './pages/hr/AttendancePage';
import { WorkingSchedulesPage } from './pages/hr/WorkingSchedulesPage';
import { TimeOffPage } from './pages/hr/TimeOffPage';
import { HRRequestsPage } from './pages/hr/HRRequestsPage';
import { FeedbackPage } from './pages/hr/FeedbackPage';
import { AnnouncementsPage } from './pages/hr/AnnouncementsPage';
import { HiringDashboardPage } from './pages/hiring/HiringDashboardPage';
import { RequisitionsPage } from './pages/hiring/RequisitionsPage';
import { JobPostingsPage } from './pages/hiring/JobPostingsPage';
import { CandidatesPage } from './pages/hiring/CandidatesPage';
import { ApplicationsPage } from './pages/hiring/ApplicationsPage';
import { InterviewsPage } from './pages/hiring/InterviewsPage';
import { OffersPage } from './pages/hiring/OffersPage';
import { ReferralsPage } from './pages/hiring/ReferralsPage';
import { ITDashboardPage } from './pages/it/ITDashboardPage';
import { DevicesPage } from './pages/it/DevicesPage';
import { SoftwarePage } from './pages/it/SoftwarePage';
import { BaselinePage } from './pages/it/BaselinePage';
import { EdrPage } from './pages/it/EdrPage';
import { OnboardingPage } from './pages/it/OnboardingPage';
import { MobilityDashboardPage } from './pages/mobility/MobilityDashboardPage';
import { LocationStandardsPage } from './pages/mobility/LocationStandardsPage';
import { MobilityPartnersPage } from './pages/mobility/MobilityPartnersPage';
import { VisasPage } from './pages/mobility/VisasPage';
import { RelocationsPage } from './pages/mobility/RelocationsPage';
import { ImmigrationCasesPage } from './pages/mobility/ImmigrationCasesPage';
import { TravelPage } from './pages/mobility/TravelPage';

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

        <Route path="/hr/dashboard" element={<HRDashboardPage />} />
        <Route path="/hr/attendance" element={<AttendancePage />} />
        <Route path="/hr/schedules" element={<WorkingSchedulesPage />} />
        <Route path="/hr/time-off" element={<TimeOffPage />} />
        <Route path="/hr/requests" element={<HRRequestsPage />} />
        <Route path="/hr/feedback" element={<FeedbackPage />} />
        <Route path="/hr/announcements" element={<AnnouncementsPage />} />

        <Route path="/hiring/dashboard" element={<HiringDashboardPage />} />
        <Route path="/hiring/requisitions" element={<RequisitionsPage />} />
        <Route path="/hiring/postings" element={<JobPostingsPage />} />
        <Route path="/hiring/candidates" element={<CandidatesPage />} />
        <Route path="/hiring/applications" element={<ApplicationsPage />} />
        <Route path="/hiring/interviews" element={<InterviewsPage />} />
        <Route path="/hiring/offers" element={<OffersPage />} />
        <Route path="/hiring/referrals" element={<ReferralsPage />} />

        <Route path="/it/dashboard" element={<ITDashboardPage />} />
        <Route path="/it/devices" element={<DevicesPage />} />
        <Route path="/it/software" element={<SoftwarePage />} />
        <Route path="/it/baseline" element={<BaselinePage />} />
        <Route path="/it/edr" element={<EdrPage />} />
        <Route path="/it/onboarding" element={<OnboardingPage />} />

        <Route path="/mobility/dashboard" element={<MobilityDashboardPage />} />
        <Route path="/mobility/location-standards" element={<LocationStandardsPage />} />
        <Route path="/mobility/partners" element={<MobilityPartnersPage />} />
        <Route path="/mobility/visas" element={<VisasPage />} />
        <Route path="/mobility/relocations" element={<RelocationsPage />} />
        <Route path="/mobility/immigration" element={<ImmigrationCasesPage />} />
        <Route path="/mobility/travel" element={<TravelPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
