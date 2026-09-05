import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { humanizeEnum } from '../../utils/format';

const CATEGORIES = ['patch', 'encryption', 'mfa', 'antivirus', 'edr', 'firewall', 'backup', 'password_policy', 'access_control', 'os_config'];
const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];

export function BaselinePage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['baseline.controls'],
    queryFn: async () => (await api.get('/it/baseline/controls')).data.data as any[],
  });
  const postureQ = useQuery({
    queryKey: ['baseline.posture'],
    queryFn: async () => (await api.get('/it/baseline/posture')).data.data,
  });

  const openCreate = () => { setEditing(null); setForm(defaults()); setOpenForm(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ ...defaults(), ...r }); setOpenForm(true); };

  const save = async () => {
    try {
      if (editing) {
        await api.patch(`/it/baseline/controls/${editing.id}`, form);
        toast.success('Control updated');
      } else {
        await api.post('/it/baseline/controls', form);
        toast.success('Control created');
      }
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const posture = postureQ.data;

  return (
    <div className="pp-stack">
      <PageHeader
        title="Baseline controls"
        subtitle="Security posture rules evaluated against every managed device"
        actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>New control</Button>}
      />

      {posture && (
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <PostureCard label="Devices tracked" value={posture.devices} />
          <PostureCard label="Passing devices" value={posture.devices_with_pass} tone="success" />
          <PostureCard label="Failing devices" value={posture.devices_with_fail} tone="danger" />
          <PostureCard label="Pass rate" value={`${posture.pass_rate}%`} tone="primary" />
          <PostureCard label="Checks passing" value={posture.checks.pass} tone="success" />
          <PostureCard label="Checks failing" value={posture.checks.fail} tone="danger" />
        </div>
      )}

      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<ShieldCheck size={22} />} title="No baseline controls" action={<Button onClick={openCreate}>New control</Button>} />}
        onRowClick={openEdit}
        columns={[
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '190px' },
          { key: 'name', header: 'Name', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
          { key: 'cat', header: 'Category', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.category)}</Badge> },
          { key: 'sev', header: 'Severity', render: (r: any) => <Badge tone={r.severity === 'critical' ? 'danger' : r.severity === 'high' ? 'warning' : r.severity === 'info' ? 'muted' : 'info'}>{humanizeEnum(r.severity)}</Badge>, width: '110px' },
          { key: 'mand', header: 'Mandatory', render: (r: any) => <Badge tone={r.is_mandatory ? 'warning' : 'muted'}>{r.is_mandatory ? 'Yes' : 'No'}</Badge>, width: '110px' },
          { key: 'active', header: 'Status', render: (r: any) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? 'Edit control' : 'New baseline control'} size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>{editing ? 'Save' : 'Create'}</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          <Select label="Severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
            {SEVERITIES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
          </Select>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.is_mandatory} onChange={(e) => setForm({ ...form, is_mandatory: e.target.checked })} />
            <span>Mandatory</span>
          </label>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span>Active</span>
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Remediation guidance" value={form.remediation_guidance || ''} onChange={(e) => setForm({ ...form, remediation_guidance: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function PostureCard({ label, value, tone = 'neutral' }: { label: string; value: any; tone?: string }) {
  const color = tone === 'success' ? 'var(--pp-mint-500)' : tone === 'danger' ? 'var(--pp-rose-500)' : tone === 'primary' ? 'var(--pp-primary-600)' : 'var(--pp-ink-500)';
  return (
    <div style={{ padding: 16, background: 'var(--pp-surface)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-lg)', borderLeft: `3px solid ${color}` }}>
      <div className="pp-soft" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 22, fontWeight: 700 }}>{value ?? '-'}</div>
    </div>
  );
}

function defaults() {
  return {
    code: '', name: '', category: 'encryption', severity: 'medium',
    description: '', remediation_guidance: '', is_mandatory: true, is_active: true,
  };
}
