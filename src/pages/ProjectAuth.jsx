import Card from "../components/Card";
import AuthApiDemo from "../components/AuthApiDemo";
import { useTranslation } from "react-i18next";

export default function ProjectAuth({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="page" style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(980px, 100%)" }}>
        <Card>
          <button type="button" className="section-label section-label-link" onClick={onGoProjects}>
            <span className="dot" /> {t("projects.label") || "PROJEKTY"}
          </button>

          <h1 className="h1" style={{ fontSize: 30 }}>
            {t("auth.title") || "Auth & User Management API"}
          </h1>

          <p className="p">
            {t("auth.desc") ||
              "Backend API z rejestracją użytkowników, logowaniem JWT, rolami (admin/user) oraz profilem użytkownika. Projekt pokazuje architekturę backendu, bezpieczeństwo i pracę z bazą danych."}
          </p>

          <div className="divider" />


          <strong>{t("auth.arch")}</strong>
          <p className="p">{t("auth.archDesc")}</p>

          <div className="divider" />


          <div className="result" style={{ marginTop: 0 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              {t("auth.endpointsTitle") || "API Endpoints"}
            </div>

            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, color: "var(--muted)", fontWeight: 650 }}>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>POST</span> /auth/register</li>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>POST</span> /auth/login</li>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>GET</span> /users/profile</li>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>GET</span> /users/admin</li>
            </ul>
          </div>

          <div className="divider" />
            <AuthApiDemo />
          <div className="divider" />

          <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">FastAPI</span>
            <span className="chip">PostgreSQL</span>
            <span className="chip">SQLAlchemy</span>
            <span className="chip">JWT</span>
            <span className="chip">bcrypt</span>
            <span className="chip">Pydantic</span>
        </div>
        
        </Card>
      </div>
    </div>
  );
}