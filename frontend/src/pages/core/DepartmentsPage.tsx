import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Plus } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Badge } from '../../components/Badge';
import { Modal } from '../../components/Modal';
import { Input, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';

type Department = { id: string; name: string; code?: string | null; description?: string | null; is_active: boolean };

export function DepartmentsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState<{ name: string; code: string; description: string; is_active: boolean }>({
    name: '', code: '', description: '', is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/departments')).data.data as Department[],
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', description: '', is_active: true }); setOpenForm(true); };
  const openEdit = (d: Department) => {
    setEditing(d);
    setForm({ name: d.name, code: d.code || '', description: d.description || '', is_active: d.is_active });
    setOpenForm(true);
  };
  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, code: form.code || null };
      if (editing) {
        await api.patch(`/departments/${editing.id}`, payload);
        toast.success('Department updated');
      } else {
        await api.post('/departments', payload);
        toast.success('Department created');
      }
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Organizational units, cost centers, and reporting groups"
        actions={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>New department</Button>}
      />
      <DataTable<Department>
        loading={isLoading}
        rows={data || []}
        empty={
          <EmptyState
            icon={<Building2 size={22} />}
            title="No departments configured"
            description="Create your first department to structure your organization."
            action={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>New department</Button>}
          />
        }
        columns={[
          { key: 'name', header: 'Name', render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
          { key: 'code', header: 'Code', render: (r) => r.code ? <span className="pp-mono">{r.code}</span> : <span className="pp-soft">-</span>, width: '140px' },
          { key: 'desc', header: 'Description', render: (r) => r.description || <span className="pp-soft">-</span> },
          { key: 'active', header: 'Status', render: (r) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '120px' },
        ]}
        onRowClick={openEdit}
      />

      <Modal
        open={openForm}
        onClose={() => setOpenForm(false)}
        title={editing ? 'Edit department' : 'New department'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button onClick={save} loading={saving}>{editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className="pp-stack">
          <Input label="Name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Code" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} hint="Optional short code such as ENG, HR, SLS" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <label className="pp-row" style={{ gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
            <span>Active</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}
