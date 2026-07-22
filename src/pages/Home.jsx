import Card from "../components/Card";
import Button from "../components/Button";
import ContactForm from "../components/ContactForm";
import { useTranslation } from "react-i18next";

export default function Home({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="home-grid">
      <Card>
        <h1 className="h1">{t("home.headline")}</h1>

        <p className="p">{t("home.intro")}</p>

        <div className="tip hero-tech-line">
          {t("home.heroTech")}
        </div>

        <div className="divider" />

        <div className="actions hero-actions">
          <Button variant="primary" onClick={onGoProjects}>
            {t("home.seeProjects")}
          </Button>

          <a className="btn ghost" href="#contact">
            {t("home.cta.primary")}
          </a>
        </div>

        <div className="divider hero-section-gap" />

        <h2 className="section-heading">
          {t("home.whyTitle")}
        </h2>

        <div className="what-build-grid">
          <section className="what-build-item">
            <h3>{t("home.whatIBuild.backendTitle")}</h3>
            <p>{t("home.whatIBuild.backendBody")}</p>
          </section>

          <section className="what-build-item">
            <h3>{t("home.whatIBuild.automationTitle")}</h3>
            <p>{t("home.whatIBuild.automationBody")}</p>
          </section>

          <section className="what-build-item">
            <h3>{t("home.whatIBuild.productTitle")}</h3>
            <p>{t("home.whatIBuild.productBody")}</p>
          </section>
        </div>
      </Card>

      <div className="home-side home-side--top">
        <Card>
          <h2 className="section-heading">
            {t("home.howIWork.title")}
          </h2>

          <div className="how-work-list">
            <p>{t("home.howIWork.a")}</p>
            <p>{t("home.howIWork.b")}</p>
            <p>{t("home.howIWork.c")}</p>
            {t("home.howIWork.d") && <p>{t("home.howIWork.d")}</p>}
            {t("home.howIWork.e") && <p>{t("home.howIWork.e")}</p>}
          </div>
        </Card>

        <Card>
          <h2 className="section-heading">{t("home.stackSection.title")}</h2>

          <div className="stack-summary">
            <div>
              <strong>{t("home.stackSection.backend")}</strong>
              <span>{t("home.stackSection.backendValue")}</span>
            </div>

            <div>
              <strong>{t("home.stackSection.database")}</strong>
              <span>{t("home.stackSection.databaseValue")}</span>
            </div>

            <div>
              <strong>{t("home.stackSection.automation")}</strong>
              <span>{t("home.stackSection.automationValue")}</span>
            </div>

            <div>
              <strong>{t("home.stackSection.tools")}</strong>
              <span>{t("home.stackSection.toolsValue")}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="section-heading">
          {t("home.cta.title")}
        </h2>

        <p className="p" style={{ marginTop: 8 }}>
          {t("home.cta.body")}
        </p>

        <div className="divider" />

        <div className="info" style={{ marginTop: 6 }}>
          <ul className="contact-list" style={{ marginTop: 0 }}>
            <li>
              <strong>{t("home.email")}:</strong>{" "}
              <a href="mailto:sarbian.kamil@gmail.com">sarbian.kamil@gmail.com</a>
            </li>

            <li>
              <strong>{t("home.github")}:</strong>{" "}
              <a
                href="https://github.com/kamilSarbian"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/kamilSarbian
              </a>
            </li>

            <li>
              <strong>{t("home.linkedin")}:</strong>{" "}
              <a
                href="https://www.linkedin.com/in/kamil-sarbian-3399991ba/"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/kamilsarbian
              </a>
            </li>

            <li>
              <strong>{t("home.location")}:</strong> Oslo / {t("home.typeOfWork")}
            </li>
          </ul>
        </div>
      </Card>

      <Card id="contact">
        <h2 className="section-heading">{t("home.messageTitle")}</h2>
        <p className="p" style={{ marginTop: 6 }}>
          {t("home.messageBody")}
        </p>

        <div className="divider" />
        <ContactForm />
      </Card>
    </div>
  );
}
