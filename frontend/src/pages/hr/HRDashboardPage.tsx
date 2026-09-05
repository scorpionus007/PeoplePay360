import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, MessageSquare, Sparkles, AlertTriangle, Plane, ClipboardList } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { formatNumber, humanizeEnum } from '../../utils/format';

export function HRDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['hr.dashboard'],
    queryFn: async () => (await api.get('/hr/dashboard/overview')).data.data,
  });

  const buckets = data?.attendance?.buckets || {};
  const totals = data?.attendance?.totals || {};

  return (
    <div className="pp-stack">
      <PageHeader title="HR overview" subtitle="People operations, attendance, time off, and requests at a glance" />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard label="Active employees" value={formatNumber(data?.kpis?.active_employees)} hint={`${data?.kpis?.total_employees ?? 0} total`} icon={<Users size={18} />} tone="primary" loading={isLoading} />
        <StatCard label="Pending time off" value={formatNumber(data?.kpis?.pending_time_off_requests)} hint={`${data?.kpis?.approved_time_off_in_range ?? 0} approved in range`} icon={<Plane size={18} />} tone="info" loading={isLoading} />
        <StatCard label="Open HR requests" value={formatNumber(data?.kpis?.open_hr_requests)} icon={<MessageSquare size={18} />} tone="warning" loading={isLoading} />
        <StatCard label="New feedback" value={formatNumber(data?.kpis?.new_feedback)} hint={`${data?.kpis?.escalated_feedback ?? 0} escalated`} icon={<Sparkles size={18} />} tone="danger" loading={isLoading} />
        <StatCard label="Pending allocations" value={formatNumber(data?.kpis?.pending_allocations)} icon={<ClipboardList size={18} />} tone="success" loading={isLoading} />
        <StatCard label="Attendance edits" value={formatNumber(data?.kpis?.manually_edited_attendance)} icon={<AlertTriangle size={18} />} tone="neutral" loading={isLoading} />
      </div>

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card>
          <CardHeader title="Attendance mix" subtitle={data?.range ? `${data.range.from} to ${data.range.to}` : ''} actions={<Calendar size={16} />} />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {Object.keys(buckets).map((k) => (
                <div key={k} className="pp-row" style={{ justifyContent: 'space-between', padding: '8px 12px', background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
                  <Badge tone="neutral">{humanizeEnum(k)}</Badge>
                  <span style={{ fontWeight: 700 }}>{formatNumber(buckets[k])}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Attendance totals" subtitle="Hours worked, overtime, and manual edits" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              <Row label="Days present" value={formatNumber(totals.days_present)} />
              <Row label="Days late" value={formatNumber(totals.days_late)} />
              <Row label="Days absent" value={formatNumber(totals.days_absent)} />
              <Row label="Days on leave" value={formatNumber(totals.days_on_leave)} />
              <Row label="Missing checkouts" value={formatNumber(totals.days_missing_checkout)} />
              <Row label="Worked hours" value={formatNumber(totals.total_worked_hours, 2)} />
              <Row label="Overtime hours" value={formatNumber(totals.total_overtime_hours, 2)} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="pp-row" style={{ justifyContent: 'space-between', padding: '8px 12px', background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
      <span className="pp-soft" style={{ fontSize: 12.5 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
