export const NOVA_MARKET = Object.freeze({
  liveUrl: "https://nova.kamilsarbian.dev",
  repositoryUrl: "https://github.com/kamilSarbian/E-commerce_NOVA_Market",
  card: {
    kicker: "Flask e-commerce case study",
    title: "NOVA Market",
    problem:
      "A visual storefront alone does not demonstrate the trust boundaries, persistence, and failure handling behind a checkout journey.",
    solution:
      "A deployed Flask application connecting catalogue discovery, customer accounts, server-priced checkout, PostgreSQL persistence, and Stripe Sandbox.",
    businessValue:
      "Demonstrates an end-to-end customer journey and the backend controls required to keep totals, payments, and order state reliable.",
    productionThinking:
      "Signed webhooks, idempotent payment confirmation, versioned migrations, shared rate limiting, security headers, and isolated PostgreSQL tests.",
    stack: ["Python", "Flask", "PostgreSQL", "Stripe"],
  },
  hero: {
    eyebrow: "Flask · PostgreSQL · Stripe Sandbox",
    title: "A complete e-commerce journey built as a deployable portfolio case study.",
    description:
      "NOVA Market is a responsive Flask application that connects catalogue discovery, customer accounts, a server-priced cart, delivery selection, Stripe Sandbox Checkout, signed webhook processing, and order history in one coherent flow.",
    status: "Live portfolio demo · Stripe test mode",
    language: "English interface",
    disclaimer:
      "NOVA Market is a technical portfolio demonstration. Products, customer details, and orders are fictional. Stripe runs exclusively in sandbox mode, and the application does not accept commercial orders or provide fulfilment services.",
  },
  facts: [
    { label: "Automated tests", value: "40 passing" },
    { label: "Database", value: "Neon PostgreSQL" },
    { label: "Migrations", value: "2 versioned SQL migrations" },
    { label: "Product assets", value: "20 documented WebP images" },
  ],
  overview: {
    title: "Project Overview",
    paragraphs: [
      "NOVA Market explores the engineering work behind a modern e-commerce journey rather than presenting only a visual storefront.",
      "The application connects a responsive interface to a Flask backend, PostgreSQL persistence, server-controlled pricing, authenticated sessions, and Stripe Sandbox Checkout. Payment confirmation is processed through a signed webhook before local order state is updated.",
    ],
  },
  problem: {
    title: "Problem",
    body:
      "A checkout flow has to coordinate state across the browser, application, database, and payment provider without trusting client-supplied prices or assuming that redirects prove payment.",
    items: [
      "Keep product prices, delivery costs, currency, and totals under server control.",
      "Connect authentication, cart state, delivery selection, payment, and order history.",
      "Process asynchronous payment confirmation safely and idempotently.",
      "Protect public authentication and checkout operations from abuse.",
      "Remain transparent about the fictional catalogue and sandbox-only payment scope.",
    ],
  },
  solution: {
    title: "Solution",
    body:
      "I built a modular Flask application with separate layers for routes, business rules, persistence, payment integration, security controls, and rate-limit storage.",
    items: [
      "Trusted product data and delivery rules are reloaded from PostgreSQL before checkout.",
      "Stripe Checkout Sessions are created from server-calculated EUR totals.",
      "Signed webhook events are matched against the local order, amount, currency, and Session ID.",
      "Versioned SQL migrations and idempotent catalogue seeding control database initialization.",
      "PostgreSQL-backed counters share rate-limit state across application processes.",
    ],
  },
  architecture: {
    title: "Architecture",
    body:
      "Cloudflare provides authoritative DNS only. Application and webhook traffic terminate at Render before reaching Gunicorn and Flask.",
    dnsTitle: "DNS resolution",
    dnsAriaLabel:
      "The browser resolves the NOVA Market domain through Cloudflare authoritative DNS, which returns the Render target.",
    dnsNodes: ["Browser", "Cloudflare authoritative DNS", "Render target"],
    dnsNote: "Cloudflare is configured as DNS only and is not an application proxy.",
    appTitle: "Application request",
    appAriaLabel:
      "The browser sends an HTTPS request through the Render custom domain to Gunicorn, Flask, and Neon PostgreSQL.",
    appNodes: ["Browser", "Render custom domain", "Gunicorn", "Flask", "Neon PostgreSQL"],
    stripeTitle: "Signed webhook",
    stripeAriaLabel:
      "Stripe sends a signed webhook through Render and Gunicorn to Flask verification and Neon PostgreSQL.",
    stripeNodes: ["Stripe", "Render", "Gunicorn", "Flask verification", "Neon PostgreSQL"],
  },
  featureGroups: [
    {
      title: "Storefront & Accounts",
      items: [
        "Responsive catalogue, search, filtering, sorting, and product detail views.",
        "Registration, login, session cart, and customer order history.",
        "Twenty optimized illustrative product images created specifically for the demo.",
      ],
    },
    {
      title: "Checkout & Payments",
      items: [
        "Server-controlled EUR pricing and transparent delivery costs.",
        "Internal checkout review before Stripe-hosted Sandbox Checkout.",
        "Signed, validated, and idempotent payment confirmation.",
      ],
    },
    {
      title: "Operations",
      items: [
        "Gunicorn deployment on Render with a public health endpoint.",
        "Neon PostgreSQL with versioned migrations and isolated test schemas.",
        "Friendly 404, 429, 500, and 503 responses.",
      ],
    },
  ],
  security: {
    title: "Security and Reliability",
    body: "The public deployment uses layered, security-conscious controls:",
    items: [
      "scrypt password hashing, CSRF protection, and secure production cookies",
      "server-controlled prices, delivery fees, totals, and EUR currency",
      "parameterized PostgreSQL queries and case-insensitive e-mail uniqueness",
      "Content Security Policy, trusted-host validation, and baseline security headers",
      "Stripe test-key enforcement and signed webhook verification",
      "idempotent Checkout Session creation and payment confirmation",
      "PostgreSQL-backed rate limiting with HMAC-SHA256 client identifiers",
      "fail-closed responses when shared rate-limit storage is unavailable",
    ],
  },
  payment: {
    title: "Payment Flow",
    steps: [
      "The customer reviews products and selects a delivery option.",
      "Flask reloads trusted product prices and calculates the EUR total.",
      "A local pending order and its items are stored in PostgreSQL.",
      "Flask creates a Stripe Sandbox Checkout Session from trusted values.",
      "The browser completes the test payment on Stripe-hosted Checkout.",
      "Stripe sends a signed event to the webhook endpoint.",
      "Flask verifies the signature, amount, currency, Session ID, and order reference.",
      "The local order is updated idempotently and displayed in account history.",
    ],
    note: "The application never handles card details directly.",
  },
  contribution: {
    title: "My Contribution",
    body: "I designed and implemented the complete portfolio project, including:",
    items: [
      "Flask architecture, responsive storefront, and design system",
      "catalogue, account, cart, delivery, checkout, and order workflows",
      "PostgreSQL schema, migrations, idempotent seeding, and isolated test setup",
      "Stripe Sandbox Checkout, signed webhooks, and local payment verification",
      "security headers, trusted proxy configuration, and database-backed rate limiting",
      "Gunicorn and Render configuration, Neon integration, and custom-domain setup",
      "automated tests, deployment verification, and product-asset provenance documentation",
    ],
  },
  results: {
    title: "Results",
    items: [
      "40 automated tests passing against an isolated PostgreSQL test environment.",
      "Working catalogue, account, cart, checkout, and order persistence.",
      "Working Stripe Sandbox Checkout Session creation and signed webhook confirmation.",
      "Working idempotent order updates on a public custom domain.",
      "Twenty documented WebP product assets with no legacy JPEG references.",
    ],
    note:
      "The full registration-to-payment sandbox journey was verified manually. These results do not imply production traffic, conversion, or scalability measurements.",
  },
  gallery: {
    title: "Interface Walkthrough",
    body:
      "The live application remains intentionally English-only. The screenshots use fictional demonstration data and show the complete sandbox journey.",
    images: [
      {
        src: "/projects/nova-market/nova-market-home.png",
        width: 1228,
        height: 780,
        caption:
          "Responsive NOVA Market storefront with product discovery, category navigation, and a dark e-commerce interface.",
        alt: "NOVA Market homepage showing the hero section, navigation, and featured product cards.",
      },
      {
        src: "/projects/nova-market/nova-market-register.png",
        width: 1252,
        height: 708,
        caption:
          "Customer account creation with password guidance and CSRF-protected submission.",
        alt: "NOVA Market create-account page with name, e-mail, and password fields.",
      },
      {
        src: "/projects/nova-market/nova-market-checkout.png",
        width: 927,
        height: 833,
        caption:
          "Internal checkout review with cart contents, delivery selection, and a server-calculated EUR total.",
        alt: "NOVA Market checkout page showing products, delivery options, and the order summary.",
      },
      {
        src: "/projects/nova-market/nova-market-stripe-sandbox.png",
        width: 867,
        height: 887,
        caption: "Stripe-hosted Sandbox Checkout validates the external payment handoff.",
        alt: "Stripe Sandbox Checkout page showing a NOVA Market test order and payment form.",
      },
      {
        src: "/projects/nova-market/nova-market-payment-confirmed.png",
        width: 766,
        height: 742,
        caption: "Verified sandbox payment confirmation displayed after signed webhook processing.",
        alt: "NOVA Market payment confirmation page showing a successfully confirmed demo order.",
      },
    ],
  },
  limitations: {
    title: "Current Limitations",
    items: [
      "Stripe operates exclusively in sandbox mode, and the catalogue is fictional.",
      "No physical fulfilment, shipping operation, or administrator dashboard is connected.",
      "Database migrations and expired rate-limit cleanup are currently manual operations.",
      "Free-tier hosting may introduce cold starts after inactivity.",
      "The hosted Stripe journey is verified manually rather than through browser-driven tests.",
      "Legal pages demonstrate information architecture and are not a substitute for legal review.",
    ],
  },
  nextSteps: {
    title: "Next Steps",
    items: [
      "Add browser-driven end-to-end tests for the public checkout journey.",
      "Add CI checks for tests, formatting, migrations, and asset integrity.",
      "Introduce catalogue and order administration workflows.",
      "Automate rate-limit cleanup and add structured monitoring.",
      "Add responsive image variants and srcset delivery.",
      "Document recovery, backup, and rollback procedures.",
    ],
  },
});
