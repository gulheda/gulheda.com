import { motion } from "framer-motion";
import { useLocale } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import Heading from "../components/Heading.jsx";

export default function Projects() {
  const { t } = useLocale();
  const p = t.projects;

  return (
    <section id="projects" className="section projects">
      <div className="wrap">
        <Heading eyebrow={p.lead} title={p.heading} index="03" />

        <div className="projects__list">
          {p.items.map((item, i) => {
            const hasLink = item.link && item.link !== "#";
            const Tag = hasLink ? motion.a : motion.div;
            return (
              <Reveal key={item.title} delay={0.05 * i} y={40}>
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
                  <span className="project__index">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="project__main">
                    <h3 className="project__name display">{item.title}</h3>
                    {item.context && (
                      <p className="project__context">{item.context}</p>
                    )}
                    {item.role && <p className="project__role">{item.role}</p>}
                    <p className="project__blurb">{item.blurb}</p>
                  </div>

                  <div className="project__side">
                    <ul className="project__tech">
                      {item.tech.map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>
                    {hasLink && (
                      <span className="project__go">
                        {t.ui.view} <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </div>
                </Tag>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
