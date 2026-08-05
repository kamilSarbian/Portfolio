import { useTranslation } from "react-i18next";

import Card from "../components/Card";
import { NOVA_MARKET_IMAGES, NOVA_MARKET_LINKS } from "../content/novaMarket";

function TextList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Flow({ label, nodes }) {
  return (
    <div className="nova-flow" role="img" aria-label={label}>
      {nodes.map((node, index) => (
        <div className="nova-flow-step" key={node}>
          <span className="nova-flow-node">{node}</span>
          {index < nodes.length - 1 ? (
            <span className="nova-flow-arrow" aria-hidden="true">→</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function ProjectLinks({ showColdStart = false }) {
  const { t } = useTranslation();

  return (
    <div className="nova-project-actions">
      <div className="nova-project-links">
        <a className="btn primary" href={NOVA_MARKET_LINKS.liveUrl} target="_blank" rel="noreferrer">
          {t("novaMarket.cta.live")} ↗
        </a>
        <a
          className="btn ghost"
          href={NOVA_MARKET_LINKS.repositoryUrl}
          target="_blank"
          rel="noreferrer"
        >
          {t("novaMarket.cta.source")} ↗
        </a>
      </div>
      {showColdStart ? (
        <p className="nova-cold-start-note">
          <span aria-hidden="true">◷</span>
          {t("novaMarket.cta.coldStart")}
        </p>
      ) : null}
    </div>
  );
}

export default function ProjectNovaMarket({ onGoProjects }) {
  const { t } = useTranslation();
  const copy = t("novaMarket", { returnObjects: true });
  const galleryImages = NOVA_MARKET_IMAGES.map((image, index) => ({
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
              <p className="nova-kicker">{copy.hero.eyebrow}</p>
              <h1 className="h1 nova-title">{copy.hero.title}</h1>
              <p className="p nova-subtitle">{copy.hero.description}</p>

              <div className="nova-status-row">
                <span className="nova-status">{copy.hero.status}</span>
                <span className="nova-language-badge">{copy.hero.language}</span>
              </div>

              <ProjectLinks showColdStart />
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

          <p className="nova-disclaimer">{copy.hero.disclaimer}</p>

          <dl className="nova-facts-grid">
            {copy.facts.map((fact) => (
              <div className="nova-fact" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="divider" />

          <div className="nova-sections">
            <section className="nova-section">
              <h2>{copy.overview.title}</h2>
              {copy.overview.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <div className="nova-two-column">
              {[copy.problem, copy.solution].map((section) => (
                <section className="nova-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  <TextList items={section.items} />
                </section>
              ))}
            </div>

            <section className="nova-section nova-architecture" id="architecture" tabIndex={-1}>
              <h2>{copy.architecture.title}</h2>
              <p>{copy.architecture.body}</p>

              <div className="nova-architecture-grid">
                <article className="nova-architecture-card">
                  <h3>{copy.architecture.dnsTitle}</h3>
                  <Flow
                    label={copy.architecture.dnsAriaLabel}
                    nodes={copy.architecture.dnsNodes}
                  />
                  <p className="nova-note">{copy.architecture.dnsNote}</p>
                </article>

                <article className="nova-architecture-card nova-architecture-card--wide">
                  <h3>{copy.architecture.appTitle}</h3>
                  <Flow
                    label={copy.architecture.appAriaLabel}
                    nodes={copy.architecture.appNodes}
                  />
                </article>

                <article className="nova-architecture-card nova-architecture-card--wide">
                  <h3>{copy.architecture.stripeTitle}</h3>
                  <Flow
                    label={copy.architecture.stripeAriaLabel}
                    nodes={copy.architecture.stripeNodes}
                  />
                </article>
              </div>
            </section>

            <section className="nova-section">
              <h2>{copy.featuresTitle}</h2>
              <div className="nova-feature-grid">
                {copy.featureGroups.map((group) => (
                  <article className="nova-feature-card" key={group.title}>
                    <h3>{group.title}</h3>
                    <TextList items={group.items} />
                  </article>
                ))}
              </div>
            </section>

            <div className="nova-two-column">
              <section className="nova-section">
                <h2>{copy.security.title}</h2>
                <p>{copy.security.body}</p>
                <TextList items={copy.security.items} />
              </section>

              <section className="nova-section">
                <h2>{copy.payment.title}</h2>
                <ol className="nova-numbered-list">
                  {copy.payment.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="nova-note">{copy.payment.note}</p>
              </section>
            </div>

            <div className="nova-two-column">
              <section className="nova-section">
                <h2>{copy.contribution.title}</h2>
                <p>{copy.contribution.body}</p>
                <TextList items={copy.contribution.items} />
              </section>

              <section className="nova-section">
                <h2>{copy.results.title}</h2>
                <TextList items={copy.results.items} />
                <p className="nova-note">{copy.results.note}</p>
              </section>
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
              {[copy.limitations, copy.nextSteps].map((section) => (
                <section className="nova-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <TextList items={section.items} />
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
