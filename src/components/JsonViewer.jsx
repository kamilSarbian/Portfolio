import { useTranslation } from "react-i18next";

export default function JsonViewer({ title, data }) {
  const { t } = useTranslation();

  if (!data) return null;

  return (
    <div className="result" style={{ marginTop: 0 }}>
      <div style={{ fontWeight: 900, marginBottom: 10 }}>
        {title || t("auth.response") || "API Response"}
      </div>

      <pre
        style={{
          margin: 0,
          padding: 14,
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "rgba(0,0,0,0.25)",
          color: "var(--fg)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflowX: "auto",
          fontSize: 14,
          lineHeight: 1.6,
          fontWeight: 700,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}