import { useEffect, useRef } from "react";
import { motion, useMotionValue } from "framer-motion";
import { useLocale } from "../i18n.jsx";

/* 0 → 1 over [a, b], clamped */
const ramp = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));

export default function Contact() {
  const ref = useRef(null);
  const { t, shared } = useLocale();
  const c = t.contact;

  /* Progress is measured by hand from the live element rect, exactly the
     way the shader gate does it. framer's useScroll caches the target's
     offsets at mount, and by the time the lazy sections above have grown
     the page those offsets are stale — which faded the text back OUT at
     the very bottom. The text settles at ~60% of the runway, then stays. */
  const opacity = useMotionValue(0);
  const y = useMotionValue(46);
  const hintFade = useMotionValue(1);

  useEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      opacity.set(ramp(p, 0.3, 0.58));
      y.set(46 * (1 - ramp(p, 0.3, 0.6)));
      hintFade.set(1 - ramp(p, 0, 0.12));
    };
    /* driven by rAF, not scroll events: one rect read per frame is
       negligible, and it stays correct even when scroll events are
       swallowed (embedded browsers, some touch/zoom states) */
    let raf = requestAnimationFrame(function loop() {
      read();
      raf = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(raf);
  }, [opacity, y, hintFade]);

  return (
    <section id="contact" ref={ref} className="section contact">
      <div className="contact__sticky">
        <motion.div className="contact__content" style={{ opacity, y }}>
          <p className="eyebrow eyebrow--code contact__eyebrow">
            {"// " + c.lead}
          </p>
          <h2 className="contact__title display">{c.invitation}</h2>

          <div className="rule contact__rule" aria-hidden="true">
            <span className="rule__line rule__line--l" />
            <span className="rule__gem" />
            <span className="rule__line rule__line--r" />
          </div>

          <a
            className="contact__email display"
            href={`mailto:${shared.email}`}
            data-cursor="hover"
          >
            {shared.email}
          </a>

          {shared.phone && (
            <a className="contact__phone" href={`tel:${shared.phone.replace(/\s/g, "")}`}>
              {shared.phone}
            </a>
          )}

          <ul className="contact__socials">
            {c.socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  data-cursor="hover"
                  className="contact__social"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="contact__sign">
            {shared.fullName} · {t.identity.title}
          </p>
          <p className="contact__copy">© {new Date().getFullYear()}</p>
        </motion.div>

        <motion.p className="contact__hint" style={{ opacity: hintFade }}>
          {t.ui.gateHint}
        </motion.p>
      </div>
    </section>
  );
}
