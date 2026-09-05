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

const TRIP_TYPES = ['business', 'client_visit', 'training', 'conference', 'onboarding', 'relocation', 'other'];

export function TravelPage() {
  const toast = useToast();
  const { user } = useAuth();
  const currency = user?.organization?.base_currency || 'USD';
  const [openForm, setOpenForm] = useState(false);
  const [bookOpen, setBookOpen] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults(currency));
  const [bookRef, setBookRef] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['mobility.travel'],
    queryFn: async () => (await api.get('/mobility/travel')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });

  const save = async () => {
    try {
      await api.post('/mobility/travel', {
        employee_id: form.employee_id || null,
        purpose: form.purpose,
        trip_type: form.trip_type,
        from_country_code: form.from_country_code || null,
        from_city: form.from_city || null,
        to_country_code: form.to_country_code,
        to_city: form.to_city || null,
        depart_date: form.depart_date,
        return_date: form.return_date,
        estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null,
        currency: form.currency,
        requires_visa: form.requires_visa,
      });
      toast.success('Travel request submitted');
      setOpenForm(false);
      setForm(defaults(currency));
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const action = async (id: string, act: string, body: any = {}) => {
    try {
      await api.post(`/mobility/travel/${id}/${act}`, body);
      toast.success('Updated');
      refetch();
    } catch (err) {
      toast.error('Failed', extractApiError(err));
    }
  };

  const book = async () => {
    await action(bookOpen.id, 'book', { booking_reference: bookRef });
    setBookOpen(null);
    setBookRef('');
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
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.trip_type)}</Badge>, width: '130px' },
          { key: 'route', header: 'Route', render: (r: any) => <span className="pp-mono" style={{ fontSize: 12 }}>{r.from_city || r.from_country_code || '-'} to {r.to_city || r.to_country_code}</span> },
          { key: 'depart', header: 'Depart', render: (r: any) => r.depart_date ? formatDate(r.depart_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'return', header: 'Return', render: (r: any) => r.return_date ? formatDate(r.return_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'cost', header: 'Estimated', align: 'right' as const, render: (r: any) => r.estimated_cost ? formatMoney(r.estimated_cost, r.currency || currency) : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          { key: 'actions', header: '', width: '270px', render: (r: any) => (
            <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
              {(r.status === 'submitted' || r.status === 'draft') && <>
                <Button size="sm" variant="subtle" onClick={() => action(r.id, 'approve')}>Approve</Button>
                <Button size="sm" variant="danger" onClick={() => action(r.id, 'reject')}>Reject</Button>
              </>}
              {r.status === 'approved' && <Button size="sm" onClick={() => { setBookRef(''); setBookOpen(r); }}>Book</Button>}
              {r.status === 'booked' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'complete')}>Complete</Button>}
              {['submitted', 'draft', 'approved', 'booked'].includes(r.status) && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'cancel')}>Cancel</Button>}
            </div>
          ) },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New travel request" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Submit</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Traveler" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Trip type" required value={form.trip_type} onChange={(e) => setForm({ ...form, trip_type: e.target.value })}>
            {TRIP_TYPES.map((tt) => <option key={tt} value={tt}>{humanizeEnum(tt)}</option>)}
          </Select>
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Purpose" required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          </div>
          <Input label="From country (ISO2)" maxLength={2} value={form.from_country_code} onChange={(e) => setForm({ ...form, from_country_code: e.target.value.toUpperCase() })} />
          <Input label="From city" value={form.from_city} onChange={(e) => setForm({ ...form, from_city: e.target.value })} />
          <Input label="To country (ISO2)" required maxLength={2} value={form.to_country_code} onChange={(e) => setForm({ ...form, to_country_code: e.target.value.toUpperCase() })} />
          <Input label="To city" value={form.to_city} onChange={(e) => setForm({ ...form, to_city: e.target.value })} />
          <Input label="Depart" type="date" required value={form.depart_date} onChange={(e) => setForm({ ...form, depart_date: e.target.value })} />
          <Input label="Return" type="date" required value={form.return_date} onChange={(e) => setForm({ ...form, return_date: e.target.value })} />
          <Input label="Estimated cost" type="number" step="0.01" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} />
          <Input label="Currency" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.requires_visa} onChange={(e) => setForm({ ...form, requires_visa: e.target.checked })} />
            <span>Requires visa</span>
          </label>
        </div>
      </Modal>

      {bookOpen && (
        <Modal open={!!bookOpen} onClose={() => setBookOpen(null)} title="Confirm booking" footer={<><Button variant="secondary" onClick={() => setBookOpen(null)}>Cancel</Button><Button onClick={book}>Confirm booking</Button></>}>
          <Input label="Booking reference" required value={bookRef} onChange={(e) => setBookRef(e.target.value)} placeholder="PNR / confirmation number" />
        </Modal>
      )}
    </div>
  );
}

function defaults(currency: string) {
  return {
    employee_id: '', purpose: '', trip_type: 'business',
    from_country_code: '', from_city: '',
    to_country_code: '', to_city: '',
    depart_date: '', return_date: '',
    estimated_cost: '', currency, requires_visa: false,
  };
}
