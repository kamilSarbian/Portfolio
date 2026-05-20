import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Navbar({ theme, active, onToggleTheme, onGoHome, onGoProjects }) {
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const langRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    }

    function onEsc(e) {
      if (e.key === "Escape") {
        setLangOpen(false);
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const lang = i18n.language || "en";
  const subtitle =
    lang === "no" ? "Portfolio / Prosjekter" : lang === "en" ? "Portfolio / Projects" : "Portfolio / Projekty";

  function chooseLanguage(nextLang) {
    i18n.changeLanguage(nextLang);
    setLangOpen(false);
  }

  return (
    <header className="navbar">
      <div className="brand" onClick={onGoHome} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onGoHome()}>
        <div className="nav-avatar" aria-label="Avatar">
          <img src="/avatar.png" alt="Kamil Sarbian" className="nav-avatar" />
        </div>

        <div className="brand-text">
          <div className="title">Kamil Sarbian</div>
          <div className="subtitle">{t("nav.openTo")}</div>
          <div className="subtitle">{subtitle}</div>
        </div>
      </div>

      <button
        type="button"
        className="nav-hamburger"
        onClick={() => setMenuOpen((value) => !value)}
      >
        Menu
      </button>

      <div className="nav-actions nav-actions--desktop">
        <button className={active === "home" ? "btn primary" : "btn"} onClick={onGoHome}>
          {t("nav.home") || "Home"}
        </button>

        <button className={active === "projects" ? "btn primary" : "btn"} onClick={onGoProjects}>
          {t("nav.projects") || "Projects"}
        </button>

        <div className="lang" ref={langRef}>
          <button
            type="button"
            className="btn ghost"
            aria-haspopup="menu"
            aria-expanded={langOpen}
            onClick={() => setLangOpen((value) => !value)}
          >
            {t("nav.language") || "Language"}
          </button>

          {langOpen && (
            <div className="lang-menu" role="menu">
              <button
                type="button"
                className={`lang-item ${lang === "pl" ? "active" : ""}`}
                role="menuitem"
                onClick={() => chooseLanguage("pl")}
              >
                {t("nav.langPl") || "Polski"}
              </button>

              <button
                type="button"
                className={`lang-item ${lang === "en" ? "active" : ""}`}
                role="menuitem"
                onClick={() => chooseLanguage("en")}
              >
                {t("nav.langEn") || "English"}
              </button>

              <button
                type="button"
                className={`lang-item ${lang === "no" ? "active" : ""}`}
                role="menuitem"
                onClick={() => chooseLanguage("no")}
              >
                {t("nav.langNo") || "Norsk"}
              </button>
            </div>
          )}
        </div>

        <button className="theme-btn" onClick={onToggleTheme}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-drawer">
          <button className={active === "home" ? "btn primary" : "btn"} onClick={() => { setMenuOpen(false); onGoHome(); }}>
            {t("nav.home") || "Home"}
          </button>

          <button className={active === "projects" ? "btn primary" : "btn"} onClick={() => { setMenuOpen(false); onGoProjects(); }}>
            {t("nav.projects") || "Projects"}
          </button>

          <div className="nav-drawer-row">
            <div className="lang" ref={langRef}>
              <button
                type="button"
                className="btn ghost"
                aria-haspopup="menu"
                aria-expanded={langOpen}
                onClick={() => setLangOpen((value) => !value)}
              >
                {t("nav.language") || "Language"}
              </button>

              {langOpen && (
                <div className="lang-menu" role="menu">
                  <button
                    type="button"
                    className={`lang-item ${lang === "pl" ? "active" : ""}`}
                    role="menuitem"
                    onClick={() => {
                      chooseLanguage("pl");
                      setMenuOpen(false);
                    }}
                  >
                    {t("nav.langPl") || "Polski"}
                  </button>

                  <button
                    type="button"
                    className={`lang-item ${lang === "en" ? "active" : ""}`}
                    role="menuitem"
                    onClick={() => {
                      chooseLanguage("en");
                      setMenuOpen(false);
                    }}
                  >
                    {t("nav.langEn") || "English"}
                  </button>

                  <button
                    type="button"
                    className={`lang-item ${lang === "no" ? "active" : ""}`}
                    role="menuitem"
                    onClick={() => {
                      chooseLanguage("no");
                      setMenuOpen(false);
                    }}
                  >
                    {t("nav.langNo") || "Norsk"}
                  </button>
                </div>
              )}
            </div>

            <button className="theme-btn" onClick={onToggleTheme}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
