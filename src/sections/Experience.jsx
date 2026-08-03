import { useLocale } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import Heading from "../components/Heading.jsx";

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
            <Reveal
              as="li"
              key={c.name}
              delay={0.04 * i}
              y={22}
              className="cert"
              data-spot=""
            >
              <span className="cert__name">{c.name}</span>
              <span className="cert__org">{c.org}</span>
              {c.year && <span className="cert__year">{c.year}</span>}
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
