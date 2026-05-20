import { useState } from "react";
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

import "./App.css";

export default function App() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("pl");

  const navActive = location.pathname === "/" ? "home" : "projects";

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
        onGoHome={() => navigate("/")}
        onGoProjects={() => navigate("/projects")}
      />

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={<Home onGoProjects={() => navigate("/projects")} />}
          />

          <Route
            path="/projects"
            element={
              <Projects
                onOpenAuth={() => navigate("/projects/auth-api")}
                onOpenPwned={() => navigate("/projects/password-checker")}
                onOpenImageEditor={() => navigate("/projects/image-editor")}
                onOpenImageClassifier={() => navigate("/projects/image-classifier")}
              />
            }
          />

          <Route
            path="/projects/auth-api"
            element={<ProjectAuth onGoProjects={() => navigate("/projects")} />}
          />

          <Route
            path="/projects/password-checker"
            element={<ProjectPwned onGoProjects={() => navigate("/projects")} />}
          />

          <Route
            path="/projects/image-editor"
            element={<ProjectImageEditor onGoProjects={() => navigate("/projects")} />}
          />

          <Route
            path="/projects/image-classifier"
            element={<ProjectImageClassifier onGoProjects={() => navigate("/projects")} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
