import { useState } from "react";
import { useTranslation } from "react-i18next";

import { API } from "../api";
import { getApiErrorMessage } from "../apiErrors";
import Button from "./Button";
import CopyTokenButton from "./CopyTokenButton";
import JsonViewer from "./JsonViewer";


export default function AuthApiDemo() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Password123");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");
  const isLoggedIn = Boolean(token);

  async function callJson(method, path, body, options = {}) {
    const authToken = options.tokenOverride ?? token;

    setBusy(true);
    setError("");
    setOut(null);

    try {
      const res = await fetch(path, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, t, "auth.error"));
      }

      setOut(data);

      return data;
    } catch (e) {
      setError(
        e instanceof TypeError ? t("auth.error") : e?.message || t("auth.error"),
      );
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function loginRequest() {
    setBusy(true);
    setError("");
    setOut(null);

    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await fetch(API.auth.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(getApiErrorMessage(data, t, "auth.error"));
      }

      setOut(data);
      return data;
    } catch (e) {
      setError(
        e instanceof TypeError ? t("auth.error") : e?.message || t("auth.error"),
      );
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onRegister() {
    await callJson("POST", API.auth.register, { email, password });
  }

  async function onLogin() {
    const data = await loginRequest();

    if (data?.access_token) {
      const freshToken = data.access_token;
      setToken(freshToken);

      await callJson("GET", API.users.profile, null, {
        tokenOverride: freshToken,
      });
    }
  }

  async function onProfile() {
    await callJson("GET", API.users.profile);
  }

  async function onUsers() {
    await callJson("GET", API.users.list);
  }

  function onReset() {
    setToken("");
    setOut(null);
    setError("");
    setEmail("demo@example.com");
    setPassword("Password123");
  }

  return (
    <div id="auth-demo" style={{ display: "grid", gap: 12 }}>
      <div className="result" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>
          {t("auth.demoTitle")}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <p className="auth-demo-lead">
            {t("auth.tokenMissing")}
          </p>

          <p className="demo-credentials-note">
            {t("auth.demoCredentials")}: demo@example.com / Password123
          </p>

          <div>
            <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--muted)" }}>
              {t("auth.email")}
            </div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.emailPlaceholder")} />
          </div>

          <div>
            <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--muted)" }}>
              {t("auth.password")}
            </div>
            <input className="input" value={password} type="password" onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.passwordPlaceholder")} />
          </div>

          <div className="auth-demo-actions auth-demo-actions--primary">
            <Button variant="primary" disabled={busy} onClick={onLogin}>
              {busy ? t("auth.loading") : t("auth.login")}
            </Button>

            <Button variant="ghost" disabled={busy} onClick={isLoggedIn ? onReset : onRegister}>
              {isLoggedIn
                ? t("auth.resetSession")
                : busy
                  ? t("auth.loading")
                  : t("auth.createDemoAccount")}
            </Button>
          </div>

          {isLoggedIn ? (
            <div className="auth-demo-actions auth-demo-actions--secondary">
              <Button variant="ghost" disabled={busy} onClick={onProfile}>
                {t("auth.profile")}
              </Button>

              <Button variant="ghost" disabled={busy} onClick={onUsers}>
                {t("auth.usersAdmin")}
              </Button>

              <CopyTokenButton token={token} />

            </div>
          ) : null}

          {token ? (
            <div className="tip">
              {t("auth.tokenOk")}
            </div>
          ) : null}
        </div>
      </div>

      {error ? <div className="result bad">{error}</div> : null}

      <JsonViewer title={t("auth.response")} data={out} />
    </div>
  );
}
