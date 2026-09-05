import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ClipboardList } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatMoney, humanizeEnum } from '../../utils/format';

type Rule = {
  id: string;
  code: string;
  name: string;
  category: string;
  compute_type: string;
  fixed_amount?: string | number | null;
  percent_value?: string | number | null;
  percent_of_category?: string | null;
  formula?: string | null;
  taxable: boolean;
  is_active: boolean;
};

const CATEGORIES = ['basic', 'allowance', 'gross', 'deduction', 'tax', 'contribution', 'net'];
const COMPUTE = ['fixed', 'percent_of_basic', 'percent_of_category', 'percent_of_gross', 'formula'];

export function SalaryRulesPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Rule | null>(null);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['salaryRules'],
    queryFn: async () => (await api.get('/payroll/salary-rules', { params: { limit: 100 } })).data.data as Rule[],
  });

  const openCreate = () => { setEditing(null); setForm(defaults()); setOpenForm(true); };
  const openEdit = (r: Rule) => { setEditing(r); setForm({ ...defaults(), ...r }); setOpenForm(true); };

  const save = async () => {
    try {
      const payload: any = {
        code: form.code,
        name: form.name,
        category: form.category,
        compute_type: form.compute_type,
        taxable: !!form.taxable,
        is_active: !!form.is_active,
        fixed_amount: form.fixed_amount ? Number(form.fixed_amount) : null,
        percent_value: form.percent_value ? Number(form.percent_value) : null,
        percent_of_category: form.percent_of_category || null,
        formula: form.formula || null,
      };
      if (editing) {
        await api.patch(`/payroll/salary-rules/${editing.id}`, payload);
        toast.success('Rule updated');
      } else {
        await api.post('/payroll/salary-rules', payload);
        toast.success('Rule created');
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
        title="Salary rules"
        subtitle="Building blocks for salary computation: earnings, deductions, taxes and net"
        actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>New rule</Button>}
      />
      <DataTable<Rule>
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<ClipboardList size={22} />} title="No salary rules" description="Create the first rule to start building salary structures." action={<Button onClick={openCreate}>New rule</Button>} />}
        columns={[
          { key: 'code', header: 'Code', render: (r) => <span className="pp-mono">{r.code}</span>, width: '140px' },
          { key: 'name', header: 'Name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
          { key: 'cat', header: 'Category', render: (r) => <Badge tone="primary">{humanizeEnum(r.category)}</Badge> },
          { key: 'compute', header: 'Compute', render: (r) => <span className="pp-soft">{humanizeEnum(r.compute_type)}</span> },
          {
            key: 'value',
            header: 'Value',
            render: (r) =>
              r.compute_type === 'fixed'
                ? formatMoney(r.fixed_amount as any)
                : r.compute_type === 'formula'
                ? <span className="pp-mono" style={{ fontSize: 12 }}>{r.formula}</span>
                : `${r.percent_value ?? 0}%${r.percent_of_category ? ` of ${r.percent_of_category}` : ''}`,
          },
          { key: 'tax', header: 'Taxable', render: (r) => <Badge tone={r.taxable ? 'warning' : 'muted'}>{r.taxable ? 'Yes' : 'No'}</Badge>, width: '100px' },
          { key: 'active', header: 'Status', render: (r) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
        ]}
        onRowClick={openEdit}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing ? 'Edit rule' : 'New salary rule'}
        size="lg"
        footer={<>
          <Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button onClick={save}>{editing ? 'Save' : 'Create'}</Button>
        </>}
      >
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          <Select label="Compute type" value={form.compute_type} onChange={(e) => setForm({ ...form, compute_type: e.target.value })}>
            {COMPUTE.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          {form.compute_type === 'fixed' && (
            <Input label="Fixed amount" type="number" value={form.fixed_amount || ''} onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })} />
          )}
          {(form.compute_type === 'percent_of_basic' || form.compute_type === 'percent_of_gross' || form.compute_type === 'percent_of_category') && (
            <Input label="Percent value" type="number" value={form.percent_value || ''} onChange={(e) => setForm({ ...form, percent_value: e.target.value })} hint="e.g. 40 for 40%" />
          )}
          {form.compute_type === 'percent_of_category' && (
            <Select label="Percent of category" value={form.percent_of_category || ''} onChange={(e) => setForm({ ...form, percent_of_category: e.target.value })}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
            </Select>
          )}
          {form.compute_type === 'formula' && (
            <Input label="Formula" value={form.formula || ''} onChange={(e) => setForm({ ...form, formula: e.target.value })} hint="e.g. BASIC * 0.1 + GROSS * 0.02" />
          )}
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={!!form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} />
            <span>Taxable</span>
          </label>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <span>Active</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    code: '', name: '', category: 'basic', compute_type: 'fixed',
    fixed_amount: '', percent_value: '', percent_of_category: '', formula: '',
    taxable: false, is_active: true,
  };
}
