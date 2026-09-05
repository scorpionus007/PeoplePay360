import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play, Square, Calendar, PencilLine } from 'lucide-react';
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
import { formatDate, formatDateTime, formatNumber, humanizeEnum } from '../../utils/format';

const STATUSES = ['present', 'late', 'early_leave', 'absent', 'on_leave', 'holiday', 'weekend', 'overtime', 'missing_checkout'];

export function AttendancePage() {
  const toast = useToast();
  const { user } = useAuth();
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });
  const [editing, setEditing] = useState<any | null>(null);
  const [patch, setPatch] = useState<any>({});
  const [note, setNote] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['attendance', filters],
    queryFn: async () => (await api.get('/hr/attendance', { params: { limit: 100, ...filters } })).data.data as any[],
  });

  const checkIn = async () => {
    try {
      await api.post('/hr/attendance/check-in', {});
      toast.success('Checked in');
      refetch();
    } catch (err) {
      toast.error('Check in failed', extractApiError(err));
    }
  };

  const checkOut = async () => {
    try {
      await api.post('/hr/attendance/check-out', {});
      toast.success('Checked out');
      refetch();
    } catch (err) {
      toast.error('Check out failed', extractApiError(err));
    }
  };

  const openCorrect = (row: any) => {
    setEditing(row);
    setPatch({
      check_in: row.check_in ? row.check_in.slice(0, 16) : '',
      check_out: row.check_out ? row.check_out.slice(0, 16) : '',
      break_minutes: row.break_minutes,
      status: row.status,
      notes: row.notes || '',
    });
    setNote('');
  };

  const submitCorrection = async () => {
    try {
      const payload: any = { note, patch: {} };
      if (patch.check_in) payload.patch.check_in = new Date(patch.check_in).toISOString();
      if (patch.check_out) payload.patch.check_out = new Date(patch.check_out).toISOString();
      if (patch.break_minutes !== '') payload.patch.break_minutes = Number(patch.break_minutes);
      if (patch.status) payload.patch.status = patch.status;
      if (patch.notes !== undefined) payload.patch.notes = patch.notes;
      await api.patch(`/hr/attendance/${editing.id}/correct`, payload);
      toast.success('Attendance corrected');
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error('Correction failed', extractApiError(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Check in and out, review the day, correct exceptions"
        actions={
          user?.employee ? (
            <div className="pp-row" style={{ gap: 8 }}>
              <Button variant="secondary" leftIcon={<Play size={14} />} onClick={checkIn}>Check in</Button>
              <Button leftIcon={<Square size={14} />} onClick={checkOut}>Check out</Button>
            </div>
          ) : null
        }
      />

      <div className="pp-row" style={{ gap: 8, marginBottom: 16 }}>
        <div style={{ minWidth: 160 }}><Input label="From" type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} /></div>
        <div style={{ minWidth: 160 }}><Input label="To" type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} /></div>
        <div style={{ minWidth: 180 }}><Select label="Status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
        </Select></div>
      </div>

      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Calendar size={22} />} title="No attendance records" description="Attendance appears here as employees check in each day." />}
        columns={[
          { key: 'employee', header: 'Employee', render: (r: any) => r.employee ? <span style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</span> : '-' },
          { key: 'date', header: 'Date', render: (r: any) => formatDate(r.work_date), width: '130px' },
          { key: 'in', header: 'Check in', render: (r: any) => r.check_in ? formatDateTime(r.check_in) : <span className="pp-soft">-</span> },
          { key: 'out', header: 'Check out', render: (r: any) => r.check_out ? formatDateTime(r.check_out) : <span className="pp-soft">-</span> },
          { key: 'worked', header: 'Worked', render: (r: any) => `${formatNumber(r.worked_hours, 2)}h`, align: 'right' as const, width: '90px' },
          { key: 'ot', header: 'OT', render: (r: any) => Number(r.overtime_hours || 0) > 0 ? <Badge tone="warning">{formatNumber(r.overtime_hours, 2)}h</Badge> : <span className="pp-soft">-</span>, width: '90px' },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '160px' },
          { key: 'corr', header: 'Corrected', render: (r: any) => r.is_corrected ? <Badge tone="warning">Yes</Badge> : <span className="pp-soft">-</span>, width: '110px' },
          { key: 'actions', header: '', width: '120px', render: (r: any) => <div className="pp-row" style={{ justifyContent: 'flex-end' }}><Button size="sm" variant="ghost" leftIcon={<PencilLine size={13} />} onClick={() => openCorrect(r)}>Correct</Button></div> },
        ]}
      />

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Correct attendance" footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={submitCorrection}>Save correction</Button></>}>
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Check in" type="datetime-local" value={patch.check_in || ''} onChange={(e) => setPatch({ ...patch, check_in: e.target.value })} />
          <Input label="Check out" type="datetime-local" value={patch.check_out || ''} onChange={(e) => setPatch({ ...patch, check_out: e.target.value })} />
          <Input label="Break minutes" type="number" value={patch.break_minutes ?? ''} onChange={(e) => setPatch({ ...patch, break_minutes: e.target.value })} />
          <Select label="Status" value={patch.status || ''} onChange={(e) => setPatch({ ...patch, status: e.target.value })}>
            {STATUSES.map((s) => <option key={s} value={s}>{humanizeEnum(s)}</option>)}
          </Select>
          <div style={{ gridColumn: '1 / -1' }}>
            <Textarea label="Notes" value={patch.notes || ''} onChange={(e) => setPatch({ ...patch, notes: e.target.value })} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <Input label="Correction reason" value={note} onChange={(e) => setNote(e.target.value)} required />
          </div>
        </div>
      </Modal>
    </div>
  );
}
