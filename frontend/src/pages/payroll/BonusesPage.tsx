import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Award } from 'lucide-react';
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

const BONUS_TYPES = ['performance', 'retention', 'referral', 'sign_on', 'festive', 'discretionary'];

export function BonusesPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', bonus_type: 'discretionary', amount: '', currency: 'USD', grant_date: '', payout_period: '', taxable: true, reason: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['bonuses'],
    queryFn: async () => (await api.get('/payroll/bonuses', { params: { limit: 100 } })).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/payroll/bonuses', {
        ...form,
        amount: Number(form.amount),
        payout_period: form.payout_period || null,
      });
      toast.success('Bonus created');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Create failed', extractApiError(err));
    }
  };

  const action = async (id: string, path: string, label: string) => {
    try {
      await api.post(`/payroll/bonuses/${id}/${path}`);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Bonuses"
        subtitle="One time awards that fold into the next matching payrun"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New bonus</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Award size={22} />} title="No bonuses yet" action={<Button onClick={() => setOpenForm(true)}>New bonus</Button>} />}
        columns={[
          { key: 'employee', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.bonus_type)}</Badge> },
          { key: 'amount', header: 'Amount', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.amount, r.currency)}</span>, align: 'right' as const },
          { key: 'grant', header: 'Grant date', render: (r: any) => formatDate(r.grant_date) },
          { key: 'payout', header: 'Payout period', render: (r: any) => r.payout_period ? formatDate(r.payout_period) : <span className="pp-soft">Next payrun</span> },
          { key: 'tax', header: 'Taxable', render: (r: any) => <Badge tone={r.taxable ? 'warning' : 'muted'}>{r.taxable ? 'Yes' : 'No'}</Badge>, width: '90px' },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '110px' },
          {
            key: 'actions',
            header: '',
            width: '200px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'draft' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve', 'Approved')}>Approve</Button>}
                {r.status !== 'cancelled' && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'cancel', 'Cancelled')}>Cancel</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title="New bonus"
        footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}
      >
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Type" value={form.bonus_type} onChange={(e) => setForm({ ...form, bonus_type: e.target.value })}>
            {BONUS_TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
          </Select>
          <Input label="Amount" type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Input label="Grant date" type="date" required value={form.grant_date} onChange={(e) => setForm({ ...form, grant_date: e.target.value })} />
          <Input label="Payout period" type="date" value={form.payout_period} onChange={(e) => setForm({ ...form, payout_period: e.target.value })} />
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={!!form.taxable} onChange={(e) => setForm({ ...form, taxable: e.target.checked })} />
            <span>Taxable</span>
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
