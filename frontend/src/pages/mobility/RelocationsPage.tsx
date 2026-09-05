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
const REASONS = ['new_role', 'transfer', 'promotion', 'return_home', 'other'];
const CATEGORIES = ['flights', 'shipping', 'housing', 'temporary_stay', 'visa_fees', 'legal', 'transport', 'per_diem', 'other'];

export function RelocationsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';
  const [openForm, setOpenForm] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState<any>(null);
  const [expenseDetail, setExpenseDetail] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults(currency));
  const [expForm, setExpForm] = useState<any>({ category: 'flights', description: '', amount: '', currency, incurred_on: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobility.relocations'],
    queryFn: async () => (await api.get('/mobility/relocations')).data.data as any[],
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
      await api.post('/mobility/relocations', {
        employee_id: form.employee_id,
        mobility_partner_id: form.mobility_partner_id || null,
        from_country_code: form.from_country_code,
        from_city: form.from_city || null,
        to_country_code: form.to_country_code,
        to_city: form.to_city || null,
        reason: form.reason,
        budget_amount: form.budget_amount ? Number(form.budget_amount) : null,
        budget_currency: form.budget_currency,
        target_move_date: form.target_move_date || null,
        dependents_count: Number(form.dependents_count) || 0,
        notes: form.notes || null,
      });
      toast.success('Relocation created');
      setOpenForm(false);
      setForm(defaults(currency));
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const transition = async (id: string, status: string) => {
    try {
      await api.post(`/mobility/relocations/${id}/transition`, { status });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  const openExpenses = async (row: any) => {
    setExpenseOpen(row);
    setExpenseDetail(null);
    try {
      const full = (await api.get(`/mobility/relocations/${row.id}`)).data.data;
      setExpenseDetail(full);
    } catch (err) {
      toast.error('Could not load expenses', extractApiError(err));
    }
  };

  const addExpense = async () => {
    try {
      await api.post(`/mobility/relocations/${expenseOpen.id}/expenses`, {
        category: expForm.category,
        description: expForm.description,
        amount: Number(expForm.amount),
        currency: expForm.currency,
        incurred_on: expForm.incurred_on,
      });
      toast.success('Expense added');
      setExpForm({ category: 'flights', description: '', amount: '', currency, incurred_on: '' });
      openExpenses(expenseOpen);
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
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? <div><div style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.case_code}</div></div> : '-' },
          { key: 'from', header: 'From', render: (r: any) => `${r.from_country_code}${r.from_city ? ` / ${r.from_city}` : ''}`, width: '130px' },
          { key: 'to', header: 'To', render: (r: any) => `${r.to_country_code}${r.to_city ? ` / ${r.to_city}` : ''}`, width: '130px' },
          { key: 'move', header: 'Target move', render: (r: any) => r.target_move_date ? formatDate(r.target_move_date) : <span className="pp-soft">-</span>, width: '120px' },
          { key: 'budget', header: 'Budget', align: 'right' as const, render: (r: any) => r.budget_amount ? formatMoney(r.budget_amount, r.budget_currency || currency) : <span className="pp-soft">-</span> },
          { key: 'spent', header: 'Spent', align: 'right' as const, render: (r: any) => formatMoney(r.spent_amount || 0, r.budget_currency || currency) },
          { key: 'status', header: 'Status', render: (r: any) => (
            <Select value={r.status} onChange={(e) => transition(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
          ), width: '150px' },
          { key: 'actions', header: '', width: '140px', render: (r: any) => (
            <Button size="sm" variant="subtle" leftIcon={<DollarSign size={14} />} onClick={() => openExpenses(r)}>Expenses</Button>
          ) },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New relocation" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Relocation partner" value={form.mobility_partner_id} onChange={(e) => setForm({ ...form, mobility_partner_id: e.target.value })}>
            <option value="">None</option>
            {(partnersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="From country (ISO2)" required maxLength={2} value={form.from_country_code} onChange={(e) => setForm({ ...form, from_country_code: e.target.value.toUpperCase() })} />
          <Input label="From city" value={form.from_city} onChange={(e) => setForm({ ...form, from_city: e.target.value })} />
          <Input label="To country (ISO2)" required maxLength={2} value={form.to_country_code} onChange={(e) => setForm({ ...form, to_country_code: e.target.value.toUpperCase() })} />
          <Input label="To city" value={form.to_city} onChange={(e) => setForm({ ...form, to_city: e.target.value })} />
          <Select label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>
            {REASONS.map((r) => <option key={r} value={r}>{humanizeEnum(r)}</option>)}
          </Select>
          <Input label="Target move date" type="date" value={form.target_move_date} onChange={(e) => setForm({ ...form, target_move_date: e.target.value })} />
          <Input label="Budget amount" type="number" step="0.01" value={form.budget_amount} onChange={(e) => setForm({ ...form, budget_amount: e.target.value })} />
          <Input label="Budget currency" maxLength={3} value={form.budget_currency} onChange={(e) => setForm({ ...form, budget_currency: e.target.value.toUpperCase() })} />
          <Input label="Dependents" type="number" value={form.dependents_count} onChange={(e) => setForm({ ...form, dependents_count: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      {expenseOpen && (
        <Modal open={!!expenseOpen} onClose={() => setExpenseOpen(null)} title={`Expenses for ${expenseOpen.employee?.first_name || 'relocation'}`} size="lg" footer={<Button onClick={addExpense}>Add expense</Button>}>
          <div className="pp-stack">
            <div style={{ padding: 12, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Recorded expenses</div>
              {!expenseDetail && <div className="pp-soft">Loading...</div>}
              {expenseDetail && (expenseDetail.expenses || []).length === 0 && <div className="pp-soft">No expenses yet</div>}
              {expenseDetail && (expenseDetail.expenses || []).map((x: any) => (
                <div key={x.id} className="pp-row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--pp-border)' }}>
                  <div>
                    <Badge tone={statusTone(x.status)}>{humanizeEnum(x.status)}</Badge>
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
              <Input label="Incurred on" type="date" required value={expForm.incurred_on} onChange={(e) => setExpForm({ ...expForm, incurred_on: e.target.value })} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function defaults(currency: string) {
  return {
    employee_id: '', mobility_partner_id: '',
    from_country_code: '', from_city: '',
    to_country_code: '', to_city: '',
    reason: 'new_role', target_move_date: '',
    budget_amount: '', budget_currency: currency, dependents_count: 0, notes: '',
  };
}
