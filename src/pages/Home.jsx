import Card from "../components/Card";
import Button from "../components/Button";
import ContactForm from "../components/ContactForm";
import { useTranslation } from "react-i18next";

const STACK_ROWS = [
  ["backend", "backendValue"],
  ["data", "dataValue"],
  ["integrations", "integrationsValue"],
  ["automation", "automationValue"],
  ["infrastructure", "infrastructureValue"],
];

export default function Home({ onGoProjects }) {
  const { t } = useTranslation();
  const howIWorkSteps = t("home.howIWork.steps", { returnObjects: true });
  const methods = t("home.stackSection.methods", { returnObjects: true });
  const contactTopics = t("home.contactSection.topics", {
    returnObjects: true,
  });

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
            {t("home.heroContact")}
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

      <Card data-home-panel="stack">
        <h2 className="section-heading">{t("home.stackSection.title")}</h2>

        <dl className="stack-summary">
          {STACK_ROWS.map(([labelKey, valueKey]) => (
            <div key={labelKey}>
              <dt>{t(`home.stackSection.${labelKey}`)}</dt>
              <dd>{t(`home.stackSection.${valueKey}`)}</dd>
            </div>
          ))}
        </dl>

        <section className="stack-methods">
          <h3>{t("home.stackSection.methodsTitle")}</h3>
          <ul className="method-chips" role="list">
            {Array.isArray(methods) &&
              methods.map((method) => <li key={method}>{method}</li>)}
          </ul>
        </section>
      </Card>

      <div className="home-full-row">
        <Card>
          <h2 className="section-heading">
            {t("home.howIWork.title")}
          </h2>

          <ol className="how-work-list" role="list">
            {Array.isArray(howIWorkSteps) &&
              howIWorkSteps.map((step, index) => (
                <li key={step}>
                  <span className="how-work-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
          </ol>
        </Card>
      </div>

      <div className="home-full-row">
        <Card id="contact">
          <h2 className="section-heading">{t("home.contactSection.title")}</h2>

          <div className="home-contact-grid">
            <section className="home-contact-details">
              <h3 className="home-contact-subheading">
                {t("home.contactSection.detailsTitle")}
              </h3>
              <p className="home-contact-copy">{t("home.contactSection.body")}</p>

              <div className="info">
                <ul className="contact-list">
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

              <div className="home-contact-topics">
                <h4>{t("home.contactSection.topicsTitle")}</h4>
                <ul>
                  {Array.isArray(contactTopics) &&
                    contactTopics.map((topic) => <li key={topic}>{topic}</li>)}
                </ul>
              </div>
            </section>

            <section className="home-contact-form">
              <h3 className="home-contact-subheading">
                {t("home.contactSection.formTitle")}
              </h3>
              <ContactForm />
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
