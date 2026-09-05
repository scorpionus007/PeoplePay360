import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Handshake } from 'lucide-react';
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

export function OffersPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => (await api.get('/hiring/offers')).data.data as any[],
  });
  const appsQ = useQuery({
    queryKey: ['applications', 'compact'],
    queryFn: async () => (await api.get('/hiring/applications', { params: { limit: 200 } })).data.data as any[],
  });

  const draft = async () => {
    try {
      const payload: any = {
        ...form,
        base_salary: Number(form.base_salary),
        sign_on_bonus: form.sign_on_bonus ? Number(form.sign_on_bonus) : null,
        annual_bonus_percent: form.annual_bonus_percent ? Number(form.annual_bonus_percent) : null,
      };
      await api.post('/hiring/offers', payload);
      toast.success('Offer drafted');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };
  const action = async (id: string, path: string, label: string, body: any = {}) => {
    try {
      await api.post(`/hiring/offers/${id}/${path}`, body);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Offers"
        subtitle="Draft, approve, extend, and track candidate responses"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Draft offer</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Handshake size={22} />} title="No offers yet" action={<Button onClick={() => setOpenForm(true)}>Draft offer</Button>} />}
        columns={[
          { key: 'candidate', header: 'Candidate', render: (r: any) => r.candidate ? <div><div style={{ fontWeight: 600 }}>{r.candidate.first_name} {r.candidate.last_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.candidate.email}</div></div> : '-' },
          { key: 'title', header: 'Role', render: (r: any) => r.title },
          { key: 'req', header: 'Requisition', render: (r: any) => r.requisition ? <span className="pp-mono">{r.requisition.code}</span> : '-' },
          { key: 'salary', header: 'Base salary', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.base_salary, r.currency)}</span>, align: 'right' as const },
          { key: 'bonus', header: 'Sign on', render: (r: any) => r.sign_on_bonus ? formatMoney(r.sign_on_bonus, r.currency) : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'start', header: 'Start', render: (r: any) => r.start_date ? formatDate(r.start_date) : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '140px' },
          {
            key: 'actions', header: '', width: '320px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'draft' && <Button size="sm" variant="secondary" onClick={() => action(r.id, 'submit', 'Submitted')}>Submit</Button>}
                {['draft', 'pending_approval'].includes(r.status) && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve', 'Approved')}>Approve</Button>}
                {['draft', 'pending_approval'].includes(r.status) && <Button size="sm" onClick={() => action(r.id, 'extend', 'Extended')}>Extend</Button>}
                {['extended', 'negotiating'].includes(r.status) && <>
                  <Button size="sm" variant="subtle" onClick={() => action(r.id, 'accept', 'Accepted')}>Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => action(r.id, 'decline', 'Declined')}>Decline</Button>
                </>}
                {!['accepted', 'declined', 'rescinded', 'expired'].includes(r.status) && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'rescind', 'Rescinded')}>Rescind</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Draft offer" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={draft}>Draft</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Select label="Application" required value={form.application_id} onChange={(e) => setForm({ ...form, application_id: e.target.value })}>
              <option value="">Select an application</option>
              {(appsQ.data || []).map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.candidate ? `${a.candidate.first_name} ${a.candidate.last_name}` : ''} - {a.requisition?.title || 'Requisition'}
                </option>
              ))}
            </Select>
          </div>
          <Input label="Role title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Base salary" type="number" required value={form.base_salary} onChange={(e) => setForm({ ...form, base_salary: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Select label="Salary period" value={form.salary_period} onChange={(e) => setForm({ ...form, salary_period: e.target.value })}>
            {['hourly', 'daily', 'weekly', 'monthly', 'yearly'].map((p) => <option key={p} value={p}>{p}</option>)}
          </Select>
          <Input label="Sign on bonus" type="number" value={form.sign_on_bonus} onChange={(e) => setForm({ ...form, sign_on_bonus: e.target.value })} />
          <Input label="Annual bonus %" type="number" value={form.annual_bonus_percent} onChange={(e) => setForm({ ...form, annual_bonus_percent: e.target.value })} />
          <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <Input label="Expires at" type="datetime-local" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          <Input label="Probation days" type="number" value={form.probation_days} onChange={(e) => setForm({ ...form, probation_days: e.target.value })} />
          <Input label="Offer letter URL" value={form.offer_letter_url} onChange={(e) => setForm({ ...form, offer_letter_url: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Terms" value={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    application_id: '', title: '', base_salary: '', currency: 'USD', salary_period: 'yearly',
    sign_on_bonus: '', annual_bonus_percent: '', start_date: '', expires_at: '',
    probation_days: '', offer_letter_url: '', terms: '',
  };
}
