import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Send } from 'lucide-react';
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

const CHANNELS = ['careers_site', 'linkedin', 'indeed', 'glassdoor', 'monster', 'naukri', 'wellfound', 'referral_only', 'custom'];

export function JobPostingsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ requisition_id: '', channel: 'careers_site', title: '', slug: '', external_url: '', published_content: '', status: 'draft' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['postings'],
    queryFn: async () => (await api.get('/hiring/postings')).data.data as any[],
  });
  const reqsQ = useQuery({
    queryKey: ['requisitions', 'approved'],
    queryFn: async () => (await api.get('/hiring/requisitions', { params: { status: 'approved', limit: 100 } })).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/hiring/postings', form);
      toast.success('Posting created');
      setOpenForm(false);
      refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    }
  };
  const action = async (id: string, path: string, label: string) => {
    try {
      await api.post(`/hiring/postings/${id}/${path}`, {});
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(label + ' failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Job postings"
        subtitle="Publish approved requisitions to careers site or external boards"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New posting</Button>}
      />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Send size={22} />} title="No postings yet" action={<Button onClick={() => setOpenForm(true)}>New posting</Button>} />}
        columns={[
          { key: 'title', header: 'Title', render: (r: any) => <span style={{ fontWeight: 600 }}>{r.title}</span> },
          { key: 'requisition', header: 'Requisition', render: (r: any) => r.requisition ? <span className="pp-mono">{r.requisition.code}</span> : '-' },
          { key: 'channel', header: 'Channel', render: (r: any) => <Badge tone="neutral">{humanizeEnum(r.channel)}</Badge> },
          { key: 'apps', header: 'Applications', render: (r: any) => r.applications_count || 0, align: 'right' as const },
          { key: 'published', header: 'Published', render: (r: any) => r.published_at ? formatDateTime(r.published_at) : <span className="pp-soft">-</span> },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          {
            key: 'actions', header: '', width: '200px',
            render: (r: any) => (
              <div className="pp-row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                {r.status !== 'published' && r.status !== 'closed' && <Button size="sm" variant="subtle" onClick={() => action(r.id, 'publish', 'Published')}>Publish</Button>}
                {r.status === 'published' && <Button size="sm" variant="ghost" onClick={() => action(r.id, 'close', 'Closed')}>Close</Button>}
              </div>
            ),
          },
        ]}
      />

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New posting" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Create</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Select label="Requisition" required value={form.requisition_id} onChange={(e) => setForm({ ...form, requisition_id: e.target.value })}>
            <option value="">Select approved requisition</option>
            {(reqsQ.data || []).map((r: any) => <option key={r.id} value={r.id}>{r.code} - {r.title}</option>)}
          </Select>
          <Select label="Channel" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
            {CHANNELS.map((c) => <option key={c} value={c}>{humanizeEnum(c)}</option>)}
          </Select>
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="External URL" value={form.external_url} onChange={(e) => setForm({ ...form, external_url: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Published content" value={form.published_content} onChange={(e) => setForm({ ...form, published_content: e.target.value })} rows={8} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
