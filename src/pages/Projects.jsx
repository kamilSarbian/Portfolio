import Card from "../components/Card";
import { useTranslation } from "react-i18next";

const API_DOCS_URL = "https://portfolio-api-kym0.onrender.com/docs";
const GITHUB_URL = "https://github.com/kamilSarbian/Portfolio";
const PROJECT_LINKS = {
  auth: {
    githubUrl: GITHUB_URL,
    screenshot: null,
  },
  classifier: {
    githubUrl: GITHUB_URL,
    screenshot: null,
  },
  imageProcessing: {
    githubUrl: GITHUB_URL,
    screenshot: null,
  },
};

const PROJECT_CASES = [
  { id: "auth", onOpenKey: "auth" },
  { id: "classifier", onOpenKey: "classifier" },
  { id: "imageProcessing", onOpenKey: "imageProcessing", secondary: true },
];

function CaseStudy({ id, onOpen, featured = true }) {
  const { t } = useTranslation();
  const base = `projects.caseStudies.${id}`;
  const stack = t(`${base}.stack`, { returnObjects: true });
  const visibleStack = Array.isArray(stack) ? stack.slice(0, 4) : [];
  const links = PROJECT_LINKS[id];

  return (
    <article className={featured ? "case-study" : "case-study case-study--secondary"}>
      <div className="case-study-header">
        <div>
          <h2>{t(`${base}.title`)}</h2>
        </div>
      </div>

      <div className="case-study-grid">
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

      <div className="case-study-footer">
        {links.screenshot ? (
          <img
            className="case-study-screenshot"
            src={links.screenshot}
            alt={t(`${base}.title`)}
            loading="lazy"
          />
        ) : null}

        <div className="case-study-stack-text">
          {visibleStack.join(" · ")}
        </div>

        <div className="case-study-links">
          <button type="button" className="inline-link" onClick={onOpen}>
            {t("projects.viewProject")}
          </button>

          <span aria-hidden="true">|</span>

          <a href={links.githubUrl} target="_blank" rel="noreferrer">
            {t("projects.github")}
          </a>

          <span aria-hidden="true">|</span>

          <a href={API_DOCS_URL} target="_blank" rel="noreferrer">
            {t("projects.apiDocs")}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function Projects({ onOpenAuth, onOpenImageEditor, onOpenImageClassifier }) {
  const { t } = useTranslation();
  const projectActions = {
    auth: onOpenAuth,
    classifier: onOpenImageClassifier,
    imageProcessing: onOpenImageEditor,
  };

  return (
    <div className="projects-layout">
      <Card>
        <h1 className="h1" style={{ fontSize: 30 }}>
          {t("projects.title")}
        </h1>

        <p className="p">{t("projects.subtitle")}</p>

        <div className="divider" />

        <div className="case-study-list">
          {PROJECT_CASES.map((project) => (
            <CaseStudy
              key={project.id}
              id={project.id}
              onOpen={projectActions[project.onOpenKey]}
              featured={!project.secondary}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
