import { motion } from "framer-motion";
import { useLocale } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import Heading from "../components/Heading.jsx";

const EASE = [0.16, 1, 0.3, 1];

/* one certificate row: the hairline draws itself, then the content
   rises through it — and rows with a document open the real proof */
function CertRow({ c, i }) {
  const Tag = c.href ? motion.a : motion.div;
  return (
    <motion.li
      className="cert-row__wrap"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      transition={{ staggerChildren: 0.12, delayChildren: 0.08 * i }}
    >
      <motion.span
        className="cert-row__line"
        aria-hidden="true"
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1.1, ease: EASE } },
        }}
      />
      <Tag
        className="cert-row"
        data-spot=""
        {...(c.href
          ? {
              href: c.href,
              target: "_blank",
              rel: "noreferrer",
              "data-cursor": "hover",
            }
          : {})}
      >
        <motion.span
          className="cert-row__year"
          variants={{
            hidden: { opacity: 0, x: -14 },
            show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
          }}
        >
          {c.year || "—"}
        </motion.span>
        <motion.span
          className="cert-row__body"
          variants={{
            hidden: { opacity: 0, y: 22 },
            show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
          }}
        >
          <span className="cert-row__name display">{c.name}</span>
          <span className="cert-row__org">{c.org}</span>
        </motion.span>
        {c.href && (
          <motion.span
            className="cert-row__go"
            variants={{
              hidden: { opacity: 0, x: 14 },
              show: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {c.proof} <span aria-hidden="true">↗</span>
          </motion.span>
        )}
      </Tag>
    </motion.li>
  );
}

/* Experience, education and certificates as one editorial timeline —
   a fine gold spine with entries hanging off it. */

function Entry({ item, i }) {
  return (
    <Reveal delay={0.05 * i} y={30} className="entry">
      <span className="entry__node" aria-hidden="true" />
      <p className="entry__period">{item.period}</p>
      <div className="entry__body">
        <h4 className="entry__role">{item.role}</h4>
        <p className="entry__org">{item.org}</p>
        {item.note && <p className="entry__note">{item.note}</p>}
      </div>
    </Reveal>
  );
}

export default function Experience() {
  const { t } = useLocale();
  const x = t.experience;

  return (
    <section id="experience" className="section experience">
      <div className="wrap">
        <Heading eyebrow={x.lead} title={x.heading} index="04" />

        <div className="timeline">
          {x.roles.map((item, i) => (
            <Entry key={item.role + item.org} item={item} i={i} />
          ))}
        </div>

        <Reveal delay={0.1}>
          <h3 className="experience__sub eyebrow eyebrow--code">
            {"// " + x.educationLabel}
          </h3>
        </Reveal>
        <div className="timeline">
          {x.education.map((item, i) => (
            <Entry key={item.role + item.org} item={item} i={i} />
          ))}
        </div>

        <Reveal delay={0.1}>
          <h3 className="experience__sub eyebrow eyebrow--code">
            {"// " + x.certificatesLabel}
          </h3>
        </Reveal>
        <ul className="certs">
          {x.certificates.map((c, i) => (
            <CertRow key={c.name} c={c} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
