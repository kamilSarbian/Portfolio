import { useTranslation } from "react-i18next";

import Card from "../components/Card";
import { NOVA_MARKET } from "../content/novaMarket";

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

function ProjectLinks() {
  return (
    <div className="nova-project-links">
      <a className="btn primary" href={NOVA_MARKET.liveUrl} target="_blank" rel="noreferrer">
        View live demo ↗
      </a>
      <a
        className="btn ghost"
        href={NOVA_MARKET.repositoryUrl}
        target="_blank"
        rel="noreferrer"
      >
        Explore source code ↗
      </a>
    </div>
  );
}

export default function ProjectNovaMarket({ onGoProjects }) {
  const { t } = useTranslation();

  return (
    <div className="page nova-page" lang="en">
      <div className="nova-page-inner">
        <Card>
          <button type="button" className="project-back-link" onClick={onGoProjects}>
            ← {t("projects.title")}
          </button>

          <header className="nova-hero">
            <div className="nova-hero-copy">
              <p className="nova-kicker">{NOVA_MARKET.hero.eyebrow}</p>
              <h1 className="h1 nova-title">{NOVA_MARKET.hero.title}</h1>
              <p className="p nova-subtitle">{NOVA_MARKET.hero.description}</p>

              <div className="nova-status-row">
                <span className="nova-status">{NOVA_MARKET.hero.status}</span>
                <span className="nova-language-badge">{NOVA_MARKET.hero.language}</span>
              </div>

              <ProjectLinks />
            </div>

            <img
              className="nova-hero-image"
              src={NOVA_MARKET.gallery.images[0].src}
              alt={NOVA_MARKET.gallery.images[0].alt}
              width={NOVA_MARKET.gallery.images[0].width}
              height={NOVA_MARKET.gallery.images[0].height}
              fetchPriority="high"
            />
          </header>

          <p className="nova-disclaimer">{NOVA_MARKET.hero.disclaimer}</p>

          <dl className="nova-facts-grid">
            {NOVA_MARKET.facts.map((fact) => (
              <div className="nova-fact" key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="divider" />

          <div className="nova-sections">
            <section className="nova-section">
              <h2>{NOVA_MARKET.overview.title}</h2>
              {NOVA_MARKET.overview.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>

            <div className="nova-two-column">
              {[NOVA_MARKET.problem, NOVA_MARKET.solution].map((section) => (
                <section className="nova-section" key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                  <TextList items={section.items} />
                </section>
              ))}
            </div>

            <section className="nova-section nova-architecture" id="architecture" tabIndex={-1}>
              <h2>{NOVA_MARKET.architecture.title}</h2>
              <p>{NOVA_MARKET.architecture.body}</p>

              <div className="nova-architecture-grid">
                <article className="nova-architecture-card">
                  <h3>{NOVA_MARKET.architecture.dnsTitle}</h3>
                  <Flow
                    label={NOVA_MARKET.architecture.dnsAriaLabel}
                    nodes={NOVA_MARKET.architecture.dnsNodes}
                  />
                  <p className="nova-note">{NOVA_MARKET.architecture.dnsNote}</p>
                </article>

                <article className="nova-architecture-card nova-architecture-card--wide">
                  <h3>{NOVA_MARKET.architecture.appTitle}</h3>
                  <Flow
                    label={NOVA_MARKET.architecture.appAriaLabel}
                    nodes={NOVA_MARKET.architecture.appNodes}
                  />
                </article>

                <article className="nova-architecture-card nova-architecture-card--wide">
                  <h3>{NOVA_MARKET.architecture.stripeTitle}</h3>
                  <Flow
                    label={NOVA_MARKET.architecture.stripeAriaLabel}
                    nodes={NOVA_MARKET.architecture.stripeNodes}
                  />
                </article>
              </div>
            </section>

            <section className="nova-section">
              <h2>Core Features</h2>
              <div className="nova-feature-grid">
                {NOVA_MARKET.featureGroups.map((group) => (
                  <article className="nova-feature-card" key={group.title}>
                    <h3>{group.title}</h3>
                    <TextList items={group.items} />
                  </article>
                ))}
              </div>
            </section>

            <div className="nova-two-column">
              <section className="nova-section">
                <h2>{NOVA_MARKET.security.title}</h2>
                <p>{NOVA_MARKET.security.body}</p>
                <TextList items={NOVA_MARKET.security.items} />
              </section>

              <section className="nova-section">
                <h2>{NOVA_MARKET.payment.title}</h2>
                <ol className="nova-numbered-list">
                  {NOVA_MARKET.payment.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="nova-note">{NOVA_MARKET.payment.note}</p>
              </section>
            </div>

            <div className="nova-two-column">
              <section className="nova-section">
                <h2>{NOVA_MARKET.contribution.title}</h2>
                <p>{NOVA_MARKET.contribution.body}</p>
                <TextList items={NOVA_MARKET.contribution.items} />
              </section>

              <section className="nova-section">
                <h2>{NOVA_MARKET.results.title}</h2>
                <TextList items={NOVA_MARKET.results.items} />
                <p className="nova-note">{NOVA_MARKET.results.note}</p>
              </section>
            </div>

            <section className="nova-section" id="interface" tabIndex={-1}>
              <h2>{NOVA_MARKET.gallery.title}</h2>
              <p>{NOVA_MARKET.gallery.body}</p>
              <div className="nova-gallery">
                {NOVA_MARKET.gallery.images.map((image, index) => (
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
              {[NOVA_MARKET.limitations, NOVA_MARKET.nextSteps].map((section) => (
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
