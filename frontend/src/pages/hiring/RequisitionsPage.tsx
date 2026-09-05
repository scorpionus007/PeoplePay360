import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, FileText } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

const TRACKS = ['internal', 'external', 'intern', 'freelancer', 'auditor'];
const TYPES = ['full_time', 'part_time', 'contract', 'intern', 'freelancer', 'auditor'];

export function RequisitionsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['requisitions'],
    queryFn: async () => (await api.get('/hiring/requisitions', { params: { limit: 100 } })).data.data as any[],
  });
  const deptsQ = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data.data as any[],
  });

  const create = async () => {
    try {
      const payload: any = {
        ...form,
        department_id: form.department_id || null,
        headcount: Number(form.headcount),
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
      };
      await api.post('/hiring/requisitions', payload);
      toast.success('Requisition created');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };
  const action = async (id: string, path: string, label: string, body: any = {}) => {
    try {
      await api.post(`/hiring/requisitions/${id}/${path}`, body);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Requisitions"
        subtitle="Hiring plans, approvals, and headcount tracking"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New requisition</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<FileText size={22} />} title="No requisitions yet" action={<Button onClick={() => setOpenForm(true)}>New requisition</Button>} />}
        columns={[
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '140px' },
          { key: 'title', header: 'Title', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.title}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.department?.name || 'Unassigned'}</div></div> },
          { key: 'track', header: 'Track', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.hiring_track)}</Badge> },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.employment_type)}</Badge> },
          { key: 'salary', header: 'Salary range', render: (r: any) => r.salary_min || r.salary_max ? `${formatMoney(r.salary_min, r.currency)} - ${formatMoney(r.salary_max, r.currency)}` : <span className="pp-soft">-</span> },
          { key: 'headcount', header: 'Filled', render: (r: any) => `${r.headcount_filled}/${r.headcount}`, align: 'right' as const },
          { key: 'target', header: 'Target start', render: (r: any) => r.target_start_date ? formatDate(r.target_start_date) : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '160px' },
          {
            key: 'actions', header: '', width: '260px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'draft' && <Button size="sm" variant="secondary" onClick={() => action(r.id, 'submit', 'Submitted')}>Submit</Button>}
                {['draft', 'pending_approval'].includes(r.status) && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve', 'Approved')}>Approve</Button>}
                {r.status === 'approved' && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'hold', 'On hold')}>Hold</Button>}
                {!['filled', 'cancelled'].includes(r.status) && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'cancel', 'Cancelled')}>Cancel</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New requisition" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Department" value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
            <option value="">Unassigned</option>
            {(deptsQ.data || []).map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select label="Hiring track" value={form.hiring_track} onChange={(e) => setForm({ ...form, hiring_track: e.target.value })}>
            {TRACKS.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
          </Select>
          <Select label="Employment type" value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
          </Select>
          <Input label="Headcount" type="number" value={form.headcount} onChange={(e) => setForm({ ...form, headcount: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Seniority" value={form.seniority} onChange={(e) => setForm({ ...form, seniority: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Select label="Salary period" value={form.salary_period} onChange={(e) => setForm({ ...form, salary_period: e.target.value })}>
            {['hourly', 'daily', 'weekly', 'monthly', 'yearly'].map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Input label="Salary min" type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
          <Input label="Salary max" type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
          <Input label="Target start" type="date" value={form.target_start_date} onChange={(e) => setForm({ ...form, target_start_date: e.target.value })} />
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{humanizeEnum(p)}</option>)}
          </Select>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.remote_allowed} onChange={(e) => setForm({ ...form, remote_allowed: e.target.checked })} />
            <span>Remote allowed</span>
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    code: '', title: '', department_id: '', hiring_track: 'external', employment_type: 'full_time',
    headcount: 1, location: '', seniority: '', currency: 'USD', salary_period: 'yearly',
    salary_min: '', salary_max: '', target_start_date: '', priority: 'normal', remote_allowed: false,
    description: '', requirements: '',
  };
}
