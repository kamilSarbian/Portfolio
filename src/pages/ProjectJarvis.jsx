import { useTranslation } from "react-i18next";

import Card from "../components/Card";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function DetailSection({ section }) {
  return (
    <section className="jarvis-section">
      <h2>{section.title}</h2>
      {section.body ? <p>{section.body}</p> : null}
      {asArray(section.items).length ? (
        <ul>
          {asArray(section.items).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {section.note ? <p className="jarvis-section-note">{section.note}</p> : null}
    </section>
  );
}

function FlowNode({ children, emphasized = false }) {
  return (
    <div className={`jarvis-architecture-node${emphasized ? " jarvis-architecture-node--gateway" : ""}`}>
      {children}
    </div>
  );
}

function FlowArrow() {
  return <span className="jarvis-architecture-arrow" aria-hidden="true">→</span>;
}

function ArchitectureDiagram({ architecture }) {
  const branches = [
    architecture.deepseek,
    architecture.workspace,
    architecture.semantic,
    architecture.scheduled,
    architecture.tools,
  ];

  return (
    <section className="jarvis-section jarvis-architecture" id="architecture" tabIndex={-1}>
      <h2>{architecture.title}</h2>
      <p>{architecture.body}</p>

      <div className="jarvis-architecture-panel">
        <h3>{architecture.mainTitle}</h3>
        <div className="jarvis-architecture-chain" aria-label={architecture.mainAriaLabel}>
          <FlowNode>{architecture.user}</FlowNode>
          <FlowArrow />
          <FlowNode>{architecture.telegram}</FlowNode>
          <FlowArrow />
          <FlowNode emphasized>{architecture.gateway}</FlowNode>
        </div>
        <div className="jarvis-architecture-branch-arrow" aria-hidden="true">↓</div>
        <div className="jarvis-architecture-branches">
          {branches.map((branch) => (
            <FlowNode key={branch}>{branch}</FlowNode>
          ))}
        </div>
      </div>

      <div className="jarvis-architecture-supporting">
        <h3>{architecture.supportingTitle}</h3>
        <div className="jarvis-service-flow" aria-label={architecture.portfolioAriaLabel}>
          <FlowNode>{architecture.portfolioForm}</FlowNode>
          <FlowArrow />
          <FlowNode>{architecture.tunnel}</FlowNode>
          <FlowArrow />
          <FlowNode>{architecture.middleware}</FlowNode>
          <FlowArrow />
          <FlowNode>{architecture.openClaw}</FlowNode>
        </div>
        <div className="jarvis-service-flow" aria-label={architecture.restAriaLabel}>
          <FlowNode>{architecture.genericClient}</FlowNode>
          <FlowArrow />
          <FlowNode>{architecture.restService}</FlowNode>
          <FlowArrow />
          <FlowNode>{architecture.deepseekApi}</FlowNode>
        </div>
      </div>
    </section>
  );
}

export default function ProjectJarvis({ onGoProjects }) {
  const { t } = useTranslation();
  const facts = t("jarvis.facts", { returnObjects: true });
  const sections = t("jarvis.sections", { returnObjects: true });
  const architecture = t("jarvis.architecture", { returnObjects: true });
  const sectionOrder = [
    "problem",
    "usage",
    "openClaw",
    "contribution",
    "memory",
    "automation",
    "deployment",
    "security",
    "reliability",
    "outsideScope",
    "results",
    "nextSteps",
  ];

  return (
    <div className="page jarvis-page">
      <div className="jarvis-page-inner">
        <Card>
          <button type="button" className="project-back-link" onClick={onGoProjects}>
            ← {t("projects.title")}
          </button>

          <h1 className="h1 jarvis-title">{t("jarvis.title")}</h1>
          <p className="p jarvis-subtitle">{t("jarvis.subtitle")}</p>

          <div className="jarvis-status-row">
            <span className="jarvis-status">{t("jarvis.status")}</span>
            <span className="private-repository-badge">{t("jarvis.privateRepository")}</span>
          </div>

          <dl className="jarvis-meta-grid">
            {asArray(facts).map((fact) => (
              <div className="jarvis-meta-item" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="divider" />

          <div className="jarvis-sections">
            {sectionOrder.slice(0, 2).map((sectionKey) => (
              <DetailSection key={sectionKey} section={sections[sectionKey]} />
            ))}

            <ArchitectureDiagram architecture={architecture} />

            {sectionOrder.slice(2).map((sectionKey) => (
              <DetailSection key={sectionKey} section={sections[sectionKey]} />
            ))}
          </div>

          <div className="divider" />

          <footer className="project-detail-footer">
            <button type="button" className="inline-link" onClick={onGoProjects}>
              {t("projects.backToCaseStudies")}
            </button>
            <span className="private-repository-badge">{t("jarvis.privateRepository")}</span>
          </footer>
        </Card>
      </div>
    </div>
  );
}
