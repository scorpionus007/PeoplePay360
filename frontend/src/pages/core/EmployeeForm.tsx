import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { Button } from '../../components/Button';
import { api, extractApiError } from '../../api/client';
import { useToast } from '../../components/Toast';

type Props = {
  open: boolean;
  onClose: () => void;
  employee: any | null;
  onSaved: () => void;
};

const EMPTY = {
  employee_number: '',
  first_name: '',
  last_name: '',
  email_work: '',
  job_title: '',
  employment_type: 'full_time',
  employment_status: 'active',
  base_currency: 'USD',
  department_id: '',
};

export function EmployeeForm({ open, onClose, employee, onSaved }: Props) {
  const [form, setForm] = useState<any>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const editing = !!employee?.id;

  const { data: depts } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data.data as { id: string; name: string }[],
  });

  useEffect(() => {
    if (open) {
      setForm(employee ? { ...EMPTY, ...employee, department_id: employee.department_id || '' } : EMPTY);
    }
  }, [open, employee]);

  const update = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, department_id: form.department_id || null };
      if (editing) {
        await api.patch(`/employees/${employee.id}`, payload);
        toast.success('Employee updated');
      } else {
        await api.post('/employees', payload);
        toast.success('Employee created');
      }
      onSaved();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit employee' : 'Add employee'}
      subtitle={editing ? 'Update employee details and status' : 'Add a new person to your organization'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={submitting}>{editing ? 'Save changes' : 'Create employee'}</Button>
        </>
      }
    >
      <form onSubmit={onSubmit} className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <Input label="Employee number" required value={form.employee_number} onChange={(e) => update('employee_number', e.target.value)} />
        <Input label="Work email" type="email" required value={form.email_work} onChange={(e) => update('email_work', e.target.value)} />
        <Input label="First name" required value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
        <Input label="Last name" required value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
        <Input label="Job title" value={form.job_title || ''} onChange={(e) => update('job_title', e.target.value)} />
        <Select label="Department" value={form.department_id || ''} onChange={(e) => update('department_id', e.target.value)}>
          <option value="">Unassigned</option>
          {(depts || []).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select label="Employment type" value={form.employment_type} onChange={(e) => update('employment_type', e.target.value)}>
          {['full_time', 'part_time', 'contract', 'intern', 'freelancer', 'auditor'].map((v) => (
            <option key={v} value={v}>{v.replace('_', ' ')}</option>
          ))}
        </Select>
        <Select label="Status" value={form.employment_status} onChange={(e) => update('employment_status', e.target.value)}>
          {['active', 'onboarding', 'on_leave', 'suspended', 'terminated'].map((v) => (
            <option key={v} value={v}>{v.replace('_', ' ')}</option>
          ))}
        </Select>
        <Input label="Base currency" maxLength={3} value={form.base_currency} onChange={(e) => update('base_currency', e.target.value.toUpperCase())} />
        <Input label="Phone" value={form.phone || ''} onChange={(e) => update('phone', e.target.value)} />
      </form>
    </Modal>
  );
}
