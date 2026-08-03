import "./styles/app.css";
import { MotionConfig } from "framer-motion";

import { lazy, Suspense, useEffect } from "react";
import { LocaleProvider, useLocale } from "./i18n.jsx";
import Cursor from "./components/Cursor.jsx";
import SafeBoundary from "./components/SafeBoundary.jsx";

/* The WebGL atmosphere is purely decorative, so it loads after the
   content rather than blocking first paint. */
const Atmosphere = lazy(() => import("./three/Atmosphere.jsx"));
import Nav from "./components/Nav.jsx";

import Hero from "./sections/Hero.jsx";
import Marquee from "./components/Marquee.jsx";
import About from "./sections/About.jsx";
import Skills from "./sections/Skills.jsx";
import Projects from "./sections/Projects.jsx";
import Experience from "./sections/Experience.jsx";
import Collaborate from "./sections/Collaborate.jsx";
import Contact from "./sections/Contact.jsx";

/* One listener drives every cursor-spotlight on the page: any element
   carrying data-spot gets --mx/--my custom props as the pointer moves. */
function SpotlightDelegate() {
  useEffect(() => {
    const onMove = (e) => {
      const el = e.target.closest?.("[data-spot]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}

function Footer() {
  const { t, shared } = useLocale();
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} {shared.brand} — {t.ui.footer}
      </p>
    </footer>
  );
}

export default function App() {
  return (
    <LocaleProvider>
      <MotionConfig reducedMotion="user">
        {/* decoration must never be able to take the page down */}
        <SafeBoundary>
          <Suspense fallback={null}>
            <Atmosphere />
          </Suspense>
        </SafeBoundary>
        {/* a barely-there drafting grid: structure under the softness */}
        <div className="grid" aria-hidden="true" />
        {/* fine paper grain over everything — the printed-page feel */}
        <div className="paper" aria-hidden="true" />
        <SpotlightDelegate />
        <Cursor />
        <Nav />

        <main>
          <Hero />
          <Marquee />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Marquee />
          <Collaborate />
          <Contact />
        </main>

        <Footer />
      </MotionConfig>
    </LocaleProvider>
  );
}
