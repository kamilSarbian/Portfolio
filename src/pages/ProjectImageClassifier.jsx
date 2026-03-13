import Card from "../components/Card";
import ImageClassifier from "../components/ImageClassifier";
import { useTranslation } from "react-i18next";

export default function ProjectImageClassifier({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="page" style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(980px, 100%)" }}>
        <Card>
          <button type="button" className="section-label section-label-link" onClick={onGoProjects}>
            <span className="dot" /> {t("projects.label")}
          </button>

          <h1 className="h1" style={{ fontSize: 30 }}>
            {t("imageClassifier.title")}
          </h1>

          <p className="p">{t("imageClassifier.desc")}</p>

          <div className="divider" />
        
          <strong>{t("imageClassifier.arch")}</strong>
          <p className="p">{t("imageClassifier.archDesc")}</p>

          <div className="divider" />
            <ImageClassifier />
          <div className="divider" />

          <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">FastAPI</span>
            <span className="chip">PyTorch</span>
            <span className="chip">CLIP</span>
            <span className="chip">Pillow</span>
            <span className="chip">NumPy</span>
          </div>
          
        </Card>
      </div>
    </div>
  );
}