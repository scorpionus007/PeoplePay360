import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Sparkles, EyeOff } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { formatDateTime, humanizeEnum } from '../../utils/format';

const CATEGORIES = ['appreciation', 'complaint', 'suggestion', 'harassment', 'safety', 'policy', 'manager', 'peer', 'other'];
const STATUSES = ['new', 'under_review', 'action_taken', 'escalated', 'closed'];

export function FeedbackPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ anonymous: false, category: 'suggestion', subject: '', body: '', priority: 'normal' });
  const [statusRow, setStatusRow] = useState<any | null>(null);
  const [statusForm, setStatusForm] = useState<any>({ status: 'under_review', note: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['feedback'],
    queryFn: async () => (await api.get('/hr/feedback', { params: { limit: 100 } })).data.data as any[],
  });

  const submit = async () => {
    try {
      await api.post('/hr/feedback', form);
      toast.success('Feedback submitted');
      setOpenForm(false);
      setForm({ anonymous: false, category: 'suggestion', subject: '', body: '', priority: 'normal' });
      refetch();
    } catch (err) {
      toast.error('Submit failed', extractApiError(err));
    }
  };

  const openStatus = (row: any) => { setStatusRow(row); setStatusForm({ status: row.status, note: row.resolution_note || '' }); };
  const saveStatus = async () => {
    if (!statusRow) return;
    try {
      await api.patch(`/hr/feedback/${statusRow.id}/status`, statusForm);
      toast.success('Status updated');
      setStatusRow(null);
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Feedback"
        subtitle="Employee feedback with optional anonymous submission"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Submit feedback</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Sparkles size={22} />} title="No feedback yet" action={<Button onClick={() => setOpenForm(true)}>Submit feedback</Button>} />}
        onRowClick={openStatus}
        columns={[
          {
            key: 'from', header: 'From', render: (r: any) => r.is_anonymous ? (
              <div className="pp-row" style={{ gap: 6 }}><EyeOff size={13} className="pp-soft" /><span className="pp-soft">Anonymous</span></div>
            ) : (r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '-'),
          },
          { key: 'cat', header: 'Category', render: (r: any) => <Badge tone="primary">{humanizeEnum(r.category)}</Badge> },
          { key: 'subject', header: 'Subject', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.subject}</span> },
          { key: 'priority', header: 'Priority', render: (r: any) => <Badge tone={r.priority === 'critical' ? 'danger' : r.priority === 'high' ? 'warning' : 'muted'}>{humanizeEnum(r.priority)}</Badge>, width: '110px' },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '140px' },
          { key: 'created', header: 'Submitted', render: (r: any) => formatDateTime(r.created_at), width: '180px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Submit feedback" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={submit}>Submit</Button></>}>
        <div className="pp-stack">
          <label className="pp-row" style={{ gap: 8, padding: 10, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
            <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Submit anonymously</div>
              <div className="pp-soft" style={{ fontSize: 12 }}>Your identity is stripped from the record. HR can still detect spam via salted fingerprint.</div>
            </div>
          </label>
          <Input label="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div className="pp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['low', 'normal', 'high', 'critical'].map((p) => <option key={p} value={p}>{humanizeEnum(p)}</option>)}
            </Select>
          </div>
          <Textarea label="Details" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
      </Modal>

      <Modal open={!!statusRow} onClose={() => setStatusRow(null)} title={statusRow?.subject} footer={<><Button variant="secondary" onClick={() => setStatusRow(null)}>Cancel</Button><Button onClick={saveStatus}>Update</Button></>}>
        {statusRow && (
          <div className="pp-stack">
            <div className="pp-row" style={{ gap: 8 }}>
              <Badge tone="primary">{humanizeEnum(statusRow.category)}</Badge>
              <Badge tone={statusTone(statusRow.status)} dot>{humanizeEnum(statusRow.status)}</Badge>
              {statusRow.is_anonymous && <Badge tone="warning">Anonymous</Badge>}
            </div>
            <div style={{ padding: 12, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)', whiteSpace: 'pre-wrap' }}>{statusRow.body}</div>
            <Select label="Update status" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
            <Textarea label="Resolution note" value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} />
          </div>
        )}
      </Modal>
    </div>
  );
}
