import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ClipboardList } from 'lucide-react';
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

export function BenefitClaimsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', benefit_enrollment_id: '', subject: '', description: '', incurred_on: '', claim_amount: '', currency: 'USD' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['benefit-claims'],
    queryFn: async () => (await api.get('/benefits/claims', { params: { limit: 100 } })).data.data as any[],
  });
  const enrollmentsQ = useQuery({
    queryKey: ['enrollments', 'active'],
    queryFn: async () => (await api.get('/benefits/enrollments', { params: { status: 'active', limit: 200 } })).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/benefits/claims', {
        ...form,
        claim_amount: Number(form.claim_amount),
        employee_id: form.employee_id || null,
      });
      toast.success('Claim submitted');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Submit failed', extractApiError(err));
    }
  };

  const action = async (id: string, path: string, label: string, body: any = {}) => {
    try {
      await api.post(`/benefits/claims/${id}/${path}`, body);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Benefit claims"
        subtitle="Submit, review and reimburse claims tied to active enrollments"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Submit claim</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<ClipboardList size={22} />} title="No claims yet" action={<Button onClick={() => setOpenForm(true)}>Submit claim</Button>} />}
        columns={[
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.claim_code}</span>, width: '190px' },
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '-' },
          { key: 'plan', header: 'Plan', render: (r: any) => r.plan?.name || '-' },
          { key: 'subject', header: 'Subject', render: (r: any) => r.subject },
          { key: 'incurred', header: 'Incurred', render: (r: any) => formatDate(r.incurred_on) },
          { key: 'amount', header: 'Amount', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.claim_amount, r.currency)}</span>, align: 'right' as const },
          { key: 'approved', header: 'Approved', render: (r: any) => r.approved_amount ? formatMoney(r.approved_amount, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          {
            key: 'actions', header: '', width: '300px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {['submitted', 'under_review'].includes(r.status) && (
                  <>
                    <Button size="sm" variant="subtle" onClick={() => {
                      const raw = prompt('Approved amount', String(r.claim_amount || ''));
                      if (raw) action(r.id, 'approve', 'Approved', { approved_amount: Number(raw) });
                    }}>Approve</Button>
                    <Button size="sm" variant="ghost" onClick={() => action(r.id, 'reject', 'Rejected')}>Reject</Button>
                  </>
                )}
                {r.status === 'approved' && <Button size="sm" onClick={() => action(r.id, 'reimburse', 'Reimbursed', {})}>Reimburse</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Submit claim" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Submit</Button></>}>
        <div className="pp-stack">
          <Select label="Enrollment" required value={form.benefit_enrollment_id} onChange={(e) => {
            const enroll = (enrollmentsQ.data || []).find((x: any) => x.id === e.target.value);
            setForm({ ...form, benefit_enrollment_id: e.target.value, employee_id: enroll?.employee_id || form.employee_id, currency: enroll?.currency || 'USD' });
          }}>
            <option value="">Select an enrollment</option>
            {(enrollmentsQ.data || []).map((en: any) => (
              <option key={en.id} value={en.id}>
                {en.employee ? `${en.employee.first_name} ${en.employee.last_name}` : ''} - {en.plan?.name || 'Plan'}
              </option>
            ))}
          </Select>
          <Input label="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div className="pp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Incurred on" type="date" required value={form.incurred_on} onChange={(e) => setForm({ ...form, incurred_on: e.target.value })} />
            <Input label="Amount" type="number" required value={form.claim_amount} onChange={(e) => setForm({ ...form, claim_amount: e.target.value })} />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
