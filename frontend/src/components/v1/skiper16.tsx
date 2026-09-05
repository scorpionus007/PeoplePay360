import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import './skiper16.css';

export type StickyCardProject = {
  title: string;
  body: string;
  indexLabel: string;
};

/**
 * Skiper 16 — Card stack scroll
 * https://skiper-ui.com/v1/skiper16
 * Attribution to Skiper UI required on the free version.
 */
export function StickyCard_001({
  i,
  title,
  body,
  indexLabel,
  progress,
  range,
  targetScale,
}: {
  i: number;
  title: string;
  body: string;
  indexLabel: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}) {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="skiper16-slot" style={{ top: 88 + i * 18 }}>
      <motion.article
        className="skiper16-card"
        style={{ scale, transformOrigin: 'top center' }}
      >
        <div className="skiper16-card__index">{indexLabel}</div>
        <h3 className="skiper16-card__title">{title}</h3>
        <p className="skiper16-card__body">{body}</p>
      </motion.article>
    </div>
  );
}

export function Skiper16({ projects }: { projects: StickyCardProject[] }) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <div ref={container} className="skiper16">
      {projects.map((project, i) => {
        const targetScale = Math.max(0.5, 1 - (projects.length - i - 1) * 0.1);
        return (
          <StickyCard_001
            key={project.title}
            i={i}
            {...project}
            progress={scrollYProgress}
            range={[i * 0.18, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </div>
  );
}
