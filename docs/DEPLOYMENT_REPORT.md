# Portfolio v1.0.0 Deployment Report

## Release

- **Deployment date:** 2026-07-24
- **Environment:** Production
- **Production URL:** https://kamilsarbian.dev
- **Release application commit:** `60574b282461b83af7c7ae56de0009ca8f0a3b47`
- **Release commit message:** `docs: add final QA report`
- **Deployment provider:** Vercel
- **Deployment status:** Successful
- **Vercel deployment:** https://vercel.com/kamilsarbians-projects/portfolio/4CNwGN8Qs9CrP2b2SHbFjMdrNYdW
- **Deployment identifier:** `4CNwGN8Qs9CrP2b2SHbFjMdrNYdW`

GitHub reported a successful Vercel deployment for the release commit. The repository was clean, and `main` matched `origin/main` before the release verification.

## Rollback Reference

- **Previous verified commit:** `75b4ff0df9c816d49325c3ef5682ec9644ce65b0`
- **Previous commit message:** `test: add final portfolio QA checks`
- **Previous Vercel deployment:** https://vercel.com/kamilsarbians-projects/portfolio/4YTfam1FTVqvoAYLcaStfmdq2LDX
- **Previous deployment identifier:** `4YTfam1FTVqvoAYLcaStfmdq2LDX`

Use the previous Vercel deployment as the first rollback candidate if a release-only issue is discovered.

## Pre-deployment Verification

The following checks passed on the release candidate:

- `git status`
- `git log -1 --oneline`
- `npm ci`
- `npm run check`
- `python -m pytest -q backend`
- `ruff check backend`
- `black --check backend`
- `isort --check-only backend`

Results:

- npm installed 144 packages from the lockfile
- npm audit reported 0 vulnerabilities
- frontend lint, JSON, i18n, SEO, link, secret, unit-test, build, and bundle checks passed
- backend pytest: 36 passed
- Ruff, Black, and isort passed

Accepted warnings:

- the Open Graph image is 607,757 bytes and exceeds the 500 KiB reporting threshold while remaining below the accepted 1 MB limit
- external link availability is non-blocking without a network check
- Starlette `TestClient` reports a dependency deprecation warning related to future `httpx2` migration

## Production Routing Smoke Test

Direct production requests returned the expected SPA document for:

- `/`
- `/projects`
- `/projects/auth-api`
- `/projects/jarvis-ai-environment`
- `/projects/jarvis-ai-environment#architecture`
- `/projects/living-startpakke`
- `/projects/living-startpakke#prototype`
- `/projects/password-checker`
- `/projects/image-editor`
- `/projects/image-classifier`
- an unknown route using the localized client-side 404 page

The client-side 404 route returns HTTP 200 because of the accepted SPA hosting fallback.

## Production SEO and Public Files

The following production resources returned HTTP 200:

- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`
- `/og/portfolio-og.png`

The production HTML includes:

- the global Open Graph image
- the static Person JSON-LD entity
- the English metadata fallback
- the React root used for route-aware metadata

Route-aware title, description, canonical, robots, Open Graph, Twitter metadata, and route JSON-LD were covered by automated checks and manual browser QA.

## Production API Smoke Test

| Area | Result | Verification |
| --- | --- | --- |
| OpenAPI | Passed | Schema returned with registered paths |
| ML metadata | Passed | Model metadata returned |
| ML presets | Passed | Preset collection returned |
| Password Checker | Passed | Structured success response |
| Password validation | Passed | `password_required` |
| Authentication login | Passed | JWT issued without logging or storing it |
| Authentication profile | Passed | Nested `user` profile returned |
| Authentication permissions | Passed | Role enforcement returned the expected result |
| Invalid credentials | Passed | `invalid_credentials` |
| Image Editor | Passed | Valid PNG response |
| Invalid image file | Passed | `unsupported_file_type` |
| Image Classifier | Passed | Structured predictions returned |
| Classifier validation | Passed | `labels_required` |
| Contact without AI | Passed | Email workflow queued |
| Contact with AI | Passed | Email and AI-assisted workflow queued |
| Contact validation | Passed | Safe `validation_error` response |

Two clearly labeled production smoke-test contact messages were sent to `sarbian.kamil@gmail.com`. No reply is required.

## Known Limitations

- Social crawlers that do not execute JavaScript receive the shared English fallback metadata.
- The client-side 404 page can return HTTP 200.
- The regex secret scanner does not scan complete Git history.
- External link availability is not a blocking build check.
- Fifty-nine legacy translation keys remain classified as optional cleanup candidates.
- Lighthouse results may vary with network conditions and backend cold starts.

## Final Status

**Production smoke test passed.** The portfolio is approved for the annotated `v1.0.0` release tag.
