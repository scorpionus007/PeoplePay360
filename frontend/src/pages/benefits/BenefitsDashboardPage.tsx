import { useQuery } from '@tanstack/react-query';
import { Sparkles, Users, ClipboardList, Wallet, BadgeDollarSign, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useAuth } from '../../auth/AuthContext';
import { formatMoney, formatNumber, humanizeEnum } from '../../utils/format';

export function BenefitsDashboardPage() {
  const { user } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';
  const { data, isLoading } = useQuery({
    queryKey: ['benefits.dashboard'],
    queryFn: async () => (await api.get('/benefits/dashboard/overview')).data.data,
  });

  return (
    <div className="pp-stack">
      <PageHeader title="Benefits" subtitle="Enrollments, claims, loans, and vouchers across your organization" />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard label="Active plans" value={formatNumber(data?.kpis?.active_plans)} icon={<ShieldCheck size={18} />} tone="primary" loading={isLoading} />
        <StatCard label="Active enrollments" value={formatNumber(data?.kpis?.active_enrollments)} hint={`${data?.kpis?.pending_enrollments ?? 0} pending`} icon={<Users size={18} />} tone="info" loading={isLoading} />
        <StatCard label="Pending claims" value={formatNumber(data?.kpis?.pending_claims)} hint={`${data?.kpis?.approved_claims_awaiting_reimbursement ?? 0} awaiting reimbursement`} icon={<ClipboardList size={18} />} tone="warning" loading={isLoading} />
        <StatCard label="Outstanding loans" value={formatMoney(data?.kpis?.outstanding_loan_amount, currency)} hint={`${data?.kpis?.active_loans ?? 0} active`} icon={<Wallet size={18} />} tone="success" loading={isLoading} />
        <StatCard label="Reimbursed (range)" value={formatMoney(data?.kpis?.reimbursed_amount_in_range, currency)} icon={<Sparkles size={18} />} tone="neutral" loading={isLoading} />
        <StatCard label="Vouchers in circulation" value={formatNumber(data?.kpis?.vouchers_in_circulation)} icon={<BadgeDollarSign size={18} />} tone="danger" loading={isLoading} />
      </div>

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card>
          <CardHeader title="Plans by category" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {(data?.plans_by_category || []).map((r: any) => (
                <div key={r.category} className="pp-row" style={{ justifyContent: 'space-between', padding: '8px 12px', background: 'var(--pp-surface-2)', borderRadius: 'var(--pp-radius-md)', border: '1px solid var(--pp-border)' }}>
                  <Badge tone="primary">{humanizeEnum(r.category)}</Badge>
                  <span style={{ fontWeight: 700 }}>{r.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Claims by status" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {(data?.claims_by_status || []).map((r: any) => (
                <div key={r.status} className="pp-row" style={{ justifyContent: 'space-between', padding: '8px 12px', background: 'var(--pp-surface-2)', borderRadius: 'var(--pp-radius-md)', border: '1px solid var(--pp-border)' }}>
                  <Badge tone="neutral">{humanizeEnum(r.status)}</Badge>
                  <span style={{ fontWeight: 700 }}>{r.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
