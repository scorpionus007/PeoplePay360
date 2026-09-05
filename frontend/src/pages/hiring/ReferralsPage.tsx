import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Award } from 'lucide-react';
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

const STATUSES = ['submitted', 'in_review', 'advanced', 'hired', 'rejected', 'bonus_paid', 'cancelled'];

export function ReferralsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['referrals'],
    queryFn: async () => (await api.get('/hiring/referrals')).data.data as any[],
  });
  const reqsQ = useQuery({
    queryKey: ['requisitions'],
    queryFn: async () => (await api.get('/hiring/requisitions', { params: { limit: 100 } })).data.data as any[],
  });

  const submit = async () => {
    try {
      await api.post('/hiring/referrals', { ...form, requisition_id: form.requisition_id || null });
      toast.success('Referral submitted');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Submit failed', extractApiError(err));
    }
  };

  const review = async (id: string, status: string) => {
    const note = prompt('Review note (optional)') || '';
    try {
      await api.post(`/hiring/referrals/${id}/review`, { status, note });
      toast.success('Reviewed');
      refetch();
    } catch (err) {
      toast.error('Review failed', extractApiError(err));
    }
  };

  const payBonus = async (id: string) => {
    const rawAmount = prompt('Bonus amount');
    if (!rawAmount) return;
    const rawCurrency = prompt('Currency', 'USD') || 'USD';
    try {
      await api.post(`/hiring/referrals/${id}/pay-bonus`, { amount: Number(rawAmount), currency: rawCurrency.toUpperCase() });
      toast.success('Bonus recorded');
      refetch();
    } catch (err) {
      toast.error('Pay failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Referrals"
        subtitle="Employee referrals with review and bonus tracking"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Refer a candidate</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Award size={22} />} title="No referrals yet" action={<Button onClick={() => setOpenForm(true)}>Refer a candidate</Button>} />}
        columns={[
          {
            key: 'candidate', header: 'Candidate',
            render: (r: any) => <div><div style={{ fontWeight: 600 }}>{r.candidate_first_name} {r.candidate_last_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.candidate_email}</div></div>,
          },
          { key: 'referrer', header: 'Referrer', render: (r: any) => r.referrer ? `${r.referrer.first_name} ${r.referrer.last_name}` : '-' },
          { key: 'req', header: 'Requisition', render: (r: any) => r.requisition ? <div>{r.requisition.title}<div className="pp-soft pp-mono" style={{ fontSize: 11 }}>{r.requisition.code}</div></div> : <span className="pp-soft">Any</span> },
          { key: 'relationship', header: 'Relationship', render: (r: any) => r.relationship || <span className="pp-soft">-</span> },
          { key: 'bonus', header: 'Bonus', render: (r: any) => r.bonus_amount ? <span style={{ fontWeight: 700 }}>{formatMoney(r.bonus_amount, r.bonus_currency || 'USD')}</span> : <span className="pp-soft">-</span>, align: 'right' as const },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          { key: 'created', header: 'Submitted', render: (r: any) => formatDate(r.created_at), width: '130px' },
          {
            key: 'actions', header: '', width: '260px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status === 'submitted' && <Button size="sm" variant="secondary" onClick={() => review(r.id, 'in_review')}>Review</Button>}
                {['in_review', 'advanced'].includes(r.status) && <Button size="sm" variant="subtle" onClick={() => review(r.id, 'hired')}>Mark hired</Button>}
                {r.status === 'hired' && <Button size="sm" onClick={() => payBonus(r.id)}>Pay bonus</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Refer a candidate" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={submit}>Submit</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Select label="Requisition (optional)" value={form.requisition_id} onChange={(e) => setForm({ ...form, requisition_id: e.target.value })}>
              <option value="">Any open role</option>
              {(reqsQ.data || []).map((r: any) => <option key={r.id} value={r.id}>{r.code} - {r.title}</option>)}
            </Select>
          </div>
          <Input label="First name" required value={form.candidate_first_name} onChange={(e) => setForm({ ...form, candidate_first_name: e.target.value })} />
          <Input label="Last name" required value={form.candidate_last_name} onChange={(e) => setForm({ ...form, candidate_last_name: e.target.value })} />
          <Input label="Email" type="email" required value={form.candidate_email} onChange={(e) => setForm({ ...form, candidate_email: e.target.value })} />
          <Input label="Phone" value={form.candidate_phone} onChange={(e) => setForm({ ...form, candidate_phone: e.target.value })} />
          <Input label="Resume URL" value={form.candidate_resume_url} onChange={(e) => setForm({ ...form, candidate_resume_url: e.target.value })} />
          <Input label="Relationship" placeholder="e.g. former colleague" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Why you recommend them" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    requisition_id: '', candidate_first_name: '', candidate_last_name: '', candidate_email: '',
    candidate_phone: '', candidate_resume_url: '', relationship: '', recommendation: '',
  };
}
