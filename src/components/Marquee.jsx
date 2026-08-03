import { useLocale } from "../i18n.jsx";

/* An endless strip of her stack drifting between the hero and the
   first section — outlined ghost type, constant slow motion. Two
   identical lists inside one track let the -50% translation loop
   without a visible seam. Purely decorative, hidden from readers. */

function Row({ items }) {
  return (
    <ul className="marquee__row">
      {items.map((it, i) => (
        <li key={i} className="marquee__item">
          {it}
          <span className="marquee__dot" aria-hidden="true">
            ·
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  const { shared } = useLocale();
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        <Row items={shared.marquee} />
        <Row items={shared.marquee} />
      </div>
    </div>
  );
}
