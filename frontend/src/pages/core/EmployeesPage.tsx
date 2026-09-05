import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Users } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Badge, statusTone } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { EmptyState } from '../../components/EmptyState';
import { Avatar } from '../../components/Avatar';
import { humanizeEnum } from '../../utils/format';
import { EmployeeForm } from './EmployeeForm';

type Employee = {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email_work: string;
  job_title?: string | null;
  employment_type: string;
  employment_status: string;
  department?: { id: string; name: string; code?: string } | null;
};

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['employees', { search, status }],
    queryFn: async () => {
      const res = await api.get('/employees', { params: { search, employment_status: status || undefined, limit: 50 } });
      return res.data.data as Employee[];
    },
  });

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle="Central directory of every person on your workforce"
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => { setEditing(null); setOpenForm(true); }}>
            Add employee
          </Button>
        }
      />

      <div className="pp-row" style={{ marginBottom: 16, gap: 8 }}>
        <div style={{ flex: 1, maxWidth: 360 }}>
          <Input
            placeholder="Search name, email, or ID"
            leftAdornment={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <select className="pp-input pp-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="on_leave">On leave</option>
            <option value="suspended">Suspended</option>
            <option value="terminated">Terminated</option>
          </select>
        </div>
      </div>

      <DataTable<Employee>
        loading={isLoading}
        rows={data || []}
        empty={
          <EmptyState
            icon={<Users size={22} />}
            title="No employees yet"
            description="Add your first employee to start building your workforce records."
            action={
              <Button leftIcon={<Plus size={16} />} onClick={() => { setEditing(null); setOpenForm(true); }}>
                Add employee
              </Button>
            }
          />
        }
        columns={[
          {
            key: 'name',
            header: 'Employee',
            render: (row) => (
              <div className="pp-row" style={{ gap: 10 }}>
                <Avatar name={`${row.first_name} ${row.last_name}`} size={32} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{row.first_name} {row.last_name}</span>
                  <span className="pp-soft" style={{ fontSize: 12 }}>{row.email_work}</span>
                </div>
              </div>
            ),
          },
          { key: 'number', header: 'ID', render: (r) => <span className="pp-mono">{r.employee_number}</span>, width: '120px' },
          { key: 'dept', header: 'Department', render: (r) => r.department?.name || <span className="pp-soft">Unassigned</span> },
          { key: 'title', header: 'Job title', render: (r) => r.job_title || <span className="pp-soft">-</span> },
          { key: 'type', header: 'Type', render: (r) => <Badge tone="neutral">{humanizeEnum(r.employment_type)}</Badge> },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.employment_status)} dot>{humanizeEnum(r.employment_status)}</Badge> },
        ]}
        onRowClick={(row) => { setEditing(row); setOpenForm(true); }}
      />

      <EmployeeForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        employee={editing}
        onSaved={() => { setOpenForm(false); refetch(); }}
      />
    </div>
  );
}
