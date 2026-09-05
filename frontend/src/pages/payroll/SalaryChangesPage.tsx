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
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

export function SalaryChangesPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', change_type: 'increment', amount: '', percent: '', reason: '', effective_from: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['salary-changes'],
    queryFn: async () => (await api.get('/payroll/salary-change-requests', { params: { limit: 100 } })).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const submit = async () => {
    try {
      await api.post('/payroll/salary-change-requests/suggest', {
        employee_id: form.employee_id,
        change_type: form.change_type,
        amount: form.amount ? Number(form.amount) : null,
        percent: form.percent ? Number(form.percent) : null,
        reason: form.reason,
        effective_from: form.effective_from || null,
      });
      toast.success('Change suggested');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Suggest failed', extractApiError(err));
    }
  };

  const decide = async (id: string, decided_amount: number) => {
    try {
      await api.post(`/payroll/salary-change-requests/${id}/payroll-decision`, { decided_amount });
      toast.success('Decision recorded');
      refetch();
    } catch (err) {
      toast.error('Decision failed', extractApiError(err));
    }
  };
  const action = async (id: string, path: string, label: string) => {
    try {
      await api.post(`/payroll/salary-change-requests/${id}/${path}`);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Salary changes"
        subtitle="HR suggests, Payroll Manager decides, Admin approves, and applying creates a new active contract"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Suggest change</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<BadgeDollarSign size={22} />} title="No salary change requests" action={<Button onClick={() => setOpenForm(true)}>Suggest change</Button>} />}
        columns={[
          { key: 'employee', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone={r.change_type === 'increment' ? 'success' : 'warning'}>{humanizeEnum(r.change_type)}</Badge> },
          { key: 'suggested', header: 'Suggested', render: (r: any) => r.suggested_amount ? formatMoney(r.suggested_amount) : (r.suggested_percent ? `${r.suggested_percent}%` : '-') },
          { key: 'decided', header: 'Decided', render: (r: any) => r.payroll_decided_amount ? formatMoney(r.payroll_decided_amount) : <span className="pp-soft">-</span> },
          { key: 'eff', header: 'Effective', render: (r: any) => r.effective_from ? formatDate(r.effective_from) : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '190px' },
          {
            key: 'actions',
            header: '',
            width: '280px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'pending_payroll_review' && (
                  <Button size="sm" variant="subtle" onClick={() => {
                    const raw = prompt('Decided amount', String(r.suggested_amount || ''));
                    if (raw) decide(r.id, Number(raw));
                  }}>Decide</Button>
                )}
                {r.status === 'pending_admin_approval' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'admin-approve', 'Approved')}>Approve</Button>}
                {r.status === 'approved' && <Button size="sm" onClick={() => action(r.id, 'apply', 'Applied')}>Apply</Button>}
                {['pending_payroll_review', 'pending_admin_approval'].includes(r.status) && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'reject', 'Rejected')}>Reject</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Suggest salary change" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={submit}>Suggest</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Change type" value={form.change_type} onChange={(e) => setForm({ ...form, change_type: e.target.value })}>
            <option value="increment">Increment</option>
            <option value="decrement">Decrement</option>
          </Select>
          <Input label="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} hint="Or set percent" />
          <Input label="Percent" type="number" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })} />
          <Input label="Effective from" type="date" value={form.effective_from} onChange={(e) => setForm({ ...form, effective_from: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Reason" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
