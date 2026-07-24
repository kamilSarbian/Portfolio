import { useTranslation } from "react-i18next";

import Button from "../components/Button";

export default function NotFound({ onGoHome, onGoProjects }) {
  const { t } = useTranslation();

  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="card not-found-card">
        <p className="not-found-eyebrow">{t("notFound.eyebrow")}</p>
        <h1 id="not-found-title">{t("notFound.title")}</h1>
        <p>{t("notFound.body")}</p>
        <div className="not-found-actions">
          <Button type="button" variant="primary" onClick={onGoHome}>
            {t("notFound.home")}
          </Button>
          <Button type="button" onClick={onGoProjects}>
            {t("notFound.projects")}
          </Button>
        </div>
      </div>
    </section>
  );
}
