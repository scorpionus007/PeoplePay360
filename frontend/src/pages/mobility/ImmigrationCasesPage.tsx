import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ClipboardList, MessageSquare } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, formatDateTime, humanizeEnum } from '../../utils/format';

const CASE_TYPES = ['work_authorization', 'permanent_residency', 'citizenship', 'dependent_visa', 'renewal', 'travel_document', 'other'];
const STATUSES = ['open', 'documents_pending', 'in_review', 'awaiting_authorities', 'resolved', 'cancelled'];

export function ImmigrationCasesPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [updOpen, setUpdOpen] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults());
  const [update, setUpdate] = useState({ note: '', new_status: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobility.immigration'],
    queryFn: async () => (await api.get('/mobility/immigration')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const partnersQ = useQuery({
    queryKey: ['mobility.partners', 'lawyers'],
    queryFn: async () => (await api.get('/mobility/partners', { params: { category: 'immigration_lawyer' } })).data.data as any[],
  });

  const save = async () => {
    try {
      await api.post('/mobility/immigration', {
        ...form,
        partner_id: form.partner_id || null,
        opened_on: form.opened_on || null,
        target_close_date: form.target_close_date || null,
      });
      toast.success('Case created');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const advance = async (id: string, status: string) => {
    try {
      await api.patch(`/mobility/immigration/${id}/status`, { status });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  const addUpdate = async () => {
    try {
      await api.post(`/mobility/immigration/${updOpen.id}/updates`, {
        note: update.note,
        new_status: update.new_status || undefined,
      });
      toast.success('Update logged');
      setUpdOpen(null);
      setUpdate({ note: '', new_status: '' });
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Immigration cases"
        subtitle="End to end tracking with partners and updates"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New case</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<ClipboardList size={22} />} title="No immigration cases" action={<Button onClick={() => setOpenForm(true)}>New case</Button>} />}
        columns={[
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.case_type)}</Badge> },
          { key: 'country', header: 'Country', render: (r: any) => r.country_code, width: '90px' },
          { key: 'partner', header: 'Partner', render: (r: any) => r.partner?.name || <span className="pp-soft">-</span> },
          { key: 'opened', header: 'Opened', render: (r: any) => r.opened_on ? formatDate(r.opened_on) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'target', header: 'Target close', render: (r: any) => r.target_close_date ? formatDate(r.target_close_date) : <span className="pp-soft">-</span>, width: '120px' },
          { key: 'status', header: 'Status', render: (r: any) => (
            <Select value={r.status} onChange={(e) => advance(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
          ), width: '180px' },
          { key: 'actions', header: '', width: '140px', render: (r: any) => (
            <Button size="sm" variant="subtle" leftIcon={<MessageSquare size={14} />} onClick={() => setUpdOpen(r)}>Updates</Button>
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
          <Select label="Partner" value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
            <option value="">None</option>
            {(partnersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Opened on" type="date" value={form.opened_on} onChange={(e) => setForm({ ...form, opened_on: e.target.value })} />
          <Input label="Target close" type="date" value={form.target_close_date} onChange={(e) => setForm({ ...form, target_close_date: e.target.value })} />
          <Input label="Reference number" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </div>
        </div>
      </Modal>

      {updOpen && (
        <Modal open={!!updOpen} onClose={() => setUpdOpen(null)} title={`Updates for ${updOpen.employee?.first_name || 'case'}`} size="lg" footer={<Button onClick={addUpdate}>Log update</Button>}>
          <div className="pp-stack">
            <div style={{ padding: 12, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Timeline</div>
              {(updOpen.updates || []).length === 0 && <div className="pp-soft">No updates yet</div>}
              {(updOpen.updates || []).map((u: any) => (
                <div key={u.id} style={{ padding: '8px 0', borderTop: '1px dashed var(--pp-border)' }}>
                  <div className="pp-row" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                    <span className="pp-soft" style={{ fontSize: 12 }}>{formatDateTime(u.created_at)}</span>
                    {u.new_status && <Badge tone={statusTone(u.new_status)}>{humanizeEnum(u.new_status)}</Badge>}
                  </div>
                  <div>{u.note}</div>
                </div>
              ))}
            </div>
            <Textarea label="Note" required value={update.note} onChange={(e) => setUpdate({ ...update, note: e.target.value })} />
            <Select label="Update status (optional)" value={update.new_status} onChange={(e) => setUpdate({ ...update, new_status: e.target.value })}>
              <option value="">Keep current</option>
              {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
          </div>
        </Modal>
      )}
    </div>
  );
}

function defaults() {
  return {
    employee_id: '', case_type: 'work_authorization', country_code: '', partner_id: '',
    opened_on: '', target_close_date: '', reference_number: '', summary: '',
  };
}
