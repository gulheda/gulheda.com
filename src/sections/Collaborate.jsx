import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../i18n.jsx";
import {
  collaborate,
  whyFor,
  composeMessage,
  detectTech,
} from "../data/collaborate.js";
import { submitInquiry, isDemo } from "../services/submitInquiry.js";
import Heading from "../components/Heading.jsx";

/* =====================================================================
   "Birlikte Ne Geliştirebiliriz?" — the message IS the interface.

   No stepper, no boxed form: the visitor completes a large statement
   written in the hero's own typographic voice. Blanks in the sentence
   are interactive slots (click → inline menu), the free text sits on
   ruled lines like a notebook, and the sender introduces themselves in
   a sentence too. The classic composed message is still built behind
   the scenes and can be reviewed/edited before sending.
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

/* One blank in the sentence: a button showing the current choice (or a
   placeholder), opening an inline listbox. Only one menu is open at a
   time — the parent owns that state. */
function Slot({
  id,
  value,
  placeholder,
  options,
  onPick,
  open,
  onToggle,
  invalid,
  display = "label",
}) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const away = (e) => {
      if (!rootRef.current?.contains(e.target)) onToggle(null);
    };
    const esc = (e) => {
      if (e.key === "Escape") onToggle(null);
    };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open, onToggle]);

  const chosen = options.find((o) => o.id === value);

  return (
    <span className="slot" ref={rootRef}>
      <button
        type="button"
        className={[
          "slot__btn",
          chosen ? "is-filled" : "is-empty",
          invalid ? "is-invalid" : "",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onToggle(open ? null : id)}
        data-cursor="hover"
      >
        {chosen ? chosen[display] || chosen.label : placeholder}
        <span className="slot__mark" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <motion.ul
          className="slot__menu"
          role="listbox"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
        >
          {options.map((o) => (
            <li key={o.id} role="option" aria-selected={o.id === value}>
              <button
                type="button"
                className={`slot__opt ${o.id === value ? "is-on" : ""}`}
                onClick={() => {
                  onPick(o.id);
                  onToggle(null);
                }}
                data-spot=""
              >
                {o.label}
              </button>
            </li>
          ))}
        </motion.ul>
      )}
    </span>
  );
}

export default function Collaborate() {
  const { locale, shared } = useLocale();
  const d = collaborate[locale];
  const m = d.mad;

  const [a, setA] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [openSlot, setOpenSlot] = useState(null);
  const [messageTouched, setMessageTouched] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [delivered, setDelivered] = useState(false);

  const purpose = useMemo(
    () => d.purposes.find((p) => p.id === a.purpose),
    [d.purposes, a.purpose],
  );
  const asks = purpose?.asks ?? [];
  const why = a.field ? whyFor(locale, a.field) : null;
  const detected = useMemo(() => detectTech(a.description), [a.description]);

  const set = (key) => (val) => {
    setA((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onInput = (key) => (e) => set(key)(e.target.value);

  /* keep the composed message in sync until the visitor edits it */
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

  const validate = () => {
    const e = {};
    if (!a.purpose) e.purpose = d.errors.purpose;
    if (asks.includes("field") && !a.field) e.field = d.errors.field;
    if (asks.includes("stage") && !a.stage) e.stage = d.errors.stage;
    if (asks.includes("support") && !a.support) e.support = d.errors.support;
    if (a.description.trim().length < MIN_DESC)
      e.description = d.errors.description;
    if (!a.name.trim()) e.name = d.errors.name;
    if (!EMAIL_RE.test(a.email.trim())) e.email = d.errors.email;
    if (!a.message.trim()) e.message = d.errors.message;
    if (
      a.linkedin.trim() &&
      !/^(https?:\/\/|www\.|linkedin\.com)/i.test(a.linkedin.trim())
    )
      e.linkedin = d.errors.linkedin;
    setErrors(e);
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length > 0) return;

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
    setPreviewOpen(false);
    setOpenSlot(null);
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

  /* which meta slots the chosen purpose actually asks for */
  const railSlots = ["field", "stage", "support"].filter((k) =>
    asks.includes(k),
  );
  const railOptions = { field: d.fields, stage: d.stages, support: d.supports };

  const descLabel =
    d.descriptionLegend[a.purpose] || d.descriptionLegend.project;

  const slotErrors = ["purpose", ...railSlots]
    .map((k) => errors[k])
    .filter(Boolean);

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
          <form className="mad" onSubmit={onSubmit} noValidate>
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

            {/* ---- the statement: greeting + purpose blank ---- */}
            <p className="mad__line">
              {m.greet1}
              <Slot
                id="purpose"
                value={a.purpose}
                placeholder={m.purposePlaceholder}
                options={d.purposes}
                onPick={set("purpose")}
                open={openSlot === "purpose"}
                onToggle={setOpenSlot}
                invalid={Boolean(errors.purpose)}
                display="inline"
              />
              {m.greet2}
            </p>

            {/* ---- the detail rail: only the blanks this purpose needs ---- */}
            {railSlots.length > 0 && (
              <motion.div
                className="mad__rail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {railSlots.map((k) => (
                  <div className="mad__cell" key={k}>
                    <span className="mad__cell-label">
                      {"// " + m.slotLabels[k]}
                    </span>
                    <Slot
                      id={k}
                      value={a[k]}
                      placeholder={m.slotPlaceholder}
                      options={railOptions[k]}
                      onPick={set(k)}
                      open={openSlot === k}
                      onToggle={setOpenSlot}
                      invalid={Boolean(errors[k])}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {slotErrors.length > 0 && (
              <p className="field__error" role="alert">
                {slotErrors[0]}
              </p>
            )}

            {/* ---- why me, when a field has been picked ---- */}
            {why && (
              <motion.p
                className="mad__why"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <strong>{d.whyTitle}</strong> {d.whyNote}{" "}
                {why.join(" · ")}
              </motion.p>
            )}

            {/* ---- the free text, on ruled notebook lines ---- */}
            {a.purpose && (
              <motion.div
                className="mad__desc"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <label className="mad__desc-label" htmlFor="collab-desc">
                  {"// " + descLabel}
                </label>
                <textarea
                  id="collab-desc"
                  className="mad__paper"
                  rows={4}
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

                {detected.length > 0 && (
                  <div className="mad__tech" aria-live="polite">
                    <span className="mad__tech-label">
                      {"// " + d.detectedLabel}
                    </span>
                    {detected.map((t) => (
                      <span className="mad__chip" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ---- who is writing: a sentence, not a field grid ---- */}
            <p className="mad__line mad__line--id">
              {m.identity1}
              <span
                className={`mad__input-wrap ${errors.name ? "is-invalid" : ""}`}
              >
                <input
                  className="mad__input"
                  type="text"
                  autoComplete="name"
                  placeholder={m.namePh}
                  size={Math.max(a.name.length, m.namePh.length)}
                  value={a.name}
                  onChange={onInput("name")}
                  aria-label={d.nameLabel}
                  aria-invalid={errors.name ? "true" : undefined}
                />
              </span>
              {m.identity2}
              <span
                className={`mad__input-wrap ${errors.email ? "is-invalid" : ""}`}
              >
                <input
                  className="mad__input"
                  type="email"
                  autoComplete="email"
                  placeholder={m.emailPh}
                  size={Math.max(a.email.length, m.emailPh.length)}
                  value={a.email}
                  onChange={onInput("email")}
                  aria-label={d.emailLabel}
                  aria-invalid={errors.email ? "true" : undefined}
                />
              </span>
              {m.identity3}
            </p>
            {(errors.name || errors.email) && (
              <p className="field__error" role="alert">
                {errors.name || errors.email}
              </p>
            )}

            <div className="mad__optional">
              <input
                className="mad__ghost-input"
                type="text"
                autoComplete="organization"
                placeholder={`${m.orgPh} · ${d.optional}`}
                value={a.org}
                onChange={onInput("org")}
                aria-label={d.orgLabel}
              />
              <input
                className="mad__ghost-input"
                type="text"
                inputMode="url"
                placeholder={`${m.linkedinPh} · ${d.optional}`}
                value={a.linkedin}
                onChange={onInput("linkedin")}
                aria-label={d.linkedinLabel}
                aria-invalid={errors.linkedin ? "true" : undefined}
              />
            </div>
            {errors.linkedin && (
              <p className="field__error" role="alert">
                {errors.linkedin}
              </p>
            )}

            {/* ---- the composed message, on request ---- */}
            {a.purpose && (
              <div className="mad__preview">
                <button
                  type="button"
                  className="mad__preview-toggle"
                  aria-expanded={previewOpen}
                  onClick={() => setPreviewOpen((v) => !v)}
                >
                  {previewOpen ? m.previewClose : m.previewOpen}
                  <span aria-hidden="true">{previewOpen ? " ↑" : " ↓"}</span>
                </button>

                {previewOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <textarea
                      className="field__input field__input--area field__input--msg"
                      rows={9}
                      value={a.message}
                      onChange={(e) => {
                        setMessageTouched(true);
                        onInput("message")(e);
                      }}
                      aria-label={d.messageLabel}
                    />
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
                  </motion.div>
                )}
              </div>
            )}

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

            <div className="mad__send">
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
        )}
      </div>
    </section>
  );
}
