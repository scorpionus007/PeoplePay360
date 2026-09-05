import { memo, useState } from 'react';
import clsx from 'clsx';
import './FocusCards.css';

export type FocusCardItem = {
  title: string;
  src?: string;
  summary?: string;
};

/**
 * Focus Cards — hover one card, blur the rest.
 * Recreated from Aceternity UI (no Tailwind).
 * https://ui.aceternity.com/components/focus-cards
 */
const Card = memo(function Card({
  card,
  index,
  hovered,
  setHovered,
}: {
  card: FocusCardItem;
  index: number;
  hovered: number | null;
  setHovered: (index: number | null) => void;
}) {
  const dim = hovered !== null && hovered !== index;
  const active = hovered === index;

  return (
    <article
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={clsx(
        'pp-focus-card',
        index % 2 === 0 ? 'pp-focus-card--lavender' : 'pp-focus-card--white',
        dim && 'pp-focus-card--dim',
        active && 'pp-focus-card--active',
      )}
    >
      {card.src ? (
        <img className="pp-focus-card__image" src={card.src} alt="" />
      ) : null}
      <div className="pp-focus-card__body">
        <h3 className="pp-focus-card__title">{card.title}</h3>
        {card.summary ? <p className="pp-focus-card__summary">{card.summary}</p> : null}
      </div>
    </article>
  );
});

export function FocusCards({ cards }: { cards: FocusCardItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="pp-focus-cards">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
