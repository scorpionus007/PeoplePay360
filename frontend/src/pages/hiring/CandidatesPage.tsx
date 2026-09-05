import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Users, Search, Ban } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { Avatar } from '../../components/Avatar';
import { humanizeEnum } from '../../utils/format';

export function CandidatesPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['candidates', { search }],
    queryFn: async () => (await api.get('/hiring/candidates', { params: { limit: 100, search } })).data.data as any[],
  });

  const create = async () => {
    try {
      const payload = { ...form };
      if (payload.years_of_experience) payload.years_of_experience = Number(payload.years_of_experience);
      await api.post('/hiring/candidates', payload);
      toast.success('Candidate created');
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
        title="Candidates"
        subtitle="Talent pool across every requisition"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New candidate</Button>}
      />

      <div style={{ maxWidth: 380, marginBottom: 16 }}>
        <Input placeholder="Search name, email, company" leftAdornment={<Search size={16} />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Users size={22} />} title="No candidates" action={<Button onClick={() => setOpenForm(true)}>New candidate</Button>} />}
        columns={[
          {
            key: 'name', header: 'Candidate',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 10 }}>
                <Avatar name={`${r.first_name} ${r.last_name}`} size={32} />
                <div>
                  <div style={{ fontWeight: 600 }}>{r.first_name} {r.last_name}</div>
                  <div className="pp-soft" style={{ fontSize: 12 }}>{r.email}</div>
                </div>
              </div>
            ),
          },
          { key: 'title', header: 'Current title', render: (r: any) => r.current_title || <span className="pp-soft">-</span> },
          { key: 'company', header: 'Company', render: (r: any) => r.current_company || <span className="pp-soft">-</span> },
          { key: 'yoe', header: 'Experience', render: (r: any) => r.years_of_experience ? `${r.years_of_experience}y` : <span className="pp-soft">-</span>, align: 'right' as const, width: '120px' },
          { key: 'bg', header: 'Background', render: (r: any) => <Badge tone={r.background_check_status === 'cleared' ? 'success' : r.background_check_status === 'flagged' ? 'danger' : 'muted'}>{humanizeEnum(r.background_check_status)}</Badge> },
          { key: 'flag', header: '', render: (r: any) => r.is_blacklisted ? <Badge tone="danger"><Ban size={11} /> Blocked</Badge> : null, width: '110px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New candidate" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="First name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input label="Last name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Current title" value={form.current_title} onChange={(e) => setForm({ ...form, current_title: e.target.value })} />
          <Input label="Current company" value={form.current_company} onChange={(e) => setForm({ ...form, current_company: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Years experience" type="number" value={form.years_of_experience} onChange={(e) => setForm({ ...form, years_of_experience: e.target.value })} />
          <Input label="LinkedIn URL" value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} />
          <Input label="Resume URL" value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Internal notes" value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    first_name: '', last_name: '', email: '', phone: '', current_title: '', current_company: '',
    location: '', years_of_experience: '', linkedin_url: '', resume_url: '', internal_notes: '',
  };
}
