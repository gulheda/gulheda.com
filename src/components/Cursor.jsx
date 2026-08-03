import { useEffect, useRef, useState } from "react";

/**
 * A thin gold ring that trails the (fully visible) native cursor and
 * swells over interactive elements. Accent, not replacement — the
 * real pointer is never hidden. Skipped on touch devices.
 */
export default function Cursor() {
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const ring = ringRef.current;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const move = (e) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const over = (e) => {
      const interactive = e.target.closest(
        "a, button, [data-cursor='hover'], input, textarea",
      );
      ring.style.setProperty("--s", interactive ? "1.9" : "1");
      ring.style.setProperty("--o", interactive ? "0.95" : "0.5");
    };

    const loop = () => {
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(var(--s, 1))`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  if (!enabled) return null;

  return <div ref={ringRef} className="cursor-ring" aria-hidden="true" />;
}
