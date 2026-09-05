import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Megaphone, Pin } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import { Input, Select, Textarea } from '../../components/Input';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { useToast } from '../../components/Toast';
import { formatDateTime, humanizeEnum } from '../../utils/format';

export function AnnouncementsPage() {
  const toast = useToast();
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState<any>({ title: '', body: '', audience: 'all', is_pinned: false, status: 'published' });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => (await api.get('/hr/announcements')).data.data as any[],
  });

  const create = async () => {
    try {
      await api.post('/hr/announcements', form);
      toast.success('Announcement published');
      setOpenForm(false);
      setForm({ title: '', body: '', audience: 'all', is_pinned: false, status: 'published' });
      refetch();
    } catch (err) {
      toast.error('Publish failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Organization wide notices and updates"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setOpenForm(true)}>New announcement</Button>}
      />

      {isLoading ? (
        <div className="pp-skeleton" style={{ height: 200 }} />
      ) : (data || []).length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<Megaphone size={22} />} title="No announcements" description="Publish the first announcement to update your team." action={<Button onClick={() => setOpenForm(true)}>New announcement</Button>} />
        </CardBody></Card>
      ) : (
        <div className="pp-stack" style={{ gap: 14 }}>
          {(data || []).map((a: any) => (
            <Card key={a.id}>
              <CardHeader
                title={
                  <div className="pp-row" style={{ gap: 8 }}>
                    {a.is_pinned && <Pin size={14} color="var(--pp-primary-600)" />}
                    <span>{a.title}</span>
                  </div>
                }
                subtitle={
                  <div className="pp-row" style={{ gap: 8 }}>
                    <Badge tone="neutral">{humanizeEnum(a.audience)}</Badge>
                    <Badge tone={a.status === 'published' ? 'success' : 'muted'} dot>{humanizeEnum(a.status)}</Badge>
                    <span className="pp-soft" style={{ fontSize: 12 }}>{formatDateTime(a.created_at)}</span>
                  </div>
                }
              />
              <CardBody>
                <div style={{ whiteSpace: 'pre-wrap', color: 'var(--pp-text-muted)' }}>{a.body}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal open={openForm} onClose={() => setOpenForm(false)} title="New announcement" size="lg" footer={<><Button variant="secondary" onClick={() => setOpenForm(false)}>Cancel</Button><Button onClick={create}>Publish</Button></>}>
        <div className="pp-stack">
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="pp-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select label="Audience" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">Everyone</option>
              <option value="department">By department</option>
              <option value="role">By role</option>
              <option value="custom">Custom</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </Select>
          </div>
          <label className="pp-row" style={{ gap: 8 }}>
            <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} />
            <span>Pin to top</span>
          </label>
          <Textarea label="Message" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} />
        </div>
      </Modal>
    </div>
  );
}
