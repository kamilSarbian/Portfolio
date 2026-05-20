import Card from "../components/Card";
import ImageClassifier from "../components/ImageClassifier";
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

export default function ProjectImageClassifier({ onGoProjects }) {
  const { t } = useTranslation();
  const stack = t("projects.caseStudies.classifier.stack", { returnObjects: true });

  return (
    <div className="page" style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(980px, 100%)" }}>
        <Card>
          <button type="button" className="section-label section-label-link" onClick={onGoProjects}>
            <span className="dot" /> {t("projects.label")}
          </button>

          <h1 className="h1" style={{ fontSize: 30 }}>
            {t("projects.caseStudies.classifier.title")}
          </h1>

          <p className="p">{t("imageClassifier.desc")}</p>

          <div className="divider" />

          <CaseStudySummary caseId="classifier" />

          <div className="divider" />

          <strong>{t("imageClassifier.warning")}</strong>
          <p className="p">{t("imageClassifier.warningDesc")}</p>

          <div className="divider" />

          <ImageClassifier />

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
