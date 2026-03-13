import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectPwned from "./pages/ProjectPwned";
import ProjectImageEditor from "./pages/ProjectImageEditor";
import ProjectImageClassifier from "./pages/ProjectImageClassifier";
import ProjectAuth from "./pages/ProjectAuth";

import "./App.css";

export default function App() {
  const { i18n } = useTranslation();

  const [theme, setTheme] = useState("dark");
  const [view, setView] = useState("home");

  // (język trzymamy też lokalnie, żeby toggle był prosty)
  const [lang, setLang] = useState("pl");

  // Dla podstron projektów w navbarze dalej ma świecić "Projekty"
  const navActive = view === "home" ? "home" : "projects";

  const page = useMemo(() => {
    if (view === "projects") {
      return (
        <Projects
          onOpenAuth={() => setView("auth")}
          onOpenPwned={() => setView("pwned")}
          onOpenImageEditor={() => setView("imageEditor")}
          onOpenImageClassifier={() => setView("imageClassifier")}
        />
      );
    }

    if (view === "auth") return <ProjectAuth onGoProjects={() => setView("projects")} />;
    if (view === "pwned") return <ProjectPwned onGoProjects={() => setView("projects")} />;
    if (view === "imageEditor") return <ProjectImageEditor onGoProjects={() => setView("projects")} />;
    if (view === "imageClassifier") return <ProjectImageClassifier onGoProjects={() => setView("projects")} />;

    return <Home onGoProjects={() => setView("projects")} />;
  }, [view]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function toggleLang() {
    const next = lang === "pl" ? "en" : lang === "en" ? "no" : "pl";
    setLang(next);
    i18n.changeLanguage(next);
  }

  return (
    <div className={`app ${theme}`}>
      <Navbar
        theme={theme}
        active={navActive}
        onToggleTheme={toggleTheme}
        lang={lang}
        onToggleLang={toggleLang}
        onGoHome={() => setView("home")}
        onGoProjects={() => setView("projects")}
      />

      <main className="container">{page}</main>
    </div>
  );
}