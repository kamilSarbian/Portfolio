import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { API } from "../api";
import { getApiErrorMessage } from "../apiErrors";
import Button from "./Button";

const API_URL = API.image.process;

const SIZES = [
  { key: "S", label: "S (320px)" },
  { key: "M", label: "M (640px)" },
  { key: "L", label: "L (1024px)" },
];


function rotateLeft(r) {
  return (r + 270) % 360;
}


function rotateRight(r) {
  return (r + 90) % 360;
}


export default function ImageEditor() {
  const { t } = useTranslation();

  const [file, setFile] = useState(null);
  const [size, setSize] = useState("M");
  const [grayscale, setGrayscale] = useState(false);
  const [rotate, setRotate] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resultBlob, setResultBlob] = useState(null);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  const originalUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  const resultUrl = useMemo(() => (resultBlob ? URL.createObjectURL(resultBlob) : ""), [resultBlob]);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function onPick(e) {
    setError("");
    setResultBlob(null);
    const nextFile = e.target.files?.[0] || null;
    setFile(nextFile);
    setSize("M");
    setGrayscale(false);
    setRotate(0);
  }

  const callApi = useCallback(async (signal) => {
    if (!file) return;

    const fd = new FormData();
    fd.append("file", file);
    fd.append("size", size);
    fd.append("grayscale", String(grayscale));
    fd.append("rotate", String(rotate));

    const res = await fetch(API_URL, { method: "POST", body: fd, signal });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(getApiErrorMessage(data, t, "imageEditor.unknownError"));
    }

    const blob = await res.blob();
    setResultBlob(blob);
  }, [file, grayscale, rotate, size, t]);

  useEffect(() => {
    if (!file) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError("");
      setBusy(true);
      try {
        await callApi(controller.signal);
      } catch (e) {
        if (e?.name !== "AbortError") {
          setError(
            e instanceof TypeError
              ? t("imageEditor.connectionError")
              : e?.message || t("imageEditor.unknownError"),
          );
        }
      } finally {
        setBusy(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [callApi, file, t]);

  function download() {
    if (!resultBlob) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "edited.png";
    a.click();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="file-upload">
        <label className="file-button">
          {t("imageEditor.pick")}
          <input type="file" accept="image/*" onChange={onPick} hidden />
        </label>

        <span className="file-name">
          {file ? file.name : t("imageEditor.noFileSelected")}
        </span>
      </div>

      <div className="image-editor-controls">
        <section className="image-editor-control-group">
          <h3>{t("imageEditor.resizePresets")}</h3>
          <div className="image-editor-button-row">
            {SIZES.map((s) => (
              <Button
                key={s.key}
                variant={size === s.key ? "primary" : "ghost"}
                onClick={() => setSize(s.key)}
                disabled={!file}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </section>

        <section className="image-editor-control-group">
          <h3>{t("imageEditor.transformations")}</h3>
          <div className="image-editor-button-row">
            <Button variant={grayscale ? "primary" : "ghost"} onClick={() => setGrayscale((v) => !v)} disabled={!file}>
              {t("imageEditor.grayscale")}
            </Button>

            <Button variant="ghost" onClick={() => setRotate(rotateLeft)} disabled={!file}>
              {t("imageEditor.rotateLeft")}
            </Button>

            <Button variant="ghost" onClick={() => setRotate(rotateRight)} disabled={!file}>
              {t("imageEditor.rotateRight")}
            </Button>
          </div>
        </section>

        <section className="image-editor-control-group">
          <h3>{t("imageEditor.export")}</h3>
          <div className="image-editor-button-row">
            <Button variant="ghost" onClick={download} disabled={!resultBlob}>
              {t("imageEditor.download")}
            </Button>
          </div>
        </section>
      </div>

      {busy ? <div className="tip">{t("imageEditor.processing")}</div> : null}
      {error ? <div className="result bad">{error}</div> : null}

      {file ? (
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div className="result" style={{ marginTop: 0 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>{t("imageEditor.original")}</div>
            <img src={originalUrl} alt={t("imageEditor.originalAlt")} style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid var(--border)" }} />
          </div>

          <div className="result" style={{ marginTop: 0 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>{t("imageEditor.output")}</div>
            {resultBlob ? (
              <img src={resultUrl} alt={t("imageEditor.outputAlt")} style={{ width: "100%", height: "auto", borderRadius: 12, border: "1px solid var(--border)" }} />
            ) : (
              <div className="tip">{t("imageEditor.resultPending")}</div>
            )}
          </div>
        </div>
      ) : (
        null
      )}
    </div>
  );
}
