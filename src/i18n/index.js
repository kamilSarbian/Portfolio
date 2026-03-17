import i18n from "i18next";
import { initReactI18next } from "react-i18next";


import pl from "./pl.json";
import en from "./en.json";
import no from "./no.json";

const saved = localStorage.getItem("lang");

i18n
  .use(initReactI18next)
  .init({
    resources: {
      pl: { translation: pl },
      en: { translation: en },
      no: { translation: no },
    },
    lng: saved || (navigator.language.startsWith("pl") ? "pl" : "en"),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

// zapisuj wybór języka
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("lang", lng);
});

export default i18n;
