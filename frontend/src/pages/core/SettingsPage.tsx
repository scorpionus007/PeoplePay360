import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { humanizeEnum } from '../../utils/format';
import { useAuth } from '../../auth/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const { data: org } = useQuery({
    queryKey: ['org.me'],
    queryFn: async () => (await api.get('/organizations/me')).data.data,
  });

  return (
    <div className="pp-stack">
      <PageHeader title="Organization" subtitle="Workspace settings and metadata" />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <Card>
          <CardHeader title="Workspace" subtitle="High level identity" />
          <CardBody>
            <dl className="pp-grid" style={{ gap: 12 }}>
              <KV k="Name" v={org?.name} />
              <KV k="Base currency" v={org?.base_currency} />
              <KV k="Timezone" v={org?.timezone} />
              <KV k="Domain" v={org?.domain} />
              <KV k="Legal name" v={org?.legal_name} />
              <KV k="Registered" v={org?.country_code} />
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="You" subtitle="Your account, roles, permissions" />
          <CardBody>
            <dl className="pp-grid" style={{ gap: 12 }}>
              <KV k="Full name" v={user?.full_name} />
              <KV k="Email" v={user?.email} />
              <KV k="Employee ID" v={user?.employee?.employee_number} />
            </dl>
            <div style={{ marginTop: 16 }}>
              <div className="pp-soft" style={{ fontSize: 12, marginBottom: 6 }}>ROLES</div>
              <div className="pp-row" style={{ flexWrap: 'wrap', gap: 6 }}>
                {(user?.roles || []).map((r) => <Badge key={r} tone="primary">{humanizeEnum(r)}</Badge>)}
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <div className="pp-soft" style={{ fontSize: 12, marginBottom: 6 }}>PERMISSIONS ({(user?.permissions || []).length})</div>
              <div className="pp-row" style={{ flexWrap: 'wrap', gap: 4 }}>
                {(user?.permissions || []).map((p) => <Badge key={p} tone="muted">{p}</Badge>)}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v?: string | number | null }) {
  return (
    <div className="pp-row" style={{ justifyContent: 'space-between', gap: 12, padding: '8px 12px', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)', background: 'var(--pp-surface-2)' }}>
      <span className="pp-soft" style={{ fontSize: 12 }}>{k}</span>
      <span style={{ fontWeight: 600 }}>{v ?? '-'}</span>
    </div>
  );
}
