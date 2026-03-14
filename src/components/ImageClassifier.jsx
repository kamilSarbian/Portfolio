import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { API } from "../api";

const API_CLASSIFY = API.ml.classify;
const API_INFO = API.ml.info;
const API_EXAMPLES = API.ml.examples;

function clamp(n, min, max) {
  const v = Number.isFinite(n) ? n : min;
  return Math.max(min, Math.min(max, v));
}

export default function ImageClassifier() {
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [preds, setPreds] = useState([]);
  const [unknown, setUnknown] = useState(false);

  const [topK, setTopK] = useState(3);
  const [minScore, setMinScore] = useState(0.15);

  const [smartMode, setSmartMode] = useState(true);
  const [labels, setLabels] = useState(
    "statue, monument, band, person, animal, building, street, car, indoor, landscape"
  );

  const [info, setInfo] = useState(null);
  const [examples, setExamples] = useState([]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  // fetch /info + /examples (UI działa też bez tego)
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [infoRes, exRes] = await Promise.all([
          fetch(API_INFO).catch(() => null),
          fetch(API_EXAMPLES).catch(() => null),
        ]);

        if (!cancelled && infoRes && infoRes.ok) {
          const data = await infoRes.json().catch(() => null);
          setInfo(data || null);
        }

        if (!cancelled && exRes && exRes.ok) {
          const data = await exRes.json().catch(() => null);
          const list = Array.isArray(data?.examples) ? data.examples : [];
          setExamples(list);
        }
      } catch {
        // cisza
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  function onPick(e) {
    setError("");
    setPreds([]);
    setUnknown(false);
    const f = e.target.files?.[0] || null;
    setFile(f);
  }

  async function classify() {
    if (!file) return;

    setBusy(true);
    setError("");
    setPreds([]);
    setUnknown(false);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const params = new URLSearchParams();
      params.set("top_k", String(clamp(topK, 1, 10)));
      params.set("min_score", String(clamp(minScore, 0, 1)));

      if (!smartMode) {
        params.set("labels", labels);
      }

      const res = await fetch(`${API_CLASSIFY}?${params.toString()}`, { method: "POST", body: fd });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `${t("imageClassifier.error")} (${res.status})`);
      }

      const data = await res.json();
      setPreds(Array.isArray(data?.predictions) ? data.predictions : []);
      setUnknown(!!data?.unknown);
    } catch (e) {
      setError(e?.message || t("imageClassifier.error"));
    } finally {
      setBusy(false);
    }
  }

  async function copyLabel(label) {
    try {
      await navigator.clipboard.writeText(label);
    } catch {
      // ignore
    }
  }

  function reset() {
    setFile(null);
    setPreds([]);
    setError("");
    setUnknown(false);
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="file-upload">
        <label className="file-button">
          {t("imageClassifier.pick")}
          <input type="file" accept="image/*" onChange={onPick} hidden />
        </label>
        <span className="file-name">{file ? file.name : t("imageClassifier.noFile")}</span>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <div className="result" style={{ marginTop: 0, padding: 10 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("imageClassifier.minScore") || "Min score"}</div>
          <input
            className="input"
            style={{ width: 130, height: 36 }}
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={minScore}
            onChange={(e) => setMinScore(clamp(Number(e.target.value || 0.15), 0, 1))}
          />
        </div>

        <div className="result" style={{ marginTop: 0, padding: 10 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("imageClassifier.mode") || "Mode"}</div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800, color: "var(--muted)" }}>
            <input type="checkbox" checked={smartMode} onChange={(e) => setSmartMode(e.target.checked)} />
            {t("imageClassifier.smartMode") || "Smart mode"}
          </label>
        </div>

        <div className="result" style={{ marginTop: 0, padding: 10 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("imageClassifier.topK")}</div>
          <input
            className="input"
            style={{ width: 130, height: 36 }}
            type="number"
            min={1}
            max={10}
            value={topK}
            onChange={(e) => setTopK(clamp(Number(e.target.value || 3), 1, 10))}
          />
        </div>

        <Button variant="primary" onClick={classify} disabled={!file || busy}>
          {busy ? t("imageClassifier.loading") : t("imageClassifier.classify")}
        </Button>

        <Button variant="ghost" onClick={reset} disabled={busy && !!file}>
          {t("imageClassifier.clear")}
        </Button>
      </div>

      <div className="tip" style={{ marginTop: -2 }}>
        {smartMode
          ? t("imageClassifier.smartTip") ||
            "Smart mode używa presetów kategorii po stronie backendu. Nic nie musisz wpisywać."
          : t("imageClassifier.manualTip") ||
            "Tryb manualny: wpisz własne etykiety (po przecinku). CLIP dopasowuje obraz do tekstu."}
        {info?.model_name ? (
          <span style={{ marginLeft: 8 }}>
            ({info.model_name}
            {info.device ? ` · ${info.device}` : ""})
          </span>
        ) : null}
      </div>

      {!smartMode ? (
        <div className="result" style={{ marginTop: 0 }}>
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            {t("imageClassifier.labels") || "Labels (comma-separated)"}
          </div>
          <input
            className="input"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            placeholder="statue, monument, band, animal..."
          />

          {examples?.length ? (
            <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {examples.slice(0, 6).map((ex) => (
                <button
                  key={ex.id || ex.name}
                  type="button"
                  className="chip"
                  onClick={() => setLabels(ex.labels || "")}
                  title={ex.labels}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <div className="result bad">{error}</div> : null}

      {file ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div className="result" style={{ marginTop: 0 }}>
            {/* ✅ WYNIK NAD OBRAZEM */}
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              {t("imageClassifier.result")}
            </div>

            {preds?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 800, color: "var(--muted)" }}>
                  {t("imageClassifier.result") || "Wynik (API)"}
                </div>

                <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--border)" }} />

                {preds.map((p, idx) => (
                  <button
                    key={`${p.label}-${idx}`}
                    type="button"
                    className="chip"
                    onClick={() => copyLabel(p.label)}
                    title={t("imageClassifier.copyHint") || "Kliknij, aby skopiować"}
                    style={{ cursor: "pointer" }}
                  >
                    <span style={{ fontWeight: 900 }}>{p.label}</span>
                    <span style={{ opacity: 0.75, marginLeft: 6 }}>
                      ({Math.round((p.score || 0) * 100)}%)
                    </span>
                  </button>
                ))}

                {unknown ? (
                  <span className="tip" style={{ marginTop: 0 }}>
                    {t("imageClassifier.unknown") || "unknown"}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="tip" style={{ marginBottom: 12 }}>
                {t("imageClassifier.hint")}
              </div>
            )}

            <div style={{ height: 12 }} />

            {/* PREVIEW POD WYNIKIEM */}
            <div style={{ fontWeight: 900, marginBottom: 8 }}>{t("imageClassifier.preview")}</div>

            <img
              src={previewUrl}
              alt="preview"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 12,
                border: "1px solid var(--border)",
              }}
            />
          </div>
        </div>
      ) : (
        <div className="tip">{t("imageClassifier.hint")}</div>
      )}
    </div>
  );
}