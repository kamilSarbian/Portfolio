import Card from "../components/Card";
import Chip from "../components/Chip";
import Button from "../components/Button";
import ContactForm from "../components/ContactForm";
import { useTranslation } from "react-i18next";

export default function Home({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="grid">
      {/* LEWA KOLUMNA */}
      <Card>
        <div className="section-label">
          <span className="dot" /> {t("home.aboutLabel")}
        </div>

        <h1 className="h1">{t("home.headline")}</h1>

        <p className="p">{t("home.intro")}</p>

        <div className="divider" />

        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
          {t("home.whyTitle")}
        </h2>

        <p className="p" style={{ marginTop: 8 }}>
          {t("home.whyBody")}
        </p>

        <div className="chips">
          <Chip variant="primary">Python</Chip>
          <Chip variant="primary">FastAPI</Chip>
          <Chip variant="primary">PostgreSQL</Chip>
          <Chip>React</Chip>
          <Chip>SQL</Chip>
          <Chip>REST</Chip>
        </div>

        <div className="divider" />

        <div className="actions">
          <Button variant="primary" onClick={onGoProjects}>
            {t("home.seeProjects")}
          </Button>

          <a className="btn ghost" href="https://portfolio-api-kym0.onrender.com/docs" target="_blank" rel="noreferrer">
            {t("home.backendDocs")}
          </a>
        </div>

        <div className="tip">{t("home.tip")}</div>

        <div className="tip">{t("home.demoInfo")}</div>
        <div className="tech-badges">
          <span className="tech-badge">⚡ Live API</span>
          <span className="tech-badge">🐍 FastAPI</span>
          <span className="tech-badge">🔐 JWT Auth</span>
          <span className="tech-badge">🧠 CLIP ML</span>
          <span className="tech-badge">☁️ Render Cloud</span>
          <span className="tech-badge">🗄 PostgreSQL (Neon)</span>
      </div>
      </Card>

      {/* PRAWA KOLUMNA */}
      <div style={{ display: "grid", gap: 18 }}>
        {/* SZYBKIE INFO */}
        <Card>
          <div className="section-label">{t("home.quickTitle")}</div>

          <div className="info">
            {/* NARAZIE NIE POTRZEBNE */}
            {/* <div className="info-row">
              <div className="info-k">{t("home.stack")}</div>
              <div className="info-v">{t("home.stackVal")}</div>
            </div> */}

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

        {/* KONTAKT */}
        <Card>
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
                <strong>{t("home.location")}:</strong> Oslo/{t("home.typeOfWork")}
              </li>

              <li>
                <strong>{t("home.cv")}:</strong>{" "}
                <a href="/Kamil_Sarbian_CV.pdf" target="_blank" rel="noopener noreferrer">
                  Kamil Sarbian (PDF)
                </a>{" "}
                •{" "}
                <a href="/Kamil_Sarbian_CV.pdf" download>
                  {t("home.download")}
                </a>
              </li>

              <li>
                <strong>{t("home.certs")}:</strong>{" "}
                <a href="/DBMS_SQL_ETL_BI_Python.pdf" target="_blank" rel="noopener noreferrer">
                  Kamil Sarbian (PDF)
                </a>
                {" · "}
                <a href="/DBMS_SQL_ETL_BI_Python.pdf" download>
                  {t("home.download")}
                </a>
              </li>

              <li>
                <strong>{t("home.education")}:</strong>{" "}
                <a
                  href="/Generell_godkjenning_av_utenlandsk_utdanning.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Kamil Sarbian (PDF)
                </a>
                {" · "}
                <a
                  href="/Generell_godkjenning_av_utenlandsk_utdanning.pdf"
                  download
                >
                  {t("home.download")}
                </a>
              </li>
            </ul>
          </div>
        </Card>

        {/* WIADOMOŚĆ */}
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
