import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calculator, CheckCircle2, DollarSign, XCircle, AlertTriangle } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { DataTable } from '../../components/DataTable';
import { useToast } from '../../components/Toast';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

export function PayrunDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['payrun', id],
    enabled: !!id,
    queryFn: async () => (await api.get(`/payroll/payruns/${id}`)).data.data,
  });

  const run = async (path: string, label: string) => {
    try {
      await api.post(`/payroll/payruns/${id}/${path}`);
      toast.success(label);
      refetch();
    } catch (err) {
      toast.error(`${label} failed`, extractApiError(err));
    }
  };

  const payslips = data?.payslips || [];
  const warnings = (data?.warnings || []) as Array<{ code: string; message: string }>;

  return (
    <div className="pp-stack">
      <PageHeader
        title={data?.name || 'Loading...'}
        subtitle={data ? `${data.code} · ${formatDate(data.period_start)} - ${formatDate(data.period_end)}` : ''}
        breadcrumbs={[{ label: 'Payroll', href: '/payroll/dashboard' }, { label: 'Payruns', href: '/payroll/payruns' }, { label: data?.code || '' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => nav('/payroll/payruns')}>Back</Button>
            <Button variant="secondary" leftIcon={<Calculator size={16} />} onClick={() => run('compute', 'Payrun computed')}>Compute</Button>
            <Button variant="secondary" leftIcon={<CheckCircle2 size={16} />} onClick={() => run('validate', 'Payrun validated')} disabled={data?.status !== 'computed'}>Validate</Button>
            <Button leftIcon={<DollarSign size={16} />} onClick={() => run('mark-paid', 'Payrun paid')} disabled={data?.status !== 'validated'}>Mark paid</Button>
          </>
        }
      />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <MetaCard label="Status" value={<Badge tone={statusTone(data?.status)} dot>{humanizeEnum(data?.status || '')}</Badge>} />
        <MetaCard label="Structure" value={data?.salary_structure?.name || 'Per contract'} />
        <MetaCard label="Currency" value={data?.currency || '-'} />
        <MetaCard label="Payment date" value={data?.payment_date ? formatDate(data.payment_date) : 'Not set'} />
      </div>

      {warnings.length > 0 && (
        <Card>
          <CardHeader
            title={<div className="pp-row" style={{ gap: 8 }}><AlertTriangle size={16} color="var(--pp-amber-500)" /> {warnings.length} warnings</div>}
            subtitle="Resolve before validating and paying the payrun"
          />
          <CardBody>
            <div className="pp-stack" style={{ gap: 6 }}>
              {warnings.map((w, i) => (
                <div key={i} className="pp-row" style={{ padding: '8px 12px', background: 'var(--pp-amber-100)', color: '#7a4400', borderRadius: 'var(--pp-radius-md)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                  <Badge tone="warning">{humanizeEnum(w.code)}</Badge>
                  <span style={{ marginLeft: 8 }}>{w.message}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader title={`Payslips (${payslips.length})`} subtitle="Employee-level breakdown of this payrun" />
        <DataTable
          loading={isLoading}
          rows={payslips}
          columns={[
            {
              key: 'employee',
              header: 'Employee',
              render: (r: any) =>
                r.employee ? (
                  <Link to={`/payroll/payslips/${r.id}`} style={{ color: 'var(--pp-text)', fontWeight: 600 }}>
                    {r.employee.first_name} {r.employee.last_name}
                  </Link>
                ) : '-',
            },
            { key: 'code', header: 'Code', render: (r: any) => <span className="pp-mono">{r.code}</span>, width: '160px' },
            { key: 'gross', header: 'Gross', render: (r: any) => formatMoney(r.gross_amount, r.currency), align: 'right' as const },
            { key: 'tax', header: 'Tax', render: (r: any) => formatMoney(r.tax_amount, r.currency), align: 'right' as const },
            { key: 'deduct', header: 'Deductions', render: (r: any) => formatMoney(r.deductions_amount, r.currency), align: 'right' as const },
            { key: 'net', header: 'Net', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatMoney(r.net_amount, r.currency)}</span>, align: 'right' as const },
            { key: 'status', header: 'Status', render: (r: any) => <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>, width: '130px' },
          ]}
          onRowClick={(r: any) => nav(`/payroll/payslips/${r.id}`)}
        />
      </Card>
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: '14px 16px', background: 'var(--pp-surface)', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-lg)' }}>
      <div className="pp-soft" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 15, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
