import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { API } from "../api";
import Button from "./Button";


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
    website: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedOnce, setSubmittedOnce] = useState(false);

  useEffect(() => {
    if (status?.type !== "ok") return;
    const timer = setTimeout(() => setStatus(null), 15000);
    return () => clearTimeout(timer);
  }, [status]);

  function setField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function markTouched(key) {
    setTouched((previous) => ({ ...previous, [key]: true }));
  }

  const errors = useMemo(() => {
    const nextErrors = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (name.length < 2) nextErrors.name = t("contactForm.errors.nameMin");
    if (!isEmailLike(email)) nextErrors.email = t("contactForm.errors.emailInvalid");

    if (message.length < 20) nextErrors.message = t("contactForm.errors.messageTooShort");
    const links = countLinks(message);
    if (message.length >= 20 && links > 2) {
      nextErrors.message = t("contactForm.errors.tooManyLinks");
    }

    return nextErrors;
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

  function resetForm() {
    setForm({ name: "", email: "", company: "", message: "", website: "" });
    setTouched({ name: false, email: false, message: false });
    setSubmittedOnce(false);
    setStatus(null);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmittedOnce(true);

    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      const lang = (i18n.language || "pl").slice(0, 2);

      const res = await fetch(API.contact.send, {
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
          lang
        })
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

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
      <div className="hp" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

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

        <Button variant="ghost" type="button" disabled={loading} onClick={resetForm}>
          {t("contactForm.clear")}
        </Button>
      </div>
    </form>
  );
}
