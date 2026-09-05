import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, humanizeEnum } from '../../utils/format';

const CATEGORIES = ['immigration_lawyer', 'relocation_agency', 'tax_consultant', 'housing', 'insurance', 'language_training', 'travel_agency', 'other'];

export function MobilityPartnersPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobility.partners'],
    queryFn: async () => (await api.get('/mobility/partners')).data.data as any[],
  });

  const save = async () => {
    try {
      // Send blank optionals as null (not '') so the validators accept them.
      const payload: any = {
        name: form.name,
        category: form.category,
        country_code: form.country_code || null,
        city: form.city || null,
        contact_name: form.contact_name || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        website: form.website || null,
        contract_reference: form.contract_reference || null,
        contract_end_date: form.contract_end_date || null,
        rating: form.rating ? Number(form.rating) : null,
        notes: form.notes || null,
      };
      await api.post('/mobility/partners', payload);
      toast.success('Partner added');
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
        title="Mobility partners"
        subtitle="Immigration lawyers, relocation agencies, tax consultants, housing"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Add partner</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Users size={22} />} title="No mobility partners" action={<Button onClick={() => setOpenForm(true)}>Add partner</Button>} />}
        columns={[
          { key: 'name', header: 'Partner', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
          { key: 'cat', header: 'Category', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.category)}</Badge> },
          { key: 'country', header: 'Country', render: (r: any) => r.country_code || <span className="pp-soft">-</span>, width: '100px' },
          { key: 'contact', header: 'Contact', render: (r: any) => r.contact_name ? <div><div>{r.contact_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.contact_email}</div></div> : <span className="pp-soft">-</span> },
          { key: 'contract', header: 'Contract end', render: (r: any) => r.contract_end_date ? formatDate(r.contract_end_date) : <span className="pp-soft">-</span> },
          { key: 'rating', header: 'Rating', render: (r: any) => r.rating ? <Badge tone={Number(r.rating) >= 4 ? 'success' : 'muted'}>{r.rating}</Badge> : <span className="pp-soft">-</span>, width: '90px' },
          { key: 'active', header: 'Status', render: (r: any) => <Badge tone={r.is_active ? 'success' : 'muted'} dot>{r.is_active ? 'Active' : 'Inactive'}</Badge>, width: '110px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Add mobility partner" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Add</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          <Input label="Country (ISO2)" maxLength={2} value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} />
          <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="Contact name" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
          <Input label="Contact email" type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
          <Input label="Contact phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
          <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <Input label="Contract reference" value={form.contract_reference} onChange={(e) => setForm({ ...form, contract_reference: e.target.value })} />
          <Input label="Contract end" type="date" value={form.contract_end_date} onChange={(e) => setForm({ ...form, contract_end_date: e.target.value })} />
          <Input label="Rating (0-10)" type="number" step="0.5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    name: '', category: 'immigration_lawyer', country_code: '', city: '',
    contact_name: '', contact_email: '', contact_phone: '', website: '',
    contract_reference: '', contract_end_date: '', rating: '', notes: '',
  };
}
