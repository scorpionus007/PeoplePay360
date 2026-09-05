import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Zap,
  Receipt,
  UserPlus,
  Plane,
  Wallet,
  Eye,
  EyeOff,
  ArrowLeftRight,
  ListChecks,
  FileText,
  DollarSign,
  Clock,
  Flag,
  Info,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../api/client';
import { Badge, statusTone } from '../components/Badge';
import { formatMoney, formatNumber, humanizeEnum, formatDate } from '../utils/format';
import { useAuth } from '../auth/AuthContext';
import './Dashboard.css';

function useDashboard<T = any>(path: string, enabled = true) {
  return useQuery<T>({
    queryKey: ['dash', path],
    enabled,
    queryFn: async () => (await api.get(path)).data.data,
  });
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const currency = user?.organization?.base_currency || 'USD';
  const isAdmin = user?.roles?.includes('admin');
  const [showBalance, setShowBalance] = useState(false);

  const payroll = useDashboard<any>('/payroll/dashboard/overview', isAdmin || hasPermission('payroll.read'));
  const hr = useDashboard<any>('/hr/dashboard/overview', isAdmin || hasPermission('hr.request.read'));
  const hiring = useDashboard<any>('/hiring/dashboard/overview', isAdmin || hasPermission('requisition.read'));

  const payrunsQ = useQuery({
    queryKey: ['dash', 'recent-payruns'],
    enabled: isAdmin || hasPermission('payrun.read'),
    queryFn: async () => (await api.get('/payroll/payruns', { params: { limit: 5 } })).data.data as any[],
  });

  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const totalNet = payroll.data?.kpis?.total_net_paid ?? 0;
  const currencySymbol = useMemo(() => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value || currency;
    } catch {
      return currency;
    }
  }, [currency]);

  const quickActions = [
    { label: 'Run payroll', icon: <Receipt size={20} />, to: '/payroll/payruns' },
    { label: 'Add employee', icon: <UserPlus size={20} />, to: '/employees' },
    { label: 'Request time off', icon: <Plane size={20} />, to: '/hr/time-off' },
    { label: 'View payslips', icon: <Wallet size={20} />, to: '/payroll/payslips' },
  ];

  const tasks = useMemo(() => {
    const items: { label: string; count: number; to: string }[] = [];
    const pendingTimeOff = hr.data?.kpis?.pending_time_off_requests ?? 0;
    const openRequests = hr.data?.kpis?.open_hr_requests ?? 0;
    const upcomingInterviews = hiring.data?.kpis?.upcoming_interviews ?? 0;
    const draftPayslips = payroll.data?.kpis?.payslips_generated - (payroll.data?.kpis?.payslips_paid ?? 0);
    if (pendingTimeOff > 0) items.push({ label: 'Time off requests to review', count: pendingTimeOff, to: '/hr/time-off' });
    if (openRequests > 0) items.push({ label: 'Open HR requests', count: openRequests, to: '/hr/requests' });
    if (upcomingInterviews > 0) items.push({ label: 'Upcoming interviews', count: upcomingInterviews, to: '/hiring/interviews' });
    if (draftPayslips > 0) items.push({ label: 'Payslips awaiting payment', count: draftPayslips, to: '/payroll/payslips' });
    return items;
  }, [hr.data, hiring.data, payroll.data]);

  const contractTypes = [
    { title: 'Permanent', icon: <DollarSign size={18} />, desc: 'For employees on an ongoing payroll cycle with a fixed salary.' },
    { title: 'Fixed term', icon: <Clock size={18} />, desc: 'For contracts with a defined start and end date.' },
    { title: 'Freelance', icon: <Flag size={18} />, desc: 'For contractors paid per invoice or milestone.' },
  ];

  return (
    <div className="pp-home">
      <h1 className="pp-home__greeting">Hey, {firstName}</h1>

      <div className="pp-home__layout">
        <div className="pp-home__main">
          {/* Quick actions */}
          <section className="pp-panel">
            <div className="pp-panel__head">
              <span className="pp-panel__icon"><Zap size={16} /></span>
              <h2 className="pp-panel__title">Quick actions</h2>
            </div>
            <div className="pp-quick">
              {quickActions.map((a) => (
                <button key={a.label} type="button" className="pp-quick__tile" onClick={() => navigate(a.to)}>
                  <span className="pp-quick__icon">{a.icon}</span>
                  <span className="pp-quick__label">{a.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Balance */}
          <section className="pp-panel">
            <div className="pp-panel__head">
              <span className="pp-panel__icon"><Wallet size={16} /></span>
              <h2 className="pp-panel__title">Payroll balance</h2>
              <button type="button" className="pp-pill pp-pill--ghost" onClick={() => navigate('/payroll/payruns')}>View all</button>
            </div>
            <div className="pp-balance">
              <div className="pp-balance__row">
                <div className="pp-balance__amount">
                  {payroll.isLoading ? (
                    <span className="pp-skeleton" style={{ width: 180, height: 34, display: 'inline-block' }} />
                  ) : showBalance ? (
                    formatMoney(totalNet, currency)
                  ) : (
                    <span className="pp-balance__mask">{currencySymbol}<span>*****</span></span>
                  )}
                  <button type="button" className="pp-balance__eye" onClick={() => setShowBalance((s) => !s)} aria-label="Toggle balance visibility">
                    {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button type="button" className="pp-btn-move" onClick={() => navigate('/payroll/payruns')}>
                  <ArrowLeftRight size={15} /> Move money
                </button>
              </div>
              <div className="pp-balance__chip">
                <span className="pp-balance__ccy">{currency}</span>
              </div>

              <div className="pp-promo">
                <div className="pp-promo__body">
                  <div className="pp-promo__title">Process your next payrun with PeoplePay Flow</div>
                  <p className="pp-promo__text">
                    Generate payslips, approve, and pay your team in a few clicks without spreadsheets or manual reconciliation.
                    <button type="button" className="pp-promo__link" onClick={() => navigate('/payroll/payruns')}>Learn more</button>
                  </p>
                </div>
                <button type="button" className="pp-promo__cta" onClick={() => navigate('/payroll/payruns')}>Start</button>
              </div>
            </div>
          </section>

          {/* Recent payruns */}
          <section className="pp-panel">
            <div className="pp-panel__head">
              <span className="pp-panel__icon"><Receipt size={16} /></span>
              <h2 className="pp-panel__title">Recent payruns</h2>
              <button type="button" className="pp-pill pp-pill--ghost" onClick={() => navigate('/payroll/payruns')}>View all</button>
            </div>
            <div className="pp-recent">
              {payrunsQ.isLoading && (
                <>
                  {[0, 1, 2].map((i) => <div key={i} className="pp-recent__row"><span className="pp-skeleton" style={{ width: '60%', height: 16 }} /><span className="pp-skeleton" style={{ width: 80, height: 16 }} /></div>)}
                </>
              )}
              {!payrunsQ.isLoading && (payrunsQ.data || []).length === 0 && (
                <div className="pp-recent__empty">No payruns yet. Start your first payrun to see it here.</div>
              )}
              {!payrunsQ.isLoading && (payrunsQ.data || []).slice(0, 5).map((r: any) => (
                <button key={r.id} type="button" className="pp-recent__row pp-recent__row--link" onClick={() => navigate(`/payroll/payruns/${r.id}`)}>
                  <span className="pp-recent__left">
                    <span className="pp-recent__avatar"><Receipt size={15} /></span>
                    <span>
                      <span className="pp-recent__name">{r.name || `Payrun ${formatDate(r.period_start)}`}</span>
                      <span className="pp-recent__sub">{r.period_start ? `${formatDate(r.period_start)} to ${formatDate(r.period_end)}` : 'Draft'}</span>
                    </span>
                  </span>
                  <span className="pp-recent__right">
                    <Badge tone={statusTone(r.status)} dot>{humanizeEnum(r.status)}</Badge>
                    <ChevronRight size={16} className="pp-recent__chev" />
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="pp-home__side">
          {/* All tasks */}
          <section className="pp-panel">
            <div className="pp-panel__head">
              <span className="pp-panel__icon"><ListChecks size={16} /></span>
              <h2 className="pp-panel__title">All tasks</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="pp-tasks-empty">
                <TasksIllustration />
                <div className="pp-tasks-empty__title">That is all for today</div>
                <div className="pp-tasks-empty__text">You are all caught up across payroll and people ops.</div>
              </div>
            ) : (
              <div className="pp-tasklist">
                {tasks.map((t) => (
                  <button key={t.label} type="button" className="pp-tasklist__row" onClick={() => navigate(t.to)}>
                    <span className="pp-tasklist__badge">{formatNumber(t.count)}</span>
                    <span className="pp-tasklist__label">{t.label}</span>
                    <ArrowUpRight size={16} className="pp-tasklist__arrow" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Create contract */}
          <section className="pp-panel">
            <div className="pp-panel__head">
              <span className="pp-panel__icon"><FileText size={16} /></span>
              <h2 className="pp-panel__title">Create contract</h2>
            </div>
            <p className="pp-panel__lead">Choose your contracting agreement</p>
            <div className="pp-contract">
              {contractTypes.map((c) => (
                <button key={c.title} type="button" className="pp-contract__row" onClick={() => navigate('/payroll/contracts')}>
                  <span className="pp-contract__icon">{c.icon}</span>
                  <span className="pp-contract__body">
                    <span className="pp-contract__title">{c.title} <Info size={13} className="pp-contract__info" /></span>
                    <span className="pp-contract__desc">{c.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function TasksIllustration() {
  return (
    <svg className="pp-tasks-empty__art" width="180" height="130" viewBox="0 0 180 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="90" cy="118" rx="66" ry="8" fill="var(--pp-primary-50)" />
      <rect x="36" y="44" width="94" height="60" rx="8" fill="var(--pp-primary-100)" />
      <rect x="36" y="44" width="94" height="60" rx="8" stroke="var(--pp-primary-500)" strokeWidth="2" />
      <rect x="30" y="104" width="106" height="8" rx="4" fill="var(--pp-primary-500)" />
      <rect x="48" y="56" width="70" height="36" rx="4" fill="var(--pp-surface)" />
      <path d="M70 74l8 8 16-18" stroke="var(--pp-primary-600)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="132" cy="40" r="14" fill="var(--pp-amber-100)" />
      <path d="M132 34v6l4 3" stroke="var(--pp-amber-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="44" cy="30" r="5" fill="var(--pp-mint-100)" />
      <circle cx="150" cy="80" r="4" fill="var(--pp-sky-100)" />
    </svg>
  );
}
