import { useState } from "react";
import Button from "./Button";
import { useTranslation } from "react-i18next";

export default function CopyTokenButton({ token }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (!token) return;

    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant="ghost" onClick={onCopy} disabled={!token}>
      {copied
        ? t("auth.tokenCopied")
        : t("auth.copyToken")}
    </Button>
  );
}
