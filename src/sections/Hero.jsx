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
import OrbitBadge from "../components/OrbitBadge.jsx";

/* =====================================================================
   HERO — an asymmetric two-column opening.

   Left: the identity — name, role, one line, status, call to action.
   Right: interactive category panels that take the visitor straight
   into the part of the site they came for.

   This replaces the earlier centred nameplate inside a frame: a single
   symmetric block of type on an atmospheric wash read as a card, not
   as a portfolio.
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

  /* the identity column leans a few pixels toward the pointer */
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(mx, { stiffness: 60, damping: 22, mass: 0.6 });
  const tiltY = useSpring(my, { stiffness: 60, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 12);
      my.set((e.clientY / window.innerHeight - 0.5) * 8);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14, delayChildren: 0.9 } },
  };
  const rise = {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 1.4, ease: EASE } },
  };
  const stmtWrap = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
  };
  const stmtPart = {
    hidden: { opacity: 0, y: "0.35em" },
    show: { opacity: 1, y: 0, transition: { duration: 1.3, ease: EASE } },
  };
  const panelsWrap = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 1.5 } },
  };
  const panelV = {
    hidden: { opacity: 0, x: 26 },
    show: { opacity: 1, x: 0, transition: { duration: 1.1, ease: EASE } },
  };

  const go = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });


  return (
    <section id="hero" ref={ref} className="section hero">
      <motion.div
        className="hero__grid wrap"
        style={{ y, opacity: fade }}
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {/* ---------------- left: identity ---------------- */}
        <motion.div className="hero__id" style={{ x: tiltX, y: tiltY }}>
          <motion.p
            className="eyebrow eyebrow--code hero__welcome"
            variants={rise}
          >
            {"// " + identity.welcome}
          </motion.p>

          {/* the name is a masthead credit, not a monument */}
          <motion.h1 className="hero__name" variants={rise}>
            <span className="hero__name-text">{shared.fullName}</span>
            <span className="hero__name-rule" aria-hidden="true" />
            <span className="hero__name-role">{identity.title}</span>
          </motion.h1>

          {/* the large type carries what she does, not who she is */}
          <motion.p
            className="hero__statement display"
            variants={stmtWrap}
            aria-label={identity.statement.map((x) => x.t).join("")}
          >
            {identity.statement.map((part, i) => (
              <motion.span
                key={i}
                className={part.em ? "hero__stmt-em" : "hero__stmt"}
                variants={stmtPart}
                aria-hidden="true"
              >
                {part.t}
              </motion.span>
            ))}
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
            {identity.meta?.focus && (
              <li className="hero__spec-item">{identity.meta.focus}</li>
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
            <OrbitBadge
              text={t.ui.orbit}
              label={t.ui.orbitLabel}
              onClick={() => go("collaborate")}
            />
          </motion.div>
        </motion.div>

        {/* ------------- right: category panels ------------- */}
        <motion.nav
          className="panels"
          variants={panelsWrap}
          aria-label={t.ui.panelsLabel}
        >
          <motion.p className="panels__label" variants={panelV}>
            {t.ui.panelsLabel}
          </motion.p>

          {t.ui.panels.map((p) => (
            <motion.button
              key={p.id}
              type="button"
              className="panel"
              variants={panelV}
              onClick={() => go(p.id)}
              data-spot=""
              data-cursor="hover"
            >
              <span className="panel__ghost" aria-hidden="true">
                {p.k}
              </span>
              <span className="panel__body">
                <span className="panel__title">{p.title}</span>
                <span className="panel__note">{p.note}</span>
              </span>
              <span className="panel__arrow" aria-hidden="true">
                →
              </span>
            </motion.button>
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
