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

type Contract = {
  id: string;
  title: string;
  status: string;
  employee?: { id: string; first_name: string; last_name: string; employee_number: string };
  salary_structure?: { id: string; name: string; code: string } | null;
  wage_amount: number | string;
  wage_currency: string;
  wage_period: string;
  start_date: string;
  end_date?: string | null;
  department?: string | null;
  position?: string | null;
};

export function ContractsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());
  const [saving, setSaving] = useState(false);

  const contractsQ = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => (await api.get('/payroll/contracts', { params: { limit: 100 } })).data.data as Contract[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const structuresQ = useQuery({
    queryKey: ['salaryStructures'],
    queryFn: async () => (await api.get('/payroll/salary-structures')).data.data as any[],
  });

  const openCreate = () => { setForm(defaults()); setOpenForm(true); };

  const save = async () => {
    setSaving(true);
    try {
      const payload: any = {
        ...form,
        wage_amount: Number(form.wage_amount),
        salary_structure_id: form.salary_structure_id || null,
        end_date: form.end_date || null,
        department: form.department || null,
        position: form.position || null,
      };
      await api.post('/payroll/contracts', payload);
      toast.success('Contract created');
      setOpenForm(false);
      contractsQ.refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="Employment contracts with active-in-period enforcement"
        actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>New contract</Button>}
      />

      <DataTable<Contract>
        loading={contractsQ.isLoading}
        rows={contractsQ.data || []}
        empty={<EmptyState icon={<FileText size={22} />} title="No contracts on file" description="Create the first contract to unlock payroll for that employee." action={<Button onClick={openCreate}>New contract</Button>} />}
        columns={[
          {
            key: 'employee',
            header: 'Employee',
            render: (r) => r.employee ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span>
                <span className="pp-soft pp-mono" style={{ fontSize: 12 }}>{r.employee.employee_number}</span>
              </div>
            ) : <span className="pp-soft">-</span>,
          },
          { key: 'title', header: 'Role', render: (r) => <span>{r.title}</span> },
          { key: 'wage', header: 'Wage', render: (r) => <span style={{ fontWeight: 600 }}>{formatMoney(r.wage_amount as any, r.wage_currency)}</span>, align: 'right' as const },
          { key: 'period', header: 'Period', render: (r) => <Badge tone="neutral">{humanizeEnum(r.wage_period)}</Badge>, width: '110px' },
          { key: 'dates', header: 'Effective', render: (r) => `${formatDate(r.start_date)}${r.end_date ? ' - ' + formatDate(r.end_date) : ''}` },
          { key: 'structure', header: 'Structure', render: (r) => r.salary_structure ? <span>{r.salary_structure.name}</span> : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '120px' },
        ]}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title="New contract"
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={save} loading={saving}>Create contract</Button>
        </>}
      >
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_number})</option>)}
          </Select>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          <Input label="Start date" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="End date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <Input label="Wage amount" type="number" required value={form.wage_amount} onChange={(e) => setForm({ ...form, wage_amount: e.target.value })} />
          <Input label="Wage currency" maxLength={3} value={form.wage_currency} onChange={(e) => setForm({ ...form, wage_currency: e.target.value.toUpperCase() })} />
          <Select label="Wage period" value={form.wage_period} onChange={(e) => setForm({ ...form, wage_period: e.target.value })}>
            {['hourly', 'daily', 'weekly', 'monthly', 'yearly'].map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
          <Select label="Salary structure" value={form.salary_structure_id} onChange={(e) => setForm({ ...form, salary_structure_id: e.target.value })}>
            <option value="">None</option>
            {(structuresQ.data || []).map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['draft', 'active', 'expired', 'terminated'].map((v) => <option key={v} value={v}>{v}</option>)}
          </Select>
          <Input label="Notice period days" type="number" value={form.notice_period_days} onChange={(e) => setForm({ ...form, notice_period_days: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Terms" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    employee_id: '', title: '', department: '', position: '', start_date: '', end_date: '',
    wage_amount: '', wage_currency: 'USD', wage_period: 'monthly', salary_structure_id: '',
    status: 'active', notice_period_days: '', terms: '',
  };
}
