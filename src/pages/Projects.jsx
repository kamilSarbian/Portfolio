import Card from "../components/Card";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";

const API_DOCS_URL = "https://portfolio-api-kym0.onrender.com/docs";
const GITHUB_URL = "https://github.com/kamilSarbian/Portfolio";
const PROJECT_LINKS = {
  auth: {
    demoUrl: "https://kamilsarbian-dev.vercel.app/projects/auth-api",
    githubUrl: GITHUB_URL,
    asset: "/projects/auth-api.png",
    status: "live",
  },
  classifier: {
    demoUrl: "https://kamilsarbian-dev.vercel.app/projects/image-classifier",
    githubUrl: GITHUB_URL,
    asset: "/projects/image-classifier.png",
    status: "live",
  },
  imageProcessing: {
    demoUrl: "https://kamilsarbian-dev.vercel.app/projects/image-editor",
    githubUrl: GITHUB_URL,
    asset: "/projects/image-processing.png",
    status: "live",
  },
};

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
          <div className="case-study-kicker">
            {featured ? t("projects.featuredLabel") : t("projects.secondaryLabel")}
          </div>
          <h2>{t(`${base}.title`)}</h2>
        </div>
      </div>

      <img
        className="case-study-preview"
        src={links.asset}
        alt={t(`${base}.title`)}
        loading="lazy"
      />

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
        <div className="chips case-study-stack">
          {visibleStack.map((item) => (
            <span className="chip" key={item}>
              {item}
            </span>
          ))}
        </div>

        <div className="case-study-media-note">
          {t("projects.caseLabels.screenshot")} {links.asset}
        </div>

        <div className="actions">
          {links.status === "live" ? (
            <a className="btn primary" href={links.demoUrl} target="_blank" rel="noreferrer">
              {t("projects.liveDemo")}
            </a>
          ) : (
            <Button variant="primary" disabled>
              {t("projects.comingSoon")}
            </Button>
          )}

          <a className="btn ghost" href={links.githubUrl} target="_blank" rel="noreferrer">
            {t("projects.github")}
          </a>

          <a className="btn ghost" href={API_DOCS_URL} target="_blank" rel="noreferrer">
            {t("projects.apiDocs")}
          </a>

          <Button variant="ghost" onClick={onOpen}>
            {t("projects.openInApp")}
          </Button>
        </div>
      </div>
    </article>
  );
}

function LiveDemoMatrix() {
  const { t } = useTranslation();
  const rows = [
    ["auth", "auth"],
    ["classifier", "classifier"],
    ["imageProcessing", "imageProcessing"],
  ];

  return (
    <div className="demo-matrix">
      <div className="demo-matrix-row demo-matrix-head">
        <span>{t("projects.demoMatrix.project")}</span>
        <span>{t("projects.demoMatrix.liveDemo")}</span>
        <span>{t("projects.demoMatrix.github")}</span>
        <span>{t("projects.demoMatrix.asset")}</span>
        <span>{t("projects.demoMatrix.status")}</span>
      </div>

      {rows.map(([id, caseId]) => {
        const links = PROJECT_LINKS[id];
        return (
          <div className="demo-matrix-row" key={id}>
            <span>{t(`projects.caseStudies.${caseId}.title`)}</span>
            <a href={links.demoUrl} target="_blank" rel="noreferrer">
              {t("projects.liveDemo")}
            </a>
            <a href={links.githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <span>{links.asset}</span>
            <strong>{links.status === "live" ? t("projects.statusLive") : t("projects.comingSoon")}</strong>
          </div>
        );
      })}
    </div>
  );
}

function SystemFocusList() {
  const { t } = useTranslation();
  return (
    <ul className="system-focus-list">
      <li>{t("projects.systemFocus.a")}</li>
      <li>{t("projects.systemFocus.b")}</li>
      <li>{t("projects.systemFocus.c")}</li>
      <li>{t("projects.systemFocus.d")}</li>
      <li>{t("projects.systemFocus.e")}</li>
    </ul>
  );
}

function OtherExperiments({ onOpenPwned }) {
  const { t } = useTranslation();

  return (
    <ul className="experiments-list">
      <li>
        <span className="status">Live</span>
        <span className="experiment-text">
          {t("projects.experiments.pwned")}{" "}
          <button type="button" className="inline-link" onClick={onOpenPwned}>
            {t("projects.openSmall")}
          </button>
        </span>
      </li>
      <li>
        <span className="status">Live</span>
        <span className="experiment-text">{t("projects.experiments.contact")}</span>
      </li>
      <li>
        <span className="status">Lab</span>
        <span className="experiment-text">{t("projects.experiments.analytics")}</span>
      </li>
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

        <h1 className="h1" style={{ fontSize: 30 }}>
          {t("projects.title")}
        </h1>

        <p className="p">{t("projects.subtitle")}</p>

        <div className="divider" />

        <div className="case-study-list">
          <CaseStudy id="auth" onOpen={onOpenAuth} />
          <CaseStudy id="classifier" onOpen={onOpenImageClassifier} />
          <CaseStudy id="imageProcessing" onOpen={onOpenImageEditor} featured={false} />
        </div>
      </Card>

      <div className="right-col">
        <Card>
          <div className="section-label">{t("projects.planTitle")}</div>
          <SystemFocusList />
        </Card>

        <Card>
          <div className="section-label">{t("projects.demoMatrix.title")}</div>
          <LiveDemoMatrix />
        </Card>

        <Card>
          <div className="section-label">{t("projects.experimentsTitle")}</div>
          <div className="subtle-title">{t("projects.statusTitle")}</div>
          <OtherExperiments onOpenPwned={onOpenPwned} />
        </Card>
      </div>
    </div>
  );
}
