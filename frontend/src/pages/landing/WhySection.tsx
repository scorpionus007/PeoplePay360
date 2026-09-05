import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import '../../components/Logo.css';
import './WhySection.css';

export function WhySection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'end 0.55'],
  });

  return (
    <section id="why" ref={ref} className="pp-why">
      <div className="pp-why__inner">
        <h2 className="pp-why__heading pp-logo" aria-label="why peoplepay">
          <WhyWord progress={scrollYProgress} index={0} total={2}>
            <span className="pp-logo__weak">why</span>
          </WhyWord>
          <WhyWord progress={scrollYProgress} index={1} total={2}>
            <span className="pp-logo__strong">people</span>
            <span className="pp-logo__weak">pay</span>
          </WhyWord>
        </h2>
        <WhyBody progress={scrollYProgress} />
      </div>
    </section>
  );
}

function WhyWord({
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
  const opacity = useTransform(progress, [start, end], [0.12, 1]);

  return (
    <motion.span className="pp-why__word" style={{ x, opacity }}>
      {children}
    </motion.span>
  );
}

function WhyBody({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.5, 1], [0.18, 1]);
  const y = useTransform(progress, [0.5, 1], [18, 0]);

  return (
    <motion.div className="pp-why__copy" style={{ opacity, y }}>
      <p className="pp-why__lead">
        One platform for every person operation. Payroll, hiring, devices, benefits
        and mobility stay in the same workspace so nothing important lives between
        spreadsheets.
      </p>
      <p className="pp-why__para">
        PeoplePay is built for the work that happens after someone joins, and the
        work that has to be true before they are paid. A requisition becomes an
        offer, an offer becomes a contract, a contract becomes a payrun, and the
        same person record carries devices, leave, claims, loans and visas with it.
        Compensation follows sequenced rules you can read. Money does not move on a
        draft. Time-off balances credit and debit like a ledger, not a sticky note.
        Local amounts still roll up to one organization currency. HR, IT, benefits
        and mobility stop being adjacent tools and start being the same operation,
        with an audit trail that can explain who changed what. That is why the
        surface can stay simple: the record underneath is already complete.
      </p>
    </motion.div>
  );
}
