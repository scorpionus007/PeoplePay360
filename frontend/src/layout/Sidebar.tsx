import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Banknote,
  FileText,
  Calendar,
  ClipboardList,
  Handshake,
  UserPlus,
  Laptop,
  Plane,
  Sparkles,
  Wallet,
  MessageSquare,
  ShieldCheck,
  BadgeDollarSign,
  Award,
  Settings,
  Home,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import './Sidebar.css';

type Item = { to: string; label: string; icon: React.ComponentType<any>; anyPerm?: string[] };
type Group = { label: string; items: Item[] };

const NAV: Group[] = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Organization',
    items: [
      { to: '/employees', label: 'Employees', icon: Users, anyPerm: ['employee.read'] },
      { to: '/departments', label: 'Departments', icon: Building2, anyPerm: ['department.read'] },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { to: '/payroll/dashboard', label: 'Payroll Overview', icon: Banknote, anyPerm: ['payroll.read'] },
      { to: '/payroll/contracts', label: 'Contracts', icon: FileText, anyPerm: ['contract.read'] },
      { to: '/payroll/salary-structures', label: 'Salary Structures', icon: ClipboardList, anyPerm: ['payroll.structure.read', 'payroll.read'] },
      { to: '/payroll/salary-rules', label: 'Salary Rules', icon: ClipboardList, anyPerm: ['payroll.rule.read', 'payroll.read'] },
      { to: '/payroll/payruns', label: 'Payruns', icon: Calendar, anyPerm: ['payrun.read'] },
      { to: '/payroll/payslips', label: 'Payslips', icon: FileText, anyPerm: ['payslip.read'] },
      { to: '/payroll/advance-salary', label: 'Advance Salary', icon: Wallet, anyPerm: ['advance.salary.request', 'advance.salary.approve'] },
      { to: '/payroll/bonuses', label: 'Bonuses', icon: Award, anyPerm: ['bonus.manage', 'payroll.read'] },
      { to: '/payroll/salary-changes', label: 'Salary Changes', icon: BadgeDollarSign, anyPerm: ['salary.change.suggest', 'salary.change.decide', 'salary.change.approve'] },
    ],
  },
  {
    label: 'Benefits',
    items: [
      { to: '/benefits/dashboard', label: 'Benefits Overview', icon: Sparkles, anyPerm: ['benefit.plan.read'] },
      { to: '/benefits/plans', label: 'Plans', icon: ShieldCheck, anyPerm: ['benefit.plan.read'] },
      { to: '/benefits/enrollments', label: 'Enrollments', icon: UserPlus, anyPerm: ['benefit.enrollment.read'] },
      { to: '/benefits/claims', label: 'Claims', icon: ClipboardList, anyPerm: ['benefit.claim.read'] },
      { to: '/benefits/loans', label: 'Loans', icon: Wallet, anyPerm: ['loan.request.read'] },
      { to: '/benefits/vouchers', label: 'Vouchers', icon: BadgeDollarSign, anyPerm: ['voucher.read'] },
    ],
  },
  {
    label: 'HR',
    items: [
      { to: '/hr/dashboard', label: 'HR Overview', icon: Sparkles, anyPerm: ['hr.request.read', 'attendance.read'] },
      { to: '/hr/attendance', label: 'Attendance', icon: Calendar, anyPerm: ['attendance.read', 'attendance.self.write'] },
      { to: '/hr/schedules', label: 'Working Schedules', icon: ClipboardList, anyPerm: ['working_schedule.read'] },
      { to: '/hr/time-off', label: 'Time Off', icon: Plane, anyPerm: ['timeoff.request.read', 'timeoff.request.write'] },
      { to: '/hr/requests', label: 'Requests', icon: MessageSquare, anyPerm: ['hr.request.read'] },
      { to: '/hr/feedback', label: 'Feedback', icon: Sparkles, anyPerm: ['feedback.read', 'feedback.write'] },
      { to: '/hr/announcements', label: 'Announcements', icon: MessageSquare },
    ],
  },
  {
    label: 'Hiring',
    items: [
      { to: '/hiring/dashboard', label: 'Hiring Overview', icon: Handshake, anyPerm: ['requisition.read', 'application.read'] },
      { to: '/hiring/requisitions', label: 'Requisitions', icon: ClipboardList, anyPerm: ['requisition.read'] },
      { to: '/hiring/postings', label: 'Job Postings', icon: Handshake, anyPerm: ['job.posting.read'] },
      { to: '/hiring/candidates', label: 'Candidates', icon: Users, anyPerm: ['candidate.read'] },
      { to: '/hiring/applications', label: 'Applications', icon: UserPlus, anyPerm: ['application.read'] },
      { to: '/hiring/interviews', label: 'Interviews', icon: Calendar, anyPerm: ['interview.read'] },
      { to: '/hiring/offers', label: 'Offers', icon: Handshake, anyPerm: ['offer.read'] },
      { to: '/hiring/referrals', label: 'Referrals', icon: Award, anyPerm: ['referral.submit', 'referral.read'] },
    ],
  },
  {
    label: 'IT',
    items: [
      { to: '/it/dashboard', label: 'IT Overview', icon: Sparkles, anyPerm: ['it.device.read'] },
      { to: '/it/devices', label: 'Devices', icon: Laptop, anyPerm: ['it.device.read'] },
      { to: '/it/software', label: 'Software', icon: ClipboardList, anyPerm: ['it.software.read'] },
      { to: '/it/baseline', label: 'Baseline', icon: ShieldCheck, anyPerm: ['it.baseline.read'] },
      { to: '/it/edr', label: 'EDR', icon: ShieldCheck, anyPerm: ['it.edr.read'] },
      { to: '/it/onboarding', label: 'Onboarding', icon: UserPlus, anyPerm: ['it.onboarding.read'] },
    ],
  },
  {
    label: 'Mobility',
    items: [
      { to: '/mobility/dashboard', label: 'Mobility Overview', icon: Sparkles, anyPerm: ['visa.read', 'location.standard.read'] },
      { to: '/mobility/location-standards', label: 'Location Standards', icon: Home, anyPerm: ['location.standard.read'] },
      { to: '/mobility/partners', label: 'Partners', icon: Handshake, anyPerm: ['mobility.partner.read'] },
      { to: '/mobility/visas', label: 'Visas', icon: Plane, anyPerm: ['visa.read'] },
      { to: '/mobility/relocations', label: 'Relocations', icon: Home, anyPerm: ['relocation.read'] },
      { to: '/mobility/immigration', label: 'Immigration Cases', icon: ClipboardList, anyPerm: ['immigration.read'] },
      { to: '/mobility/travel', label: 'Travel', icon: Plane, anyPerm: ['travel.read'] },
    ],
  },
  {
    label: 'Settings',
    items: [{ to: '/settings', label: 'Organization', icon: Settings }],
  },
];

export function Sidebar() {
  const { user, hasPermission } = useAuth();
  const isAdmin = !!user?.roles?.includes('admin');
  return (
    <aside className="pp-sidebar">
      <div className="pp-sidebar__brand">
        <Logo size={22} />
      </div>

      <nav className="pp-sidebar__nav">
        {NAV.map((group) => {
          const items = group.items.filter((it) => !it.anyPerm || isAdmin || it.anyPerm.some((p) => hasPermission(p)));
          if (items.length === 0) return null;
          return (
            <div key={group.label} className="pp-sidebar__group">
              <div className="pp-sidebar__group-label">{group.label}</div>
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  className={({ isActive }) => clsx('pp-sidebar__link', isActive && 'pp-sidebar__link--active')}
                >
                  <span className="pp-sidebar__link-icon">
                    <item.icon size={16} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="pp-sidebar__footer">
        <span className="pp-mono">v0.1.0</span>
        <span className="pp-sidebar__footer-dot" />
        <span>Odoo Hackathon 2026</span>
      </div>
    </aside>
  );
}
