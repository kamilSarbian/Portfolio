import Card from "../components/Card";
import Button from "../components/Button";
import ContactForm from "../components/ContactForm";
import { useTranslation } from "react-i18next";

export default function Home({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="grid">
      <Card>
        <div className="section-label">
          <span className="dot" /> {t("home.aboutLabel")}
        </div>

        <h1 className="h1">{t("home.headline")}</h1>

        <p className="p">{t("home.intro")}</p>

        <div className="tip" style={{ marginTop: 14 }}>
          {t("home.heroTech")}
        </div>

        <div className="divider" />

        <div className="actions">
          <Button variant="primary" onClick={onGoProjects}>
            {t("home.seeProjects")}
          </Button>

          <a className="btn ghost" href="#contact">
            {t("home.cta.primary")}
          </a>
        </div>

        <div className="tip">{t("home.tip")}</div>

        <div className="divider" />

        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
          {t("home.whyTitle")}
        </h2>

        <p className="p" style={{ marginTop: 8 }}>
          {t("home.whyBody")}
        </p>

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
            <h3>{t("home.whatIBuild.integrationTitle")}</h3>
            <p>{t("home.whatIBuild.integrationBody")}</p>
          </section>
        </div>
      </Card>

      <div style={{ display: "grid", gap: 18 }}>
        <Card>
          <div className="section-label">{t("home.quickTitle")}</div>

          <div className="info">
            <div className="info-row">
              <div className="info-k">{t("home.goal")}</div>
              <div className="info-v">{t("home.goalVal")}</div>
            </div>

            <div className="info-row">
              <div className="info-k">{t("home.today")}</div>
              <div className="info-v">{t("home.todayVal")}</div>
            </div>
          </div>

          <div className="divider" />

          <p className="p" style={{ marginTop: 0 }}>
            {t("home.quickBody")}
          </p>
        </Card>

        <Card id="contact">
          <div className="section-label">{t("home.contactTitle")}</div>

          <div className="info" style={{ marginTop: 6 }}>
            <ul className="contact-list" style={{ marginTop: 0 }}>
              <li>
                <strong>{t("home.email")}:</strong>{" "}
                <a href="mailto:sarbian.kamil@email.com">sarbian.kamil@email.com</a>
              </li>

              <li>
                <strong>{t("home.phone")}:</strong>{" "}
                <a href="tel:+4792511661">+47 92 51 16 61</a>
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

        <Card>
          <div className="section-label">{t("home.messageTitle")}</div>
          <p className="p" style={{ marginTop: 6 }}>
            {t("home.messageBody")}
          </p>

          <div className="divider" />
          <ContactForm />
        </Card>
      </div>
    </div>
  );
}
