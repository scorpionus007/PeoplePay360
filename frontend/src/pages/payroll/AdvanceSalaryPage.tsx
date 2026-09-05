import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Wallet } from 'lucide-react';
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

export function AdvanceSalaryPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', requested_amount: '', repayment_mode: 'salary_deduction', emi_months: '', reason: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['advance-salary'],
    queryFn: async () => (await api.get('/payroll/advance-salary-requests', { params: { limit: 100 } })).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const submit = async () => {
    try {
      const payload: any = {
        employee_id: form.employee_id || null,
        requested_amount: Number(form.requested_amount),
        repayment_mode: form.repayment_mode,
        emi_months: form.repayment_mode === 'emi' ? Number(form.emi_months) : null,
        reason: form.reason || null,
      };
      await api.post('/payroll/advance-salary-requests', payload);
      toast.success('Advance requested');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Request failed', extractApiError(err));
    }
  };

  const action = async (id: string, path: string, label: string) => {
    try {
      await api.post(`/payroll/advance-salary-requests/${id}/${path}`);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(`${label} failed`, extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Advance salary"
        subtitle="On demand salary access with automatic recovery"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Request advance</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Wallet size={22} />} title="No advance requests" action={<Button onClick={() => setOpenForm(true)}>Request advance</Button>} />}
        columns={[
          { key: 'employee', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'requested', header: 'Requested', render: (r: any) => formatMoney(r.requested_amount, r.currency), align: 'right' as const },
          { key: 'fee', header: 'Fee', render: (r: any) => <span className="pp-soft">{formatMoney(r.service_fee_amount, r.currency)} ({r.service_fee_percent}%)</span>, align: 'right' as const },
          { key: 'disbursement', header: 'Disbursement', render: (r: any) => <span style={{ fontWeight: 600 }}>{formatMoney(r.disbursement_amount, r.currency)}</span>, align: 'right' as const },
          { key: 'outstanding', header: 'Outstanding', render: (r: any) => formatMoney(r.outstanding_amount, r.currency), align: 'right' as const },
          { key: 'mode', header: 'Mode', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.repayment_mode)}{r.emi_months ? ` × ${r.emi_months}` : ''}</Badge> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          { key: 'created', header: 'Created', render: (r: any) => formatDate(r.created_at), width: '130px' },
          {
            key: 'actions',
            header: '',
            width: '260px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'requested' && <>
                  <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve', 'Approved')}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => action(r.id, 'reject', 'Rejected')}>Reject</Button>
                </>}
                {r.status === 'approved' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'disburse', 'Disbursed')}>Disburse</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title="Request advance salary"
        footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={submit}>Submit request</Button></>}
      >
        <div className="pp-stack">
          <Select label="Employee" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Current user or select</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Input label="Requested amount" type="number" required value={form.requested_amount} onChange={(e) => setForm({ ...form, requested_amount: e.target.value })} />
          <Select label="Repayment mode" value={form.repayment_mode} onChange={(e) => setForm({ ...form, repayment_mode: e.target.value })}>
            <option value="salary_deduction">Deduct from next salary</option>
            <option value="direct_transfer">Direct transfer</option>
            <option value="emi">EMI over multiple months</option>
          </Select>
          {form.repayment_mode === 'emi' && (
            <Input label="EMI months" type="number" required value={form.emi_months} onChange={(e) => setForm({ ...form, emi_months: e.target.value })} />
          )}
          <Textarea label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
