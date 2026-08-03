import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { MenuIcon, Hairline } from "./Ornaments.jsx";
import { useLocale } from "../i18n.jsx";
import { LOCALES } from "../data/content.js";

/* A segmented control with a gold pill that slides between the two
   languages — prominent enough to be found immediately, quiet enough
   to belong to the rest of the page. */
function LangSwitch({ className = "" }) {
  const { locale, setLocale, t } = useLocale();
  return (
    <div
      className={`lang ${className}`}
      role="group"
      aria-label={t.ui.langLabel}
    >
      {LOCALES.map((code) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            className={`lang__btn ${isActive ? "is-active" : ""}`}
            onClick={() => setLocale(code)}
            aria-pressed={isActive}
            lang={code}
          >
            {isActive && (
              <motion.span
                className="lang__pill"
                layoutId="lang-pill"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span className="lang__code">{code.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useLocale();
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  const [active, setActive] = useState("hero");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* scrollspy: whichever section owns the middle of the screen lights up */
  useEffect(() => {
    const ids = t.nav.map((n) => n.id);
    const pick = () => {
      const mid = window.innerHeight / 2;
      let best = ids[0];
      let bestDist = Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const dist = Math.abs(r.top + r.height / 2 - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = id;
        }
      }
      setActive(best);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    window.addEventListener("resize", pick);
    return () => {
      window.removeEventListener("scroll", pick);
      window.removeEventListener("resize", pick);
    };
  }, [t.nav]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.div className="nav__progress" style={{ scaleX: bar }} />

      <header className={`nav ${scrolled ? "nav--solid" : ""}`}>
        <div className="nav__left">
          <LangSwitch />
        </div>

        <nav className="nav__links" aria-label="Primary">
          {t.nav.map((n) => (
            <button
              key={n.id}
              className={`nav__link ${active === n.id ? "is-active" : ""}`}
              onClick={() => go(n.id)}
              aria-current={active === n.id ? "true" : undefined}
            >
              {n.label}
              {active === n.id && (
                <motion.span
                  className="nav__link-underline"
                  layoutId="nav-underline"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                />
              )}
            </button>
          ))}
        </nav>

        <button
          className="nav__toggle gold-text"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <MenuIcon open={open} />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="menu__inner">
              {t.nav.map((n, i) => (
                <motion.button
                  key={n.id}
                  className="menu__link display"
                  onClick={() => go(n.id)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.07 * i + 0.1,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <span className="menu__idx gold-text">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {n.label}
                </motion.button>
              ))}
              <Hairline className="menu__orn gold-text" width={220} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
