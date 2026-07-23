import { useTranslation } from "react-i18next";

const NUMBER_LOCALES = {
  en: "en-US",
  pl: "pl-PL",
  no: "nb-NO",
  nb: "nb-NO",
};

export default function ResultBox({ result, error }) {
  const { t, i18n } = useTranslation();

  if (error) return <div className="result bad">{error}</div>;
  if (!result) return null;

  const found = Boolean(result.found);
  const count = Number(result.count ?? 0);
  const language = (i18n.resolvedLanguage || i18n.language || "en").slice(0, 2);
  const formattedCount = new Intl.NumberFormat(
    NUMBER_LOCALES[language] || NUMBER_LOCALES.en,
  ).format(count);

  if (found) {
    return (
      <div className="result warn">
        {t("pwnedProject.resultFound", { count, formattedCount })}
      </div>
    );
  }

  return <div className="result ok">{t("pwnedProject.resultNotFound")}</div>;
}
