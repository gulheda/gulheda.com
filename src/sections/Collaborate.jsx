import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../i18n.jsx";
import { collaborate, detectTech } from "../data/collaborate.js";
import { submitInquiry, isDemo } from "../services/submitInquiry.js";
import Heading from "../components/Heading.jsx";

/* =====================================================================
   "Birlikte Ne Geliştirebiliriz?" — deliberately simple.

   One glance, one form: pick a topic if you like, write a few
   sentences, leave your name and e-mail, send. The left column keeps
   it human — what to expect, and a direct e-mail address for people
   who prefer their own mail client. No steps, no wizardry.
   ===================================================================== */

const EASE = [0.16, 1, 0.3, 1];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MIN_MSG = 10;

const EMPTY = {
  topic: "",
  message: "",
  name: "",
  email: "",
  org: "",
  trap: "", // honeypot
};

export default function Collaborate() {
  const { locale, shared } = useLocale();
  const d = collaborate[locale];
  const c = d.simple;

  const [a, setA] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [copied, setCopied] = useState(false);
  const [delivered, setDelivered] = useState(false);

  const detected = useMemo(() => detectTech(a.message), [a.message]);
  const topic = c.topics.find((t) => t.id === a.topic);

  const set = (key) => (val) => {
    setA((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onInput = (key) => (e) => set(key)(e.target.value);

  const validate = () => {
    const e = {};
    if (!a.name.trim()) e.name = d.errors.name;
    if (!EMAIL_RE.test(a.email.trim())) e.email = d.errors.email;
    if (a.message.trim().length < MIN_MSG) e.message = d.errors.message;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    // honeypot: a real person never fills this. Fail quietly.
    if (a.trap) {
      setDelivered(false);
      setStatus("done");
      return;
    }

    setStatus("sending");
    try {
      const res = await submitInquiry({
        name: a.name,
        email: a.email,
        org: a.org,
        purpose: topic?.label || "",
        message: a.message,
        locale,
      });
      setDelivered(Boolean(res?.delivered));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setA(EMPTY);
    setErrors({});
    setStatus("idle");
    setCopied(false);
    setDelivered(false);
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(a.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const mailtoHref = () => {
    const subject =
      locale === "tr"
        ? `Portfolyo üzerinden iletişim — ${a.name || ""}`.trim()
        : `Contact via portfolio — ${a.name || ""}`.trim();
    const lines = [
      a.message,
      "",
      `${d.nameLabel}: ${a.name}`,
      `${d.emailLabel}: ${a.email}`,
      a.org ? `${d.orgLabel}: ${a.org}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${shared.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines)}`;
  };

  return (
    <section id="collaborate" className="section collab">
      <div className="wrap collab__inner">
        <Heading eyebrow={d.eyebrow} title={d.heading} index="05" />

        {status === "done" ? (
          <motion.div
            className="collab__panel collab__done"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
            role="status"
          >
            <h3 className="collab__done-title display">
              {delivered ? d.sentTitle : d.successTitle}
            </h3>
            <p className="collab__done-body">
              {delivered ? d.sentBody : d.successBody}
            </p>

            <pre className="collab__final">{a.message}</pre>

            <div className="collab__actions collab__actions--center">
              <button type="button" className="btn" onClick={copyMessage}>
                {copied ? d.copied : d.copy}
              </button>
              {!delivered && (
                <a className="btn btn--primary" href={mailtoHref()}>
                  {d.openMail}
                </a>
              )}
            </div>

            <button type="button" className="collab__restart" onClick={reset}>
              {d.startOver}
            </button>
          </motion.div>
        ) : (
          <div className="cf">
            {/* ---- left: what to expect + the direct route ---- */}
            <aside className="cf__aside">
              <p className="cf__title display">{c.asideTitle}</p>
              <p className="cf__body">{c.asideBody}</p>

              <p className="cf__direct-label">{c.directLabel}</p>
              <a
                className="cf__direct"
                href={`mailto:${shared.email}`}
                data-cursor="hover"
              >
                {shared.email}
              </a>
            </aside>

            {/* ---- right: the form, three fields and a topic ---- */}
            <form className="cf__form" onSubmit={onSubmit} noValidate>
              {/* honeypot — off-screen, never announced, never autofilled */}
              <div className="collab__trap" aria-hidden="true">
                <label htmlFor="collab-company-url">Company URL</label>
                <input
                  id="collab-company-url"
                  name="company_url"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={a.trap}
                  onChange={onInput("trap")}
                />
              </div>

              <fieldset className="cf__topics">
                <legend className="field__label">
                  {c.topicLabel}
                  <span className="field__opt">{c.topicOptional}</span>
                </legend>
                <div className="cf__chips">
                  {c.topics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`cf__chip ${a.topic === t.id ? "is-on" : ""}`}
                      aria-pressed={a.topic === t.id}
                      onClick={() => set("topic")(a.topic === t.id ? "" : t.id)}
                      data-cursor="hover"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="field">
                <label className="field__label" htmlFor="cf-msg">
                  {c.msgLabel}
                </label>
                <textarea
                  id="cf-msg"
                  className="field__input field__input--area"
                  rows={5}
                  value={a.message}
                  onChange={onInput("message")}
                  placeholder={c.msgPlaceholder}
                  aria-invalid={errors.message ? "true" : undefined}
                />
                {errors.message && (
                  <p className="field__error" role="alert">
                    {errors.message}
                  </p>
                )}
                {detected.length > 0 && (
                  <div className="cf__tech" aria-live="polite">
                    <span className="cf__tech-label">
                      {"// " + d.detectedLabel}
                    </span>
                    {detected.map((t) => (
                      <span className="cf__tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="cf__row">
                <div className="field">
                  <label className="field__label" htmlFor="cf-name">
                    {d.nameLabel}
                  </label>
                  <input
                    id="cf-name"
                    className="field__input"
                    type="text"
                    autoComplete="name"
                    value={a.name}
                    onChange={onInput("name")}
                    aria-invalid={errors.name ? "true" : undefined}
                  />
                  {errors.name && (
                    <p className="field__error" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label className="field__label" htmlFor="cf-email">
                    {d.emailLabel}
                  </label>
                  <input
                    id="cf-email"
                    className="field__input"
                    type="email"
                    autoComplete="email"
                    value={a.email}
                    onChange={onInput("email")}
                    aria-invalid={errors.email ? "true" : undefined}
                  />
                  {errors.email && (
                    <p className="field__error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="field">
                <label className="field__label" htmlFor="cf-org">
                  {d.orgLabel}
                  <span className="field__opt">{d.optional}</span>
                </label>
                <input
                  id="cf-org"
                  className="field__input"
                  type="text"
                  autoComplete="organization"
                  value={a.org}
                  onChange={onInput("org")}
                />
              </div>

              {isDemo && (
                <div className="collab__demo" role="note">
                  <p className="collab__demo-title">{d.demoTitle}</p>
                  <p className="collab__demo-body">{d.demoBody}</p>
                </div>
              )}

              {status === "error" && (
                <p className="field__error" role="alert">
                  {d.errors.generic}
                </p>
              )}

              <div className="cf__send">
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <>
                      <span className="btn__spinner" aria-hidden="true" />
                      {d.sending}
                    </>
                  ) : (
                    d.submit
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
