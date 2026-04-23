import { useState } from "react";
import { useTranslation } from "react-i18next";

import { API } from "../api";
import Button from "./Button";
import ResultBox from "./ResultBox";

const API_URL = API.password.check;


export default function PasswordChecker() {
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function onCheck() {
    setError("");
    setResult(null);

    const pwd = password.trim();
    if (!pwd) {
      setError(t("pwnedProject.passwordRequired") || "Enter a password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : `API error: HTTP ${res.status}`
        );
      }

      setResult(data);
    } catch (e) {
      setError(e?.message || "Backend connection error.");
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setPassword("");
    setResult(null);
    setError("");
  }

  return (
    <>
      <label style={{ fontWeight: 900, display: "block", marginBottom: 8 }}>
        {t("pwnedProject.password")}
      </label>

      <input
        className="input"
        type="password"
        placeholder={t("pwnedProject.placeHolderPassword")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCheck();
        }}
      />

      <div className="actions">
        <Button variant="primary" onClick={onCheck} disabled={loading}>
          {loading ? "Checking..." : "Check"}
        </Button>
        <Button variant="ghost" onClick={onClear} disabled={loading}>
          Clear
        </Button>
      </div>

      {error ? <div className="result bad">{error}</div> : null}
      {result ? <ResultBox result={result} /> : null}
    </>
  );
}
