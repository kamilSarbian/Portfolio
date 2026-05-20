import Card from "../components/Card";
import AuthApiDemo from "../components/AuthApiDemo";
import { useTranslation } from "react-i18next";

function CaseStudySummary({ caseId }) {
  const { t } = useTranslation();
  const base = `projects.caseStudies.${caseId}`;

  return (
    <div className="case-study-grid case-study-grid--detail">
      <section>
        <h3>{t("projects.caseLabels.problem")}</h3>
        <p>{t(`${base}.problem`)}</p>
      </section>

      <section>
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

  return (
    <div className="page" style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(980px, 100%)" }}>
        <Card>
          <button type="button" className="section-label section-label-link" onClick={onGoProjects}>
            <span className="dot" /> {t("projects.label")}
          </button>

          <h1 className="h1" style={{ fontSize: 30 }}>
            {t("projects.caseStudies.auth.title")}
          </h1>

          <p className="p">{t("auth.desc")}</p>

          <img
            className="case-study-preview"
            src="/projects/auth-api.png"
            alt={t("projects.caseStudies.auth.title")}
            loading="lazy"
          />

          <div className="divider" />

          <CaseStudySummary caseId="auth" />

          <div className="divider" />

          <div className="result" style={{ marginTop: 0 }}>
            <div style={{ fontWeight: 900, marginBottom: 8 }}>
              {t("auth.endpointsTitle")}
            </div>

            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, color: "var(--muted)", fontWeight: 650 }}>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>POST</span> /backend/auth/register</li>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>POST</span> /backend/auth/login</li>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>GET</span> /backend/users/profile</li>
              <li><span style={{ color: "var(--fg)", fontWeight: 900 }}>GET</span> /backend/users</li>
            </ul>
          </div>

          <div className="divider" />

          <AuthApiDemo />

          <div className="divider" />

          <div className="chips">
            {Array.isArray(stack)
              ? stack.map((item) => (
                  <span className="chip" key={item}>
                    {item}
                  </span>
                ))
              : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
