import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatMoney, humanizeEnum } from '../../utils/format';

const CATEGORIES = [
  'health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability_insurance',
  'maternity', 'paternity', 'legal_support', 'wellness', 'mental_health',
  'transportation', 'meals', 'gift_voucher', 'shopping_discount',
  'retirement', 'loan', 'learning', 'relocation', 'childcare', 'other',
];

export function BenefitPlansPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['benefit-plans'],
    queryFn: async () => (await api.get('/benefits/plans', { params: { limit: 100 } })).data.data as any[],
  });

  const providersQ = useQuery({
    queryKey: ['benefit-providers'],
    queryFn: async () => (await api.get('/benefits/providers')).data.data as any[],
  });

  const create = async () => {
    try {
      const payload: any = { ...form, provider_id: form.provider_id || null };
      ['employer_cost_amount', 'employee_cost_amount', 'coverage_amount', 'total_seats', 'max_dependents'].forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) payload[k] = null;
        else payload[k] = Number(payload[k]);
      });
      await api.post('/benefits/plans', payload);
      toast.success('Plan created');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Benefit plans"
        subtitle="Health, wellness, retirement, gifts and more"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New plan</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<ShieldCheck size={22} />} title="No plans yet" action={<Button onClick={() => setOpenForm(true)}>New plan</Button>} />}
        columns={[
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '140px' },
          { key: 'name', header: 'Name', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.provider?.name || 'Direct'}</div></div> },
          { key: 'cat', header: 'Category', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.category)}</Badge> },
          { key: 'employee', header: 'Employee cost', render: (r: any) => r.employee_cost_amount ? formatMoney(r.employee_cost_amount, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'employer', header: 'Employer cost', render: (r: any) => r.employer_cost_amount ? formatMoney(r.employer_cost_amount, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'seats', header: 'Seats', render: (r: any) => r.total_seats ? `${r.seats_used}/${r.total_seats}` : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '110px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New benefit plan" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          <Select label="Provider" value={form.provider_id} onChange={(e) => setForm({ ...form, provider_id: e.target.value })}>
            <option value="">Direct (no provider)</option>
            {(providersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Select label="Cost frequency" value={form.cost_frequency} onChange={(e) => setForm({ ...form, cost_frequency: e.target.value })}>
            <option value="per_month">Per month</option><option value="per_year">Per year</option><option value="per_payroll">Per payroll</option><option value="one_time">One time</option>
          </Select>
          <Input label="Employer cost" type="number" value={form.employer_cost_amount} onChange={(e) => setForm({ ...form, employer_cost_amount: e.target.value })} />
          <Input label="Employee cost" type="number" value={form.employee_cost_amount} onChange={(e) => setForm({ ...form, employee_cost_amount: e.target.value })} />
          <Input label="Coverage amount" type="number" value={form.coverage_amount} onChange={(e) => setForm({ ...form, coverage_amount: e.target.value })} />
          <Input label="Total seats" type="number" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} />
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.dependents_allowed} onChange={(e) => setForm({ ...form, dependents_allowed: e.target.checked })} />
            <span>Allow dependents</span>
          </label>
          {form.dependents_allowed && (
            <Input label="Max dependents" type="number" value={form.max_dependents} onChange={(e) => setForm({ ...form, max_dependents: e.target.value })} />
          )}
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.approval_required} onChange={(e) => setForm({ ...form, approval_required: e.target.checked })} />
            <span>Approval required</span>
          </label>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['draft', 'active', 'paused', 'archived'].map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    code: '', name: '', category: 'health_insurance', provider_id: '',
    currency: 'USD', cost_frequency: 'per_month',
    employer_cost_amount: '', employee_cost_amount: '', coverage_amount: '',
    total_seats: '', dependents_allowed: false, max_dependents: '',
    approval_required: true, status: 'active', description: '',
  };
}
