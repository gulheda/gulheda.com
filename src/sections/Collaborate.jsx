import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../i18n.jsx";
import { collaborate, whyFor, composeMessage } from "../data/collaborate.js";
import { submitInquiry, isDemo } from "../services/submitInquiry.js";
import Heading from "../components/Heading.jsx";
import Stepper from "../components/Stepper.jsx";
import OptionGroup from "../components/OptionGroup.jsx";

/* =====================================================================
   "Birlikte Ne Geliştirebiliriz?" — a guided, three-step enquiry.

   Not a chatbot: no free conversation. The visitor makes choices, the
   questions adapt, and a clean professional message is drafted for them
   to edit and send. Answers live in component state, so they survive
   moving between steps but reset on a page refresh (as specified).
   ===================================================================== */

const EASE = [0.16, 1, 0.3, 1];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MIN_DESC = 20;

const EMPTY = {
  purpose: "",
  field: "",
  stage: "",
  support: "",
  description: "",
  name: "",
  email: "",
  org: "",
  linkedin: "",
  message: "",
  trap: "", // honeypot
};

export default function Collaborate() {
  const { locale, shared } = useLocale();
  const d = collaborate[locale];

  const [step, setStep] = useState(0);
  const [a, setA] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [messageTouched, setMessageTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [delivered, setDelivered] = useState(false);

  const stepRef = useRef(null);
  const prevStep = useRef(step);

  const purpose = useMemo(
    () => d.purposes.find((p) => p.id === a.purpose),
    [d.purposes, a.purpose],
  );
  const asks = purpose?.asks ?? [];
  const why = a.field ? whyFor(locale, a.field) : null;

  const set = (key) => (val) => {
    setA((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onInput = (key) => (e) => set(key)(e.target.value);

  /* keep the draft in sync with the answers until the visitor edits it,
     and re-draft when the language changes */
  useEffect(() => {
    if (!messageTouched && a.purpose) {
      setA((prev) => ({ ...prev, message: composeMessage(locale, prev) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    locale,
    a.purpose,
    a.field,
    a.stage,
    a.support,
    a.description,
    messageTouched,
  ]);

  /* Move focus to the new step so keyboard users are not left behind.
     Compare against the previous value rather than a "first render"
     flag: under StrictMode effects run twice, and a flag would let the
     second run steal focus on mount — which yanked the whole page down
     to this section on load. preventScroll keeps the view still. */
  useEffect(() => {
    if (prevStep.current !== step) {
      prevStep.current = step;
      stepRef.current?.focus({ preventScroll: true });
    }
  }, [step]);

  const validate = (which) => {
    const e = {};
    if (which === 0 && !a.purpose) e.purpose = d.errors.purpose;

    if (which === 1) {
      if (asks.includes("field") && !a.field) e.field = d.errors.field;
      if (asks.includes("stage") && !a.stage) e.stage = d.errors.stage;
      if (asks.includes("support") && !a.support) e.support = d.errors.support;
      if (a.description.trim().length < MIN_DESC)
        e.description = d.errors.description;
    }

    if (which === 2) {
      if (!a.name.trim()) e.name = d.errors.name;
      if (!EMAIL_RE.test(a.email.trim())) e.email = d.errors.email;
      if (!a.message.trim()) e.message = d.errors.message;
      if (a.linkedin.trim() && !/^(https?:\/\/|www\.|linkedin\.com)/i.test(a.linkedin.trim()))
        e.linkedin = d.errors.linkedin;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (validate(step)) setStep((s) => Math.min(s + 1, 2));
  };
  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate(2)) return;

    // honeypot: a real person never fills this. Fail quietly.
    if (a.trap) {
      setDelivered(false);
      setStatus("done");
      return;
    }

    setStatus("sending");
    try {
      const res = await submitInquiry({ ...a, trap: undefined, locale });
      setDelivered(Boolean(res?.delivered));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setA(EMPTY);
    setErrors({});
    setMessageTouched(false);
    setStatus("idle");
    setCopied(false);
    setDelivered(false);
    setStep(0);
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
      a.linkedin ? `${d.linkedinLabel}: ${a.linkedin}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    return `mailto:${shared.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines)}`;
  };

  const fieldLegend =
    a.purpose === "job"
      ? d.fieldLegendJob
      : a.purpose === "question"
        ? d.fieldLegendQuestion
        : d.fieldLegend;

  return (
    <section id="collaborate" className="section collab">
      <div className="wrap collab__inner">
        <Heading eyebrow={d.eyebrow} title={d.heading} index="05" />
        <p className="collab__intro">{d.intro}</p>

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

            {/* when the message really was delivered, copying and
                mailto are just conveniences — not the way to send */}
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
          <form className="collab__panel" onSubmit={onSubmit} noValidate>
            <Stepper
              steps={d.steps}
              current={step}
              label={d.stepOf(step + 1, d.steps.length)}
            />

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

            <div
              className="collab__step"
              ref={stepRef}
              tabIndex={-1}
              aria-label={d.steps[step]}
            >
              {/* No exit animation here on purpose: with AnimatePresence
                  mode="wait" a stalled exit (hidden tab, interrupted
                  animation) leaves the form frozen on the previous step.
                  Keying the incoming step is simpler and cannot stall. */}
              <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: EASE }}
                >
                  {step === 0 && (
                    <OptionGroup
                      name="purpose"
                      legend={d.purposeLegend}
                      options={d.purposes}
                      value={a.purpose}
                      onChange={set("purpose")}
                      error={errors.purpose}
                      columns={2}
                    />
                  )}

                  {step === 1 && (
                    <>
                      {asks.includes("field") && (
                        <OptionGroup
                          name="field"
                          legend={fieldLegend}
                          options={d.fields}
                          value={a.field}
                          onChange={set("field")}
                          error={errors.field}
                          columns={2}
                        />
                      )}

                      {why && (
                        <motion.aside
                          className="why"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, ease: EASE }}
                        >
                          <p className="why__title">
                            {d.whyTitle}
                          </p>
                          <p className="why__note">{d.whyNote}</p>
                          <ul className="why__list">
                            {why.map((w) => (
                              <li key={w}>{w}</li>
                            ))}
                          </ul>
                        </motion.aside>
                      )}

                      {asks.includes("stage") && (
                        <OptionGroup
                          name="stage"
                          legend={d.stageLegend}
                          options={d.stages}
                          value={a.stage}
                          onChange={set("stage")}
                          error={errors.stage}
                          columns={2}
                        />
                      )}

                      {asks.includes("support") && (
                        <OptionGroup
                          name="support"
                          legend={d.supportLegend}
                          options={d.supports}
                          value={a.support}
                          onChange={set("support")}
                          error={errors.support}
                          columns={2}
                        />
                      )}

                      <div className="field">
                        <label className="field__label" htmlFor="collab-desc">
                          {d.descriptionLegend[a.purpose] ||
                            d.descriptionLegend.project}
                        </label>
                        <textarea
                          id="collab-desc"
                          className="field__input field__input--area"
                          rows={5}
                          value={a.description}
                          onChange={onInput("description")}
                          placeholder={d.descriptionPlaceholder}
                          aria-invalid={errors.description ? "true" : undefined}
                          aria-describedby={
                            errors.description ? "collab-desc-error" : undefined
                          }
                        />
                        {errors.description && (
                          <p
                            className="field__error"
                            id="collab-desc-error"
                            role="alert"
                          >
                            {errors.description}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <p className="collab__review-legend">{d.reviewLegend}</p>

                      <div className="field">
                        <label className="field__label" htmlFor="collab-msg">
                          {d.messageLabel}
                          {messageTouched && (
                            <span className="field__badge">{d.edited}</span>
                          )}
                        </label>
                        <textarea
                          id="collab-msg"
                          className="field__input field__input--area field__input--msg"
                          rows={10}
                          value={a.message}
                          onChange={(e) => {
                            setMessageTouched(true);
                            onInput("message")(e);
                          }}
                          aria-invalid={errors.message ? "true" : undefined}
                        />
                        {errors.message && (
                          <p className="field__error" role="alert">
                            {errors.message}
                          </p>
                        )}
                        {messageTouched && (
                          <button
                            type="button"
                            className="field__link"
                            onClick={() => {
                              setMessageTouched(false);
                              set("message")(composeMessage(locale, a));
                            }}
                          >
                            {d.regenerate}
                          </button>
                        )}
                      </div>

                      <div className="collab__grid">
                        <div className="field">
                          <label className="field__label" htmlFor="collab-name">
                            {d.nameLabel}
                          </label>
                          <input
                            id="collab-name"
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
                          <label className="field__label" htmlFor="collab-email">
                            {d.emailLabel}
                          </label>
                          <input
                            id="collab-email"
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

                        <div className="field">
                          <label className="field__label" htmlFor="collab-org">
                            {d.orgLabel}
                            <span className="field__opt">{d.optional}</span>
                          </label>
                          <input
                            id="collab-org"
                            className="field__input"
                            type="text"
                            autoComplete="organization"
                            value={a.org}
                            onChange={onInput("org")}
                          />
                        </div>

                        <div className="field">
                          <label className="field__label" htmlFor="collab-li">
                            {d.linkedinLabel}
                            <span className="field__opt">{d.optional}</span>
                          </label>
                          <input
                            id="collab-li"
                            className="field__input"
                            type="text"
                            inputMode="url"
                            value={a.linkedin}
                            onChange={onInput("linkedin")}
                            aria-invalid={errors.linkedin ? "true" : undefined}
                          />
                          {errors.linkedin && (
                            <p className="field__error" role="alert">
                              {errors.linkedin}
                            </p>
                          )}
                        </div>
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
                    </>
                  )}
                </motion.div>
            </div>

            <div className="collab__actions">
              <button
                type="button"
                className="btn"
                onClick={goBack}
                disabled={step === 0 || status === "sending"}
              >
                {d.back}
              </button>

              {step < 2 ? (
                <button type="button" className="btn btn--primary" onClick={goNext}>
                  {d.next}
                </button>
              ) : (
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
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
