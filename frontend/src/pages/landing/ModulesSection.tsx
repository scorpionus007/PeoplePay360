import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Skiper23 } from '../../components/v1/skiper23';
import '../../components/Logo.css';
import './ModulesSection.css';

const MODULES = [
  {
    title: 'Payroll',
    summary: 'Salary structures, sequenced rules, contracts, payruns and payslips, with a two-step check before funds move.',
    details: ['Period-based contracts', 'Rule order you can read', 'Warnings before validate'],
    tone: '#e9e3f7',
  },
  {
    title: 'Hiring',
    summary: 'Requisitions through offers and referrals, so the pipeline is one conversation instead of five tools.',
    details: ['Pipeline stages', 'Interview feedback', 'Employee referrals'],
    tone: '#e9e3f7',
  },
  {
    title: 'IT',
    summary: 'Device inventory, software catalog, baseline posture and onboarding kits, assigned to the person not a spreadsheet.',
    details: ['Device assignment', 'Baseline controls', 'EDR event channel'],
    tone: '#e9e3f7',
  },
  {
    title: 'Mobility',
    summary: 'Visas, relocations, immigration and travel as first-class workflows next to payroll and HR.',
    details: ['Visa lifecycle', 'Relocation budget', 'Travel approvals'],
    tone: '#e9e3f7',
  },
  {
    title: 'Benefits',
    summary: 'Plans, enrollments, claims, loans and vouchers with an approval path on every exception.',
    details: ['Enrollment approvals', 'Claim reimbursement', 'Loan recovery on the same person record'],
    tone: '#e9e3f7',
  },
  {
    title: 'HR',
    summary: 'Schedules, attendance, time off, feedback and requests, with balances that actually debit and credit.',
    details: ['Transactional leave balances', 'Anonymous feedback', 'People requests in one queue'],
    tone: '#e9e3f7',
  },
];

export function ModulesSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  });

  return (
    <section id="modules" ref={ref} className="pp-modules">
      <div className="pp-modules__inner">
        <h2 className="pp-modules__heading pp-logo" aria-label="our modules">
          <ModuleWord progress={scrollYProgress} index={0} total={2}>
            <span className="pp-logo__weak">our</span>
          </ModuleWord>
          <ModuleWord progress={scrollYProgress} index={1} total={2}>
            <span className="pp-logo__strong">modules</span>
          </ModuleWord>
        </h2>
        <div className="pp-modules__cards">
          <Skiper23 items={MODULES} />
        </div>
      </div>
    </section>
  );
}

function ModuleWord({
  children,
  progress,
  index,
  total,
}: {
  children: ReactNode;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const start = (index / total) * 0.45;
  const end = start + 0.35;
  const x = useTransform(progress, [start, end], [36, 0]);
  return (
    <motion.span className="pp-modules__word" style={{ x }}>
      {children}
    </motion.span>
  );
}
