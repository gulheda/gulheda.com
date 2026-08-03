import { motion } from "framer-motion";

/**
 * Fade + gentle rise as the element scrolls into view. Slow, eased, single
 * shot — never bounces. Honors reduced-motion automatically via framer.
 */
export default function Reveal({
  children,
  as = "div",
  delay = 0,
  y = 26,
  className = "",
  once = true,
  ...rest
}) {
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.35 }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </M>
  );
}
