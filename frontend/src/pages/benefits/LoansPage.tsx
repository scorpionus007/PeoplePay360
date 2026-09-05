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
import { formatMoney, humanizeEnum } from '../../utils/format';

export function LoansPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', loan_program_id: '', requested_amount: '', tenure_months: '', reason: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['loans'],
    queryFn: async () => (await api.get('/benefits/loans', { params: { limit: 100 } })).data.data as any[],
  });
  const programsQ = useQuery({
    queryKey: ['loan-programs'],
    queryFn: async () => (await api.get('/benefits/loans/programs')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/benefits/loans', {
        ...form,
        requested_amount: Number(form.requested_amount),
        tenure_months: Number(form.tenure_months),
      });
      toast.success('Loan requested');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Request failed', extractApiError(err));
    }
  };

  const action = async (id: string, path: string, label: string, body: any = { approve: true }) => {
    try {
      await api.post(`/benefits/loans/${id}/${path}`, body);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Loans"
        subtitle="Employee loan programs, applications, and repayments"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Apply for loan</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Wallet size={22} />} title="No loans" action={<Button onClick={() => setOpenForm(true)}>Apply for loan</Button>} />}
        columns={[
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '160px' },
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '-' },
          { key: 'program', header: 'Program', render: (r: any) => r.program?.name || '-' },
          { key: 'requested', header: 'Requested', render: (r: any) => formatMoney(r.requested_amount, r.currency), align: 'right' as const },
          { key: 'emi', header: 'EMI', render: (r: any) => r.monthly_installment ? formatMoney(r.monthly_installment, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'outstanding', header: 'Outstanding', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.outstanding_amount, r.currency)}</span>, align: 'right' as const },
          { key: 'tenure', header: 'Tenure', render: (r: any) => `${r.tenure_months} mo`, align: 'right' as const, width: '90px' },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          {
            key: 'actions', header: '', width: '260px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'submitted' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'manager-review', 'Manager reviewed')}>Manager OK</Button>}
                {r.status === 'under_review' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'admin-review', 'Admin reviewed')}>Admin OK</Button>}
                {r.status === 'approved' && <Button size="sm" onClick={() => action(r.id, 'disburse', 'Disbursed', {})}>Disburse</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Apply for a loan" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Apply</Button></>}>
        <div className="pp-stack">
          <Select label="Employee" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Current user or select</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Program" required value={form.loan_program_id} onChange={(e) => setForm({ ...form, loan_program_id: e.target.value })}>
            <option value="">Select a program</option>
            {(programsQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.currency}, {p.interest_rate_percent}% {p.interest_mode})</option>)}
          </Select>
          <div className="pp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Requested amount" type="number" required value={form.requested_amount} onChange={(e) => setForm({ ...form, requested_amount: e.target.value })} />
            <Input label="Tenure (months)" type="number" required value={form.tenure_months} onChange={(e) => setForm({ ...form, tenure_months: e.target.value })} />
          </div>
          <Textarea label="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
