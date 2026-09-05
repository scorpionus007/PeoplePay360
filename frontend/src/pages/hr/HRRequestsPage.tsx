import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, MessageSquare, Send } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { useToast } from '../../components/Toast';
import { Avatar } from '../../components/Avatar';
import { formatDateTime, humanizeEnum } from '../../utils/format';

const TYPES = ['document', 'letter', 'policy_query', 'salary_query', 'it_query', 'benefits_query', 'general'];

export function HRRequestsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ subject: '', body: '', request_type: 'general', priority: 'normal' });
  const [replyBody, setReplyBody] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['hr.requests'],
    queryFn: async () => (await api.get('/hr/requests', { params: { limit: 100 } })).data.data as any[],
  });

  const detailQ = useQuery({
    queryKey: ['hr.request', selectedId],
    enabled: !!selectedId,
    queryFn: async () => (await api.get(`/hr/requests/${selectedId}`)).data.data,
  });

  const create = async () => {
    try {
      await api.post('/hr/requests', form);
      toast.success('Request opened');
      setOpenForm(false);
      setForm({ subject: '', body: '', request_type: 'general', priority: 'normal' });
      refetch();
    } catch (err) {
      toast.error('Open failed', extractApiError(err));
    }
  };

  const sendReply = async () => {
    if (!selectedId || !replyBody.trim()) return;
    try {
      await api.post(`/hr/requests/${selectedId}/messages`, { body: replyBody, assign_to_self: true });
      setReplyBody('');
      detailQ.refetch();
      refetch();
    } catch (err) {
      toast.error('Reply failed', extractApiError(err));
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedId) return;
    try {
      await api.patch(`/hr/requests/${selectedId}/status`, { status });
      toast.success('Status updated');
      detailQ.refetch();
      refetch();
    } catch (err) {
      toast.error('Update failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="HR requests"
        subtitle="Two way channel between employees and HR"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New request</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<MessageSquare size={22} />} title="No requests" action={<Button onClick={() => setOpenForm(true)}>New request</Button>} />}
        onRowClick={(r: any) => setSelectedId(r.id)}
        columns={[
          { key: 'emp', header: 'Employee', render: (r: any) => r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : '-' },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.request_type)}</Badge> },
          { key: 'subject', header: 'Subject', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.subject}</span> },
          { key: 'priority', header: 'Priority', render: (r: any) => <Badge tone={r.priority === 'urgent' ? 'danger' : r.priority === 'high' ? 'warning' : 'muted'}>{humanizeEnum(r.priority)}</Badge>, width: '110px' },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '160px' },
          { key: 'created', header: 'Opened', render: (r: any) => formatDateTime(r.created_at), width: '180px' },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Open HR request" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Open</Button></>}>
        <div className="pp-stack">
          <Input label="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <div className="pp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Type" value={form.request_type} onChange={(e) => setForm({ ...form, request_type: e.target.value })}>
              {TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
            </Select>
            <Select label="Priority" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{humanizeEnum(p)}</option>)}
            </Select>
          </div>
          <Textarea label="Details" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
      </Modal>

      <Modal open={!!selectedId} onClose={() => setSelectedId(null)} title={detailQ.data?.subject || 'Request'} size="lg" footer={detailQ.data && (
        <>
          <Select value={detailQ.data.status} onChange={(e) => updateStatus(e.target.value)}>
            {['open', 'in_progress', 'waiting_on_employee', 'resolved', 'cancelled'].map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
          </Select>
          <Button variant="secondary" onClick={() => setSelectedId(null)}>Close</Button>
        </>
      )}>
        {detailQ.data && (
          <div className="pp-stack">
            <Card>
              <CardHeader
                title={detailQ.data.subject}
                subtitle={
                  <div className="pp-row" style={{ gap: 8 }}>
                    <Badge tone={statusTone(detailQ.data.status)} dot>{humanizeEnum(detailQ.data.status)}</Badge>
                    <Badge tone="neutral">{humanizeEnum(detailQ.data.request_type)}</Badge>
                    <span className="pp-soft" style={{ fontSize: 12 }}>Opened {formatDateTime(detailQ.data.created_at)}</span>
                  </div>
                }
              />
              <CardBody>
                <div className="pp-soft" style={{ fontSize: 12, marginBottom: 8 }}>Original message</div>
                <div style={{ padding: 12, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)', whiteSpace: 'pre-wrap' }}>{detailQ.data.body}</div>
              </CardBody>
            </Card>

            <div className="pp-stack" style={{ gap: 8 }}>
              {(detailQ.data.messages || []).map((m: any) => (
                <div key={m.id} className="pp-row" style={{ alignItems: 'flex-start', gap: 12, padding: 12, background: m.sender_type === 'hr' || m.sender_type === 'hr_manager' ? 'var(--pp-primary-50)' : 'var(--pp-surface-2)', borderRadius: 'var(--pp-radius-md)', border: '1px solid var(--pp-border)' }}>
                  <Avatar name={m.sender_type} size={30} />
                  <div style={{ flex: 1 }}>
                    <div className="pp-row" style={{ gap: 6, marginBottom: 4 }}>
                      <Badge tone={m.sender_type === 'employee' ? 'neutral' : 'primary'}>{humanizeEnum(m.sender_type)}</Badge>
                      {m.internal_note && <Badge tone="warning">Internal note</Badge>}
                      <span className="pp-soft" style={{ fontSize: 11 }}>{formatDateTime(m.created_at)}</span>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pp-row" style={{ gap: 8, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Textarea label="Reply" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Type a message" />
              </div>
              <Button leftIcon={<Send size={14} />} onClick={sendReply} disabled={!replyBody.trim()}>Send</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
