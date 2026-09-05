import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Skiper16 } from '../../components/v1/skiper16';
import '../../components/Logo.css';
import './HoodSection.css';

const CAPABILITIES = [
  {
    indexLabel: '01',
    title: 'Sequenced rules',
    body: 'Compensation logic runs in a declared order. What applied, and what was skipped, is always reconstructable.',
  },
  {
    indexLabel: '02',
    title: 'Validate, then release',
    body: 'Money does not move on a draft. A payrun has to be checked, then confirmed, before anything is considered complete.',
  },
  {
    indexLabel: '03',
    title: 'Permissioned actions',
    body: 'Every write is gated by role. Reading a record and changing it are different privileges, not different screens.',
  },
  {
    indexLabel: '04',
    title: 'An audit that holds',
    body: 'Who changed a contract, a balance, a device assignment or an offer is stored with the record, not in a side channel.',
  },
  {
    indexLabel: '05',
    title: 'Balances that settle',
    body: 'Time off is not a number on a card. Credits and debits post together so the ledger cannot drift from the calendar.',
  },
  {
    indexLabel: '06',
    title: 'One base, many currencies',
    body: 'Amounts can be entered in local currency and still roll up to a single organization base without a parallel workbook.',
  },
];

export function HoodSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  });

  return (
    <section id="hood" ref={ref} className="pp-hood">
      <div className="pp-hood__inner">
        <h2 className="pp-hood__heading pp-logo" aria-label="under the hood">
          <HoodWord progress={scrollYProgress} index={0} total={2}>
            <span className="pp-logo__weak">under the</span>
          </HoodWord>
          <HoodWord progress={scrollYProgress} index={1} total={2}>
            <span className="pp-logo__strong">hood</span>
          </HoodWord>
        </h2>
        <p className="pp-hood__body">What has to be true for the surface to stay simple.</p>
      </div>
      <Skiper16 projects={CAPABILITIES} />
    </section>
  );
}

function HoodWord({
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
    <motion.span className="pp-hood__word" style={{ x }}>
      {children}
    </motion.span>
  );
}
