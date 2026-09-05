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

const VISA_TYPES = ['work_visa', 'business_visa', 'dependent_visa', 'permanent_residency', 'student_visa', 'transit', 'digital_nomad', 'other'];
const VISA_STATUSES = ['initiated', 'documents_collecting', 'under_internal_review', 'filed', 'rfe_pending', 'approved', 'denied', 'expired', 'renewed', 'cancelled'];

export function VisasPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [docOpen, setDocOpen] = useState<any>(null);
  const [docDetail, setDocDetail] = useState<any>(null);
  const [form, setForm] = useState<any>(defaults());
  const [docForm, setDocForm] = useState<any>({ document_type: 'passport', title: '', file_url: '', note: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['visa.cases'],
    queryFn: async () => (await api.get('/mobility/visas')).data.data as any[],
  });
  const empsQ = useQuery({
    queryKey: ['employees', 'compact'],
    queryFn: async () => (await api.get('/employees', { params: { limit: 200 } })).data.data as any[],
  });
  const partnersQ = useQuery({
    queryKey: ['mobility.partners'],
    queryFn: async () => (await api.get('/mobility/partners')).data.data as any[],
  });

  const save = async () => {
    try {
      await api.post('/mobility/visas', {
        employee_id: form.employee_id,
        mobility_partner_id: form.mobility_partner_id || null,
        visa_type: form.visa_type,
        country_code: form.country_code,
        visa_category: form.visa_category || null,
        priority: form.priority,
        total_cost_amount: form.total_cost_amount ? Number(form.total_cost_amount) : null,
      });
      toast.success('Visa case created');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };

  const transition = async (id: string, status: string) => {
    try {
      await api.post(`/mobility/visas/${id}/transition`, { status });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  const openDocs = async (row: any) => {
    setDocOpen(row);
    setDocDetail(null);
    try {
      const full = (await api.get(`/mobility/visas/${row.id}`)).data.data;
      setDocDetail(full);
    } catch (err) {
      toast.error('Could not load documents', extractApiError(err));
    }
  };

  const uploadDoc = async () => {
    try {
      await api.post(`/mobility/visas/${docOpen.id}/documents`, {
        document_type: docForm.document_type,
        title: docForm.title,
        file_url: docForm.file_url || null,
        note: docForm.note || null,
      });
      toast.success('Document added');
      setDocForm({ document_type: 'passport', title: '', file_url: '', note: '' });
      openDocs(docOpen);
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
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? <div><div style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.case_code}</div></div> : <span className="pp-soft">-</span> },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.visa_type)}</Badge>, width: '150px' },
          { key: 'country', header: 'Country', render: (r: any) => r.country_code, width: '90px' },
          { key: 'requested', header: 'Requested', render: (r: any) => r.requested_at ? formatDate(r.requested_at) : <span className="pp-soft">-</span>, width: '120px' },
          { key: 'valid', header: 'Valid to', render: (r: any) => r.valid_to ? formatDate(r.valid_to) : <span className="pp-soft">-</span>, width: '120px' },
          { key: 'partner', header: 'Partner', render: (r: any) => r.partner?.name || <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => (
            <Select value={r.status} onChange={(e) => transition(r.id, e.target.value)}>
              {VISA_STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
          ), width: '180px' },
          { key: 'actions', header: '', width: '110px', render: (r: any) => (
            <Button size="sm" variant="subtle" leftIcon={<FileText size={14} />} onClick={() => openDocs(r)}>Docs</Button>
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
          <Input label="Country (ISO2)" required maxLength={2} value={form.country_code} onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })} />
          <Input label="Visa category" value={form.visa_category} onChange={(e) => setForm({ ...form, visa_category: e.target.value })} />
          <Select label="Immigration partner" value={form.mobility_partner_id} onChange={(e) => setForm({ ...form, mobility_partner_id: e.target.value })}>
            <option value="">None</option>
            {(partnersQ.data || []).map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{humanizeEnum(p)}</option>)}
          </Select>
          <Input label="Total cost" type="number" step="0.01" value={form.total_cost_amount} onChange={(e) => setForm({ ...form, total_cost_amount: e.target.value })} />
        </div>
      </Modal>

      {docOpen && (
        <Modal open={!!docOpen} onClose={() => setDocOpen(null)} title={`Documents for ${docOpen.employee?.first_name || 'case'}`} size="lg" footer={<Button onClick={uploadDoc}>Add document</Button>}>
          <div className="pp-stack">
            <div style={{ padding: 12, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Existing documents</div>
              {!docDetail && <div className="pp-soft">Loading...</div>}
              {docDetail && (docDetail.documents || []).length === 0 && <div className="pp-soft">No documents yet</div>}
              {docDetail && (docDetail.documents || []).map((d: any) => (
                <div key={d.id} className="pp-row" style={{ justifyContent: 'space-between', padding: '6px 0', borderTop: '1px dashed var(--pp-border)' }}>
                  <div>
                    <Badge tone={statusTone(d.status)}>{humanizeEnum(d.status)}</Badge>
                    <span style={{ marginLeft: 8, fontWeight: 600 }}>{d.title}</span>
                    <span className="pp-soft" style={{ marginLeft: 8, fontSize: 12 }}>{humanizeEnum(d.document_type)}</span>
                  </div>
                  {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Open</a>}
                </div>
              ))}
            </div>
            <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Input label="Document type" required value={docForm.document_type} onChange={(e) => setDocForm({ ...docForm, document_type: e.target.value })} />
              <Input label="Title" required value={docForm.title} onChange={(e) => setDocForm({ ...docForm, title: e.target.value })} />
              <Input label="File URL" value={docForm.file_url} onChange={(e) => setDocForm({ ...docForm, file_url: e.target.value })} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Textarea label="Note" value={docForm.note} onChange={(e) => setDocForm({ ...docForm, note: e.target.value })} />
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
    employee_id: '', visa_type: 'work_visa', country_code: '', visa_category: '',
    mobility_partner_id: '', priority: 'normal', total_cost_amount: '',
  };
}
