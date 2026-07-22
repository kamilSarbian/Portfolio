import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import no from "./no.json";
import pl from "./pl.json";

const SUPPORTED_LANGUAGES = new Set(["en", "no", "pl"]);
const LANGUAGE_STORAGE_KEY = "lang";
const GEO_TIMEOUT_MS = 2000;

function toHtmlLang(lng) {
  const base = (lng || "en").slice(0, 2);
  if (base === "pl") return "pl";
  if (base === "no" || base === "nb") return "no";
  return "en";
}

async function getGeoLanguage() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), GEO_TIMEOUT_MS);

  try {
    const response = await fetch("/api/locale", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Locale endpoint returned ${response.status}.`);
    }

    const data = await response.json();
    return SUPPORTED_LANGUAGES.has(data?.language) ? data.language : "en";
  } catch (error) {
    console.info("IP-based language detection unavailable; using English.", error);
    return "en";
  } finally {
    window.clearTimeout(timeout);
  }
}

async function getInitialLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (SUPPORTED_LANGUAGES.has(savedLanguage)) return savedLanguage;
  return getGeoLanguage();
}

export async function initializeI18n() {
  if (i18n.isInitialized) return i18n;

  const initialLang = await getInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        pl: { translation: pl },
        en: { translation: en },
        no: { translation: no },
      },
      lng: initialLang,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });

  document.documentElement.lang = toHtmlLang(initialLang);

  i18n.on("languageChanged", (lng) => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
    document.documentElement.lang = toHtmlLang(lng);
  });

  return i18n;
}

export default i18n;
