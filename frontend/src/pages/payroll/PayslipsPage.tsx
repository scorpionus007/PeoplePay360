import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Badge, statusTone } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

export function PayslipsPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['payslips'],
    queryFn: async () => (await api.get('/payroll/payslips', { params: { limit: 100 } })).data.data as any[],
  });

  return (
    <div>
      <PageHeader title="Payslips" subtitle="Every employee, every period" />
      <DataTable
        loading={isLoading}
        rows={data || []}
        empty={<EmptyState icon={<FileText size={22} />} title="No payslips yet" description="Payslips appear here once you compute a payrun." />}
        onRowClick={(r: any) => navigate(`/payroll/payslips/${r.id}`)}
        columns={[
          {
            key: 'employee',
            header: 'Employee',
            render: (r: any) =>
              r.employee ? (
                <div>
                  <div style={{ fontWeight: 600 }}>{r.employee.first_name} {r.employee.last_name}</div>
                  <div className="pp-soft" style={{ fontSize: 12 }}>{r.employee.employee_number}</div>
                </div>
              ) : '-',
          },
          { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '160px' },
          { key: 'period', header: 'Period', render: (r: any) => `${formatDate(r.period_start)} - ${formatDate(r.period_end)}` },
          { key: 'gross', header: 'Gross', render: (r: any) => formatMoney(r.gross_amount, r.currency), align: 'right' as const },
          { key: 'net', header: 'Net', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.net_amount, r.currency)}</span>, align: 'right' as const },
          { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '120px' },
        ]}
      />
    </div>
  );
}
