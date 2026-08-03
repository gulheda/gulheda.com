import { useLocale } from "../i18n.jsx";
import Reveal from "../components/Reveal.jsx";
import Heading from "../components/Heading.jsx";

export default function Skills() {
  const { t } = useLocale();
  const s = t.skills;

  return (
    <section id="skills" className="section skills">
      <div className="wrap">
        <Heading eyebrow={s.lead} title={s.heading} index="02" />

        <div className="skills__grid">
          {s.groups.map((group, gi) => (
            <Reveal
              key={group.group}
              delay={0.06 * gi}
              className="skillcard"
              data-spot=""
              data-cursor="hover"
            >
              <div className="skillcard__head">
                <span className="skillcard__numeral">
                  {String(gi + 1).padStart(2, "0")}
                </span>
                <h3 className="skillcard__name">{group.group}</h3>
              </div>
              <ul className="skillcard__list">
                {group.items.map((it) => (
                  <li key={it} className="chip">
                    {it}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
