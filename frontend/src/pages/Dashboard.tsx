import { useQuery } from '@tanstack/react-query';
import { Banknote, Users, Sparkles, Laptop, Handshake, Plane, Calendar, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Badge } from '../components/Badge';
import { formatMoney, formatNumber } from '../utils/format';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

function useDashboard<T = any>(path: string, enabled = true) {
  return useQuery<T>({
    queryKey: ['dash', path],
    enabled,
    queryFn: async () => (await api.get(path)).data.data,
  });
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';
  const isAdmin = user?.roles?.includes('admin');

  const payroll = useDashboard<any>('/payroll/dashboard/overview', isAdmin || hasPermission('payroll.read'));
  const hr = useDashboard<any>('/hr/dashboard/overview', isAdmin || hasPermission('hr.request.read'));
  const it = useDashboard<any>('/it/dashboard/overview', isAdmin || hasPermission('it.device.read'));
  const benefits = useDashboard<any>('/benefits/dashboard/overview', isAdmin || hasPermission('benefit.plan.read'));
  const hiring = useDashboard<any>('/hiring/dashboard/overview', isAdmin || hasPermission('requisition.read'));
  const mobility = useDashboard<any>('/mobility/dashboard/overview', isAdmin || hasPermission('visa.read'));

  const totalNet = payroll.data?.kpis?.total_net_paid ?? 0;
  const employees = payroll.data?.kpis?.employee_count ?? hr.data?.kpis?.total_employees ?? 0;

  return (
    <div className="pp-dashboard">
      <PageHeader
        title={`Good day, ${user?.full_name?.split(' ')[0] || 'there'}`}
        subtitle={`Here is what is happening across ${user?.organization?.name || 'your workspace'} today.`}
      />

      <section className="pp-dashboard__stats">
        <StatCard label="Total net paid" value={formatMoney(totalNet, currency)} hint="Across all payruns" icon={<Banknote size={18} />} tone="primary" loading={payroll.isLoading} />
        <StatCard label="Active employees" value={formatNumber(employees)} hint={`${payroll.data?.kpis?.active_contracts ?? 0} active contracts`} icon={<Users size={18} />} tone="info" loading={hr.isLoading && payroll.isLoading} />
        <StatCard label="Open hiring" value={formatNumber(hiring.data?.kpis?.active_applications ?? 0)} hint={`${hiring.data?.kpis?.open_requisitions ?? 0} open reqs`} icon={<Handshake size={18} />} tone="success" loading={hiring.isLoading} />
        <StatCard label="Managed devices" value={formatNumber(it.data?.kpis?.total_devices ?? 0)} hint={`${it.data?.kpis?.baseline_pass_rate ?? 0}% baseline pass`} icon={<Laptop size={18} />} tone="warning" loading={it.isLoading} />
      </section>

      <section className="pp-dashboard__grid">
        <Card>
          <CardHeader title="Payroll pulse" subtitle="Live payslip and payment status" actions={<Badge tone="primary" dot>Live</Badge>} />
          <CardBody>
            <div className="pp-dashboard__list">
              <MetricRow label="Payslips generated" value={formatNumber(payroll.data?.kpis?.payslips_generated ?? 0)} loading={payroll.isLoading} />
              <MetricRow label="Payslips paid" value={formatNumber(payroll.data?.kpis?.payslips_paid ?? 0)} loading={payroll.isLoading} />
              <MetricRow label="Salary structures" value={formatNumber(payroll.data?.kpis?.salary_structures ?? 0)} loading={payroll.isLoading} />
              <MetricRow label="Average net" value={formatMoney(payroll.data?.kpis?.average_net ?? 0, currency)} loading={payroll.isLoading} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="People operations" subtitle="Attendance, time off, HR requests" actions={<Calendar size={16} />} />
          <CardBody>
            <div className="pp-dashboard__list">
              <MetricRow label="Pending time off" value={formatNumber(hr.data?.kpis?.pending_time_off_requests ?? 0)} loading={hr.isLoading} />
              <MetricRow label="Open HR requests" value={formatNumber(hr.data?.kpis?.open_hr_requests ?? 0)} loading={hr.isLoading} />
              <MetricRow label="New feedback" value={formatNumber(hr.data?.kpis?.new_feedback ?? 0)} loading={hr.isLoading} />
              <MetricRow label="Corrected attendance" value={formatNumber(hr.data?.kpis?.manually_edited_attendance ?? 0)} loading={hr.isLoading} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Benefits" subtitle="Enrollments, claims, loans, vouchers" actions={<Sparkles size={16} />} />
          <CardBody>
            <div className="pp-dashboard__list">
              <MetricRow label="Active plans" value={formatNumber(benefits.data?.kpis?.active_plans ?? 0)} loading={benefits.isLoading} />
              <MetricRow label="Active enrollments" value={formatNumber(benefits.data?.kpis?.active_enrollments ?? 0)} loading={benefits.isLoading} />
              <MetricRow label="Pending claims" value={formatNumber(benefits.data?.kpis?.pending_claims ?? 0)} loading={benefits.isLoading} />
              <MetricRow label="Outstanding loans" value={formatMoney(benefits.data?.kpis?.outstanding_loan_amount ?? 0, currency)} loading={benefits.isLoading} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Hiring pipeline" subtitle="Requisitions, applications, offers" actions={<TrendingUp size={16} />} />
          <CardBody>
            <div className="pp-dashboard__list">
              <MetricRow label="Published postings" value={formatNumber(hiring.data?.kpis?.published_postings ?? 0)} loading={hiring.isLoading} />
              <MetricRow label="Upcoming interviews" value={formatNumber(hiring.data?.kpis?.upcoming_interviews ?? 0)} loading={hiring.isLoading} />
              <MetricRow label="Offers extended" value={formatNumber(hiring.data?.kpis?.offers_extended ?? 0)} loading={hiring.isLoading} />
              <MetricRow label="Active referrals" value={formatNumber(hiring.data?.kpis?.active_referrals ?? 0)} loading={hiring.isLoading} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="IT fleet" subtitle="Devices, baseline, EDR events" actions={<Laptop size={16} />} />
          <CardBody>
            <div className="pp-dashboard__list">
              <MetricRow label="Software items" value={formatNumber(it.data?.kpis?.software_items ?? 0)} loading={it.isLoading} />
              <MetricRow label="EDR integrations" value={formatNumber(it.data?.kpis?.active_edr_integrations ?? 0)} loading={it.isLoading} />
              <MetricRow label="Open high severity" value={formatNumber(it.data?.kpis?.open_high_severity_events ?? 0)} loading={it.isLoading} />
              <MetricRow label="Pending onboarding" value={formatNumber(it.data?.kpis?.pending_onboarding_provisions ?? 0)} loading={it.isLoading} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Mobility" subtitle="Visas, relocations, travel" actions={<Plane size={16} />} />
          <CardBody>
            <div className="pp-dashboard__list">
              <MetricRow label="Active visas" value={formatNumber(mobility.data?.kpis?.active_visa_cases ?? 0)} loading={mobility.isLoading} />
              <MetricRow label="Expiring in 30 days" value={formatNumber(mobility.data?.kpis?.visas_expiring_in_30_days ?? 0)} loading={mobility.isLoading} />
              <MetricRow label="Active relocations" value={formatNumber(mobility.data?.kpis?.active_relocations ?? 0)} loading={mobility.isLoading} />
              <MetricRow label="Upcoming travel" value={formatNumber(mobility.data?.kpis?.upcoming_travel ?? 0)} loading={mobility.isLoading} />
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function MetricRow({ label, value, loading }: { label: string; value: string; loading?: boolean }) {
  return (
    <div className="pp-dashboard__row">
      <span className="pp-dashboard__row-label">{label}</span>
      {loading ? <span className="pp-skeleton pp-dashboard__row-sk" /> : <span className="pp-dashboard__row-value">{value}</span>}
    </div>
  );
}
