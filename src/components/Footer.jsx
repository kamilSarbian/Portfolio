import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div>{t("home.footer.location")}</div>

      <nav className="footer-links" aria-label="Footer links">
        <a href="mailto:sarbian.kamil@email.com">{t("home.email")}</a>
        <a href="https://github.com/kamilSarbian" target="_blank" rel="noopener noreferrer">
          {t("home.github")}
        </a>
        <a
          href="https://www.linkedin.com/in/kamil-sarbian-3399991ba/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("home.linkedin")}
        </a>
        <a href="https://portfolio-api-kym0.onrender.com/docs" target="_blank" rel="noopener noreferrer">
          {t("projects.apiDocs")}
        </a>
      </nav>
    </footer>
  );
}
