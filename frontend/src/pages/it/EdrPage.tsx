import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Zap, AlertTriangle } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { useToast } from '../../components/Toast';
import { formatDateTime, humanizeEnum } from '../../utils/format';

const VENDORS = ['crowdstrike', 'sentinelone', 'microsoft_defender', 'sophos', 'carbon_black', 'elastic', 'custom'];
const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];
const STATUSES = ['new', 'triaged', 'in_progress', 'resolved', 'false_positive'];

export function EdrPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ vendor: 'crowdstrike', display_name: '', api_base_url: '', credentials_ref: '' });

  const { data: integrations, isLoading: intsLoading, refetch: refetchInts } = useQuery({
    queryKey: ['edr.integrations'],
    queryFn: async () => (await api.get('/it/edr/integrations')).data.data as any[],
  });
  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['edr.events'],
    queryFn: async () => (await api.get('/it/edr/events', { params: { limit: 100 } })).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/it/edr/integrations', form);
      toast.success('Integration registered');
      setOpenForm(false);
      setForm({ vendor: 'crowdstrike', display_name: '', api_base_url: '', credentials_ref: '' });
      refetchInts();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const updateEventStatus = async (integrationId: string, eventId: string, status: string) => {
    try {
      await api.patch(`/it/edr/integrations/${integrationId}/events/${eventId}/status`, { status });
      toast.success('Event updated');
      refetchEvents();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  return (
    <div className="pp-stack">
      <PageHeader
        title="EDR"
        subtitle="Integrations and endpoint detection events"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Register integration</Button>}
      />

      <Card>
        <CardHeader title="Integrations" subtitle="Vendors connected to this workspace" />
        <DataTable
          loading={intsLoading}
          rows={integrations || []}
          empty={<EmptyState icon={<Zap size={22} />} title="No EDR integrations" action={<Button onClick={() => setOpenForm(true)}>Register integration</Button>} />}
          columns={[
            { key: 'name', header: 'Name', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.display_name}</span> },
            { key: 'vendor', header: 'Vendor', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.vendor)}</Badge> },
            { key: 'url', header: 'API URL', render: (r: any) => r.api_base_url ? <span className="pp-mono" style={{ fontSize: 12 }}>{r.api_base_url}</span> : <span className="pp-soft">-</span> },
            { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '140px' },
            { key: 'sync', header: 'Last synced', render: (r: any) => r.last_synced_at ? formatDateTime(r.last_synced_at) : <span className="pp-soft">-</span> },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title={<div className="pp-row" style={{ gap: 8 }}><AlertTriangle size={16} /> Events</div>} subtitle="Endpoint detection alerts across integrations" />
        <DataTable
          loading={eventsLoading}
          rows={events || []}
          empty={<EmptyState icon={<AlertTriangle size={22} />} title="No EDR events" description="Events will appear here as EDR integrations ingest data." />}
          columns={[
            { key: 'occurred', header: 'When', render: (r: any) => formatDateTime(r.occurred_at), width: '180px' },
            { key: 'title', header: 'Event', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.title || r.event_type}</div>{r.summary && <div className="pp-soft" style={{ fontSize: 12 }}>{r.summary.slice(0, 80)}</div>}</div> },
            { key: 'type', header: 'Type', render: (r: any) => <span className="pp-mono" style={{ fontSize: 12 }}>{r.event_type}</span> },
            { key: 'device', header: 'Device', render: (r: any) => r.device ? <span className="pp-mono" style={{ fontSize: 12 }}>{r.device.asset_tag}</span> : <span className="pp-soft">-</span> },
            { key: 'sev', header: 'Severity', render: (r: any) => <Badge tone={r.severity === 'critical' || r.severity === 'high' ? 'danger' : r.severity === 'medium' ? 'warning' : 'muted'}>{humanizeEnum(r.severity)}</Badge>, width: '110px' },
            { key: 'status', header: 'Status', render: (r: any) => (
              <Select value={r.status} onChange={(e) => updateEventStatus(r.edr_integration_id, r.id, e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
              </Select>
            ), width: '160px' },
          ]}
        />
      </Card>

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Register EDR integration" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Register</Button></>}>
        <div className="pp-stack">
          <Select label="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}>
            {VENDORS.map((v) => <option key={v} value={v}>{humanizeEnum(v)}</option>)}
          </Select>
          <Input label="Display name" required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          <Input label="API base URL" value={form.api_base_url} onChange={(e) => setForm({ ...form, api_base_url: e.target.value })} />
          <Input label="Credentials reference" hint="Pointer to secret store, not the secret itself" value={form.credentials_ref} onChange={(e) => setForm({ ...form, credentials_ref: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
