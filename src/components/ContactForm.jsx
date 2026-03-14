import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

function countLinks(text) {
  return (text.match(/(https?:\/\/\S+|www\.\S+)/gi) || []).length;
}
function isEmailLike(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ContactForm() {
  const { t, i18n } = useTranslation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    website: "" // honeypot
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false
  });

  const [status, setStatus] = useState(null); // null | {type:"ok"|"err", msg:string}
  const [loading, setLoading] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // auto-hide success after 15s
  useEffect(() => {
    if (status?.type !== "ok") return;
    const timer = setTimeout(() => setStatus(null), 15000);
    return () => clearTimeout(timer);
  }, [status]);

  function setField(key, value) {
    setForm((p) => ({ ...p, [key]: value }));
  }
  function markTouched(key) {
    setTouched((p) => ({ ...p, [key]: true }));
  }

  const errors = useMemo(() => {
    const e = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const msg = form.message.trim();

    if (name.length < 2) e.name = t("contactForm.errors.nameMin");
    if (!isEmailLike(email)) e.email = t("contactForm.errors.emailInvalid");

    if (msg.length < 20) e.message = t("contactForm.errors.messageTooShort");
    const links = countLinks(msg);
    if (msg.length >= 20 && links > 2) e.message = t("contactForm.errors.tooManyLinks");

    return e;
  }, [form.name, form.email, form.message, t]);

  function shouldShowError(field) {
    return (touched[field] || submittedOnce) && Boolean(errors[field]);
  }

  function inputClass(field) {
    return shouldShowError(field) ? "input input--error" : "input";
  }
  function textareaClass(field) {
    return shouldShowError(field) ? "textarea textarea--error" : "textarea";
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmittedOnce(true);

    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const lang = (i18n.language || "pl").slice(0, 2); // pl/en/no

      const res = await fetch(`${API_BASE}/backend/contact/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": lang
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          company: form.company.trim() || null,
          message: form.message.trim(),
          website: form.website.trim() || null,
          lang // <<< kluczowe: backend wybierze autoresponder
        })
      });

      let data = null;
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        const msg =
          typeof data?.detail === "string"
            ? data.detail
            : t("contactForm.errors.serverError", { code: res.status });
        throw new Error(msg);
      }

      setStatus({ type: "ok", msg: t("contactForm.success") });
      setForm({ name: "", email: "", company: "", message: "", website: "" });
      setTouched({ name: false, email: false, message: false });
      setSubmittedOnce(false);
    } catch (err) {
      setStatus({ type: "err", msg: err?.message || t("contactForm.errors.sendFailed") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="contact-form">
      {/* honeypot */}
      <div className="hp" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      {/* placeholders zostają po EN */}
      <div className="field">
        <input
          className={inputClass("name")}
          placeholder="Name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          onBlur={() => markTouched("name")}
          aria-invalid={shouldShowError("name")}
        />
        {shouldShowError("name") ? <div className="field-error">{errors.name}</div> : null}
      </div>

      <div className="field">
        <input
          className={inputClass("email")}
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          onBlur={() => markTouched("email")}
          aria-invalid={shouldShowError("email")}
        />
        {shouldShowError("email") ? <div className="field-error">{errors.email}</div> : null}
      </div>

      <div className="field">
        <input
          className="input"
          placeholder="Company (optional)"
          value={form.company}
          onChange={(e) => setField("company", e.target.value)}
        />
      </div>

      <div className="field">
        <textarea
          className={textareaClass("message")}
          placeholder="Message"
          value={form.message}
          onChange={(e) => setField("message", e.target.value)}
          onBlur={() => markTouched("message")}
          aria-invalid={shouldShowError("message")}
        />
        {shouldShowError("message") ? <div className="field-error">{errors.message}</div> : null}
      </div>

      {status ? (
        <div className={`contact-status ${status.type === "ok" ? "contact-status--ok" : "contact-status--error"}`}>
          {status.msg}
        </div>
      ) : null}

      <div className="actions">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? t("contactForm.sending") : t("contactForm.send")}
        </Button>

        <Button
          variant="ghost"
          type="button"
          disabled={loading}
          onClick={() => {
            setForm({ name: "", email: "", company: "", message: "", website: "" });
            setTouched({ name: false, email: false, message: false });
            setSubmittedOnce(false);
            setStatus(null);
          }}
        >
          {t("contactForm.clear")}
        </Button>
      </div>
    </form>
  );
}
