import { motion } from "framer-motion";

/* One heading treatment shared by every section, so the whole site
   animates in the same language as the hero: a code-comment eyebrow,
   a title revealed word by word as light rises through it, and a rule
   that draws outward from a turning diamond.

   Words, not letters: section titles are phrases, and animating single
   letters both broke words across lines and pushed them outside narrow
   viewports. The hero keeps its per-letter treatment for the wordmark. */

const EASE = [0.16, 1, 0.3, 1];

const wrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.16 } },
};

const eyebrowV = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: EASE } },
};

const titleWrap = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

const wordV = {
  hidden: { y: "0.4em", clipPath: "inset(106% 0% -8% 0%)", opacity: 0 },
  show: {
    y: 0,
    clipPath: "inset(-8% 0% -8% 0%)",
    opacity: 1,
    transition: { duration: 1.5, ease: EASE },
  },
};

/* a single hairline drawing out from the left — the same restraint
   the hero uses under the name */
const barV = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.2, ease: EASE } },
};

export default function Heading({
  eyebrow,
  title,
  index,
  align = "left",
  className = "",
}) {
  const words = title.split(" ");

  return (
    <motion.div
      className={`heading heading--${align} ${className}`}
      variants={wrap}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
    >
      {index && (
        <span className="heading__index" aria-hidden="true">
          {index}
        </span>
      )}
      {eyebrow && (
        <motion.p className="eyebrow eyebrow--code" variants={eyebrowV}>
          {"// " + eyebrow}
        </motion.p>
      )}

      <motion.h2
        className="heading__title display"
        variants={titleWrap}
        aria-label={title}
      >
        {words.map((w, i) => (
          <span className="heading__word" key={i} aria-hidden="true">
            <motion.span className="heading__word-in" variants={wordV}>
              {w}
            </motion.span>
          </span>
        ))}
      </motion.h2>

      <motion.div className="heading__bar" variants={barV} aria-hidden="true" />
    </motion.div>
  );
}
