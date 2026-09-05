import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import './skiper23.css';

export type Skiper23Item = {
  title: string;
  summary: string;
  details: string[];
  tone?: string;
};

/**
 * Skiper 23 — Minimal card expand
 * Inspired by Family app / jakub.kr · https://skiper-ui.com/v1/skiper23
 * Attribution to Skiper UI required on the free version.
 */
export function Skiper23({ items }: { items: Skiper23Item[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  return (
    <div ref={rootRef} className="skiper23">
      {items.map((item, index) => {
        const expanded = open === index;
        return (
          <motion.button
            layout
            type="button"
            key={item.title}
            className={clsx('skiper23-card', expanded && 'skiper23-card--open')}
            style={item.tone ? { ['--skiper23-tone' as string]: item.tone } : undefined}
            onClick={() => setOpen(expanded ? null : index)}
            aria-expanded={expanded}
          >
            <div className="skiper23-card__top">
              <div className="skiper23-card__title">{item.title}</div>
              <div className="skiper23-card__summary">{item.summary}</div>
            </div>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.ul
                  className="skiper23-card__details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  {item.details.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
