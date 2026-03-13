import Card from "../components/Card";
import ImageEditor from "../components/ImageEditor";
import { useTranslation } from "react-i18next";

export default function ProjectImageEditor({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="page" style={{ display: "grid", placeItems: "center" }}>
      <div style={{ width: "min(980px, 100%)" }}>
        <Card>
          <button type="button" className="section-label section-label-link" onClick={onGoProjects}>
            <span className="dot" /> {t("projects.label")}
          </button>

          <h1 className="h1" style={{ fontSize: 30 }}>
            {t("imageEditor.title")}
          </h1>

          <p className="p">{t("imageEditor.desc")}</p>

          <div className="divider" />
        
          <strong>{t("imageEditor.arch")}</strong>
          <p className="p">{t("imageEditor.archDesc")}</p>

          <div className="divider" />
          <ImageEditor />
          <div className="divider" />
          <div className="chips">
            <span className="chip">Python</span>
            <span className="chip">FastAPI</span>
            <span className="chip">Image Processing</span>
            <span className="chip">File Upload</span>
            <span className="chip">REST API</span>
            <span className="chip">PIL</span>
          </div>
        </Card>
      </div>
    </div>
  );
}