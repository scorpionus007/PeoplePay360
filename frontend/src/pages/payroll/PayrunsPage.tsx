import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Calendar } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { formatDate, humanizeEnum } from '../../utils/format';
import { PayrunWizard } from './PayrunWizard';

type Payrun = {
  id: string;
  name: string;
  code: string;
  period_start: string;
  period_end: string;
  payment_date?: string | null;
  currency: string;
  status: string;
  salary_structure?: { id: string; name: string } | null;
};

export function PayrunsPage() {
  const navigate = useNavigate();
  const [wizardOpen, setWizardOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payruns'],
    queryFn: async () => (await api.get('/payroll/payruns', { params: { limit: 100 } })).data.data as Payrun[],
  });

  return (
    <div>
      <PageHeader
        title="Payruns"
        subtitle="Batch payroll processing per period and salary structure"
        actions={<Button leftIcon={<Plus size={16} />} onClick={() => setWizardOpen(true)}>New payrun</Button>}
      />
      <DataTable<Payrun>
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<Calendar size={22} />} title="No payruns yet" description="Start a new payrun to compute payslips for a period." action={<Button onClick={() => setWizardOpen(true)}>New payrun</Button>} />}
        onRowClick={(r) => navigate(`/payroll/payruns/${r.id}`)}
        columns={[
          { key: 'code', header: 'Code', render: (r) => <span className="pp-mono">{r.code}</span>, width: '160px' },
          { key: 'name', header: 'Name', render: (r) => <Link to={`/payroll/payruns/${r.id}`} style={{ fontWeight: 600, color: 'var(--pp-text)' }}>{r.name}</Link> },
          { key: 'period', header: 'Period', render: (r) => `${formatDate(r.period_start)} - ${formatDate(r.period_end)}` },
          { key: 'pay', header: 'Payment date', render: (r) => r.payment_date ? formatDate(r.payment_date) : <span className="pp-soft">-</span> },
          { key: 'ccy', header: 'Currency', render: (r) => <Badge tone="neutral">{r.currency}</Badge>, width: '100px' },
          { key: 'status', header: 'Status', render: (r) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
        ]}
      />

      <PayrunWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={(id) => { setWizardOpen(false); refetch(); navigate(`/payroll/payruns/${id}`); }}
      />
    </div>
  );
}
