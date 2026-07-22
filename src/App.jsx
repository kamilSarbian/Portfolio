import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectPwned from "./pages/ProjectPwned";
import ProjectImageEditor from "./pages/ProjectImageEditor";
import ProjectImageClassifier from "./pages/ProjectImageClassifier";
import ProjectAuth from "./pages/ProjectAuth";
import ProjectJarvis from "./pages/ProjectJarvis";
import ProjectLivingStartpakke from "./pages/ProjectLivingStartpakke";

import "./App.css";

export default function App() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState("dark");
  const lang = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);

  const navActive = location.pathname === "/" ? "home" : "projects";

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return undefined;
    }

    const targetId = decodeURIComponent(location.hash.slice(1));
    const timer = window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: "auto", block: "start" });
      target.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [location.hash, location.pathname]);

  function goTo(path) {
    navigate(path);
  }

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function toggleLang() {
    const next = lang === "pl" ? "en" : lang === "en" ? "no" : "pl";
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
        onGoHome={() => goTo("/")}
        onGoProjects={() => goTo("/projects")}
      />

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={<Home onGoProjects={() => goTo("/projects")} />}
          />

          <Route
            path="/projects"
            element={
              <Projects
                onOpenAuth={() => goTo("/projects/auth-api")}
                onOpenJarvis={() => goTo("/projects/jarvis-ai-environment")}
                onOpenJarvisArchitecture={() => goTo("/projects/jarvis-ai-environment#architecture")}
                onOpenLiving={() => goTo("/projects/living-startpakke")}
                onOpenLivingPrototype={() => goTo("/projects/living-startpakke#prototype")}
                onOpenPwned={() => goTo("/projects/password-checker")}
                onOpenImageEditor={() => goTo("/projects/image-editor")}
                onOpenImageClassifier={() => goTo("/projects/image-classifier")}
              />
            }
          />

          <Route
            path="/projects/auth-api"
            element={<ProjectAuth onGoProjects={() => goTo("/projects")} />}
          />

          <Route
            path="/projects/jarvis-ai-environment"
            element={<ProjectJarvis onGoProjects={() => goTo("/projects")} />}
          />

          <Route
            path="/projects/living-startpakke"
            element={<ProjectLivingStartpakke onGoProjects={() => goTo("/projects")} />}
          />

          <Route
            path="/projects/password-checker"
            element={<ProjectPwned onGoProjects={() => goTo("/projects")} />}
          />

          <Route
            path="/projects/image-editor"
            element={<ProjectImageEditor onGoProjects={() => goTo("/projects")} />}
          />

          <Route
            path="/projects/image-classifier"
            element={<ProjectImageClassifier onGoProjects={() => goTo("/projects")} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
