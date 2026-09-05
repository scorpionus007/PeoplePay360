import { useQuery } from '@tanstack/react-query';
import { Plane, Globe2, Home, ClipboardList, Users, Building2 } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { formatMoney, formatNumber, humanizeEnum } from '../../utils/format';
import { useAuth } from '../../auth/AuthContext';

export function MobilityDashboardPage() {
  const { user } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';
  const { data, isLoading } = useQuery({
    queryKey: ['mobility.dashboard'],
    queryFn: async () => (await api.get('/mobility/dashboard/overview')).data.data,
  });

  return (
    <div className="pp-stack">
      <PageHeader title="Mobility overview" subtitle="Visas, relocations, immigration and travel" />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard label="Active visas" value={formatNumber(data?.kpis?.active_visa_cases)} hint={`${data?.kpis?.visas_expiring_in_30_days ?? 0} expiring in 30 days`} icon={<Globe2 size={18} />} tone="primary" loading={isLoading} />
        <StatCard label="Active relocations" value={formatNumber(data?.kpis?.active_relocations)} hint={`${data?.kpis?.completed_relocations ?? 0} completed`} icon={<Home size={18} />} tone="info" loading={isLoading} />
        <StatCard label="Open immigration" value={formatNumber(data?.kpis?.open_immigration_cases)} icon={<ClipboardList size={18} />} tone="warning" loading={isLoading} />
        <StatCard label="Upcoming travel" value={formatNumber(data?.kpis?.upcoming_travel)} icon={<Plane size={18} />} tone="success" loading={isLoading} />
        <StatCard label="Active partners" value={formatNumber(data?.kpis?.active_mobility_partners)} icon={<Users size={18} />} tone="neutral" loading={isLoading} />
        <StatCard label="Location standards" value={formatNumber(data?.kpis?.configured_location_standards)} icon={<Building2 size={18} />} tone="danger" loading={isLoading} />
      </div>

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card>
          <CardHeader title="Visas by status" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {(data?.visas_by_status || []).map((r: any) => (
                <div key={r.status} className="pp-row" style={{ justifyContent: 'space-between', padding: '8px 12px', background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
                  <Badge tone="primary">{humanizeEnum(r.status)}</Badge>
                  <span style={{ fontWeight: 700 }}>{r.count}</span>
                </div>
              ))}
              {(data?.visas_by_status || []).length === 0 && <div className="pp-soft" style={{ padding: 12 }}>No visa cases yet</div>}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Relocation spend" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 12 }}>
              <div style={{ padding: 14, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
                <div className="pp-soft" style={{ fontSize: 12 }}>Total spent</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{formatMoney(data?.kpis?.total_relocation_spent, currency)}</div>
              </div>
              <div style={{ padding: 14, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
                <div className="pp-soft" style={{ fontSize: 12 }}>Total budget</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{formatMoney(data?.kpis?.total_relocation_budget, currency)}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
