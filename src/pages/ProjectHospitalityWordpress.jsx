import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Card from "../components/Card";

export default function ProjectHospitalityWordpress() {
  const { t } = useTranslation();
  const copy = t("hospitalityWordpress", { returnObjects: true });
  const card = t("projects.caseStudies.hospitalityWordpress", { returnObjects: true });

  return (
    <div className="page living-page">
      <div className="living-page-inner">
        <Card>
          <Link className="project-back-link" to="/projects">
            ← {t("projects.title")}
          </Link>

          <header>
            <p className="living-kicker">{card.kicker}</p>
            <h1 className="h1 living-title">{card.title}</h1>
            <p className="p living-subtitle">{copy.overview}</p>
            <div className="living-status-row">
              <span className="living-status">{copy.status}</span>
            </div>
          </header>

          <div className="divider" />

          <div className="living-sections">
            {Object.entries(copy.sections).map(([key, section]) => (
              <section className="living-section" key={key}>
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

          <div className="divider" />
          <footer className="project-detail-footer living-footer">
            <Link className="inline-link" to="/projects">
              {t("projects.backToCaseStudies")}
            </Link>
          </footer>
        </Card>
      </div>
    </div>
  );
}
