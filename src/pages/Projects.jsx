import Card from "../components/Card";
import { useTranslation } from "react-i18next";

const API_DOCS_URL = "https://api.kamilsarbian.dev/docs";
const GITHUB_URL = "https://github.com/kamilSarbian/Portfolio";
const PROJECT_LINKS = {
  auth: {
    githubUrl: GITHUB_URL,
    apiDocsUrl: API_DOCS_URL,
    screenshot: null,
  },
  jarvis: {
    architecture: true,
    privateRepository: true,
    screenshot: null,
  },
  living: {
    prototype: true,
    privateResearch: true,
    screenshot: null,
  },
  classifier: {
    githubUrl: GITHUB_URL,
    apiDocsUrl: API_DOCS_URL,
    screenshot: null,
  },
  imageProcessing: {
    githubUrl: GITHUB_URL,
    apiDocsUrl: API_DOCS_URL,
    screenshot: null,
  },
};

const PROJECT_CASES = [
  { id: "auth", onOpenKey: "auth" },
  { id: "jarvis", onOpenKey: "jarvis", onArchitectureKey: "jarvisArchitecture" },
  { id: "living", onOpenKey: "living", onPrototypeKey: "livingPrototype", productCase: true },
  { id: "classifier", onOpenKey: "classifier" },
  { id: "imageProcessing", onOpenKey: "imageProcessing", secondary: true },
];

function CaseStudy({ id, onOpen, onOpenArchitecture, onOpenPrototype, featured = true, productCase = false }) {
  const { t } = useTranslation();
  const base = `projects.caseStudies.${id}`;
  const stack = t(`${base}.stack`, { returnObjects: true });
  const visibleStack = Array.isArray(stack) ? stack.slice(0, 4) : [];
  const links = PROJECT_LINKS[id];
  const kicker = t(`${base}.kicker`, { defaultValue: "" });
  const fields = productCase
    ? ["problem", "discovery", "currentDirection", "currentStage"]
    : ["problem", "solution", "businessValue", "productionThinking"];

  return (
    <article className={featured ? "case-study" : "case-study case-study--secondary"}>
      <div className="case-study-header">
        <div>
          {kicker ? <p className="case-study-kicker">{kicker}</p> : null}
          <h2>{t(`${base}.title`)}</h2>
        </div>
      </div>

      <div className="case-study-grid">
        {fields.map((field) => (
          <section key={field}>
            <h3>
              {productCase
                ? t(`${base}.cardLabels.${field}`)
                : t(`projects.caseLabels.${field}`)}
            </h3>
            <p>{t(`${base}.${field}`)}</p>
          </section>
        ))}
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

          {links.architecture ? (
            <>
              <span aria-hidden="true">|</span>
              <button type="button" className="inline-link" onClick={onOpenArchitecture}>
                {t("projects.viewArchitecture")}
              </button>
            </>
          ) : null}

          {links.prototype ? (
            <>
              <span aria-hidden="true">|</span>
              <button type="button" className="inline-link" onClick={onOpenPrototype}>
                {t("projects.viewPrototype")}
              </button>
            </>
          ) : null}

          {links.githubUrl ? (
            <>
              <span aria-hidden="true">|</span>
              <a href={links.githubUrl} target="_blank" rel="noreferrer">
                {t("projects.github")}
              </a>
            </>
          ) : null}

          {links.apiDocsUrl ? (
            <>
              <span aria-hidden="true">|</span>
              <a href={links.apiDocsUrl} target="_blank" rel="noreferrer">
                {t("projects.apiDocs")}
              </a>
            </>
          ) : null}

          {links.privateRepository ? (
            <span className="private-repository-badge">
              {t("projects.privateRepository")}
            </span>
          ) : null}

          {links.privateResearch ? (
            <span className="private-repository-badge">
              {t("projects.privateResearch")}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function Projects({
  onOpenAuth,
  onOpenJarvis,
  onOpenJarvisArchitecture,
  onOpenLiving,
  onOpenLivingPrototype,
  onOpenImageEditor,
  onOpenImageClassifier,
}) {
  const { t } = useTranslation();
  const projectActions = {
    auth: onOpenAuth,
    jarvis: onOpenJarvis,
    jarvisArchitecture: onOpenJarvisArchitecture,
    living: onOpenLiving,
    livingPrototype: onOpenLivingPrototype,
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
              onOpenArchitecture={projectActions[project.onArchitectureKey]}
              onOpenPrototype={projectActions[project.onPrototypeKey]}
              featured={!project.secondary}
              productCase={project.productCase}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

