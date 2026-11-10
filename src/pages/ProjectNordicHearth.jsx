import { useTranslation } from "react-i18next";

import Card from "../components/Card";
import { NORDIC_HEARTH_IMAGES, NORDIC_HEARTH_LINKS } from "../content/nordicHearth";

function ProjectLinks() {
  const { t } = useTranslation();

  return (
    <div className="nova-project-links">
      <a className="btn primary" href={NORDIC_HEARTH_LINKS.liveUrl} target="_blank" rel="noreferrer">
        {t("nordicHearth.cta.live")} ↗
      </a>
      <a className="btn ghost" href={NORDIC_HEARTH_LINKS.repositoryUrl} target="_blank" rel="noreferrer">
        {t("nordicHearth.cta.source")} ↗
      </a>
    </div>
  );
}

export default function ProjectNordicHearth({ onGoProjects }) {
  const { t } = useTranslation();
  const copy = t("nordicHearth", { returnObjects: true });
  const galleryImages = NORDIC_HEARTH_IMAGES.map((image, index) => ({
    ...image,
    ...copy.gallery.images[index],
  }));

  return (
    <div className="page nova-page">
      <div className="nova-page-inner">
        <Card>
          <button type="button" className="project-back-link" onClick={onGoProjects}>
            ← {t("projects.title")}
          </button>

          <header className="nova-hero">
            <div className="nova-hero-copy">
              <p className="nova-kicker">{copy.eyebrow}</p>
              <h1 className="h1 nova-title">{copy.title}</h1>
              <p className="p nova-subtitle">{copy.subtitle}</p>
              <div className="nova-status-row">
                <span className="nova-status">{copy.status}</span>
              </div>
              <div className="nova-project-actions">
                <ProjectLinks />
                <p className="nova-cold-start-note">
                  <span aria-hidden="true">◷</span>
                  {copy.coldStart}
                </p>
              </div>
            </div>

            <img
              className="nova-hero-image"
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              width={galleryImages[0].width}
              height={galleryImages[0].height}
              fetchPriority="high"
            />
          </header>

          <p className="nova-disclaimer">{copy.disclaimer}</p>
          <div className="divider" />

          <div className="nova-sections">
            <div className="nova-two-column">
              {[copy.problem, copy.solution].map((section) => (
                <section className="nova-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>

            <section className="nova-section">
              <h2>{copy.explore.title}</h2>
              <p>{copy.explore.body}</p>
              <ul>
                {copy.explore.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>

            <div className="nova-two-column">
              {[copy.backend, copy.data].map((section) => (
                <section className="nova-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  <ul>
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </section>
              ))}
            </div>

            <section className="nova-section" id="interface" tabIndex={-1}>
              <h2>{copy.gallery.title}</h2>
              <p>{copy.gallery.body}</p>
              <div className="nova-gallery">
                {galleryImages.map((image, index) => (
                  <figure
                    className={`nova-gallery-item${index === 0 ? " nova-gallery-item--wide" : ""}`}
                    key={image.src}
                  >
                    <div className="nova-gallery-frame">
                      <img
                        src={image.src}
                        alt={image.alt}
                        width={image.width}
                        height={image.height}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                    <figcaption>{image.caption}</figcaption>
                  </figure>
                ))}
              </div>
            </section>

            <div className="nova-two-column">
              {[copy.contribution, copy.limitations].map((section) => (
                <section className="nova-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
          </div>

          <div className="divider" />
          <footer className="project-detail-footer nova-footer">
            <button type="button" className="inline-link" onClick={onGoProjects}>
              {t("projects.backToCaseStudies")}
            </button>
            <ProjectLinks />
          </footer>
        </Card>
      </div>
    </div>
  );
}
