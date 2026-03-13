import { useState } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import AuthStatus from "./AuthStatus";
import JsonViewer from "./JsonViewer";
import CopyTokenButton from "./CopyTokenButton";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export default function AuthApiDemo() {
  const { t } = useTranslation();

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("Password123");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  async function callJson(method, path, body, options = {}) {
    const authToken = options.tokenOverride ?? token;

    setBusy(true);
    setError("");
    setOut(null);

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || `${t("auth.error") || "Błąd"} (${res.status})`);
      }

      setOut(data);

      if (options.setProfile && data?.user) {
        setCurrentUser(data.user);
      }

      return data;
    } catch (e) {
      setError(e?.message || (t("auth.error") || "Błąd"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function loginRequest() {
    setBusy(true);
    setError("");
    setOut(null);
    setCurrentUser(null);

    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.detail || `${t("auth.error") || "Błąd"} (${res.status})`);
      }

      setOut(data);
      return data;
    } catch (e) {
      setError(e?.message || (t("auth.error") || "Błąd"));
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onRegister() {
    await callJson("POST", "/api/auth/register", { email, password });
  }

  async function onLogin() {
    const data = await loginRequest();

    if (data?.access_token) {
      const freshToken = data.access_token;
      setToken(freshToken);

      // od razu pobierz profil z użyciem ŚWIEŻEGO tokenu
      await callJson("GET", "/api/users/profile", null, {
        setProfile: true,
        tokenOverride: freshToken,
      });
    }
  }

  async function onProfile() {
    await callJson("GET", "/api/users/profile", null, { setProfile: true });
  }

  async function onUsers() {
    await callJson("GET", "/api/users");
  }

  function onClear() {
    setToken("");
    setOut(null);
    setError("");
    setCurrentUser(null);
    setEmail("demo@example.com");
    setPassword("Password123");
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <AuthStatus token={token} user={currentUser} />

      <div className="result" style={{ marginTop: 0 }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>
          {t("auth.demoTitle") || "Demo (API)"}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--muted)" }}>
              {t("auth.email") || "Email"}
            </div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
          </div>

          <div>
            <div style={{ fontWeight: 800, marginBottom: 6, color: "var(--muted)" }}>
              {t("auth.password") || "Password"}
            </div>
            <input
              className="input"
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
            />
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button variant="primary" disabled={busy} onClick={onRegister}>
              {busy ? (t("auth.loading") || "Ładowanie...") : (t("auth.register") || "Register")}
            </Button>

            <Button variant="primary" disabled={busy} onClick={onLogin}>
              {busy ? (t("auth.loading") || "Ładowanie...") : (t("auth.login") || "Login")}
            </Button>

            <Button variant="ghost" disabled={busy || !token} onClick={onProfile}>
              {t("auth.profile") || "Profile"}
            </Button>

            <Button variant="ghost" disabled={busy || !token} onClick={onUsers}>
              {t("auth.usersAdmin") || "Users (admin)"}
            </Button>

            <CopyTokenButton token={token} />

            <Button variant="ghost" disabled={busy} onClick={onClear}>
              {t("auth.clear") || "Clear"}
            </Button>
          </div>

          <div className="tip">
            {token
              ? t("auth.tokenOk") || "JWT token active — requests include Authorization: Bearer token."
              : t("auth.tokenMissing") || "Login first to receive a JWT token."}
          </div>
        </div>
      </div>

      {error ? <div className="result bad">{error}</div> : null}

      <JsonViewer title={t("auth.response") || "API Response"} data={out} />
    </div>
  );
}