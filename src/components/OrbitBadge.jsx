/* A slowly turning ring of type with an arrow at its heart — a small
   designed object that keeps the hero alive and doubles as a second
   route into the collaborate flow. The ring spins forever (CSS), the
   arrow nudges on hover, and reduced-motion stops the spin. */

export default function OrbitBadge({ text, label, onClick }) {
  return (
    <button
      type="button"
      className="orbit"
      onClick={onClick}
      aria-label={label}
      data-cursor="hover"
    >
      <svg viewBox="0 0 100 100" className="orbit__spin" aria-hidden="true">
        <defs>
          <path
            id="orbit-circle"
            d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0"
          />
        </defs>
        <text className="orbit__text">
          <textPath href="#orbit-circle">{text}</textPath>
        </text>
      </svg>
      <span className="orbit__arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}
