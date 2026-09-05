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
    <motion.p className="pp-why__body" style={{ opacity, y }}>
      One platform for every person operation. Payroll, hiring, devices, benefits
      and mobility stay in the same workspace so nothing important lives between
      spreadsheets.
    </motion.p>
  );
}
