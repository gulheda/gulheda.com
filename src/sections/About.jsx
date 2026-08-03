import { useLocale } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import Heading from "../components/Heading.jsx";

/* The same restraint as the hero: one left-aligned column, a lead
   line set larger, a pull-quote, and the facts on a hairline row.
   No drop cap, no newspaper columns — those read as magazine
   flourishes and pulled against the rest of the page. */

export default function About() {
  const { t } = useLocale();
  const about = t.about;

  return (
    <section id="about" className="section about">
      <div className="wrap about__inner">
        <Heading eyebrow={about.lead} title={about.heading} index="01" />

        {about.intro && (
          <Reveal>
            <p className="about__intro">{about.intro}</p>
          </Reveal>
        )}

        <div className="about__body">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={0.06 + i * 0.07}>
              <p className="about__p">{p}</p>
            </Reveal>
          ))}
        </div>

        {about.quote && (
          <Reveal delay={0.2}>
            <figure className="about__quote">
              <blockquote className="about__quote-text display">
                {about.quote}
              </blockquote>
            </figure>
          </Reveal>
        )}

        {about.facts?.length > 0 && (
          <Reveal delay={0.26}>
            <ul className="facts">
              {about.facts.map((f) => (
                <li key={f.label} className="facts__item">
                  <span className="facts__value display">{f.value}</span>
                  <span className="facts__label">{f.label}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}
