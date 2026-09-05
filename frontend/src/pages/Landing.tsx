import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  Banknote,
  Calendar,
  Handshake,
  Laptop,
  Plane,
  Sparkles,
  ShieldCheck,
  Globe2,
  BadgeCheck,
  Zap,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Logo } from '../components/Logo';
import { Button } from '../components/Button';
import './Landing.css';

export function LandingPage() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="pp-landing">
      <header className="pp-landing__nav">
        <div className="pp-landing__nav-inner">
          <Logo size={28} />
          <nav className="pp-landing__nav-links" aria-label="Primary">
            <a href="#modules">Modules</a>
            <a href="#why">Why PeoplePay360</a>
            <a href="#roles">For every role</a>
            <a href="#stack">Under the hood</a>
          </nav>
          <div className="pp-landing__nav-cta">
            <Link to="/login" className="pp-landing__nav-link">Sign in</Link>
            <Link to="/login"><Button size="sm" rightIcon={<ArrowRight size={14} />}>Enter workspace</Button></Link>
          </div>
        </div>
      </header>

      <section className="pp-landing__hero">
        <div className="pp-landing__hero-glow" />
        <div className="pp-landing__hero-inner">
          <div className="pp-landing__hero-eyebrow">
            <BadgeCheck size={14} /> Odoo Hackathon 2026 &middot; HR + Payroll platform
          </div>
          <h1 className="pp-landing__hero-title">
            One platform for every<br />person operation.
          </h1>
          <p className="pp-landing__hero-body">
            Run global payroll, orchestrate hiring, ship devices, manage benefits and international mobility,
            and keep every module in sync. Six modules, one workspace, real time.
          </p>
          <div className="pp-landing__hero-cta">
            <Link to="/login"><Button size="lg" rightIcon={<ArrowRight size={16} />}>Enter workspace</Button></Link>
            <a href="/api/docs" target="_blank" rel="noreferrer"><Button size="lg" variant="secondary" leftIcon={<BookOpen size={16} />}>API docs</Button></a>
          </div>
          <div className="pp-landing__hero-badges">
            <span><ShieldCheck size={13} /> JWT auth &middot; RBAC</span>
            <span><Globe2 size={13} /> Multi currency</span>
            <span><Zap size={13} /> Live payroll compute</span>
            <span><Sparkles size={13} /> 300+ API endpoints</span>
          </div>
        </div>
        <div className="pp-landing__hero-mark" aria-hidden="true">
          <Logo variant="mark" size={340} />
        </div>
      </section>

      <section id="modules" className="pp-landing__section">
        <div className="pp-landing__section-inner">
          <div className="pp-landing__section-eyebrow">Six modules, one platform</div>
          <h2 className="pp-landing__section-title">The complete people operations surface.</h2>
          <p className="pp-landing__section-lead">
            Every workflow from hire to retire, backed by one source of truth. No more spreadsheets between
            Payroll, HR, and IT.
          </p>
          <div className="pp-landing__modules">
            {MODULES.map((m) => (
              <article key={m.title} className="pp-landing__module">
                <div className="pp-landing__module-icon"><m.icon size={20} /></div>
                <h3 className="pp-landing__module-title">{m.title}</h3>
                <p className="pp-landing__module-body">{m.body}</p>
                <ul className="pp-landing__module-list">
                  {m.bullets.map((b) => (<li key={b}>{b}</li>))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="pp-landing__section pp-landing__section--dark">
        <div className="pp-landing__section-inner">
          <div className="pp-landing__section-eyebrow pp-landing__section-eyebrow--onDark">Built for scale</div>
          <h2 className="pp-landing__section-title pp-landing__section-title--onDark">Real business logic. Not a mockup.</h2>
          <p className="pp-landing__section-lead pp-landing__section-lead--onDark">
            Period based contracts, sequenced salary rules, warnings before you validate a payrun,
            transactional balance accounting for time off, and end to end audit trails.
          </p>
          <div className="pp-landing__stats">
            <Stat n="300+" label="API operations" />
            <Stat n="6" label="Modules shipped" />
            <Stat n="55" label="Swagger tag groups" />
            <Stat n="20+" label="Passing unit tests" />
          </div>
        </div>
      </section>

      <section id="roles" className="pp-landing__section">
        <div className="pp-landing__section-inner">
          <div className="pp-landing__section-eyebrow">For every role</div>
          <h2 className="pp-landing__section-title">Purpose built views for the people who run the org.</h2>
          <div className="pp-landing__roles">
            {ROLES.map((r) => (
              <div key={r.role} className="pp-landing__role">
                <div className="pp-landing__role-role">{r.role}</div>
                <div className="pp-landing__role-body">{r.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stack" className="pp-landing__section">
        <div className="pp-landing__section-inner">
          <div className="pp-landing__section-eyebrow">Under the hood</div>
          <h2 className="pp-landing__section-title">Modern, modular, and secure by default.</h2>
          <div className="pp-landing__stack">
            <StackCard title="Backend" body="Node.js and Express with Sequelize on PostgreSQL. Modular MVC per module." />
            <StackCard title="Frontend" body="React 18, TypeScript, Vite. TanStack Query for server state, custom design system in vanilla CSS." />
            <StackCard title="Auth" body="JWT access with rotating refresh tokens, bcrypt hashed passwords, roles plus permissions." />
            <StackCard title="AI" body="Python microservice for chat and support automations, integrated over HTTP (later push)." />
          </div>
        </div>
      </section>

      <section className="pp-landing__cta">
        <div className="pp-landing__cta-inner">
          <Logo variant="mark" size={80} />
          <h2 className="pp-landing__cta-title">Ready to run your organization?</h2>
          <p className="pp-landing__cta-body">Sign in with the demo workspace to explore payroll, HR, IT, benefits, hiring and mobility end to end.</p>
          <div className="pp-landing__cta-buttons">
            <Link to="/login"><Button size="lg" rightIcon={<ArrowRight size={16} />}>Enter workspace</Button></Link>
            <a href="https://github.com/scorpionus007/PeoplePay360" target="_blank" rel="noreferrer">
              <Button size="lg" variant="secondary" leftIcon={<MessageSquare size={16} />}>View on GitHub</Button>
            </a>
          </div>
        </div>
      </section>

      <footer className="pp-landing__footer">
        <div className="pp-landing__footer-inner">
          <Logo size={22} />
          <div className="pp-landing__footer-links">
            <a href="#modules">Modules</a>
            <a href="/api/docs" target="_blank" rel="noreferrer">API</a>
            <a href="https://github.com/scorpionus007/PeoplePay360" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <div className="pp-landing__footer-legal">Odoo Hackathon 2026 &middot; PeoplePay360</div>
        </div>
      </footer>
    </div>
  );
}

const MODULES = [
  {
    icon: Banknote,
    title: 'Payroll',
    body: 'Salary structures, rules, contracts, payruns, payslips, multi currency, advance salary, bonuses.',
    bullets: ['Two step payrun wizard', 'PDF payslips', 'Rule based computation'],
  },
  {
    icon: Calendar,
    title: 'HR',
    body: 'Working schedules, attendance, time off, feedback, HR requests, AI chat, announcements.',
    bullets: ['Transactional leave balances', 'Anonymous feedback', 'Employee to HR chat'],
  },
  {
    icon: Sparkles,
    title: 'Benefits',
    body: 'Insurance, wellness, gift vouchers, retirement, loans, discount partners, dependents.',
    bullets: ['Enrollment approvals', 'Claim reimbursement', 'Loan EMI recovery'],
  },
  {
    icon: Handshake,
    title: 'Hiring',
    body: 'Requisitions, postings, candidates, applications, interviews, offers, referrals.',
    bullets: ['Pipeline stages', 'Interview feedback', 'Employee referrals'],
  },
  {
    icon: Laptop,
    title: 'IT Administration',
    body: 'Device inventory, software catalog, baseline controls, EDR events, onboarding kits.',
    bullets: ['Device assignment', 'Baseline posture', 'EDR integrations'],
  },
  {
    icon: Plane,
    title: 'Mobility',
    body: 'Location standards, visa sponsorships, relocations, immigration, business travel.',
    bullets: ['Visa lifecycle', 'Relocation budget', 'Travel approvals'],
  },
];

const ROLES = [
  { role: 'Admin', body: 'Full control across every module. Approves salary changes and policy.' },
  { role: 'HR Manager', body: 'Reads every module, owns HR, chats with department leads.' },
  { role: 'HR', body: 'Department scoped HR, benefits, and mobility operations.' },
  { role: 'Payroll Manager', body: 'CRUD salary, structures, rules, and decides increments.' },
  { role: 'Payroll User', body: 'Reads payroll and releases validated funds.' },
  { role: 'IT Admin', body: 'Owns device fleet, software, baselines, and EDR channel.' },
  { role: 'Talent Acquisition Lead', body: 'Owns hiring end to end and accepts referrals.' },
  { role: 'Employee', body: 'Self service check ins, requests, referrals, and claims.' },
];

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="pp-landing__stat">
      <div className="pp-landing__stat-n">{n}</div>
      <div className="pp-landing__stat-label">{label}</div>
    </div>
  );
}

function StackCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="pp-landing__stack-card">
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
