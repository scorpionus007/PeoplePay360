import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, LayoutGrid, List, Users, ArrowRight, XCircle } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { Avatar } from '../../components/Avatar';
import { formatDate, humanizeEnum } from '../../utils/format';
import './ApplicationsPage.css';

const STAGES = ['applied', 'screening', 'phone_screen', 'assessment', 'interview', 'onsite', 'offer', 'hired', 'rejected', 'withdrawn', 'on_hold'];
const BOARD_STAGES = ['applied', 'screening', 'phone_screen', 'assessment', 'interview', 'onsite', 'offer', 'hired'];
const SOURCES = ['direct', 'referral', 'job_board', 'agency', 'sourced', 'internal', 'university'];

export function ApplicationsPage() {
  const toast = useToast();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>(defaults());
  const [progressRow, setProgressRow] = useState<any | null>(null);
  const [progress, setProgress] = useState<any>({ to_stage: '', note: '' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => (await api.get('/hiring/applications', { params: { limit: 200 } })).data.data as any[],
  });
  const reqsQ = useQuery({
    queryKey: ['requisitions', 'approved'],
    queryFn: async () => (await api.get('/hiring/requisitions', { params: { status: 'approved', limit: 100 } })).data.data as any[],
  });

  const create = async () => {
    try {
      const candidate: any = { first_name: form.first_name, last_name: form.last_name, email: form.email };
      if (form.phone) candidate.phone = form.phone;
      if (form.resume_url) candidate.resume_url = form.resume_url;
      await api.post('/hiring/applications', {
        requisition_id: form.requisition_id,
        source: form.source,
        cover_letter_url: form.cover_letter_url || null,
        candidate,
      });
      toast.success('Application submitted');
      setOpenForm(false);
      setForm(defaults());
      refetch();
    } catch (err) {
      toast.error('Submit failed', extractApiError(err));
    }
  };

  const submitProgress = async () => {
    if (!progressRow) return;
    try {
      await api.post(`/hiring/applications/${progressRow.id}/progress`, progress);
      toast.success(`Moved to ${humanizeEnum(progress.to_stage)}`);
      setProgressRow(null);
      refetch();
    } catch (err) {
      toast.error('Move failed', extractApiError(err));
    }
  };

  const reject = async (id: string) => {
    const reason = prompt('Rejection reason (optional)') || '';
    try {
      await api.post(`/hiring/applications/${id}/reject`, { reason });
      toast.success('Rejected');
      refetch();
    } catch (err) {
      toast.error('Reject failed', extractApiError(err));
    }
  };

  const grouped: Record<string, any[]> = {};
  for (const s of BOARD_STAGES) grouped[s] = [];
  for (const app of data || []) {
    if (grouped[app.current_stage]) grouped[app.current_stage].push(app);
  }

  return (
    <div>
      <PageHeader
        title="Applications"
        subtitle="Pipeline board and per candidate detail"
        actions={
          <div className="pp-row" style={{ gap: 8 }}>
            <div className="pp-row" style={{ gap: 2, padding: 2, background: 'var(--pp-surface-2)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)' }}>
              <button className={`pp-btn pp-btn--${view === 'board' ? 'secondary' : 'ghost'} pp-btn--sm`} onClick={() => setView('board')}><LayoutGrid size={14} /></button>
              <button className={`pp-btn pp-btn--${view === 'list' ? 'secondary' : 'ghost'} pp-btn--sm`} onClick={() => setView('list')}><List size={14} /></button>
            </div>
            <Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>Add application</Button>
          </div>
        }
      />

      {view === 'board' ? (
        (data || []).length === 0 && !isLoading ? (
          <EmptyState icon={<Users size={22} />} title="No applications yet" description="Add the first application to see the pipeline." action={<Button onClick={() => setOpenForm(true)}>Add application</Button>} />
        ) : (
          <div className="pp-board">
            {BOARD_STAGES.map((stage) => (
              <div key={stage} className="pp-board__col">
                <div className="pp-board__col-header">
                  <Badge tone="primary">{humanizeEnum(stage)}</Badge>
                  <span className="pp-soft" style={{ fontSize: 12 }}>{grouped[stage].length}</span>
                </div>
                <div className="pp-board__col-body">
                  {grouped[stage].map((app) => (
                    <div key={app.id} className="pp-board__card">
                      <div className="pp-row" style={{ gap: 8, marginBottom: 6 }}>
                        <Avatar name={app.candidate ? `${app.candidate.first_name} ${app.candidate.last_name}` : 'C'} size={26} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.candidate ? `${app.candidate.first_name} ${app.candidate.last_name}` : 'Candidate'}</div>
                          <div className="pp-soft" style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.candidate?.email}</div>
                        </div>
                      </div>
                      <div className="pp-soft" style={{ fontSize: 11 }}>{app.requisition?.title}</div>
                      <div className="pp-row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                        <Badge tone="muted">{humanizeEnum(app.source)}</Badge>
                        <div className="pp-row" style={{ gap: 4 }}>
                          <Button size="sm" variant="ghost" onClick={() => { setProgressRow(app); setProgress({ to_stage: nextStage(app.current_stage), note: '' }); }}><ArrowRight size={12} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => reject(app.id)}><XCircle size={12} /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {grouped[stage].length === 0 && <div className="pp-soft" style={{ padding: 12, textAlign: 'center', fontSize: 12 }}>No candidates</div>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <DataTable
          loading={isLoading}
          rows={data || []}
          empty={<EmptyState icon={<Users size={22} />} title="No applications" action={<Button onClick={() => setOpenForm(true)}>Add application</Button>} />}
          columns={[
            { key: 'cand', header: 'Candidate', render: (r: any) => r.candidate ? <div className="pp-row" style={{ gap: 8 }}><Avatar name={`${r.candidate.first_name} ${r.candidate.last_name}`} size={28} /><div><div style={{ fontWeight: 600 }}>{r.candidate.first_name} {r.candidate.last_name}</div><div className="pp-soft" style={{ fontSize: 12 }}>{r.candidate.email}</div></div></div> : '-' },
            { key: 'req', header: 'Requisition', render: (r: any) => r.requisition ? <div><div>{r.requisition.title}</div><div className="pp-soft pp-mono" style={{ fontSize: 12 }}>{r.requisition.code}</div></div> : '-' },
            { key: 'stage', header: 'Stage', render: (r: any) => <Badge tone={statusTone(r.current_stage)} dot>{humanizeEnum(r.current_stage)}</Badge>, width: '150px' },
            { key: 'source', header: 'Source', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.source)}</Badge>, width: '120px' },
            { key: 'applied', header: 'Applied', render: (r: any) => formatDate(r.applied_at), width: '130px' },
            { key: 'actions', header: '', width: '160px', render: (r: any) => <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
              <Button size="sm" variant="subtle" onClick={() => { setProgressRow(r); setProgress({ to_stage: nextStage(r.current_stage), note: '' }); }}>Advance</Button>
            </div> },
          ]}
        />
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="Add application" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Submit</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Requisition" required value={form.requisition_id} onChange={(e) => setForm({ ...form, requisition_id: e.target.value })}>
            <option value="">Select approved requisition</option>
            {(reqsQ.data || []).map((r: any) => <option key={r.id} value={r.id}>{r.code} - {r.title}</option>)}
          </Select>
          <Select label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
            {SOURCES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
          </Select>
          <Input label="First name" required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <Input label="Last name" required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Resume URL" value={form.resume_url} onChange={(e) => setForm({ ...form, resume_url: e.target.value })} />
          <Input label="Cover letter URL" value={form.cover_letter_url} onChange={(e) => setForm({ ...form, cover_letter_url: e.target.value })} />
        </div>
      </Modal>

      <Modal open={!!progressRow} onClose={() => setProgressRow(null)} title="Move stage" footer={<><Button variant="secondary" onClick={() => setProgressRow(null)}>Cancel</Button><Button onClick={submitProgress}>Move</Button></>}>
        {progressRow && (
          <div className="pp-stack">
            <div className="pp-soft" style={{ fontSize: 13 }}>Candidate: <b>{progressRow.candidate ? `${progressRow.candidate.first_name} ${progressRow.candidate.last_name}` : ''}</b></div>
            <div className="pp-soft" style={{ fontSize: 13 }}>Current stage: <Badge tone={statusTone(progressRow.current_stage)} dot>{humanizeEnum(progressRow.current_stage)}</Badge></div>
            <Select label="Move to" value={progress.to_stage} onChange={(e) => setProgress({ ...progress, to_stage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
            </Select>
            <Textarea label="Note (optional)" value={progress.note} onChange={(e) => setProgress({ ...progress, note: e.target.value })} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function defaults() {
  return { requisition_id: '', source: 'direct', first_name: '', last_name: '', email: '', phone: '', resume_url: '', cover_letter_url: '' };
}

function nextStage(current: string): string {
  const idx = BOARD_STAGES.indexOf(current);
  if (idx === -1 || idx === BOARD_STAGES.length - 1) return 'interview';
  return BOARD_STAGES[idx + 1];
}
