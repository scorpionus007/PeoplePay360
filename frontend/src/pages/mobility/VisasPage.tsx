import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Globe2, FileText } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDate, humanizeEnum } from '../../utils/format';

const VISA_TYPES = ['h1b', 'l1', 'o1', 'tn', 'e3', 'green_card', 'schengen', 'blue_card', 'skilled_worker', 'tier2', 'other'];
const STATUSES = ['requested', 'in_preparation', 'submitted', 'approved', 'rejected', 'expired', 'renewed', 'withdrawn'];
const DOC_TYPES = ['passport_scan', 'previous_visa', 'employment_letter', 'offer_letter', 'degree', 'photo', 'sponsorship', 'travel_history', 'other'];

export function VisasPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [docOpen, setDocOpen] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults());
  const [docForm, setDocForm] = useState<any>({ document_type: 'passport_scan', file_reference: '', file_url: '', notes: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['visa.cases'],
    queryFn: async () => (await api.get('/mobility/visas')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const partnersQ = useQuery({
    queryKey: ['mobility.partners', 'immigration'],
    queryFn: async () => (await api.get('/mobility/partners', { params: { category: 'immigration_lawyer' } })).data.data as any[],
  });

  const save = async () => {
    try {
      await api.post('/mobility/visas', {
        ...form,
        partner_id: form.partner_id || null,
        application_date: form.application_date || null,
        expiry_date: form.expiry_date || null,
      });
      toast.success('Visa case created');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const advance = async (id: string, status: string) => {
    try {
      await api.patch(`/mobility/visas/${id}/status`, { status });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  const uploadDoc = async () => {
    try {
      await api.post(`/mobility/visas/${docOpen.id}/documents`, docForm);
      toast.success('Document added');
      setDocOpen(null);
      setDocForm({ document_type: 'passport_scan', file_reference: '', file_url: '', notes: '' });
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Visa cases"
        subtitle="Work authorization, permanent residency, and travel visas"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New case</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Globe2 size={22} />} title="No visa cases" action={<Button onClick={() => setOpenForm(true)}>New case</Button>} />}
        columns={[
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? <div><div style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</div>{r.employee.email && <div className="pp-soft" style={{ fontSize: 12 }}>{r.employee.email}</div>}</div> : <span className="pp-soft">-</span> },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.visa_type)}</Badge>, width: '130px' },
          { key: 'country', header: 'Country', render: (r: any) => `${r.destination_country}${r.destination_region ? ` / ${r.destination_region}` : ''}`, width: '150px' },
          { key: 'applied', header: 'Applied', render: (r: any) => r.application_date ? formatDate(r.application_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'expiry', header: 'Expiry', render: (r: any) => r.expiry_date ? formatDate(r.expiry_date) : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'partner', header: 'Partner', render: (r: any) => r.partner?.name || <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => (
            <Select value={r.status} onChange={(e) => advance(r.id, e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
          ), width: '160px' },
          { key: 'actions', header: '', width: '120px', render: (r: any) => (
            <Button size="sm" variant="subtle" leftIcon={<FileText size={14} />} onClick={() => setDocOpen(r)}>Docs</Button>
          ) },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New visa case" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={save}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Employee" required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
            <option value="">Select an employee</option>
            {(empsQ.data || []).map((e: any) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
          </Select>
          <Select label="Visa type" required value={form.visa_type} onChange={(e) => setForm({ ...form, visa_type: e.target.value })}>
            {VISA_TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
          </Select>
          <Input label="Destination country (ISO2)" required maxLength={2} value={form.destination_country} onChange={(e) => setForm({ ...form, destination_country: e.target.value.toUpperCase() })} />
          <Input label="Destination region" value={form.destination_region} onChange={(e) => setForm({ ...form, destination_region: e.target.value })} />
          <Select label="Immigration partner" value={form.partner_id} onChange={(e) => setForm({ ...form, partner_id: e.target.value })}>
            <option value="">None</option>
            {(partnersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Input label="Application date" type="date" value={form.application_date} onChange={(e) => setForm({ ...form, application_date: e.target.value })} />
          <Input label="Expiry date" type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
          <Input label="Reference number" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
      </Modal>

      {docOpen && (
        <Modal open={!!docOpen} onClose={() => setDocOpen(null)} title={`Documents for ${docOpen.employee?.first_name || 'case'}`} size="lg" footer={<Button onClick={uploadDoc}>Add document</Button>}>
          <div className="pp-stack">
            <div style={{ padding: 12, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Existing documents</div>
              {(docOpen.documents || []).length === 0 && <div className="pp-soft">No documents yet</div>}
              {(docOpen.documents || []).map((d: any) => (
                <div key={d.id} className="pp-row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--pp-border)' }}>
                  <div>
                    <Badge tone="neutral">{humanizeEnum(d.document_type)}</Badge>
                    <span className="pp-mono" style={{ marginLeft: 8, fontSize: 12 }}>{d.file_reference}</span>
                  </div>
                  {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Open</a>}
                </div>
              ))}
            </div>
            <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Select label="Document type" value={docForm.document_type} onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })}>
                {DOC_TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
              </Select>
              <Input label="File reference" required value={docForm.file_reference} onChange={(e) => setDocForm({ ...docForm, file_reference: e.target.value })} />
              <Input label="File URL" value={docForm.file_url} onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea label="Notes" value={docForm.notes} onChange={(e) => setDocForm({ ...docForm, notes: e.target.value })} />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function defaults() {
  return {
    employee_id: '', visa_type: 'h1b', destination_country: '', destination_region: '',
    partner_id: '', application_date: '', expiry_date: '', reference_number: '', notes: '',
  };
}
