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

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 721px)");

    function closeMobileMenuOnDesktop(e) {
      if (e.matches) {
        setMenuOpen(false);
        setLangOpen(false);
      }
    }

    desktopQuery.addEventListener("change", closeMobileMenuOnDesktop);
    return () => {
      desktopQuery.removeEventListener("change", closeMobileMenuOnDesktop);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;

    function closeMobileMenuOnScroll() {
      setMenuOpen(false);
      setLangOpen(false);
    }

    window.addEventListener("scroll", closeMobileMenuOnScroll, { passive: true });
    window.addEventListener("touchmove", closeMobileMenuOnScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", closeMobileMenuOnScroll);
      window.removeEventListener("touchmove", closeMobileMenuOnScroll);
    };
  }, [menuOpen]);

  const lang = i18n.language || "en";

  function chooseLanguage(nextLang) {
    i18n.changeLanguage(nextLang);
    setLangOpen(false);
  }

  return (
    <header className="navbar">
      <button type="button" className="brand" onClick={onGoHome}>
        <div className="nav-avatar" aria-label="Avatar">
          <img src="/avatar.png" alt="Kamil Sarbian" className="nav-avatar" />
        </div>

        <div className="brand-text">
          <div className="title">Kamil Sarbian</div>
          <div className="subtitle subtitle--desktop">{t("nav.openTo")}</div>
          <div className="subtitle subtitle--mobile">{t("nav.openToMobile")}</div>
        </div>
      </button>

      <button
        type="button"
        className="nav-hamburger"
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>

      <div className="nav-actions nav-actions--desktop">
        <button type="button" className={active === "home" ? "btn primary" : "btn"} onClick={onGoHome}>
          {t("nav.home") || "Home"}
        </button>

        <button type="button" className={active === "projects" ? "btn primary" : "btn"} onClick={onGoProjects}>
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

        <button type="button" className="theme-btn" aria-pressed={theme === "light"} onClick={onToggleTheme}>
          <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="nav-drawer">
          <button type="button" className={active === "home" ? "btn primary" : "btn"} onClick={() => { setMenuOpen(false); onGoHome(); }}>
            {t("nav.home") || "Home"}
          </button>

          <button type="button" className={active === "projects" ? "btn primary" : "btn"} onClick={() => { setMenuOpen(false); onGoProjects(); }}>
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

            <button
              type="button"
              className="theme-btn theme-btn--icon"
              aria-label="Toggle color theme"
              aria-pressed={theme === "light"}
              onClick={onToggleTheme}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
