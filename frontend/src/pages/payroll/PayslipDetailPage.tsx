import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download } from 'lucide-react';
import { api } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge, statusTone } from '../../components/Badge';
import { formatDate, formatMoney, humanizeEnum } from '../../utils/format';

export function PayslipDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();

  const { data } = useQuery({
    queryKey: ['payslip', id],
    enabled: !!id,
    queryFn: async () => (await api.get(`/payroll/payslips/${id}`)).data.data,
  });

  const downloadPdf = () => {
    if (!id) return;
    const token = JSON.parse(localStorage.getItem('pp360.auth') || 'null')?.access_token;
    if (!token) return;
    const url = `/api/v1/payroll/payslips/${id}/pdf`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `payslip-${data?.code || id}.pdf`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
  };

  const lines = data?.lines || [];
  const grouped: Record<string, any[]> = {};
  for (const l of lines) {
    if (!grouped[l.category]) grouped[l.category] = [];
    grouped[l.category].push(l);
  }

  const currency = data?.currency || 'USD';

  return (
    <div className="pp-stack">
      <PageHeader
        title={data?.code || 'Payslip'}
        subtitle={data?.employee ? `${data.employee.first_name} ${data.employee.last_name} · ${formatDate(data.period_start)} - ${formatDate(data.period_end)}` : ''}
        breadcrumbs={[{ label: 'Payroll', href: '/payroll/dashboard' }, { label: 'Payslips', href: '/payroll/payslips' }, { label: data?.code || '' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => nav(-1)}>Back</Button>
            <Button leftIcon={<Download size={16} />} onClick={downloadPdf}>Download PDF</Button>
          </>
        }
      />

      <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <SumCard label="Basic" value={formatMoney(data?.basic_amount, currency)} />
        <SumCard label="Allowances" value={formatMoney(data?.allowances_amount, currency)} />
        <SumCard label="Gross" value={formatMoney(data?.gross_amount, currency)} />
        <SumCard label="Deductions" value={formatMoney(data?.deductions_amount, currency)} tone="warning" />
        <SumCard label="Tax" value={formatMoney(data?.tax_amount, currency)} tone="warning" />
        <SumCard label="Net" value={formatMoney(data?.net_amount, currency)} tone="success" />
      </div>

      <Card>
        <CardHeader
          title="Salary computation"
          subtitle={<div className="pp-row" style={{ gap: 8 }}><Badge tone={statusTone(data?.status)} dot>{humanizeEnum(data?.status || '')}</Badge> <span className="pp-soft">Structure: {data?.salary_structure?.name || 'Per contract'}</span></div>}
        />
        <CardBody>
          <div className="pp-stack">
            {Object.keys(grouped).length === 0 && <div className="pp-soft">No lines computed yet.</div>}
            {Object.keys(grouped).map((cat) => (
              <div key={cat}>
                <div className="pp-row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
                  <Badge tone="primary">{humanizeEnum(cat)}</Badge>
                </div>
                <div className="pp-stack" style={{ gap: 4 }}>
                  {grouped[cat].map((l: any) => (
                    <div key={l.id} className="pp-row" style={{ padding: '10px 12px', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)', background: 'var(--pp-surface-2)' }}>
                      <span className="pp-mono" style={{ minWidth: 120 }}>{l.rule_code}</span>
                      <span style={{ flex: 1 }}>{l.rule_name}</span>
                      <span style={{ fontWeight: 700 }}>{formatMoney(l.amount, currency)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function SumCard({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'success' | 'warning' }) {
  const border = tone === 'success' ? 'rgba(22, 179, 100, 0.35)' : tone === 'warning' ? 'rgba(247, 144, 9, 0.35)' : 'var(--pp-border)';
  const bg = tone === 'success' ? 'linear-gradient(180deg, rgba(22, 179, 100, 0.06), transparent)' : tone === 'warning' ? 'linear-gradient(180deg, rgba(247, 144, 9, 0.06), transparent)' : 'var(--pp-surface)';
  return (
    <div style={{ padding: '16px 18px', border: `1px solid ${border}`, borderRadius: 'var(--pp-radius-lg)', background: bg }}>
      <div className="pp-soft" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ marginTop: 4, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}
