import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Home, DollarSign } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

const STATUSES = ['requested', 'approved', 'in_progress', 'completed', 'cancelled'];
const CATEGORIES = ['moving', 'housing', 'flights', 'temporary_stay', 'schooling', 'visa_fees', 'meals_per_diem', 'other'];

export function RelocationsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';
  const [openForm, setOpenForm] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults());
  const [expForm, setExpForm] = useState<any>({ category: 'moving', description: '', amount: '', currency: currency, incurred_at: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobility.relocations'],
    queryFn: async () => (await api.get('/mobility/relocations')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const partnersQ = useQuery({
    queryKey: ['mobility.partners', 'relocation'],
    queryFn: async () => (await api.get('/mobility/partners', { params: { category: 'relocation_agency' } })).data.data as any[],
  });

  const save = async () => {
    try {
      await api.post('/mobility/relocations', {
        ...form,
        partner_id: form.partner_id || null,
        estimated_budget: form.estimated_budget ? Number(form.estimated_budget) : null,
        start_date: form.start_date || null,
        completion_date: form.completion_date || null,
      });
      toast.success('Relocation created');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const advance = async (id: string, status: string) => {
    try {
      await api.patch(`/mobility/relocations/${id}/status`, { status });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  const addExpense = async () => {
    try {
      await api.post(`/mobility/relocations/${expenseOpen.id}/expenses`, {
        ...expForm,
        amount: Number(expForm.amount),
        incurred_at: expForm.incurred_at || null,
      });
      toast.success('Expense added');
      setExpenseOpen(null);
      setExpForm({ category: 'moving', description: '', amount: '', currency: currency, incurred_at: '' });
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Relocations"
        subtitle="Move packages, temporary housing, and reimbursable expenses"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New relocation</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Home size={22} />} title="No relocations" action={<Button onClick={() => setOpenForm(true)}>New relocation</Button>} />}
        columns={[
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'from', header: 'From', render: (r: any) => r.origin_country || <span className="pp-soft">-</span>, width: '90px' },
          { key: 'to', header: 'To', render: (r: any) => r.destination_country, width: '90px' },
          { key: 'start', header: 'Start', render: (r: any) => r.start_date ? formatDate(r.start_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'end', header: 'Completed', render: (r: any) => r.completion_date ? formatDate(r.completion_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'partner', header: 'Partner', render: (r: any) => r.partner?.name || <span className="pp-soft">-</span> },
          { key: 'budget', header: 'Budget', align: 'right' as const, render: (r: any) => r.estimated_budget ? formatMoney(r.estimated_budget, r.currency || currency) : <span className="pp-soft">-</span> },
          { key: 'spent', header: 'Spent', align: 'right' as const, render: (r: any) => formatMoney(r.spent_to_date || 0, r.currency || currency) },
          { key: 'status', header: 'Status', render: (r: any) => (
            <Select value={r.status} onChange={(e) => advance(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
          ), width: '150px' },
          { key: 'actions', header: '', width: '140px', render: (r: any) => (
            <Button size="sm" variant="subtle" leftIcon={<DollarSign size={14} />} onClick={() => setExpenseOpen(r)}>Expenses</Button>
          ) },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New relocation" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Relocation partner" value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
            <option value="">None</option>
            {(partnersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Origin country (ISO2)" maxLength={2} value={form.origin_country} onChange={(e) => setForm({ ...form, origin_country: e.target.value.toUpperCase() })} />
          <Input label="Origin city" value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })} />
          <Input label="Destination country (ISO2)" required maxLength={2} value={form.destination_country} onChange={(e) => setForm({ ...form, destination_country: e.target.value.toUpperCase() })} />
          <Input label="Destination city" value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })} />
          <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="Completion date" type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} />
          <Input label="Estimated budget" type="number" step="0.01" value={form.estimated_budget} onChange={(e) => setForm({ ...form, estimated_budget: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Package summary" value={form.package_summary} onChange={(e) => setForm({ ...form, package_summary: e.target.value })} />
          </div>
        </div>
      </Modal>

      {expenseOpen && (
        <Modal open={!!expenseOpen} onClose={() => setExpenseOpen(null)} title={`Expenses for ${expenseOpen.employee?.first_name || 'relocation'}`} size="lg" footer={<Button onClick={addExpense}>Add expense</Button>}>
          <div className="pp-stack">
            <div style={{ padding: 12, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Recorded expenses</div>
              {(expenseOpen.expenses || []).length === 0 && <div className="pp-soft">No expenses yet</div>}
              {(expenseOpen.expenses || []).map((x: any) => (
                <div key={x.id} className="pp-row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--pp-border)' }}>
                  <div>
                    <Badge tone="neutral">{humanizeEnum(x.category)}</Badge>
                    <span style={{ marginLeft: 8 }}>{x.description}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{formatMoney(x.amount, x.currency)}</span>
                </div>
              ))}
            </div>
            <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Select label="Category" value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
              </Select>
              <Input label="Description" required value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
              <Input label="Amount" required type="number" step="0.01" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} />
              <Input label="Currency" maxLength={3} value={expForm.currency} onChange={(e) => setExpForm({ ...expForm, currency: e.target.value.toUpperCase() })} />
              <Input label="Incurred at" type="date" value={expForm.incurred_at} onChange={(e) => setExpForm({ ...expForm, incurred_at: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function defaults() {
  return {
    employee_id: '', partner_id: '',
    origin_country: '', origin_city: '',
    destination_country: '', destination_city: '',
    start_date: '', completion_date: '',
    estimated_budget: '', currency: 'USD', package_summary: '',
  };
}
