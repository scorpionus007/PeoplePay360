import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Plane } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../auth/AuthContext';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

const PURPOSES = ['client_meeting', 'training', 'internal_meeting', 'conference', 'onboarding', 'relocation_scouting', 'other'];
const STATUSES = ['requested', 'approved', 'rejected', 'booked', 'completed', 'cancelled'];

export function TravelPage() {
  const toast = useToast();
  const { user } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';
  const [openForm, setOpenForm] = useState(false);
  const [detailOpen, setDetailOpen] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults(currency));
  const [bookForm, setBookForm] = useState({ reference_number: '', booked_amount: '', currency: currency });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobility.travel'],
    queryFn: async () => (await api.get('/mobility/travel')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const partnersQ = useQuery({
    queryKey: ['mobility.partners', 'travel'],
    queryFn: async () => (await api.get('/mobility/partners', { params: { category: 'travel_agency' } })).data.data as any[],
  });

  const save = async () => {
    try {
      await api.post('/mobility/travel', {
        ...form,
        partner_id: form.partner_id || null,
        depart_date: form.depart_date || null,
        return_date: form.return_date || null,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
      });
      toast.success('Travel request created');
      setOpenForm(false);
      setForm(defaults(currency));
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const transition = async (id: string, action: string, body: any = {}) => {
    try {
      await api.patch(`/mobility/travel/${id}/${action}`, body);
      toast.success('Updated');
      refetch();
    } catch (err) {
      toast.error('Failed', extractApiError(err));
    }
  };

  const book = async () => {
    await transition(detailOpen.id, 'book', {
      reference_number: bookForm.reference_number,
      booked_amount: Number(bookForm.booked_amount),
      currency: bookForm.currency,
    });
    setDetailOpen(null);
    setBookForm({ reference_number: '', booked_amount: '', currency: currency });
  };

  return (
    <div>
      <PageHeader
        title="Travel"
        subtitle="Business travel requests, approvals, and bookings"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New request</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Plane size={22} />} title="No travel yet" action={<Button onClick={() => setOpenForm(true)}>New request</Button>} />}
        columns={[
          { key: 'emp', header: 'Traveler', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'purpose', header: 'Purpose', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.purpose)}</Badge> },
          { key: 'route', header: 'Route', render: (r: any) => <span className="pp-mono" style={{ fontSize: 12 }}>{r.origin_city || r.origin_country} to {r.destination_city || r.destination_country}</span> },
          { key: 'depart', header: 'Depart', render: (r: any) => r.depart_date ? formatDate(r.depart_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'return', header: 'Return', render: (r: any) => r.return_date ? formatDate(r.return_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'cost', header: 'Estimated', align: 'right' as const, render: (r: any) => r.estimated_cost ? formatMoney(r.estimated_cost, r.currency || currency) : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          { key: 'actions', header: '', width: '260px', render: (r: any) => (
            <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
              {r.status === 'requested' && <>
                <Button size="sm" variant="subtle" onClick={() => transition(r.id, 'approve')}>Approve</Button>
                <Button size="sm" variant="danger" onClick={() => transition(r.id, 'reject')}>Reject</Button>
              </>}
              {r.status === 'approved' && <Button size="sm" onClick={() => { setBookForm({ reference_number: '', booked_amount: String(r.estimated_cost || ''), currency: r.currency || currency }); setDetailOpen(r); }}>Book</Button>}
              {r.status === 'booked' && <Button size="sm" variant="subtle" onClick={() => transition(r.id, 'complete')}>Complete</Button>}
              {(r.status === 'requested' || r.status === 'approved' || r.status === 'booked') && <Button size="sm" variant="ghost" onClick={() => transition(r.id, 'cancel')}>Cancel</Button>}
            </div>
          ) },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New travel request" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Submit</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Traveler" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Purpose" required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
            {PURPOSES.map((p) => <option key={p} value={p}>{humanizeEnum(p)}</option>)}
          </Select>
          <Input label="Origin country (ISO2)" maxLength={2} value={form.origin_country} onChange={(e) => setForm({ ...form, origin_country: e.target.value.toUpperCase() })} />
          <Input label="Origin city" value={form.origin_city} onChange={(e) => setForm({ ...form, origin_city: e.target.value })} />
          <Input label="Destination country (ISO2)" required maxLength={2} value={form.destination_country} onChange={(e) => setForm({ ...form, destination_country: e.target.value.toUpperCase() })} />
          <Input label="Destination city" value={form.destination_city} onChange={(e) => setForm({ ...form, destination_city: e.target.value })} />
          <Input label="Depart" type="date" value={form.depart_date} onChange={(e) => setForm({ ...form, depart_date: e.target.value })} />
          <Input label="Return" type="date" value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} />
          <Input label="Estimated cost" type="number" step="0.01" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <Select label="Travel partner" value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
            <option value="">None</option>
            {(partnersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      {detailOpen && (
        <Modal open={!!detailOpen} onClose={() => setDetailOpen(null)} title="Confirm booking" footer={<><Button variant="secondary" onClick={() => setDetailOpen(null)}>Cancel</Button><Button onClick={book}>Confirm booking</Button></>}>
          <div className="pp-stack">
            <Input label="Booking reference" required value={bookForm.reference_number} onChange={(e) => setBookForm({ ...bookForm, reference_number: e.target.value })} />
            <Input label="Booked amount" required type="number" step="0.01" value={bookForm.booked_amount} onChange={(e) => setBookForm({ ...bookForm, booked_amount: e.target.value })} />
            <Input label="Currency" maxLength={3} value={bookForm.currency} onChange={(e) => setBookForm({ ...bookForm, currency: e.target.value.toUpperCase() })} />
          </div>
        </Modal>
      )}
    </div>
  );
}

function defaults(currency: string) {
  return {
    employee_id: '', purpose: 'client_meeting',
    origin_country: '', origin_city: '',
    destination_country: '', destination_city: '',
    depart_date: '', return_date: '',
    estimated_cost: '', currency,
    partner_id: '', notes: '',
  };
}
