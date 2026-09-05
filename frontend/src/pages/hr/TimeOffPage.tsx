import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Plane, Palette } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, formatNumber, humanizeEnum } from '../../utils/format';

type Tab = 'requests' | 'allocations' | 'types';

export function TimeOffPage() {
  const [tab, setTab] = useState<Tab>('requests');
  return (
    <div>
      <PageHeader title="Time off" subtitle="Types, allocations, and employee requests" />
      <div className="pp-row" style={{ gap: 4, marginBottom: 16, background: 'var(--pp-surface-2)', padding: 4, borderRadius: 'var(--pp-radius-md)', border: '1px solid var(--pp-border)', width: 'fit-content' }}>
        {(['requests', 'allocations', 'types'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 'var(--pp-radius-sm)',
              background: tab === t ? 'var(--pp-white)' : 'transparent',
              boxShadow: tab === t ? 'var(--pp-shadow-xs)' : 'none',
              fontWeight: tab === t ? 600 : 500,
              color: tab === t ? 'var(--pp-text)' : 'var(--pp-text-muted)',
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'requests' && <RequestsTab />}
      {tab === 'allocations' && <AllocationsTab />}
      {tab === 'types' && <TypesTab />}
    </div>
  );
}

function RequestsTab() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', time_off_type_id: '', start_date: '', end_date: '', reason: '', is_half_day: false });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['timeoff.requests'],
    queryFn: async () => (await api.get('/hr/time-off/requests', { params: { limit: 100 } })).data.data as any[],
  });
  const typesQ = useQuery({
    queryKey: ['timeoff.types'],
    queryFn: async () => (await api.get('/hr/time-off/types')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const submit = async () => {
    try {
      await api.post('/hr/time-off/requests', { ...form, employee_id: form.employee_id || null });
      toast.success('Request submitted');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Submit failed', extractApiError(err));
    }
  };
  const action = async (id: string, path: string, label: string) => {
    try {
      await api.post(`/hr/time-off/requests/${id}/${path}`, {});
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <>
      <div className="pp-row" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button leftIcon={<Plus size={14} />} onClick={() => setOpenForm(true)}>Submit request</Button>
      </div>
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Plane size={22} />} title="No requests yet" action={<Button onClick={() => setOpenForm(true)}>Submit request</Button>} />}
        columns={[
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '-' },
          { key: 'type', header: 'Type', render: (r: any) => r.time_off_type ? <Badge tone="primary">{r.time_off_type.name}</Badge> : '-' },
          { key: 'dates', header: 'Dates', render: (r: any) => `${formatDate(r.start_date)} - ${formatDate(r.end_date)}` },
          { key: 'duration', header: 'Duration', render: (r: any) => `${formatNumber(r.duration, 1)} ${r.is_half_day ? '(half)' : ''}`, align: 'right' as const },
          { key: 'reason', header: 'Reason', render: (r: any) => r.reason ? <span className="pp-soft">{r.reason.slice(0, 60)}</span> : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          {
            key: 'actions', header: '', width: '260px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'pending' && <>
                  <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve', 'Approved')}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => action(r.id, 'refuse', 'Refused')}>Refuse</Button>
                </>}
                {['pending', 'approved'].includes(r.status) && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'cancel', 'Cancelled')}>Cancel</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Submit time off" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={submit}>Submit</Button></>}>
        <div className="pp-stack">
          <Select label="Employee" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Current user or select</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Type" required value={form.time_off_type_id} onChange={(e) => setForm({ ...form, time_off_type_id: e.target.value })}>
            <option value="">Select a leave type</option>
            {(typesQ.data || []).filter((t: any) => t.is_active).map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.unit})</option>)}
          </Select>
          <div className="pp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Start date" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <Input label="End date" type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.is_half_day} onChange={(e) => setForm({ ...form, is_half_day: e.target.checked })} />
            <span>Half day</span>
          </label>
          <Textarea label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
      </Modal>
    </>
  );
}

function AllocationsTab() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', time_off_type_id: '', allocated_amount: '', valid_from: '', valid_to: '', allocation_note: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['timeoff.allocations'],
    queryFn: async () => (await api.get('/hr/time-off/allocations', { params: { limit: 100 } })).data.data as any[],
  });
  const typesQ = useQuery({
    queryKey: ['timeoff.types'],
    queryFn: async () => (await api.get('/hr/time-off/types')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/hr/time-off/allocations', { ...form, allocated_amount: Number(form.allocated_amount), valid_to: form.valid_to || null });
      toast.success('Allocation created');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Create failed', extractApiError(err));
    }
  };
  const action = async (id: string, path: string, label: string) => {
    try {
      await api.post(`/hr/time-off/allocations/${id}/${path}`, {});
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <>
      <div className="pp-row" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button leftIcon={<Plus size={14} />} onClick={() => setOpenForm(true)}>New allocation</Button>
      </div>
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Plane size={22} />} title="No allocations" action={<Button onClick={() => setOpenForm(true)}>New allocation</Button>} />}
        columns={[
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '-' },
          { key: 'type', header: 'Type', render: (r: any) => r.time_off_type ? <Badge tone="primary">{r.time_off_type.name}</Badge> : '-' },
          { key: 'alloc', header: 'Allocated', render: (r: any) => formatNumber(r.allocated_amount, 1), align: 'right' as const },
          { key: 'taken', header: 'Taken', render: (r: any) => formatNumber(r.taken_amount, 1), align: 'right' as const },
          { key: 'pending', header: 'Pending', render: (r: any) => formatNumber(r.pending_amount, 1), align: 'right' as const },
          { key: 'remaining', header: 'Remaining', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatNumber(r.remaining_amount, 1)}</span>, align: 'right' as const },
          { key: 'valid', header: 'Valid', render: (r: any) => r.valid_to ? `${formatDate(r.valid_from)} - ${formatDate(r.valid_to)}` : formatDate(r.valid_from) },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '150px' },
          {
            key: 'actions', header: '', width: '200px',
            render: (r: any) => r.status === 'pending_approval' ? (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve', 'Approved')}>Approve</Button>
                <Button size="sm" variant="ghost" onClick={() => action(r.id, 'refuse', 'Refused')}>Refuse</Button>
              </div>
            ) : null,
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New allocation" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}>
        <div className="pp-stack">
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Type" required value={form.time_off_type_id} onChange={(e) => setForm({ ...form, time_off_type_id: e.target.value })}>
            <option value="">Select a leave type</option>
            {(typesQ.data || []).filter((t: any) => t.requires_allocation).map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <div className="pp-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Amount" type="number" required value={form.allocated_amount} onChange={(e) => setForm({ ...form, allocated_amount: e.target.value })} />
            <Input label="Valid from" type="date" required value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
            <Input label="Valid to" type="date" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />
          </div>
          <Textarea label="Note" value={form.allocation_note} onChange={(e) => setForm({ ...form, allocation_note: e.target.value })} />
        </div>
      </Modal>
    </>
  );
}

function TypesTab() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(defaultsType());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['timeoff.types'],
    queryFn: async () => (await api.get('/hr/time-off/types')).data.data as any[],
  });

  const openCreate = () => { setEditing(null); setForm(defaultsType()); setOpenForm(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ ...defaultsType(), ...t }); setOpenForm(true); };

  const save = async () => {
    try {
      const payload = { ...form, default_allocation: Number(form.default_allocation), max_carry_forward: Number(form.max_carry_forward) };
      if (editing) {
        await api.patch(`/hr/time-off/types/${editing.id}`, payload);
        toast.success('Type updated');
      } else {
        await api.post('/hr/time-off/types', payload);
        toast.success('Type created');
      }
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <>
      <div className="pp-row" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button leftIcon={<Plus size={14} />} onClick={openCreate}>New type</Button>
      </div>
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Palette size={22} />} title="No leave types" action={<Button onClick={openCreate}>New type</Button>} />}
        onRowClick={openEdit}
        columns={[
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '120px' },
          { key: 'name', header: 'Name', render: (r: any) => <div className="pp-row" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: r.color, display: 'inline-block' }} /><span style={{ fontWeight: 600 }}>{r.name}</span></div> },
          { key: 'unit', header: 'Unit', render: (r: any) => <Badge tone="neutral">{r.unit}</Badge>, width: '90px' },
          { key: 'alloc', header: 'Requires alloc', render: (r: any) => r.requires_allocation ? 'Yes' : 'No', width: '130px' },
          { key: 'appr', header: 'Approval', render: (r: any) => r.requires_approval ? 'Yes' : 'Auto', width: '110px' },
          { key: 'paid', header: 'Paid', render: (r: any) => <Badge tone={r.paid ? 'success' : 'muted'}>{r.paid ? 'Yes' : 'No'}</Badge>, width: '90px' },
          { key: 'default', header: 'Default alloc', render: (r: any) => formatNumber(r.default_allocation, 1), align: 'right' as const, width: '130px' },
          { key: 'active', header: 'Status', render: (r: any) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? 'Edit type' : 'New leave type'} size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>{editing ? 'Save' : 'Create'}</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Color" type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
          <Select label="Unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            <option value="days">Days</option>
            <option value="hours">Hours</option>
          </Select>
          <Input label="Default allocation" type="number" value={form.default_allocation} onChange={(e) => setForm({ ...form, default_allocation: e.target.value })} />
          <Input label="Max carry forward" type="number" value={form.max_carry_forward} onChange={(e) => setForm({ ...form, max_carry_forward: e.target.value })} />
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.requires_allocation} onChange={(e) => setForm({ ...form, requires_allocation: e.target.checked })} />
            <span>Requires allocation</span>
          </label>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.requires_approval} onChange={(e) => setForm({ ...form, requires_approval: e.target.checked })} />
            <span>Requires approval</span>
          </label>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} />
            <span>Paid</span>
          </label>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span>Active</span>
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </>
  );
}

function defaultsType() {
  return {
    code: '', name: '', color: '#2563eb', unit: 'days',
    default_allocation: 0, max_carry_forward: 0,
    requires_allocation: true, requires_approval: true, paid: true,
    is_active: true, description: '',
  };
}
