import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Users, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { Input, Select } from '../../components/Input';
import { Badge } from '../../components/Badge';
import { api, extractApiError } from '../../api/client';
import { useToast } from '../../components/Toast';
import { formatMoney } from '../../utils/format';

type EligibleEmployee = {
  id: string;
  employee_number: string;
  full_name: string;
  department_id?: string | null;
  employment_type: string;
  active_contract?: { id: string; wage_amount: string; wage_currency: string } | null;
};

export function PayrunWizard({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const toast = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [scope, setScope] = useState({
    name: '',
    code: '',
    salary_structure_id: '',
    period_start: '',
    period_end: '',
    payment_date: '',
    currency: 'USD',
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const structuresQ = useQuery({
    queryKey: ['salaryStructures'],
    queryFn: async () => (await api.get('/payroll/salary-structures')).data.data as any[],
  });

  const eligibleQ = useQuery({
    enabled: step === 2 && !!scope.period_start && !!scope.period_end,
    queryKey: ['eligible', scope.period_start, scope.period_end],
    queryFn: async () => {
      const res = await api.get('/payroll/payruns/eligible-employees', {
        params: { period_start: scope.period_start, period_end: scope.period_end },
      });
      return res.data.data as EligibleEmployee[];
    },
  });

  const toStep2 = () => {
    if (!scope.name || !scope.code || !scope.period_start || !scope.period_end) {
      toast.warning('Fill in scope', 'Name, code, and both period dates are required.');
      return;
    }
    setStep(2);
  };

  const toggleAll = () => {
    if (!eligibleQ.data) return;
    if (selected.size === eligibleQ.data.length) setSelected(new Set());
    else setSelected(new Set(eligibleQ.data.map((e) => e.id)));
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const create = async () => {
    if (selected.size === 0) {
      toast.warning('Pick at least one employee');
      return;
    }
    setSubmitting(true);
    try {
      const payload: any = {
        ...scope,
        salary_structure_id: scope.salary_structure_id || null,
        payment_date: scope.payment_date || null,
        employee_ids: Array.from(selected),
      };
      const res = await api.post('/payroll/payruns', payload);
      toast.success('Payrun created', `${selected.size} employees included`);
      resetAndClose();
      onCreated(res.data.data.id);
    } catch (err) {
      toast.error('Create failed', extractApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStep(1);
    setScope({ name: '', code: '', salary_structure_id: '', period_start: '', period_end: '', payment_date: '', currency: 'USD' });
    setSelected(new Set());
    onClose();
  };

  const eligibleCount = eligibleQ.data?.length || 0;
  const allSelected = eligibleCount > 0 && selected.size === eligibleCount;

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title="Create payrun"
      subtitle={step === 1 ? 'Step 1 of 2 - Define the scope' : `Step 2 of 2 - Select employees (${selected.size} of ${eligibleCount})`}
      size="lg"
      footer={
        step === 1 ? (
          <>
            <Button variant="secondary" onClick={resetAndClose}>Cancel</Button>
            <Button rightIcon={<ArrowRight size={16} />} onClick={toStep2}>Continue</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
            <Button leftIcon={<CheckCircle2 size={16} />} onClick={create} loading={submitting}>Create payrun</Button>
          </>
        )
      }
    >
      {step === 1 ? (
        <div className="pp-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Input label="Name" required value={scope.name} onChange={(e) => setScope({ ...scope, name: e.target.value })} placeholder="e.g. September 2026 payroll" />
          <Input label="Code" required value={scope.code} onChange={(e) => setScope({ ...scope, code: e.target.value.toUpperCase() })} placeholder="e.g. PR-2026-09" />
          <Input label="Period start" type="date" required value={scope.period_start} onChange={(e) => setScope({ ...scope, period_start: e.target.value })} />
          <Input label="Period end" type="date" required value={scope.period_end} onChange={(e) => setScope({ ...scope, period_end: e.target.value })} />
          <Input label="Payment date" type="date" value={scope.payment_date} onChange={(e) => setScope({ ...scope, payment_date: e.target.value })} />
          <Input label="Currency" maxLength={3} value={scope.currency} onChange={(e) => setScope({ ...scope, currency: e.target.value.toUpperCase() })} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Select label="Salary structure" value={scope.salary_structure_id} onChange={(e) => setScope({ ...scope, salary_structure_id: e.target.value })} hint="Optional; contract structure will be used when absent">
              <option value="">Use contract structure</option>
              {(structuresQ.data || []).map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.currency})</option>)}
            </Select>
          </div>
        </div>
      ) : (
        <div className="pp-stack">
          <div className="pp-row" style={{ justifyContent: 'space-between' }}>
            <div className="pp-row" style={{ gap: 8 }}>
              <Users size={16} className="pp-soft" />
              <span>{eligibleCount} eligible employees</span>
            </div>
            <Button size="sm" variant="secondary" onClick={toggleAll} disabled={eligibleCount === 0}>
              {allSelected ? 'Clear selection' : 'Select all'}
            </Button>
          </div>
          <div className="pp-stack" style={{ maxHeight: 380, overflow: 'auto', gap: 6 }}>
            {eligibleQ.isLoading && <div className="pp-soft" style={{ padding: 20, textAlign: 'center' }}>Loading eligible employees...</div>}
            {!eligibleQ.isLoading && eligibleCount === 0 && (
              <div className="pp-soft" style={{ padding: 20, textAlign: 'center' }}>No employees have an active contract in this period.</div>
            )}
            {(eligibleQ.data || []).map((e) => (
              <label key={e.id} className="pp-row" style={{ gap: 10, padding: '10px 12px', border: '1px solid var(--pp-border)', borderRadius: 'var(--pp-radius-md)', cursor: 'pointer', background: selected.has(e.id) ? 'var(--pp-primary-50)' : 'var(--pp-surface-2)' }}>
                <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleOne(e.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{e.full_name}</div>
                  <div className="pp-soft" style={{ fontSize: 12 }}>{e.employee_number} &middot; {e.employment_type.replace('_', ' ')}</div>
                </div>
                {e.active_contract ? (
                  <span style={{ fontWeight: 600 }}>{formatMoney(e.active_contract.wage_amount as any, e.active_contract.wage_currency)}</span>
                ) : (
                  <Badge tone="warning">No contract</Badge>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
