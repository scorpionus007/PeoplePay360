import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Globe2 } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatNumber } from '../../utils/format';

export function LocationStandardsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['location.standards'],
    queryFn: async () => (await api.get('/mobility/location-standards')).data.data as any[],
  });

  const save = async () => {
    try {
      const payload: any = {
        ...form,
        region_code: form.region_code || null,
        city: form.city || null,
        standard_weekly_hours: Number(form.standard_weekly_hours),
        minimum_pto_days: Number(form.minimum_pto_days),
        minimum_sick_days: Number(form.minimum_sick_days),
        overtime_multiplier: Number(form.overtime_multiplier),
        // Blank numeric optional must be null, not '' (Joi rejects '').
        notice_period_days: form.notice_period_days ? Number(form.notice_period_days) : null,
      };
      await api.post('/mobility/location-standards', payload);
      toast.success('Location standard created');
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
        title="Location standards"
        subtitle="Per country and region defaults for hours, PTO, wages, and compliance"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New standard</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Globe2 size={22} />} title="No location standards" action={<Button onClick={() => setOpenForm(true)}>New standard</Button>} />}
        columns={[
          { key: 'country', header: 'Country', render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.display_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.country_code}{r.region_code ? ` / ${r.region_code}` : ''}</div></div> },
          { key: 'ccy', header: 'Currency', render: (r: any) => <Badge tone="neutral">{r.currency}</Badge>, width: '100px' },
          { key: 'tz', header: 'Timezone', render: (r: any) => <span className="pp-soft" style={{ fontSize: 12 }}>{r.timezone}</span> },
          { key: 'hours', header: 'Weekly', render: (r: any) => `${formatNumber(r.standard_weekly_hours, 1)}h`, align: 'right' as const, width: '90px' },
          { key: 'pto', header: 'PTO min', render: (r: any) => `${r.minimum_pto_days}d`, align: 'right' as const, width: '90px' },
          { key: 'sick', header: 'Sick min', render: (r: any) => `${r.minimum_sick_days}d`, align: 'right' as const, width: '90px' },
          { key: 'ot', header: 'OT mult', render: (r: any) => `${r.overtime_multiplier}x`, align: 'right' as const, width: '90px' },
          { key: 'visa', header: 'Work visa', render: (r: any) => <Badge tone={r.requires_work_visa_for_foreign_workers ? 'warning' : 'success'}>{r.requires_work_visa_for_foreign_workers ? 'Yes' : 'No'}</Badge>, width: '110px' },
          { key: 'active', header: 'Status', render: (r: any) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New location standard" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Country code (ISO2)" maxLength={2} required value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} />
          <Input label="Display name" required value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
          <Input label="Region code" value={form.region_code} onChange={(e) => setForm({ ...form, region_code: e.target.value })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Input label="Timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
          <Input label="Weekly hours" type="number" step="0.5" value={form.standard_weekly_hours} onChange={(e) => setForm({ ...form, standard_weekly_hours: e.target.value })} />
          <Input label="Overtime multiplier" type="number" step="0.1" value={form.overtime_multiplier} onChange={(e) => setForm({ ...form, overtime_multiplier: e.target.value })} />
          <Input label="Minimum PTO days" type="number" value={form.minimum_pto_days} onChange={(e) => setForm({ ...form, minimum_pto_days: e.target.value })} />
          <Input label="Minimum sick days" type="number" value={form.minimum_sick_days} onChange={(e) => setForm({ ...form, minimum_sick_days: e.target.value })} />
          <Input label="Notice period days" type="number" value={form.notice_period_days} onChange={(e) => setForm({ ...form, notice_period_days: e.target.value })} />
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.requires_work_visa_for_foreign_workers} onChange={(e) => setForm({ ...form, requires_work_visa_for_foreign_workers: e.target.checked })} />
            <span>Requires work visa</span>
          </label>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.permits_remote_work} onChange={(e) => setForm({ ...form, permits_remote_work: e.target.checked })} />
            <span>Permits remote work</span>
          </label>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    country_code: '', display_name: '', region_code: '', city: '',
    currency: 'USD', timezone: 'UTC',
    standard_weekly_hours: 40, minimum_pto_days: 20, minimum_sick_days: 10, overtime_multiplier: 1.5,
    notice_period_days: '',
    requires_work_visa_for_foreign_workers: true, permits_remote_work: true,
  };
}
