import { motion } from "framer-motion";
import { useLocale } from "../i18n.jsx";
import Heading from "../components/Heading.jsx";

const EASE = [0.16, 1, 0.3, 1];

/* Each project row enters like a page being ruled: the hairline draws
   itself across and the content rises through the fresh line —
   staggered, once, on first view. */
function ProjectRow({ item, viewLabel }) {
  const hasLink = item.link && item.link !== "#";
  const Tag = hasLink ? motion.a : motion.div;

  return (
    <motion.div
      className="project__wrap"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.14 }}
    >
      <motion.span
        className="project__topline"
        aria-hidden="true"
        variants={{
          hidden: { scaleX: 0 },
          show: { scaleX: 1, transition: { duration: 1.2, ease: EASE } },
        }}
      />
      <Tag
        className="project"
        data-spot=""
        {...(hasLink
          ? {
              href: item.link,
              target: "_blank",
              rel: "noreferrer",
              "data-cursor": "hover",
            }
          : {})}
      >
        <motion.div
          className="project__main"
          variants={{
            hidden: { opacity: 0, y: 28 },
            show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
          }}
        >
          <h3 className="project__name display">{item.title}</h3>
          {item.context && <p className="project__context">{item.context}</p>}
          {item.role && <p className="project__role">{item.role}</p>}
          <p className="project__blurb">{item.blurb}</p>
        </motion.div>

        <motion.div
          className="project__side"
          variants={{
            hidden: { opacity: 0, y: 28 },
            show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
          }}
        >
          <ul className="project__tech">
            {item.tech.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
          {hasLink && (
            <span className="project__go">
              {viewLabel} <span aria-hidden="true">→</span>
            </span>
          )}
        </motion.div>
      </Tag>
    </motion.div>
  );
}

export default function Projects() {
  const { t } = useLocale();
  const p = t.projects;

  return (
    <section id="projects" className="section projects">
      <div className="wrap">
        <Heading eyebrow={p.lead} title={p.heading} index="03" />

        <div className="projects__list">
          {p.items.map((item) => (
            <ProjectRow key={item.title} item={item} viewLabel={t.ui.view} />
          ))}
        </div>
      </div>
    </section>
  );
}
