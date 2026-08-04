import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocale } from "../i18n.jsx";

export default function Contact() {
  const ref = useRef(null);
  const { t, shared } = useLocale();
  const c = t.contact;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  /* the text settles well before the scroll ends, then simply stays —
     the tail of the section changes nothing on screen */
  const opacity = useTransform(scrollYProgress, [0.3, 0.58], [0, 1]);
  const y = useTransform(scrollYProgress, [0.3, 0.6], [46, 0]);
  const hintFade = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

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
