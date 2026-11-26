import { lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import RouteMeta from "./components/RouteMeta";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

import "./App.css";

const Projects = lazy(() => import("./pages/Projects"));
const ProjectPwned = lazy(() => import("./pages/ProjectPwned"));
const ProjectImageEditor = lazy(() => import("./pages/ProjectImageEditor"));
const ProjectImageClassifier = lazy(() => import("./pages/ProjectImageClassifier"));
const ProjectAuth = lazy(() => import("./pages/ProjectAuth"));
const ProjectJarvis = lazy(() => import("./pages/ProjectJarvis"));
const ProjectLivingStartpakke = lazy(() => import("./pages/ProjectLivingStartpakke"));
const ProjectHospitalityWordpress = lazy(() => import("./pages/ProjectHospitalityWordpress"));
const ProjectNovaMarket = lazy(() => import("./pages/ProjectNovaMarket"));
const ProjectNordicHearth = lazy(() => import("./pages/ProjectNordicHearth"));
const ProjectHandTracking = lazy(() => import("./pages/ProjectHandTracking"));

function RouteScroll() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return undefined;
    }

    const targetId = decodeURIComponent(hash.slice(1));
    const timer = window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (!target) return;

      target.scrollIntoView({ behavior: "auto", block: "start" });
      target.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [hash, pathname]);

  return null;
}

export default function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState("dark");
  const lang = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);

  const navActive = location.pathname === "/" ? "home" : "projects";

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
      <RouteMeta />

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
        <Suspense
          key={location.pathname}
          fallback={
            <div className="card">
              <p className="p" role="status">{t("routeLoading")}</p>
            </div>
          }
        >
          <RouteScroll />
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
                  onOpenNova={() => goTo("/projects/nova-market")}
                  onOpenNordicHearth={() => goTo("/projects/nordic-hearth")}
                  onOpenLiving={() => goTo("/projects/living-startpakke")}
                  onOpenLivingPrototype={() => goTo("/projects/living-startpakke#prototype")}
                  onOpenPwned={() => goTo("/projects/password-checker")}
                  onOpenImageEditor={() => goTo("/projects/image-editor")}
                  onOpenImageClassifier={() => goTo("/projects/image-classifier")}
                  onOpenHandTracking={() => goTo("/projects/hand-tracking")}
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
              path="/projects/hospitality-wordpress"
              element={<ProjectHospitalityWordpress />}
            />

            <Route
              path="/projects/nova-market"
              element={<ProjectNovaMarket onGoProjects={() => goTo("/projects")} />}
            />

            <Route
              path="/projects/nordic-hearth"
              element={<ProjectNordicHearth onGoProjects={() => goTo("/projects")} />}
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

            <Route
              path="/projects/hand-tracking"
              element={<ProjectHandTracking />}
            />

            <Route
              path="*"
              element={
                <NotFound
                  onGoHome={() => goTo("/")}
                  onGoProjects={() => goTo("/projects")}
                />
              }
            />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
