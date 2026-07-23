import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import JsonViewer from "./JsonViewer";
import { useTranslation } from "react-i18next";
import { API } from "../api";
import { getApiErrorMessage } from "../apiErrors";

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
  const [apiResponse, setApiResponse] = useState(null);

  const [topK, setTopK] = useState(3);
  const [minScore, setMinScore] = useState(0.15);

  const [smartMode, setSmartMode] = useState(true);
  const [labels, setLabels] = useState(
    "statue, monument, band, person, animal, building, street, car, indoor, landscape"
  );

  const [info, setInfo] = useState(null);
  const [examples, setExamples] = useState([]);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

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
        // Metadata is optional; keep the demo usable if the backend is cold.
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
    setApiResponse(null);
    const f = e.target.files?.[0] || null;
    setFile(f);
  }

  async function classify() {
    if (!file) return;

    setBusy(true);
    setError("");
    setPreds([]);
    setUnknown(false);
    setApiResponse(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const params = new URLSearchParams();
      params.set("top_k", String(clamp(topK, 1, 3)));
      params.set("min_score", String(clamp(minScore, 0, 1)));

      if (!smartMode) {
        params.set("labels", labels);
      }

      const res = await fetch(`${API_CLASSIFY}?${params.toString()}`, { method: "POST", body: fd });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          getApiErrorMessage(data, t, "imageClassifier.error"),
        );
      }

      const data = await res.json();
      const predictions = Array.isArray(data?.predictions) ? data.predictions : [];
      const primary = predictions[0] || null;

      setPreds(predictions);
      setUnknown(!!data?.unknown);
      setApiResponse({
        prediction: primary?.label || (data?.unknown ? t("imageClassifier.unknown") : null),
        confidence: primary?.score ? Number(primary.score.toFixed(3)) : null,
        alternatives: predictions.slice(1).map((item) => item.label),
        unknown: !!data?.unknown,
        predictions,
      });
    } catch (e) {
      setError(
        e instanceof TypeError
          ? t("imageClassifier.error")
          : e?.message || t("imageClassifier.error"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function copyLabel(label) {
    try {
      await navigator.clipboard.writeText(label);
    } catch {
      // Clipboard access can be unavailable in some browser contexts.
    }
  }

  function reset() {
    setFile(null);
    setPreds([]);
    setError("");
    setUnknown(false);
    setApiResponse(null);
  }

  return (
    <div className="classifier-demo">
      <div className="file-upload classifier-upload-row">
        <label className="file-button">
          {t("imageClassifier.pick")}
          <input type="file" accept="image/*" onChange={onPick} hidden />
        </label>
        <span className="file-name">{file ? file.name : t("imageClassifier.noFile")}</span>
      </div>

      <div className="classifier-settings-row">
        <div className="result classifier-setting">
          <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("imageClassifier.minScore")}</div>
          <input
            className="input"
            type="number"
            step="0.01"
            min={0}
            max={1}
            value={minScore}
            onChange={(e) => setMinScore(clamp(Number(e.target.value || 0.15), 0, 1))}
          />
        </div>

        <div className="result classifier-setting">
          <div style={{ fontWeight: 900, marginBottom: 6 }}>{t("imageClassifier.mode")}</div>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 800, color: "var(--muted)" }}>
            <input type="checkbox" checked={smartMode} onChange={(e) => setSmartMode(e.target.checked)} />
            {t("imageClassifier.smartMode")}
          </label>
        </div>

        <div className="result classifier-setting">
          <div style={{ fontWeight: 900, marginBottom: 6 }}>
            {t("imageClassifier.topK")}
            <span className="setting-hint">{t("imageClassifier.maxTopK")}</span>
          </div>
          <input
            className="input"
            type="number"
            min={1}
            max={3}
            value={topK}
            onChange={(e) => setTopK(clamp(Number(e.target.value || 3), 1, 3))}
          />
        </div>
      </div>

      <div className="classifier-actions-row">
        <Button variant="primary" onClick={classify} disabled={!file || busy}>
          {busy ? (
            <span className="button-loading">
              <span className="button-spinner" aria-hidden="true" />
              {t("imageClassifier.loading")}
            </span>
          ) : (
            t("imageClassifier.classify")
          )}
        </Button>

        <Button variant="ghost" onClick={reset} disabled={busy && !!file}>
          {t("imageClassifier.clear")}
        </Button>
      </div>

      <div className="tip" style={{ marginTop: -2 }}>
        {smartMode
          ? t("imageClassifier.smartTip")
          : t("imageClassifier.manualTip")}
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
            {t("imageClassifier.labels")}
          </div>
          <input
            className="input"
            value={labels}
            onChange={(e) => setLabels(e.target.value)}
            placeholder={t("imageClassifier.labelsPlaceholder")}
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

      <JsonViewer title={t("imageClassifier.apiResponse")} data={apiResponse} />

      {file ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div className="result" style={{ marginTop: 0 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              {t("imageClassifier.topPredictions")}
            </div>

            {preds?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                {preds.map((p, idx) => (
                  <button
                    key={`${p.label}-${idx}`}
                    type="button"
                    className="chip"
                    onClick={() => copyLabel(p.label)}
                    title={t("imageClassifier.copyHint")}
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
                    {t("imageClassifier.unknown")}
                  </span>
                ) : null}
              </div>
            ) : (
              <div className="tip" style={{ marginBottom: 12 }}>{t("imageClassifier.noResult")}</div>
            )}

            <div style={{ height: 12 }} />

            <div style={{ fontWeight: 900, marginBottom: 8 }}>{t("imageClassifier.preview")}</div>

            <img
              src={previewUrl}
              alt={t("imageClassifier.previewAlt")}
              className="classifier-preview-image"
            />
          </div>
        </div>
      ) : (
        <div className="tip">{t("imageClassifier.noFile")}</div>
      )}
    </div>
  );
}
