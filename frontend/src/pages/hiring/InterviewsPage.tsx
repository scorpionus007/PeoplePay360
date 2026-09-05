import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar, Video, MessageSquare } from 'lucide-react';
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

const TYPES = ['phone', 'video', 'onsite', 'technical', 'panel', 'behavioral', 'culture', 'take_home'];
const RECS = ['strong_hire', 'hire', 'no_hire', 'strong_no_hire', 'needs_another_round'];

export function InterviewsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());
  const [feedbackRow, setFeedbackRow] = useState<any | null>(null);
  const [fb, setFb] = useState<any>({ recommendation: 'hire', overall_rating: '', strengths: '', concerns: '', notes: '', panelist_role: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => (await api.get('/hiring/interviews')).data.data as any[],
  });
  const appsQ = useQuery({
    queryKey: ['applications', 'compact'],
    queryFn: async () => (await api.get('/hiring/applications', { params: { limit: 200 } })).data.data as any[],
  });

  const schedule = async () => {
    try {
      const payload = { ...form, scheduled_start: new Date(form.scheduled_start).toISOString(), scheduled_end: new Date(form.scheduled_end).toISOString() };
      await api.post('/hiring/interviews', payload);
      toast.success('Interview scheduled');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Schedule failed', extractApiError(err));
    }
  };

  const cancel = async (id: string) => {
    const reason = prompt('Cancellation reason (optional)') || '';
    try {
      await api.post(`/hiring/interviews/${id}/cancel`, { reason });
      toast.success('Cancelled');
      refetch();
    } catch (err) {
      toast.error('Cancel failed', extractApiError(err));
    }
  };

  const submitFeedback = async () => {
    if (!feedbackRow) return;
    try {
      await api.post(`/hiring/interviews/${feedbackRow.id}/feedback`, {
        ...fb,
        overall_rating: fb.overall_rating ? Number(fb.overall_rating) : null,
      });
      toast.success('Feedback submitted');
      setFeedbackRow(null);
      refetch();
    } catch (err) {
      toast.error('Submit failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Interviews"
        subtitle="Schedule rounds and collect structured feedback"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Schedule interview</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Calendar size={22} />} title="No interviews scheduled" action={<Button onClick={() => setOpenForm(true)}>Schedule interview</Button>} />}
        columns={[
          {
            key: 'candidate', header: 'Candidate',
            render: (r: any) => r.application?.candidate ? <div>
              <div style={{ fontWeight: 600 }}>{r.application.candidate.first_name} {r.application.candidate.last_name}</div>
              <div className="pp-soft" style={{ fontSize: 12 }}>{r.application.candidate.email}</div>
            </div> : '-',
          },
          { key: 'round', header: 'Round', render: (r: any) => <Badge tone="primary">Round {r.round_index}</Badge>, width: '100px' },
          { key: 'type', header: 'Type', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.interview_type)}</Badge>, width: '120px' },
          { key: 'title', header: 'Title', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
          { key: 'when', header: 'Scheduled', render: (r: any) => <div><div>{formatDateTime(r.scheduled_start)}</div><div className="pp-soft" style={{ fontSize: 12 }}>to {formatDateTime(r.scheduled_end)}</div></div> },
          { key: 'link', header: '', render: (r: any) => r.video_url ? <a href={r.video_url} target="_blank" rel="noreferrer" title="Video link"><Video size={16} /></a> : null, width: '50px' },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          {
            key: 'actions', header: '', width: '260px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                <Button size="sm" variant="subtle" leftIcon={<MessageSquare size={12} />} onClick={() => { setFeedbackRow(r); setFb({ recommendation: 'hire', overall_rating: '', strengths: '', concerns: '', notes: '', panelist_role: '' }); }}>Feedback</Button>
                {r.status === 'scheduled' && <Button size="sm" variant="ghost" onClick={() => cancel(r.id)}>Cancel</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Schedule interview" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={schedule}>Schedule</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Select label="Application" required value={form.application_id} onChange={(e) => setForm({ ...form, application_id: e.target.value })}>
              <option value="">Select an application</option>
              {(appsQ.data || []).map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.candidate ? `${a.candidate.first_name} ${a.candidate.last_name}` : 'Candidate'} - {a.requisition?.title || 'Requisition'}
                </option>
              ))}
            </Select>
          </div>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select label="Type" value={form.interview_type} onChange={(e) => setForm({ ...form, interview_type: e.target.value })}>
            {TYPES.map((t) => <option key={t} value={t}>{humanizeEnum(t)}</option>)}
          </Select>
          <Input label="Start" type="datetime-local" required value={form.scheduled_start} onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })} />
          <Input label="End" type="datetime-local" required value={form.scheduled_end} onChange={(e) => setForm({ ...form, scheduled_end: e.target.value })} />
          <Input label="Timezone" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
          <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input label="Video URL" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
          <Input label="Round" type="number" value={form.round_index || ''} onChange={(e) => setForm({ ...form, round_index: e.target.value ? Number(e.target.value) : null })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal open={!!feedbackRow} onClose={() => setFeedbackRow(null)} title="Submit interview feedback" size="lg" footer={<><Button variant="secondary" onClick={() => setFeedbackRow(null)}>Cancel</Button><Button onClick={submitFeedback}>Submit</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Recommendation" required value={fb.recommendation} onChange={(e) => setFb({ ...fb, recommendation: e.target.value })}>
            {RECS.map((r) => <option key={r} value={r}>{humanizeEnum(r)}</option>)}
          </Select>
          <Input label="Overall rating (0-10)" type="number" step="0.5" min="0" max="10" value={fb.overall_rating} onChange={(e) => setFb({ ...fb, overall_rating: e.target.value })} />
          <Input label="Panelist role" value={fb.panelist_role} onChange={(e) => setFb({ ...fb, panelist_role: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Strengths" value={fb.strengths} onChange={(e) => setFb({ ...fb, strengths: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Concerns" value={fb.concerns} onChange={(e) => setFb({ ...fb, concerns: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={fb.notes} onChange={(e) => setFb({ ...fb, notes: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function defaults() {
  return {
    application_id: '', title: '', interview_type: 'video',
    scheduled_start: '', scheduled_end: '', timezone: 'UTC',
    location: '', video_url: '', round_index: null as number | null, note: '',
  };
}
