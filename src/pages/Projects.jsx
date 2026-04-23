import Card from "../components/Card";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";

function RoadmapList() {
  const { t } = useTranslation();
  return (
    <ul className="roadmap-list">
      <li>{t("projects.roadmap.a")}</li>
      <li>{t("projects.roadmap.b")}</li>
      <li>{t("projects.roadmap.c")}</li>
      <li>{t("projects.roadmap.d")}</li>
      <li>{t("projects.roadmap.e")}</li>
    </ul>
  );
}

function PlannedProjects() {
  const { t } = useTranslation();

  return (
    <ul className="plan-list">
      <li><span className="status done">✅</span><span className="plan-text">{t("projects.planned.a")}</span></li>
      <li><span className="status done">✅</span><span className="plan-text">{t("projects.planned.b")}</span></li>
      <li><span className="status done">✅</span><span className="plan-text">{t("projects.planned.c")}</span></li>
      <li><span className="status next">✅</span><span className="plan-text">{t("projects.planned.d")}</span></li>
      <li><span className="status later">✅</span><span className="plan-text">{t("projects.planned.e")}</span></li>
      <li><span className="status later">🔜</span><span className="plan-text">{t("projects.planned.f")}</span></li>
      {/* <li><span className="status later">⏳</span><span className="plan-text">{t("projects.planned.g")}</span></li> */}
      {/* <li><span className="status later">⏳</span><span className="plan-text">{t("projects.planned.h")}</span></li> */}
    </ul>
  );
}

export default function Projects({ onOpenAuth, onOpenPwned, onOpenImageEditor, onOpenImageClassifier }) {
  const { t } = useTranslation();

  return (
    <div className="grid">
      <Card>
        <div className="section-label">
          <span className="dot" /> {t("projects.label")}
        </div>
{/* LEWA KOLUMNA */}
        <h1 className="h1" style={{ fontSize: 30 }}>
          {t("projects.title")}
        </h1>

        <p className="p">{t("projects.subtitle")}</p>

        <div className="divider" />

        <div className="result" style={{ marginTop: 0 }}>
          <strong>{t("projects.authTitle")}</strong>
          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 500 }}>
            {t("projects.authDesc")}
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <Button
              variant="primary"
              onClick={() => onOpenAuth && onOpenAuth()}
              disabled={!onOpenAuth}
            >
              {t("projects.open")}
            </Button>
            <a className="btn ghost" href="https://portfolio-api-kym0.onrender.com/docs" target="_blank" rel="noreferrer">
              {t("projects.apiDocs")}
            </a>
          </div>

          <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">FastAPI</span>
            <span className="chip">PostgreSQL</span>
            <span className="chip">SQLAlchemy</span>
            <span className="chip">JWT</span>
            <span className="chip">bcrypt</span>
          </div>
        </div>

        <div className="divider" />

        <div className="result" style={{ marginTop: 0 }}>
          <strong>{t("projects.imgClassTitle")}</strong>
          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 500 }}>
            {t("projects.imgClassDesc")}
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <Button variant="primary" onClick={onOpenImageClassifier}>
              {t("projects.open")}
            </Button>
            <a className="btn ghost" href="https://portfolio-api-kym0.onrender.com/docs" target="_blank" rel="noreferrer">
              {t("projects.apiDocs")}
            </a>
          </div>
          <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">ML</span>
            <span className="chip">FastAPI</span>
            <span className="chip">REST API</span>
          </div>
        </div>

        <div className="divider" />

        <div className="result" style={{ marginTop: 0 }}>
          <strong>{t("projects.imgTitle")}</strong>
          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 500 }}>
            {t("projects.imgDesc")}
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <Button variant="primary" onClick={onOpenImageEditor}>
              {t("projects.open")}
            </Button>
            <a className="btn ghost" href="https://portfolio-api-kym0.onrender.com/docs" target="_blank" rel="noreferrer">
              {t("projects.apiDocs")}
            </a>
          </div>
          <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">FastAPI</span>
            <span className="chip">Image Processing</span>
            <span className="chip">REST API</span>
          </div>
        </div>

        <div className="divider" />

        <div className="result" style={{ marginTop: 0 }}>
          <strong>{t("projects.pwnedTitle")}</strong>
          <div style={{ marginTop: 6, color: "var(--muted)", fontWeight: 500 }}>
            {t("projects.pwnedDesc")}
          </div>

          <div className="actions" style={{ marginTop: 12 }}>
            <Button variant="primary" onClick={onOpenPwned}>
              {t("projects.open")}
            </Button>
            <a className="btn ghost" href="https://portfolio-api-kym0.onrender.com/docs" target="_blank" rel="noreferrer">
              {t("projects.apiDocs")}
            </a>
          </div>
          <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">FastAPI</span>
            <span className="chip">REST API</span>
            <span className="chip">HIBP API</span>
          </div>
        </div>

        <div className="divider" />
      </Card>
{/* PRAWA KOLUMNA */}
      <div className="right-col">
        <Card>
          <div className="section-label">{t("projects.planTitle")}</div>
          <RoadmapList />
        </Card>

        <Card>
          <div className="section-label">{t("projects.plannedTitle")}</div>
          <div className="subtle-title">{t("projects.statusTitle")}</div>
          <PlannedProjects />
        </Card>
      </div>
    </div>
  );
}
