import { useTranslation } from "react-i18next";

import Card from "../components/Card";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function TextList({ items }) {
  return (
    <ul>
      {asArray(items).map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function ContentCards({ items }) {
  return (
    <div className="living-content-grid">
      {asArray(items).map((item) => (
        <article className="living-content-card" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export default function ProjectLivingStartpakke({ onGoProjects }) {
  const { t } = useTranslation();
  const facts = t("livingStartpakke.facts", { returnObjects: true });
  const problem = t("livingStartpakke.sections.problem", { returnObjects: true });
  const discovery = t("livingStartpakke.sections.discovery", { returnObjects: true });
  const research = t("livingStartpakke.sections.research", { returnObjects: true });
  const prototype = t("livingStartpakke.sections.prototype", { returnObjects: true });
  const current = t("livingStartpakke.sections.current", { returnObjects: true });
  const risks = t("livingStartpakke.sections.risks", { returnObjects: true });

  return (
    <div className="page living-page">
      <div className="living-page-inner">
        <Card>
          <button type="button" className="project-back-link" onClick={onGoProjects}>
            ← {t("projects.title")}
          </button>

          <p className="living-kicker">{t("livingStartpakke.kicker")}</p>
          <h1 className="h1 living-title">{t("livingStartpakke.title")}</h1>
          <p className="p living-subtitle">{t("livingStartpakke.subtitle")}</p>
          <p className="living-status-statement">{t("livingStartpakke.statusStatement")}</p>

          <div className="living-status-row">
            <span className="living-status">{t("livingStartpakke.status")}</span>
            <span className="private-repository-badge">{t("livingStartpakke.privateResearch")}</span>
            <span className="living-updated">{t("livingStartpakke.updated")}</span>
          </div>

          <dl className="living-facts-grid">
            {asArray(facts).map((fact) => (
              <div className="living-fact" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="divider" />

          <div className="living-sections">
            <section className="living-section">
              <h2>{problem.title}</h2>
              <p>{problem.body}</p>
              <TextList items={problem.items} />
              <div className="living-boundary">
                <h3>{problem.boundaryTitle}</h3>
                <p>{problem.boundaryBody}</p>
              </div>
            </section>

            <section className="living-section">
              <h2>{discovery.title}</h2>
              <p>{discovery.body}</p>
              <div className="living-evidence-grid">
                {asArray(discovery.evidence).map((item) => (
                  <article className="living-evidence-card" key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                    <p>{item.body}</p>
                  </article>
                ))}
              </div>
              <p className="living-note">{discovery.note}</p>
            </section>

            <section className="living-section">
              <h2>{research.title}</h2>
              <ContentCards items={research.themes} />
              <div className="living-direction-change">
                <h3>{research.directionTitle}</h3>
                <p>{research.directionBody}</p>
                <p>{research.directionNote}</p>
              </div>
            </section>

            <section className="living-section" id="prototype" tabIndex={-1}>
              <h2>{prototype.title}</h2>
              <p>{prototype.body}</p>
              <span className="living-prototype-badge">{prototype.badge}</span>
              <ContentCards items={prototype.views} />
              <div className="living-boundary">
                <h3>{prototype.interactionsTitle}</h3>
                <p>{prototype.interactionsBody}</p>
              </div>
              <p className="living-note">{prototype.limitation}</p>
            </section>

            <section className="living-section">
              <h2>{current.title}</h2>
              <p>{current.body}</p>
              <h3 className="living-subheading">{current.questionsTitle}</h3>
              <TextList items={current.questions} />
              <h3 className="living-subheading">{current.constraintsTitle}</h3>
              <TextList items={current.constraints} />
            </section>

            <section className="living-section">
              <h2>{risks.title}</h2>
              <ContentCards items={risks.items} />
              <h3 className="living-subheading">{risks.nextTitle}</h3>
              <TextList items={risks.nextSteps} />
            </section>
          </div>

          <div className="divider" />

          <footer className="project-detail-footer living-footer">
            <button type="button" className="inline-link" onClick={onGoProjects}>
              {t("projects.backToCaseStudies")}
            </button>
            <span className="private-repository-badge">{t("livingStartpakke.privateResearch")}</span>
          </footer>
        </Card>
      </div>
    </div>
  );
}
