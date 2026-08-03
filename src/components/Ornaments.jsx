/* Minimal architectural details only — no figurative drawing.
   The atmosphere carries the mood; these stay quiet and precise. */

/* A thin gold rule with a single diamond at centre. */
export function Hairline({ width = 220, className = "" }) {
  return (
    <svg
      className={className}
      width={width}
      height="9"
      viewBox="0 0 220 9"
      fill="none"
      aria-hidden="true"
    >
      <line x1="0" y1="4.5" x2="102" y2="4.5" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
      <rect x="106.5" y="1" width="7" height="7" transform="rotate(45 110 4.5)" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.9" />
      <line x1="118" y1="4.5" x2="220" y2="4.5" stroke="currentColor" strokeWidth="0.75" opacity="0.55" />
    </svg>
  );
}

export function MenuIcon({ open = false, size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line
        x1="4"
        y1={open ? "13" : "9"}
        x2="22"
        y2={open ? "13" : "9"}
        style={{
          transform: open ? "rotate(45deg)" : "none",
          transformOrigin: "13px 13px",
          transition: "transform .45s var(--ease-silk)",
        }}
      />
      <line
        x1="4"
        y1={open ? "13" : "17"}
        x2="22"
        y2={open ? "13" : "17"}
        style={{
          transform: open ? "rotate(-45deg)" : "none",
          transformOrigin: "13px 13px",
          transition: "transform .45s var(--ease-silk)",
        }}
      />
    </svg>
  );
}
