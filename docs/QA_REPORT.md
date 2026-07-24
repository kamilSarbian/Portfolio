# Final Portfolio QA Report

## Summary

- **QA date:** 2026-07-24
- **Commit tested:** `75b4ff0df9c816d49325c3ef5682ec9644ce65b0`
- **Final status:** Passed
- **Scope:** Stage 7A automated checks and Stage 7B manual browser QA

The automated pipeline passed, and the project owner confirmed that the complete manual browser matrix works without critical functional, visual, accessibility, or localization issues.

## Environment

- **Operating system:** Windows
- **Node.js:** `v24.13.0`
- **npm:** `11.6.2`
- **Python:** `3.12.9`
- **Frontend:** React with Vite `8.1.5`
- **Backend:** FastAPI
- **Browser QA:** Performed manually by the project owner; exact browser name and version were not recorded

## Automated Checks

| Check | Result | Notes |
| --- | --- | --- |
| ESLint | Passed | No blocking frontend lint issues |
| JSON validation | Passed | Six Git-visible non-i18n JSON documents |
| i18n parity | Passed | EN, PL, and NO structure, types, arrays, interpolation tokens, and empty values |
| Unused i18n report | Passed | Warning-only; 563 leaf keys scanned |
| SEO validation | Passed | Eight indexable routes and three languages |
| Routes, anchors, and public assets | Passed | External availability intentionally not checked without network access |
| Secret scan | Passed | Tracked and non-ignored Git-visible files |
| Frontend unit tests | Passed | Three Node Test Runner tests |
| Production build | Passed | Vite production build completed |
| Backend tests | Passed | 36 pytest tests |
| Ruff | Passed | No blocking Python lint issues |
| Black | Passed | 39 Python files unchanged |
| isort | Passed | Import ordering accepted |

The backend tests report one dependency deprecation warning from Starlette `TestClient` regarding the future `httpx2` migration. It does not affect the current test result.

## Translation Review

- **Languages:** English, Polish, Norwegian Bokmål
- **Leaf keys scanned:** 563
- **Intentionally retained unused keys:** 2
- **Legacy cleanup candidates:** 59
- **Classification file:** `qa/unused-i18n-review.json`

The retained keys are reserved for possible future use. Legacy candidates remain non-blocking and can be removed in a separate cleanup change.

## Route Matrix

The following routes were verified through direct entry, in-app navigation, and refresh:

- `/`
- `/projects`
- `/projects/auth-api`
- `/projects/jarvis-ai-environment`
- `/projects/living-startpakke`
- `/projects/password-checker`
- `/projects/image-editor`
- `/projects/image-classifier`
- an unknown route using the localized client-side 404 page

The `#architecture`, `#prototype`, and `#contact` anchors were included in route and interaction checks.

## Responsive and Visual QA

The project owner confirmed the manual viewport matrix:

- **Core widths:** 320, 375, 768, and 1440 px
- **Breakpoint boundaries:** 519/521, 719/721, and 919/921 px
- **JARVIS and Living Startpakke:** 375, 768, and 1440 px
- **Interactive demos and 404:** 375 and 1440 px

Verified areas:

- hero and navigation status
- mobile menu, outside click, and Escape behavior
- project cards and case-study layouts
- long EN, PL, and NO headings
- language switching without losing the active route
- dark and light themes
- images, alternative text, spacing, and content wrapping
- absence of horizontal overflow and overlapping elements
- stable navigation and anchor behavior
- clean browser console during the confirmed QA flow

## Keyboard and Accessibility QA

The manual review covered:

- logical Tab order
- visible keyboard focus
- no focus trap
- menu activation and dismissal
- Enter and Space activation for controls
- focus behavior after closing mobile navigation
- semantic headings and image alternatives
- text, muted copy, accent, disabled-state, link, and focus-ring contrast

No critical accessibility issue was reported. Lighthouse was included in the manual QA scope for representative routes; exact numeric scores were not recorded in this report.

## Interactive Demo Smoke Tests

The project owner confirmed initial, loading, success, validation, known API error, unknown error code, unavailable backend, language-switching, and theme states for the interactive portfolio areas.

The review included:

- Password Checker number formatting and pluralization
- Authentication Demo login, token, profile, permissions, and reset
- Image Editor upload, processing, cancellation, and invalid-file behavior
- Image Classifier Smart/Manual modes, presets, unknown state, and unavailable model
- Contact form validation, submission, and localized 422, 429, and 500 handling

## Bundle Baseline

Baseline file: `qa/bundle-baseline.json`

| Metric | Baseline |
| --- | ---: |
| Total `dist` size | 1,635,361 bytes |
| JavaScript raw | 449,037 bytes |
| JavaScript gzip | 137,762 bytes |
| CSS raw | 34,696 bytes |
| CSS gzip | 6,708 bytes |
| Largest JavaScript chunk | 449,037 bytes |
| Open Graph image | 607,757 bytes |

The Open Graph image exceeds the current 500 KiB warning threshold but remains below the accepted 1 MB project target. Bundle growth is warning-only until a future hard budget is approved.

## Known Limitations

- The client-side 404 page can receive HTTP 200 from the SPA hosting fallback.
- Social crawlers that do not execute JavaScript receive the global English metadata and shared Open Graph image.
- External link availability is not a blocking build check.
- The regex secret scanner checks the current repository state, not complete Git history.
- Fifty-nine legacy translation keys remain classified for optional cleanup.
- Route-specific social previews and server-level 404 responses require prerendering or server-rendered routes.
- Lighthouse scores may vary with network conditions and backend cold starts.

## Final Result

**Stage 7 passed.** Automated checks, localization validation, SEO validation, backend tests, responsive review, accessibility checks, interaction smoke tests, and bundle baseline review are complete. No critical issue remains open before Git and deployment.
