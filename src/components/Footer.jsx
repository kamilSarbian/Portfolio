import { useTranslation } from "react-i18next";

const icons = {
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16v12H4V6Zm2.2 2 5.8 4.4L17.8 8H6.2Zm11.8 8V9.9l-6 4.5-6-4.5V16h12Z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.3-2.3-.3-4.7-1.2-4.7-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.6s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.3.2 2.3.1 2.6a3.9 3.9 0 0 1 1 2.7c0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.3 8.8H2.8V21h2.5V8.8ZM4 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm6.2 5.8H7.8V21h2.4v-6.3c0-1.7.8-2.8 2.3-2.8 1.3 0 1.9.9 1.9 2.6V21h2.5v-7c0-3.4-1.8-5.3-4.4-5.3-1.1 0-2 .5-2.6 1.3h-.1l-.1-1.2Z" />
    </svg>
  ),
  docs: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h8l4 4v14H6V3Zm7 1.8V8h3.2L13 4.8ZM8 10v1.5h8V10H8Zm0 3.5V15h8v-1.5H8Zm0 3.5v1.5h5V17H8Z" />
    </svg>
  ),
};

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div>{t("home.footer.location")}</div>

      <nav className="footer-links" aria-label={t("home.footer.linksLabel")}>
        <a className="footer-icon-link" href="mailto:sarbian.kamil@gmail.com" aria-label={t("home.email")}>
          {icons.email}
        </a>
        <a
          className="footer-icon-link"
          href="https://github.com/kamilSarbian"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("home.github")}
        >
          {icons.github}
        </a>
        <a
          className="footer-icon-link"
          href="https://www.linkedin.com/in/kamil-sarbian-3399991ba/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("home.linkedin")}
        >
          {icons.linkedin}
        </a>
        <a
          className="footer-icon-link"
          href="https://api.kamilsarbian.dev/docs"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("projects.apiDocs")}
        >
          {icons.docs}
        </a>
      </nav>
    </footer>
  );
}
