import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, ClipboardList } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate } from '../../utils/format';

type Structure = {
  id: string;
  code: string;
  name: string;
  currency: string;
  is_active: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  structure_rules?: any[];
};

export function SalaryStructuresPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ code: '', name: '', description: '', currency: 'USD' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['salaryStructures'],
    queryFn: async () => (await api.get('/payroll/salary-structures', { params: { limit: 100 } })).data.data as Structure[],
  });

  const create = async () => {
    try {
      const res = await api.post('/payroll/salary-structures', form);
      toast.success('Structure created');
      setOpenForm(false);
      refetch();
      navigate(`/payroll/salary-structures/${res.data.data.id}`);
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Salary structures"
        subtitle="Containers of ordered salary rules used by payruns and contracts"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New structure</Button>}
      />
      <DataTable<Structure>
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<ClipboardList size={22} />} title="No salary structures" description="Create one to start driving payroll computation." action={<Button onClick={() => setOpenForm(true)}>New structure</Button>} />}
        onRowClick={(r) => navigate(`/payroll/salary-structures/${r.id}`)}
        columns={[
          { key: 'code', header: 'Code', render: (r) => <span className="pp-mono">{r.code}</span>, width: '140px' },
          { key: 'name', header: 'Name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
          { key: 'ccy', header: 'Currency', render: (r) => <Badge tone="neutral">{r.currency}</Badge>, width: '110px' },
          { key: 'rules', header: 'Rules', render: (r) => `${r.structure_rules?.length ?? 0}` , width: '90px' },
          { key: 'eff', header: 'Effective', render: (r) => r.effective_from ? `${formatDate(r.effective_from)}${r.effective_to ? ' - ' + formatDate(r.effective_to) : ''}` : <span className="pp-soft">Ongoing</span> },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
        ]}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title="New salary structure"
        footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}
      >
        <div className="pp-stack">
          <Input label="Code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
