import { motion } from "framer-motion";

/* Progress indicator: a gold spine that fills as the visitor advances,
   with the step names beside it. Announced politely to assistive tech. */

export default function Stepper({ steps, current, label }) {
  const pct = ((current + 1) / steps.length) * 100;

  return (
    <div className="stepper">
      <p className="stepper__count" aria-live="polite">
        {label}
      </p>

      <div
        className="stepper__track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={current + 1}
        aria-valuetext={label}
      >
        <motion.span
          className="stepper__fill"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ol className="stepper__labels">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`stepper__label ${
              i === current ? "is-current" : i < current ? "is-done" : ""
            }`}
            aria-current={i === current ? "step" : undefined}
          >
            <span className="stepper__num">{String(i + 1).padStart(2, "0")}</span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}
