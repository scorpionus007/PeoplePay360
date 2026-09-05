import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, BadgeDollarSign } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatMoney, formatDate, humanizeEnum } from '../../utils/format';

export function VouchersPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', partner_name: '', category: '', amount: '', currency: 'USD', valid_from: '', valid_to: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vouchers'],
    queryFn: async () => (await api.get('/benefits/vouchers', { params: { limit: 100 } })).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const issue = async () => {
    try {
      await api.post('/benefits/vouchers', { ...form, amount: Number(form.amount), employee_id: form.employee_id || null, valid_from: form.valid_from || null, valid_to: form.valid_to || null });
      toast.success('Voucher issued');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Issue failed', extractApiError(err));
    }
  };

  const action = async (id: string, path: string, label: string, body: any = {}) => {
    try {
      await api.post(`/benefits/vouchers/${id}/${path}`, body);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Gift vouchers"
        subtitle="Issue, deliver and redeem employee vouchers"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Issue voucher</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<BadgeDollarSign size={22} />} title="No vouchers issued" action={<Button onClick={() => setOpenForm(true)}>Issue voucher</Button>} />}
        columns={[
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '170px' },
          { key: 'employee', header: 'Employee', render: (r: any) => r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : <span className="pp-soft">Unassigned</span> },
          { key: 'partner', header: 'Partner', render: (r: any) => r.partner_name || '-' },
          { key: 'amount', header: 'Amount', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.amount, r.currency)}</span>, align: 'right' as const },
          { key: 'validity', header: 'Validity', render: (r: any) => r.valid_to ? `${formatDate(r.valid_from)} - ${formatDate(r.valid_to)}` : <span className="pp-soft">No expiry</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '120px' },
          {
            key: 'actions', header: '', width: '260px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'issued' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'deliver', 'Delivered')}>Deliver</Button>}
                {(r.status === 'issued' || r.status === 'delivered') && (
                  <Button size="sm" variant="subtle" onClick={() => {
                    const ref = prompt('Redemption reference (optional)') || '';
                    action(r.id, 'redeem', 'Redeemed', { redemption_reference: ref });
                  }}>Redeem</Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Issue voucher" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={issue}>Issue</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Unassigned</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Input label="Partner name" value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} />
          <Input label="Amount" type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Valid from" type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
          <Input label="Valid to" type="date" value={form.valid_to} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
