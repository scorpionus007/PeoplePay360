import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Trash2 } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { humanizeEnum } from '../../utils/format';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

type Day = { day_of_week: string; block_index: number; start_time: string; end_time: string; break_minutes: number; is_working: boolean };

export function WorkingSchedulesPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>(defaults());
  const [days, setDays] = useState<Day[]>([]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['workingSchedules'],
    queryFn: async () => (await api.get('/hr/working-schedules')).data.data as any[],
  });

  const openCreate = () => { setEditing(null); setForm(defaults()); setDays([]); setOpenForm(true); };
  const openEdit = (s: any) => {
    setEditing(s);
    setForm({ name: s.name, code: s.code || '', schedule_type: s.schedule_type, timezone: s.timezone, description: s.description || '', is_active: s.is_active });
    setDays((s.days || []).map((d: any) => ({
      day_of_week: d.day_of_week, block_index: d.block_index, start_time: d.start_time, end_time: d.end_time, break_minutes: d.break_minutes, is_working: d.is_working,
    })));
    setOpenForm(true);
  };

  const addDay = () => setDays([...days, { day_of_week: 'mon', block_index: 1, start_time: '09:00', end_time: '18:00', break_minutes: 60, is_working: true }]);
  const removeDay = (i: number) => setDays(days.filter((_, idx) => idx !== i));
  const updateDay = (i: number, patch: Partial<Day>) => setDays(days.map((d, idx) => idx === i ? { ...d, ...patch } : d));

  const save = async () => {
    try {
      const payload = { ...form, days };
      if (editing) {
        await api.patch(`/hr/working-schedules/${editing.id}`, payload);
        toast.success('Schedule updated');
      } else {
        await api.post('/hr/working-schedules', payload);
        toast.success('Schedule created');
      }
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Working schedules"
        subtitle="Weekly hour patterns assigned to employees or contracts"
        actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>New schedule</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Calendar size={22} />} title="No schedules yet" action={<Button onClick={openCreate}>New schedule</Button>} />}
        onRowClick={openEdit}
        columns={[
          { key: 'name', header: 'Name', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.code}</div></div> },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.schedule_type)}</Badge> },
          { key: 'tz', header: 'Timezone', render: (r: any) => <span className="pp-soft">{r.timezone}</span> },
          { key: 'hours', header: 'Weekly hours', render: (r: any) => <span style={{ fontWeight: 700 }}>{Number(r.weekly_hours).toFixed(2)}</span>, align: 'right' as const },
          { key: 'days', header: 'Days', render: (r: any) => (r.days || []).length, align: 'right' as const, width: '80px' },
          { key: 'active', header: 'Status', render: (r: any) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title={editing ? 'Edit schedule' : 'New schedule'} size="xl" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>{editing ? 'Save' : 'Create'}</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Select label="Type" value={form.schedule_type} onChange={(e) => setForm({ ...form, schedule_type: e.target.value })}>
            {['standard', 'flexible', 'shift', 'part_time', 'custom'].map((v) => <option key={v} value={v}>{humanizeEnum(v)}</option>)}
          </Select>
          <Input label="Timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="pp-row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
            <h4>Weekly pattern</h4>
            <Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={addDay}>Add block</Button>
          </div>
          <div className="pp-stack" style={{ gap: 8 }}>
            {days.length === 0 && <div className="pp-soft" style={{ padding: 12, textAlign: 'center', background: 'var(--pp-surface-2)', border: '1px dashed var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>No blocks yet</div>}
            {days.map((d, i) => (
              <div key={i} className="pp-grid" style={{ gridTemplateColumns: '100px 100px 100px 100px 100px 60px 40px', gap: 8, alignItems: 'center', padding: 10, border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)', background: 'var(--pp-surface-2)' }}>
                <Select value={d.day_of_week} onChange={(e) => updateDay(i, { day_of_week: e.target.value })}>
                  {DAYS.map((day) => <option key={day} value={day}>{day.toUpperCase()}</option>)}
                </Select>
                <Input type="number" value={d.block_index} onChange={(e) => updateDay(i, { block_index: Number(e.target.value) })} />
                <Input type="time" value={d.start_time} onChange={(e) => updateDay(i, { start_time: e.target.value })} />
                <Input type="time" value={d.end_time} onChange={(e) => updateDay(i, { end_time: e.target.value })} />
                <Input type="number" value={d.break_minutes} onChange={(e) => updateDay(i, { break_minutes: Number(e.target.value) })} />
                <label className="pp-row" style={{ gap: 4 }}>
                  <input type="checkbox" checked={d.is_working} onChange={(e) => updateDay(i, { is_working: e.target.checked })} />
                  <span style={{ fontSize: 12 }}>Work</span>
                </label>
                <Button size="sm" variant="ghost" onClick={() => removeDay(i)}><Trash2 size={13} /></Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return { name: '', code: '', schedule_type: 'standard', timezone: 'UTC', description: '', is_active: true };
}
