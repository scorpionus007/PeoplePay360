import { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { RequirePermission } from './auth/RequirePermission';
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

/** Wrap a route element in a permission guard (admin always passes). */
function guard(element: JSX.Element, ...anyPerm: string[]) {
  return <RequirePermission anyPerm={anyPerm}>{element}</RequirePermission>;
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

        <Route path="/employees" element={guard(<EmployeesPage />, 'employee.read')} />
        <Route path="/departments" element={guard(<DepartmentsPage />, 'department.read')} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/payroll/dashboard" element={guard(<PayrollDashboardPage />, 'payroll.read')} />
        <Route path="/payroll/salary-rules" element={guard(<SalaryRulesPage />, 'payroll.rule.read', 'payroll.read')} />
        <Route path="/payroll/salary-structures" element={guard(<SalaryStructuresPage />, 'payroll.structure.read', 'payroll.read')} />
        <Route path="/payroll/salary-structures/:id" element={guard(<SalaryStructureDetailPage />, 'payroll.structure.read', 'payroll.read')} />
        <Route path="/payroll/contracts" element={guard(<ContractsPage />, 'contract.read')} />
        <Route path="/payroll/payruns" element={guard(<PayrunsPage />, 'payrun.read')} />
        <Route path="/payroll/payruns/:id" element={guard(<PayrunDetailPage />, 'payrun.read')} />
        <Route path="/payroll/payslips" element={guard(<PayslipsPage />, 'payslip.read')} />
        <Route path="/payroll/payslips/:id" element={guard(<PayslipDetailPage />, 'payslip.read')} />
        <Route path="/payroll/advance-salary" element={guard(<AdvanceSalaryPage />, 'advance.salary.request', 'advance.salary.approve')} />
        <Route path="/payroll/bonuses" element={guard(<BonusesPage />, 'bonus.manage', 'payroll.read')} />
        <Route path="/payroll/salary-changes" element={guard(<SalaryChangesPage />, 'salary.change.suggest', 'salary.change.decide', 'salary.change.approve')} />

        <Route path="/benefits/dashboard" element={guard(<BenefitsDashboardPage />, 'benefit.plan.read')} />
        <Route path="/benefits/plans" element={guard(<BenefitPlansPage />, 'benefit.plan.read')} />
        <Route path="/benefits/enrollments" element={guard(<BenefitEnrollmentsPage />, 'benefit.enrollment.read')} />
        <Route path="/benefits/claims" element={guard(<BenefitClaimsPage />, 'benefit.claim.read')} />
        <Route path="/benefits/loans" element={guard(<LoansPage />, 'loan.request.read')} />
        <Route path="/benefits/vouchers" element={guard(<VouchersPage />, 'voucher.read')} />

        <Route path="/hr/dashboard" element={guard(<HRDashboardPage />, 'hr.request.read', 'attendance.read')} />
        <Route path="/hr/attendance" element={guard(<AttendancePage />, 'attendance.read', 'attendance.self.write')} />
        <Route path="/hr/schedules" element={guard(<WorkingSchedulesPage />, 'working_schedule.read')} />
        <Route path="/hr/time-off" element={guard(<TimeOffPage />, 'timeoff.request.read', 'timeoff.request.write')} />
        <Route path="/hr/requests" element={guard(<HRRequestsPage />, 'hr.request.read')} />
        <Route path="/hr/feedback" element={guard(<FeedbackPage />, 'feedback.read', 'feedback.write')} />
        <Route path="/hr/announcements" element={<AnnouncementsPage />} />

        <Route path="/hiring/dashboard" element={guard(<HiringDashboardPage />, 'requisition.read', 'application.read')} />
        <Route path="/hiring/requisitions" element={guard(<RequisitionsPage />, 'requisition.read')} />
        <Route path="/hiring/postings" element={guard(<JobPostingsPage />, 'job.posting.read')} />
        <Route path="/hiring/candidates" element={guard(<CandidatesPage />, 'candidate.read')} />
        <Route path="/hiring/applications" element={guard(<ApplicationsPage />, 'application.read')} />
        <Route path="/hiring/interviews" element={guard(<InterviewsPage />, 'interview.read')} />
        <Route path="/hiring/offers" element={guard(<OffersPage />, 'offer.read')} />
        <Route path="/hiring/referrals" element={guard(<ReferralsPage />, 'referral.submit', 'referral.read')} />

        <Route path="/it/dashboard" element={guard(<ITDashboardPage />, 'it.device.read')} />
        <Route path="/it/devices" element={guard(<DevicesPage />, 'it.device.read')} />
        <Route path="/it/software" element={guard(<SoftwarePage />, 'it.software.read')} />
        <Route path="/it/baseline" element={guard(<BaselinePage />, 'it.baseline.read')} />
        <Route path="/it/edr" element={guard(<EdrPage />, 'it.edr.read')} />
        <Route path="/it/onboarding" element={guard(<OnboardingPage />, 'it.onboarding.read')} />

        <Route path="/mobility/dashboard" element={guard(<MobilityDashboardPage />, 'visa.read', 'location.standard.read')} />
        <Route path="/mobility/location-standards" element={guard(<LocationStandardsPage />, 'location.standard.read')} />
        <Route path="/mobility/partners" element={guard(<MobilityPartnersPage />, 'mobility.partner.read')} />
        <Route path="/mobility/visas" element={guard(<VisasPage />, 'visa.read')} />
        <Route path="/mobility/relocations" element={guard(<RelocationsPage />, 'relocation.read')} />
        <Route path="/mobility/immigration" element={guard(<ImmigrationCasesPage />, 'immigration.read')} />
        <Route path="/mobility/travel" element={guard(<TravelPage />, 'travel.read')} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
