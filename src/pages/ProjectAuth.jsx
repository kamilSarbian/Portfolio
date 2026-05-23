import Card from "../components/Card";
import AuthApiDemo from "../components/AuthApiDemo";
import { useTranslation } from "react-i18next";

const API_DOCS_URL = "https://portfolio-api-kym0.onrender.com/docs";
const GITHUB_URL = "https://github.com/kamilSarbian/Portfolio";

function CaseStudySummary({ caseId }) {
  const { t } = useTranslation();
  const base = `projects.caseStudies.${caseId}`;

  return (
    <div className="case-study-grid case-study-grid--detail">
      <section className="case-study-primary">
        <h3>{t("projects.caseLabels.problem")}</h3>
        <p>{t(`${base}.problem`)}</p>
      </section>

      <section className="case-study-primary">
        <h3>{t("projects.caseLabels.solution")}</h3>
        <p>{t(`${base}.solution`)}</p>
      </section>

      <section>
        <h3>{t("projects.caseLabels.businessValue")}</h3>
        <p>{t(`${base}.businessValue`)}</p>
      </section>

      <section>
        <h3>{t("projects.caseLabels.productionThinking")}</h3>
        <p>{t(`${base}.productionThinking`)}</p>
      </section>
    </div>
  );
}

export default function ProjectAuth({ onGoProjects }) {
  const { t } = useTranslation();
  const stack = t("projects.caseStudies.auth.stack", { returnObjects: true });
  const endpoints = [
    ["POST", "/auth/register"],
    ["POST", "/auth/login"],
    ["GET", "/users/profile"],
    ["GET", "/users"],
  ];

  return (
    <div className="page" style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(980px, 100%)" }}>
        <Card>
          <button type="button" className="project-back-link" onClick={onGoProjects}>
            ← {t("projects.title")}
          </button>

          <h1 className="h1" style={{ fontSize: 30 }}>
            {t("projects.caseStudies.auth.title")}
          </h1>

          <p className="p">{t("auth.desc")}</p>

          <CaseStudySummary caseId="auth" />

          <div className="divider" />

          <section className="endpoint-panel">
            <h2 className="endpoint-title">
              {t("auth.endpointsTitle")}
            </h2>

            <div className="endpoint-grid">
              {endpoints.map(([method, path]) => (
                <div className="endpoint-pill" key={`${method}-${path}`}>
                  <span>{method}</span>
                  <code>{path}</code>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          <AuthApiDemo />

          <div className="divider" />

          <footer className="project-detail-footer">
            <div>
              <h2>{t("projects.caseLabels.stack")}</h2>
              <p>{Array.isArray(stack) ? stack.join(" · ") : ""}</p>
            </div>

            <nav className="project-detail-links" aria-label="Project links">
              <button type="button" className="inline-link" onClick={onGoProjects}>
                {t("projects.backToCaseStudies")}
              </button>
              <span aria-hidden="true">|</span>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                {t("projects.github")}
              </a>
              <span aria-hidden="true">|</span>
              <a href={API_DOCS_URL} target="_blank" rel="noreferrer">
                {t("projects.apiDocs")}
              </a>
            </nav>
          </footer>
        </Card>
      </div>
    </div>
  );
}
