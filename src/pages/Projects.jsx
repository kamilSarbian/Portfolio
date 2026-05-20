import Card from "../components/Card";
import Button from "../components/Button";
import { useTranslation } from "react-i18next";

const API_DOCS_URL = "https://portfolio-api-kym0.onrender.com/docs";
const GITHUB_URL = "https://github.com/kamilSarbian/Portfolio";

function CaseStudy({ id, onOpen, featured = true }) {
  const { t } = useTranslation();
  const base = `projects.caseStudies.${id}`;
  const stack = t(`${base}.stack`, { returnObjects: true });

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
          {Array.isArray(stack)
            ? stack.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))
            : null}
        </div>

        <div className="case-study-media-note">
          {t("projects.caseLabels.screenshot")} {t(`${base}.screenshot`)}
        </div>

        <div className="actions">
          <Button variant="primary" onClick={onOpen}>
            {t("projects.liveDemo")}
          </Button>

          <a className="btn ghost" href={GITHUB_URL} target="_blank" rel="noreferrer">
            {t("projects.github")}
          </a>

          <a className="btn ghost" href={API_DOCS_URL} target="_blank" rel="noreferrer">
            {t("projects.apiDocs")}
          </a>
        </div>
      </div>
    </article>
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
    <ul className="plan-list">
      <li>
        <span className="status">Live</span>
        <span className="plan-text">
          {t("projects.experiments.pwned")}{" "}
          <button type="button" className="inline-link" onClick={onOpenPwned}>
            {t("projects.openSmall")}
          </button>
        </span>
      </li>
      <li>
        <span className="status">Live</span>
        <span className="plan-text">{t("projects.experiments.contact")}</span>
      </li>
      <li>
        <span className="status">Lab</span>
        <span className="plan-text">{t("projects.experiments.analytics")}</span>
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
          <div className="section-label">{t("projects.experimentsTitle")}</div>
          <div className="subtle-title">{t("projects.statusTitle")}</div>
          <OtherExperiments onOpenPwned={onOpenPwned} />
        </Card>
      </div>
    </div>
  );
}
