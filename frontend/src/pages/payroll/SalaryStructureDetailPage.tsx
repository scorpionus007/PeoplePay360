import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { api, extractApiError } from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Select, Input } from '../../components/Input';
import { useToast } from '../../components/Toast';
import { humanizeEnum } from '../../utils/format';

type StructureRule = {
  id?: string;
  salary_rule_id: string;
  sequence: number;
  override_amount?: number | null;
  override_percent?: number | null;
  is_active: boolean;
  rule?: any;
};

export function SalaryStructureDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState<StructureRule[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const structureQ = useQuery({
    queryKey: ['salaryStructure', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/payroll/salary-structures/${id}`);
      const data = res.data.data;
      const existing = (data.structure_rules || []).map((sr: any) => ({
        id: sr.id,
        salary_rule_id: sr.salary_rule_id,
        sequence: sr.sequence,
        override_amount: sr.override_amount,
        override_percent: sr.override_percent,
        is_active: sr.is_active,
        rule: sr.rule,
      })).sort((a: any, b: any) => a.sequence - b.sequence);
      setRows(existing);
      setDirty(false);
      return data;
    },
  });

  const rulesQ = useQuery({
    queryKey: ['salaryRules', 'all'],
    queryFn: async () => (await api.get('/payroll/salary-rules', { params: { limit: 200 } })).data.data as any[],
  });

  const addRule = () => {
    const nextSeq = rows.length ? Math.max(...rows.map((r) => r.sequence)) + 10 : 100;
    setRows([...rows, { salary_rule_id: rulesQ.data?.[0]?.id || '', sequence: nextSeq, override_amount: null, override_percent: null, is_active: true }]);
    setDirty(true);
  };

  const updateRow = (i: number, patch: Partial<StructureRule>) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
    setDirty(true);
  };
  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        rules: rows.map((r) => ({
          salary_rule_id: r.salary_rule_id,
          sequence: Number(r.sequence),
          override_amount: r.override_amount !== null && r.override_amount !== undefined && r.override_amount !== ('' as any) ? Number(r.override_amount) : null,
          override_percent: r.override_percent !== null && r.override_percent !== undefined && r.override_percent !== ('' as any) ? Number(r.override_percent) : null,
          is_active: !!r.is_active,
        })),
      };
      await api.put(`/payroll/salary-structures/${id}/rules`, payload);
      toast.success('Structure rules saved');
      setDirty(false);
      structureQ.refetch();
    } catch (err) {
      toast.error('Save failed', extractApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const structure = structureQ.data;

  return (
    <div className="pp-stack">
      <PageHeader
        title={structure?.name || 'Loading...'}
        subtitle={structure?.code}
        breadcrumbs={[{ label: 'Payroll', href: '/payroll/dashboard' }, { label: 'Salary structures', href: '/payroll/salary-structures' }, { label: structure?.code || '' }]}
        actions={
          <>
            <Button variant="secondary" leftIcon={<ArrowLeft size={16} />} onClick={() => nav('/payroll/salary-structures')}>Back</Button>
            <Button leftIcon={<Save size={16} />} onClick={save} loading={saving} disabled={!dirty}>Save rules</Button>
          </>
        }
      />

      <Card>
        <CardHeader
          title="Rule sequence"
          subtitle="Rules run in order. Category totals accumulate for percent-of-category and formula rules."
          actions={<Button size="sm" variant="secondary" leftIcon={<Plus size={14} />} onClick={addRule}>Add rule</Button>}
        />
        <CardBody>
          {rows.length === 0 ? (
            <div className="pp-soft" style={{ padding: 24, textAlign: 'center' }}>
              No rules yet. Click <b>Add rule</b> to build this structure.
            </div>
          ) : (
            <div className="pp-stack" style={{ gap: 8 }}>
              {rows.map((row, i) => {
                const rule = rulesQ.data?.find((r) => r.id === row.salary_rule_id);
                return (
                  <div key={i} className="pp-grid" style={{ gridTemplateColumns: '80px 1fr 160px 160px 100px 40px', gap: 8, alignItems: 'center', padding: 10, border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)', background: 'var(--pp-surface-2)' }}>
                    <Input value={row.sequence} type="number" onChange={(e) => updateRow(i, { sequence: Number(e.target.value) })} />
                    <Select value={row.salary_rule_id} onChange={(e) => updateRow(i, { salary_rule_id: e.target.value })}>
                      <option value="">Select a rule</option>
                      {(rulesQ.data || []).map((r) => <option key={r.id} value={r.id}>{r.code} - {r.name}</option>)}
                    </Select>
                    <Input placeholder="Override amount" type="number" value={row.override_amount ?? ''} onChange={(e) => updateRow(i, { override_amount: e.target.value as any })} />
                    <Input placeholder="Override percent" type="number" value={row.override_percent ?? ''} onChange={(e) => updateRow(i, { override_percent: e.target.value as any })} />
                    <div className="pp-row" style={{ justifyContent: 'center' }}>
                      {rule && <Badge tone="primary">{humanizeEnum(rule.category)}</Badge>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeRow(i)} aria-label="Remove">
                      <Trash2 size={14} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
