import { useQuery } from '@tanstack/react-query';
import { Handshake, Users, Calendar, Send, FileText, Award } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { formatNumber, humanizeEnum } from '../../utils/format';

export function HiringDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['hiring.dashboard'],
    queryFn: async () => (await api.get('/hiring/dashboard/overview')).data.data,
  });

  return (
    <div className="pp-stack">
      <PageHeader title="Hiring overview" subtitle="Requisitions, pipeline, interviews, offers, referrals" />
      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <StatCard label="Open requisitions" value={formatNumber(data?.kpis?.open_requisitions)} hint={`${data?.kpis?.approved_requisitions ?? 0} approved`} icon={<FileText size={18} />} tone="primary" loading={isLoading} />
        <StatCard label="Published postings" value={formatNumber(data?.kpis?.published_postings)} icon={<Send size={18} />} tone="info" loading={isLoading} />
        <StatCard label="Active applications" value={formatNumber(data?.kpis?.active_applications)} icon={<Users size={18} />} tone="success" loading={isLoading} />
        <StatCard label="Upcoming interviews" value={formatNumber(data?.kpis?.upcoming_interviews)} icon={<Calendar size={18} />} tone="warning" loading={isLoading} />
        <StatCard label="Offers extended" value={formatNumber(data?.kpis?.offers_extended)} hint={`${data?.kpis?.offers_accepted ?? 0} accepted`} icon={<Handshake size={18} />} tone="neutral" loading={isLoading} />
        <StatCard label="Active referrals" value={formatNumber(data?.kpis?.active_referrals)} hint={`${data?.kpis?.hires ?? 0} hires`} icon={<Award size={18} />} tone="danger" loading={isLoading} />
      </div>

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card>
          <CardHeader title="Pipeline by stage" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {(data?.applications_by_stage || []).map((r: any) => (
                <div key={r.stage} className="pp-row" style={{ justifyContent: 'space-between', padding: '8px 12px', background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
                  <Badge tone="primary">{humanizeEnum(r.stage)}</Badge>
                  <span style={{ fontWeight: 700 }}>{r.count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Requisitions by track" />
          <CardBody>
            <div className="pp-stack" style={{ gap: 8 }}>
              {(data?.requisitions_by_track || []).map((r: any) => (
                <div key={r.track} className="pp-row" style={{ justifyContent: 'space-between', padding: '8px 12px', background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
                  <Badge tone="neutral">{humanizeEnum(r.track)}</Badge>
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
