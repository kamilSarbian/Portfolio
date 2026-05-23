import Card from "../components/Card";
import PasswordChecker from "../components/PasswordChecker";
import { useTranslation } from "react-i18next";

export default function ProjectPwned({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="grid">
      <Card>
        <button type="button" className="project-back-link" onClick={onGoProjects}>
          ← {t("projects.label")}
        </button>

        <h1 className="h1" style={{ fontSize: 30 }}>
          {t("pwnedProject.title")}
        </h1>
        <p className="p">{t("pwnedProject.desc")}</p>

        <div className="divider" />
        
        <strong>{t("pwnedProject.arch")}</strong>
        <p className="p">{t("pwnedProject.archDesc")}</p>

        <div className="divider" />
        <PasswordChecker />
        <div className="divider" />
        <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">FastAPI</span>
            <span className="chip">REST API</span>
            <span className="chip">HIBP API</span>
            <span className="chip">SHA-1 hashing</span>
          </div>
      </Card>

      <Card>
        <div className="section-label">{t("pwnedProject.howTitle")}</div>

        <p className="p">
          1) {t("pwnedProject.how1")}
          <br />
          2) {t("pwnedProject.how2")}
          <br />
          3) {t("pwnedProject.how3")}
        </p>

        <div className="divider" />

        <a className="small-link" href="https://portfolio-api-kym0.onrender.com/docs" target="_blank" rel="noreferrer">
          {t("pwnedProject.docs")}
        </a>
      </Card>
    </div>
  );
}
