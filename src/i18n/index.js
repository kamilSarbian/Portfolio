import i18n from "i18next";
import { initReactI18next } from "react-i18next";


import pl from "./pl.json";
import en from "./en.json";
import no from "./no.json";

const saved = localStorage.getItem("lang");
const initialLang = saved || (navigator.language.startsWith("no") || navigator.language.startsWith("nb") ? "no" : "en");

function toHtmlLang(lng) {
  const base = (lng || "en").slice(0, 2);
  if (base === "pl") return "pl";
  if (base === "no" || base === "nb") return "no";
  return "en";
}

i18n
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

// zapisuj wybór języka
document.documentElement.lang = toHtmlLang(initialLang);

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
  document.documentElement.lang = toHtmlLang(lng);
});

export default i18n;
