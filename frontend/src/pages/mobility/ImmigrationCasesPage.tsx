import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ClipboardList, CheckCircle2 } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, humanizeEnum } from '../../utils/format';

const CASE_TYPES = ['work_visa', 'permanent_residency', 'family_sponsorship', 'citizenship', 'renewal', 'appeal'];
const STATUSES = ['open', 'in_progress', 'on_hold', 'escalated', 'resolved', 'cancelled'];

export function ImmigrationCasesPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [resolveOpen, setResolveOpen] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults());
  const [resolveSummary, setResolveSummary] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobility.immigration'],
    queryFn: async () => (await api.get('/mobility/immigration-cases')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const partnersQ = useQuery({
    queryKey: ['mobility.partners'],
    queryFn: async () => (await api.get('/mobility/partners')).data.data as any[],
  });

  const save = async () => {
    try {
      await api.post('/mobility/immigration-cases', {
        employee_id: form.employee_id,
        mobility_partner_id: form.mobility_partner_id || null,
        case_type: form.case_type,
        country_code: form.country_code,
        priority: form.priority,
        dependents_count: Number(form.dependents_count) || 0,
        next_action_due: form.next_action_due || null,
        summary: form.summary || null,
      });
      toast.success('Case created');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const changeStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/mobility/immigration-cases/${id}`, { status });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  const resolve = async () => {
    try {
      await api.post(`/mobility/immigration-cases/${resolveOpen.id}/resolve`, { summary: resolveSummary || null });
      toast.success('Case resolved');
      setResolveOpen(null);
      setResolveSummary('');
      refetch();
    } catch (err) {
      toast.error('Resolve failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Immigration cases"
        subtitle="End to end tracking with external counsel"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New case</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<ClipboardList size={22} />} title="No immigration cases" action={<Button onClick={() => setOpenForm(true)}>New case</Button>} />}
        columns={[
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? <div><div style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.case_code}</div></div> : '-' },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.case_type)}</Badge> },
          { key: 'country', header: 'Country', render: (r: any) => r.country_code, width: '90px' },
          { key: 'partner', header: 'Partner', render: (r: any) => r.partner?.name || <span className="pp-soft">-</span> },
          { key: 'opened', header: 'Opened', render: (r: any) => r.opened_at ? formatDate(r.opened_at) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'due', header: 'Next action', render: (r: any) => r.next_action_due ? formatDate(r.next_action_due) : <span className="pp-soft">-</span>, width: '120px' },
          { key: 'status', header: 'Status', render: (r: any) => (
            <Select value={r.status} onChange={(e) => changeStatus(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
          ), width: '160px' },
          { key: 'actions', header: '', width: '120px', render: (r: any) => (
            r.status !== 'resolved' ? <Button size="sm" variant="subtle" leftIcon={<CheckCircle2 size={14} />} onClick={() => setResolveOpen(r)}>Resolve</Button> : <Badge tone="success">Resolved</Badge>
          ) },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New immigration case" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Case type" required value={form.case_type} onChange={(e) => setForm({ ...form, case_type: e.target.value })}>
            {CASE_TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
          </Select>
          <Input label="Country (ISO2)" required maxLength={2} value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} />
          <Select label="Partner" value={form.mobility_partner_id} onChange={(e) => setForm({ ...form, mobility_partner_id: e.target.value })}>
            <option value="">None</option>
            {(partnersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{humanizeEnum(p)}</option>)}
          </Select>
          <Input label="Next action due" type="date" value={form.next_action_due} onChange={(e) => setForm({ ...form, next_action_due: e.target.value })} />
          <Input label="Dependents" type="number" value={form.dependents_count} onChange={(e) => setForm({ ...form, dependents_count: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
        </div>
      </Modal>

      {resolveOpen && (
        <Modal open={!!resolveOpen} onClose={() => setResolveOpen(null)} title="Resolve case" footer={<><Button variant="secondary" onClick={() => setResolveOpen(null)}>Cancel</Button><Button onClick={resolve}>Resolve</Button></>}>
          <Textarea label="Resolution summary" value={resolveSummary} onChange={(e) => setResolveSummary(e.target.value)} placeholder="Outcome and any follow up" />
        </Modal>
      )}
    </div>
  );
}

function defaults() {
  return {
    employee_id: '', case_type: 'work_visa', country_code: '', mobility_partner_id: '',
    priority: 'normal', next_action_due: '', dependents_count: 0, summary: '',
  };
}
