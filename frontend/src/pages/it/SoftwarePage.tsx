import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Package } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

const LICENSE_TYPES = ['per_user', 'per_device', 'site', 'subscription', 'perpetual', 'free'];

export function SoftwarePage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['software'],
    queryFn: async () => (await api.get('/it/software')).data.data as any[],
  });

  const create = async () => {
    try {
      const payload: any = { ...form };
      ['unit_cost', 'total_seats'].forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) payload[k] = null;
        else payload[k] = Number(payload[k]);
      });
      await api.post('/it/software', payload);
      toast.success('Software added');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Software catalog"
        subtitle="License inventory across the organization"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Add software</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Package size={22} />} title="Empty catalog" action={<Button onClick={() => setOpenForm(true)}>Add software</Button>} />}
        columns={[
          { key: 'name', header: 'Software', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.vendor || 'Vendor unknown'}</div></div> },
          { key: 'category', header: 'Category', render: (r: any) => r.category ? <Badge tone="neutral">{r.category}</Badge> : <span className="pp-soft">-</span> },
          { key: 'version', header: 'Version', render: (r: any) => <span className="pp-mono">{r.version || '-'}</span>, width: '100px' },
          { key: 'license', header: 'License', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.license_type)}</Badge> },
          { key: 'cost', header: 'Unit cost', render: (r: any) => r.unit_cost ? formatMoney(r.unit_cost, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'seats', header: 'Seats', render: (r: any) => r.total_seats ? <span style={{ fontWeight: 600 }}>{r.seats_allocated}/{r.total_seats}</span> : <span className="pp-soft">Unlimited</span>, align: 'right' as const },
          { key: 'renewal', header: 'Renewal', render: (r: any) => r.renewal_date ? formatDate(r.renewal_date) : <span className="pp-soft">-</span> },
          { key: 'managed', header: 'Managed', render: (r: any) => <Badge tone={r.is_managed ? 'success' : 'muted'}>{r.is_managed ? 'Yes' : 'No'}</Badge>, width: '100px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Add software" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Add</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input label="Version" value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} />
          <Select label="License type" value={form.license_type} onChange={(e) => setForm({ ...form, license_type: e.target.value })}>
            {LICENSE_TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
          </Select>
          <Input label="Unit cost" type="number" value={form.unit_cost} onChange={(e) => setForm({ ...form, unit_cost: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Input label="Total seats" type="number" value={form.total_seats} onChange={(e) => setForm({ ...form, total_seats: e.target.value })} />
          <Input label="Renewal date" type="date" value={form.renewal_date} onChange={(e) => setForm({ ...form, renewal_date: e.target.value })} />
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.is_managed} onChange={(e) => setForm({ ...form, is_managed: e.target.checked })} />
            <span>Managed by IT</span>
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    name: '', vendor: '', category: '', version: '', license_type: 'subscription',
    unit_cost: '', currency: 'USD', total_seats: '', renewal_date: '',
    is_managed: true, description: '',
  };
}
