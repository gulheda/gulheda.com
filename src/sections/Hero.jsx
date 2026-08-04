import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { useLocale } from "../i18n.jsx";

/* =====================================================================
   HERO — the threshold, mirrored.

   The site now opens the way it closes: a centred cinematic composition
   in the language of the contact section she loves — mono eyebrow, the
   NAME large, the hairline-and-diamond rule, the profession in spaced
   capitals, an italic line, and a quiet horizontal index into the site.
   The work speaks in the sections; the front door carries the person.
   ===================================================================== */

const EASE = [0.16, 1, 0.3, 1];

export default function Hero() {
  const ref = useRef(null);
  const { t, shared } = useLocale();
  const identity = t.identity;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cueFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  /* the whole composition leans a few pixels toward the pointer */
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(mx, { stiffness: 60, damping: 22, mass: 0.6 });
  const tiltY = useSpring(my, { stiffness: 60, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 10);
      my.set((e.clientY / window.innerHeight - 0.5) * 7);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.16, delayChildren: 1.0 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 1.4, ease: EASE } },
  };

  const go = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="hero" ref={ref} className="section hero">
      <div className="hero__glow" aria-hidden="true" />

      <motion.div
        className="hero__center wrap"
        style={{ y, opacity: fade, x: tiltX }}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.p className="eyebrow eyebrow--code hero__welcome" variants={rise}>
          {"// " + identity.welcome}
        </motion.p>

        {/* the name carries the page now */}
        <motion.h1 className="hero__bigname display" variants={rise}>
          {shared.fullName}
        </motion.h1>

        <motion.div className="rule hero__rule" variants={rise} aria-hidden="true">
          <span className="rule__line rule__line--l" />
          <span className="rule__gem" />
          <span className="rule__line rule__line--r" />
        </motion.div>

        <motion.p className="hero__role" variants={rise}>
          {identity.title}
        </motion.p>

        <motion.p className="hero__tag" variants={rise}>
          {identity.tagline}
        </motion.p>

        <motion.ul className="hero__spec" variants={rise}>
          {identity.meta?.status && (
            <li className="hero__spec-item hero__spec-item--status">
              <span className="hero__dot" aria-hidden="true" />
              {identity.meta.status}
            </li>
          )}
        </motion.ul>

        <motion.div className="hero__actions" variants={rise}>
          <a
            className="hero__cta"
            href="#collaborate"
            data-cursor="hover"
            onClick={(e) => {
              e.preventDefault();
              go("collaborate");
            }}
          >
            <span className="hero__cta-text">{t.ui.heroCta}</span>
            <span className="hero__cta-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </motion.div>

        {/* a quiet horizontal index into the site, like the socials row */}
        <motion.nav
          className="hero__dirs"
          variants={rise}
          aria-label={t.ui.panelsLabel}
        >
          {t.ui.panels.map((p) => (
            <button
              key={p.id}
              type="button"
              className="hero__dir"
              onClick={() => go(p.id)}
              data-cursor="hover"
            >
              <span className="hero__dir-k" aria-hidden="true">
                {p.k}
              </span>
              {p.title}
            </button>
          ))}
        </motion.nav>
      </motion.div>

      <motion.div
        className="hero__cue-wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.4, duration: 1.2, ease: "easeOut" }}
      >
        <motion.a
          href="#about"
          className="hero__cue"
          style={{ opacity: cueFade }}
          onClick={(e) => {
            e.preventDefault();
            go("about");
          }}
          aria-label="Scroll down"
        >
          <span className="hero__cue-label">{t.ui.scroll}</span>
          <span className="hero__cue-track" aria-hidden="true">
            <span className="hero__cue-bead" />
          </span>
        </motion.a>
      </motion.div>
    </section>
  );
}
