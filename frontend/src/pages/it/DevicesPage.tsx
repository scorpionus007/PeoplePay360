import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Laptop, Search, UserPlus, UserMinus } from 'lucide-react';
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

const CATEGORIES = ['laptop', 'desktop', 'mobile', 'tablet', 'monitor', 'accessory', 'server'];
const OS = ['windows', 'macos', 'linux', 'ios', 'android', 'chromeos', 'other'];
const STATUSES = ['in_stock', 'assigned', 'in_repair', 'retired', 'lost', 'quarantined'];
const OWNERSHIPS = ['owned', 'leased', 'byod'];

export function DevicesPage() {
  const toast = useToast();
  const [filters, setFilters] = useState<any>({ search: '', status: '', category: '', ownership: '' });
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());
  const [assignRow, setAssignRow] = useState<any | null>(null);
  const [assignEmployee, setAssignEmployee] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => (await api.get('/it/devices', { params: { limit: 100, ...filters } })).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const create = async () => {
    try {
      const payload: any = { ...form };
      ['ram_gb', 'storage_gb', 'purchase_cost', 'lease_monthly_cost'].forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) payload[k] = null;
        else if (payload[k] !== null) payload[k] = Number(payload[k]);
      });
      await api.post('/it/devices', payload);
      toast.success('Device created');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const assign = async () => {
    if (!assignRow || !assignEmployee) return;
    try {
      await api.post(`/it/devices/${assignRow.id}/assign`, { employee_id: assignEmployee });
      toast.success('Device assigned');
      setAssignRow(null);
      setAssignEmployee('');
      refetch();
    } catch (err) {
      toast.error('Assign failed', extractApiError(err));
    }
  };
  const unassign = async (id: string) => {
    try {
      await api.post(`/it/devices/${id}/unassign`, {});
      toast.success('Device unassigned');
      refetch();
    } catch (err) {
      toast.error('Unassign failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Devices"
        subtitle="Central inventory of managed and BYOD devices"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Add device</Button>}
      />

      <div className="pp-row" style={{ gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, maxWidth: 320 }}>
          <Input placeholder="Search asset tag, hostname, serial" leftAdornment={<Search size={16} />} value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <div style={{ minWidth: 160 }}><Select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
        </Select></div>
        <div style={{ minWidth: 160 }}><Select label="Category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
        </Select></div>
        <div style={{ minWidth: 160 }}><Select label="Ownership" value={filters.ownership} onChange={(e) => setFilters({ ...filters, ownership: e.target.value })}>
          <option value="">All</option>
          {OWNERSHIPS.map((o) => <option key={o} value={o}>{humanizeEnum(o)}</option>)}
        </Select></div>
      </div>

      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Laptop size={22} />} title="No devices in inventory" action={<Button onClick={() => setOpenForm(true)}>Add device</Button>} />}
        columns={[
          { key: 'tag', header: 'Asset', render: (r: any) => <div><div style={{ fontWeight: 600 }} className="pp-mono">{r.asset_tag}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.hostname || '-'}</div></div> },
          { key: 'device', header: 'Device', render: (r: any) => <div><div>{r.manufacturer} {r.model}</div><div className="pp-soft" style={{ fontSize: 12 }}>{humanizeEnum(r.os_family)} {r.os_version || ''}</div></div> },
          { key: 'category', header: 'Category', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.category)}</Badge>, width: '110px' },
          { key: 'own', header: 'Ownership', render: (r: any) => <Badge tone={r.ownership === 'owned' ? 'primary' : r.ownership === 'leased' ? 'info' : 'muted'}>{humanizeEnum(r.ownership)}</Badge>, width: '110px' },
          { key: 'assigned', header: 'Assigned to', render: (r: any) => r.assigned_employee ? <span style={{ fontWeight: 600 }}>{r.assigned_employee.first_name} {r.assigned_employee.last_name}</span> : <span className="pp-soft">Unassigned</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          { key: 'cost', header: 'Cost', render: (r: any) => r.purchase_cost ? formatMoney(r.purchase_cost, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          {
            key: 'actions', header: '', width: '200px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status !== 'assigned' && r.status !== 'retired' && <Button size="sm" variant="subtle" leftIcon={<UserPlus size={12} />} onClick={() => { setAssignRow(r); setAssignEmployee(''); }}>Assign</Button>}
                {r.status === 'assigned' && <Button size="sm" variant="ghost" leftIcon={<UserMinus size={12} />} onClick={() => unassign(r.id)}>Unassign</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Add device" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Add</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Asset tag" required value={form.asset_tag} onChange={(e) => setForm({ ...form, asset_tag: e.target.value })} />
          <Input label="Hostname" value={form.hostname} onChange={(e) => setForm({ ...form, hostname: e.target.value })} />
          <Input label="Serial number" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          <Input label="Manufacturer" value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} />
          <Input label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <Select label="OS" value={form.os_family} onChange={(e) => setForm({ ...form, os_family: e.target.value })}>
            {OS.map((o) => <option key={o} value={o}>{humanizeEnum(o)}</option>)}
          </Select>
          <Input label="OS version" value={form.os_version} onChange={(e) => setForm({ ...form, os_version: e.target.value })} />
          <Input label="RAM (GB)" type="number" value={form.ram_gb} onChange={(e) => setForm({ ...form, ram_gb: e.target.value })} />
          <Input label="Storage (GB)" type="number" value={form.storage_gb} onChange={(e) => setForm({ ...form, storage_gb: e.target.value })} />
          <Select label="Ownership" value={form.ownership} onChange={(e) => setForm({ ...form, ownership: e.target.value })}>
            {OWNERSHIPS.map((o) => <option key={o} value={o}>{humanizeEnum(o)}</option>)}
          </Select>
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
          </Select>
          <Input label="Purchase date" type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
          <Input label="Purchase cost" type="number" value={form.purchase_cost} onChange={(e) => setForm({ ...form, purchase_cost: e.target.value })} />
          <Input label="Warranty end" type="date" value={form.warranty_end} onChange={(e) => setForm({ ...form, warranty_end: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal open={!!assignRow} onClose={() => setAssignRow(null)} title={`Assign ${assignRow?.asset_tag || ''}`} footer={<><Button variant="secondary" onClick={() => setAssignRow(null)}>Cancel</Button><Button onClick={assign}>Assign</Button></>}>
        <Select label="Employee" required value={assignEmployee} onChange={(e) => setAssignEmployee(e.target.value)}>
          <option value="">Select an employee</option>
          {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_number})</option>)}
        </Select>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    asset_tag: '', hostname: '', serial_number: '', category: 'laptop',
    manufacturer: '', model: '', os_family: 'windows', os_version: '',
    ram_gb: '', storage_gb: '', ownership: 'owned', status: 'in_stock',
    purchase_date: '', purchase_cost: '', warranty_end: '', currency: 'USD',
    notes: '',
  };
}
