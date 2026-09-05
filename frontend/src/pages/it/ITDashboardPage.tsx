import { useQuery } from '@tanstack/react-query';
import { Laptop, ShieldCheck, AlertTriangle, Package, Zap, Users } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { formatNumber, humanizeEnum } from '../../utils/format';

export function ITDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['it.dashboard'],
    queryFn: async () => (await api.get('/it/dashboard/overview')).data.data,
  });

  const posture = data?.baseline_posture;

  return (
    <div className="pp-stack">
      <PageHeader title="IT overview" subtitle="Fleet, software, baseline posture, EDR and onboarding" />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard label="Total devices" value={formatNumber(data?.kpis?.total_devices)} icon={<Laptop size={18} />} tone="primary" loading={isLoading} />
        <StatCard label="Software items" value={formatNumber(data?.kpis?.software_items)} icon={<Package size={18} />} tone="info" loading={isLoading} />
        <StatCard label="Active EDR integrations" value={formatNumber(data?.kpis?.active_edr_integrations)} icon={<Zap size={18} />} tone="warning" loading={isLoading} />
        <StatCard label="Open high severity events" value={formatNumber(data?.kpis?.open_high_severity_events)} icon={<AlertTriangle size={18} />} tone="danger" loading={isLoading} />
        <StatCard label="Pending onboarding" value={formatNumber(data?.kpis?.pending_onboarding_provisions)} icon={<Users size={18} />} tone="success" loading={isLoading} />
        <StatCard label="Baseline pass rate" value={`${data?.kpis?.baseline_pass_rate ?? 0}%`} icon={<ShieldCheck size={18} />} tone="neutral" loading={isLoading} />
      </div>

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <Card>
          <CardHeader title="Devices by status" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {Object.entries(data?.devices_by_status || {}).map(([k, v]) => (
                <Row key={k} label={humanizeEnum(k)} value={formatNumber(v as number)} />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="By ownership" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {(data?.devices_by_ownership || []).map((r: any) => (
                <Row key={r.ownership} label={humanizeEnum(r.ownership)} value={formatNumber(r.count)} />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="By category" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {(data?.devices_by_category || []).map((r: any) => (
                <Row key={r.category} label={humanizeEnum(r.category)} value={formatNumber(r.count)} />
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Baseline posture" subtitle={`${formatNumber(posture?.devices)} devices tracked`} />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              <Row label="Devices with any pass" value={formatNumber(posture?.devices_with_pass)} />
              <Row label="Devices with any fail" value={formatNumber(posture?.devices_with_fail)} />
              <Row label="Checks passing" value={formatNumber(posture?.checks?.pass)} />
              <Row label="Checks failing" value={formatNumber(posture?.checks?.fail)} />
              <Row label="Pass rate" value={`${posture?.pass_rate ?? 0}%`} />
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
      <Badge tone="neutral">{label}</Badge>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}
