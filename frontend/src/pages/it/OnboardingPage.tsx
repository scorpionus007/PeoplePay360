import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Package, Truck } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { useToast } from '../../components/Toast';
import { formatDate, humanizeEnum } from '../../utils/format';

const CATEGORIES = ['laptop', 'desktop', 'mobile', 'tablet', 'monitor', 'accessory', 'server'];
const OS = ['windows', 'macos', 'linux', 'ios', 'android', 'chromeos', 'other'];
const PROVISION_STATUSES = ['requested', 'preparing', 'dispatched', 'delivered', 'activated', 'cancelled'];

export function OnboardingPage() {
  const toast = useToast();
  const [openKit, setOpenKit] = useState(false);
  const [openProv, setOpenProv] = useState(false);
  const [kitForm, setKitForm] = useState<any>(defaultKit());
  const [provForm, setProvForm] = useState<any>({ employee_id: '', onboarding_kit_id: '', device_id: '', shipping_address: '', estimated_ready_date: '', note: '' });

  const { data: kits, isLoading: kitsL, refetch: refetchKits } = useQuery({
    queryKey: ['onboarding.kits'],
    queryFn: async () => (await api.get('/it/onboarding/kits')).data.data as any[],
  });
  const { data: provs, isLoading: provsL, refetch: refetchProvs } = useQuery({
    queryKey: ['onboarding.provisions'],
    queryFn: async () => (await api.get('/it/onboarding/provisions')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const devicesQ = useQuery({
    queryKey: ['devices', 'in_stock'],
    queryFn: async () => (await api.get('/it/devices', { params: { status: 'in_stock', limit: 200 } })).data.data as any[],
  });

  const createKit = async () => {
    try {
      await api.post('/it/onboarding/kits', kitForm);
      toast.success('Kit created');
      setOpenKit(false);
      setKitForm(defaultKit());
      refetchKits();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const startProvision = async () => {
    try {
      await api.post('/it/onboarding/provisions', {
        ...provForm,
        device_id: provForm.device_id || null,
        estimated_ready_date: provForm.estimated_ready_date || null,
      });
      toast.success('Provision started');
      setOpenProv(false);
      setProvForm({ employee_id: '', onboarding_kit_id: '', device_id: '', shipping_address: '', estimated_ready_date: '', note: '' });
      refetchProvs();
    } catch (err) {
      toast.error('Start failed', extractApiError(err));
    }
  };

  const advance = async (id: string, status: string) => {
    try {
      await api.patch(`/it/onboarding/provisions/${id}/status`, { status });
      toast.success('Status updated');
      refetchProvs();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  return (
    <div className="pp-stack">
      <PageHeader
        title="Onboarding"
        subtitle="Standard kits and per employee provisioning"
        actions={
          <div className="pp-row" style={{ gap: 8 }}>
            <Button variant="secondary" leftIcon={<Plus size={14} />} onClick={() => setOpenKit(true)}>New kit</Button>
            <Button leftIcon={<Truck size={14} />} onClick={() => setOpenProv(true)}>Provision</Button>
          </div>
        }
      />

      <Card>
        <CardHeader title="Kits" subtitle="Standard device and software bundles" />
        <DataTable
          loading={kitsL}
          rows={kits || []}
          empty={<EmptyState icon={<Package size={22} />} title="No kits configured" action={<Button onClick={() => setOpenKit(true)}>New kit</Button>} />}
          columns={[
            { key: 'name', header: 'Kit', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.name}</div>{r.is_default && <Badge tone="primary">Default</Badge>}</div> },
            { key: 'cat', header: 'Category', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.device_category)}</Badge>, width: '120px' },
            { key: 'os', header: 'OS', render: (r: any) => <Badge tone="muted">{humanizeEnum(r.preferred_os_family)}</Badge>, width: '110px' },
            { key: 'targets', header: 'Target types', render: (r: any) => (r.target_employee_types || []).map((t: string) => <Badge key={t} tone="muted">{humanizeEnum(t)}</Badge>) },
            { key: 'active', header: 'Status', render: (r: any) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
          ]}
        />
      </Card>

      <Card>
        <CardHeader title="Provisions" subtitle="Live onboarding shipments and activations" />
        <DataTable
          loading={provsL}
          rows={provs || []}
          empty={<EmptyState icon={<Truck size={22} />} title="No provisions yet" action={<Button onClick={() => setOpenProv(true)}>Provision an employee</Button>} />}
          columns={[
            { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
            { key: 'kit', header: 'Kit', render: (r: any) => r.kit?.name || '-' },
            { key: 'device', header: 'Device', render: (r: any) => r.device ? <span className="pp-mono" style={{ fontSize: 12 }}>{r.device.asset_tag}</span> : <span className="pp-soft">Unassigned</span> },
            { key: 'ready', header: 'Ready', render: (r: any) => r.estimated_ready_date ? formatDate(r.estimated_ready_date) : <span className="pp-soft">-</span> },
            { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
            {
              key: 'actions', header: '', width: '260px',
              render: (r: any) => {
                const idx = PROVISION_STATUSES.indexOf(r.status);
                const next = idx >= 0 && idx < 4 ? PROVISION_STATUSES[idx + 1] : null;
                return (
                  <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                    {next && next !== 'cancelled' && <Button size="sm" variant="subtle" onClick={() => advance(r.id, next)}>Advance to {humanizeEnum(next)}</Button>}
                  </div>
                );
              },
            },
          ]}
        />
      </Card>

      <Modal open={openKit} onClose={() => setOpenKit(false)} title="New kit" footer={<><Button variant="secondary" onClick={() => setOpenKit(false)}>Cancel</Button><Button onClick={createKit}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Name" required value={kitForm.name} onChange={(e) => setKitForm({ ...kitForm, name: e.target.value })} />
          <Select label="Device category" value={kitForm.device_category} onChange={(e) => setKitForm({ ...kitForm, device_category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          <Select label="Preferred OS" value={kitForm.preferred_os_family} onChange={(e) => setKitForm({ ...kitForm, preferred_os_family: e.target.value })}>
            {OS.map((o) => <option key={o} value={o}>{humanizeEnum(o)}</option>)}
          </Select>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={kitForm.is_default} onChange={(e) => setKitForm({ ...kitForm, is_default: e.target.checked })} />
            <span>Default kit</span>
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Description" value={kitForm.description} onChange={(e) => setKitForm({ ...kitForm, description: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal open={openProv} onClose={() => setOpenProv(false)} title="Provision onboarding" footer={<><Button variant="secondary" onClick={() => setOpenProv(false)}>Cancel</Button><Button onClick={startProvision}>Start</Button></>}>
        <div className="pp-stack">
          <Select label="Employee" required value={provForm.employee_id} onChange={(e) => setProvForm({ ...provForm, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Kit" required value={provForm.onboarding_kit_id} onChange={(e) => setProvForm({ ...provForm, onboarding_kit_id: e.target.value })}>
            <option value="">Select a kit</option>
            {(kits || []).filter((k: any) => k.is_active).map((k: any) => <option key={k.id} value={k.id}>{k.name}</option>)}
          </Select>
          <Select label="Device (optional)" value={provForm.device_id} onChange={(e) => setProvForm({ ...provForm, device_id: e.target.value })}>
            <option value="">Auto assign later</option>
            {(devicesQ.data || []).map((d: any) => <option key={d.id} value={d.id}>{d.asset_tag} - {d.manufacturer} {d.model}</option>)}
          </Select>
          <Input label="Shipping address" value={provForm.shipping_address} onChange={(e) => setProvForm({ ...provForm, shipping_address: e.target.value })} />
          <Input label="Estimated ready" type="date" value={provForm.estimated_ready_date} onChange={(e) => setProvForm({ ...provForm, estimated_ready_date: e.target.value })} />
          <Textarea label="Note" value={provForm.note} onChange={(e) => setProvForm({ ...provForm, note: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

function defaultKit() {
  return {
    name: '', description: '', device_category: 'laptop', preferred_os_family: 'windows',
    target_employee_types: [], software_ids: [], baseline_control_ids: [], specs: {},
    is_default: false, is_active: true,
  };
}
