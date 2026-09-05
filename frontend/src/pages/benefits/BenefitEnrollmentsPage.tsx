import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, UserPlus } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

export function BenefitEnrollmentsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ employee_id: '', benefit_plan_id: '', start_date: '', dependents: [] });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => (await api.get('/benefits/enrollments', { params: { limit: 100 } })).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const plansQ = useQuery({
    queryKey: ['benefit-plans'],
    queryFn: async () => (await api.get('/benefits/plans', { params: { limit: 200 } })).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/benefits/enrollments', { ...form, employee_id: form.employee_id || null });
      toast.success('Enrollment created');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Enroll failed', extractApiError(err));
    }
  };

  const action = async (id: string, path: string, label: string) => {
    try {
      await api.post(`/benefits/enrollments/${id}/${path}`);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Employees enrolled into benefit plans with optional dependents"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Enroll</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<UserPlus size={22} />} title="No enrollments" action={<Button onClick={() => setOpenForm(true)}>Enroll</Button>} />}
        columns={[
          { key: 'employee', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'plan', header: 'Plan', render: (r: any) => r.plan ? <div><div>{r.plan.name}</div><div className="pp-soft" style={{ fontSize: 11 }}>{humanizeEnum(r.plan.category)}</div></div> : '-' },
          { key: 'start', header: 'Start', render: (r: any) => formatDate(r.start_date) },
          { key: 'end', header: 'End', render: (r: any) => r.end_date ? formatDate(r.end_date) : <span className="pp-soft">Ongoing</span> },
          { key: 'deps', header: 'Deps', render: (r: any) => r.dependents_count, align: 'right' as const, width: '70px' },
          { key: 'cost', header: 'Monthly cost', render: (r: any) => r.employee_monthly_cost ? formatMoney(r.employee_monthly_cost, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '160px' },
          {
            key: 'actions', header: '', width: '240px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'pending_approval' && <>
                  <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve', 'Approved')}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => action(r.id, 'decline', 'Declined')}>Decline</Button>
                </>}
                {r.status === 'active' && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'terminate', 'Terminated')}>Terminate</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Enroll into a benefit plan" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Enroll</Button></>}>
        <div className="pp-stack">
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Plan" required value={form.benefit_plan_id} onChange={(e) => setForm({ ...form, benefit_plan_id: e.target.value })}>
            <option value="">Select a plan</option>
            {(plansQ.data || []).filter((p: any) => p.status === 'active').map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Start date" type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
