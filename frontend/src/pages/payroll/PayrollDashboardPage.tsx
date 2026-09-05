import { useQuery } from '@tanstack/react-query';
import { Banknote, TrendingUp, Users, CheckCircle2, FileText } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { DataTable } from '../../components/DataTable';
import { formatMoney, formatNumber } from '../../utils/format';
import { useAuth } from '../../auth/AuthContext';

export function PayrollDashboardPage() {
  const { user } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';

  const { data, isLoading } = useQuery({
    queryKey: ['payroll.dashboard'],
    queryFn: async () => (await api.get('/payroll/dashboard/overview')).data.data,
  });

  return (
    <div className="pp-stack">
      <PageHeader title="Payroll" subtitle="Live payroll KPIs, salary cost, and salary structures" />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard label="Total net paid" value={formatMoney(data?.kpis?.total_net_paid, currency)} icon={<Banknote size={18} />} tone="primary" loading={isLoading} />
        <StatCard label="Total gross paid" value={formatMoney(data?.kpis?.total_gross_paid, currency)} icon={<TrendingUp size={18} />} tone="info" loading={isLoading} />
        <StatCard label="Average net" value={formatMoney(data?.kpis?.average_net, currency)} icon={<Users size={18} />} tone="success" loading={isLoading} />
        <StatCard label="Payslips generated" value={formatNumber(data?.kpis?.payslips_generated)} hint={`${data?.kpis?.payslips_paid ?? 0} paid`} icon={<FileText size={18} />} tone="warning" loading={isLoading} />
        <StatCard label="Active contracts" value={formatNumber(data?.kpis?.active_contracts)} icon={<CheckCircle2 size={18} />} tone="neutral" loading={isLoading} />
      </div>

      <Card>
        <CardHeader title="Salary cost by department" subtitle="Aggregated across paid payslips" />
        <DataTable
          loading={isLoading}
          rows={data?.salary_cost_by_department || []}
          columns={[
            { key: 'dept', header: 'Department', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.department}</span> },
            { key: 'count', header: 'Payslips', render: (r: any) => formatNumber(r.payslip_count), align: 'right' as const },
            { key: 'net', header: 'Total net', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.total_net, currency)}</span>, align: 'right' as const },
          ]}
        />
      </Card>
    </div>
  );
}
