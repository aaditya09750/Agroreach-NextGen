# Changelog

All notable changes to **AgroReach NextGen** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned

- Custom domain support via Vercel + DNS provider
- Stripe / Razorpay payment integration
- Background job queue (BullMQ) for order emails and recommendation generation
- Redis cache instead of in-process `node-cache` (so cache survives redeploys + scaling)
- Sentry / observability instrumentation

---

## [1.0.1] - 2026-05-09

First production deployment. All four tiers live and verified.

### Added

- **Production environment** live across Vercel (two projects) + Render (two services) + MongoDB Atlas + Cloudinary.
  - Frontend01: `https://agroreach-shop.vercel.app`
  - Frontend02: `https://agroreach-farmer-ai.vercel.app`
  - Backend API: `https://agroreach-api.onrender.com`
  - ML service: `https://agroreach-ml.onrender.com`
- End-to-end smoke test passed: signin returns valid JWT, products endpoint returns Cloudinary-backed catalog (83 products), price + crop predictions return live values, CORS preflight succeeds for both Vercel origins against both Render services, Cloudinary `q_auto,f_auto` delivers 1.3 MB PNG as 12 KB WebP (~99 % size reduction).

### Fixed

- **Linux case-sensitivity bug** in `Frontend01/src/components/sections/AboutFeatures.tsx`: import path `../../assets/about/AboutMan.png` (lowercase) did not match the on-disk directory `About/` (capital A). Worked locally on Windows; failed on Vercel's Linux build with `Could not resolve` from Rollup. Corrected the import to use the exact case.

### Documentation

- `docs/DEPLOYMENT.md` updated with the production-verified Vercel URL for Frontend02 (`agroreach-farmer-ai.vercel.app`).
- `docs/DEPLOYMENT.md` troubleshooting section now leads with the Atlas IP-whitelist failure mode (the single most common deploy-day blocker) and the Linux case-sensitivity gotcha.

---

## [1.0.0] - 2026-05-08

The first production-deployable release. Brings every layer from "works on my machine" to
"can be pushed to Render + Vercel and serve real users".

### Added

- **Cloudinary integration** — `multer-storage-cloudinary` directly uploads every product / profile / farmer-request image to the `agroreach/` Cloudinary folder. `req.file.path` returned by Multer is the full HTTPS secure_url, stored verbatim in MongoDB.
- **Cloudinary delivery transforms** — `optimizedImage()` helper in both frontends inserts `q_auto,f_auto,w_*` into Cloudinary URLs so browsers receive WebP or AVIF (typically 40-60 % smaller).
- **Backend gzip compression** — `compression()` middleware globally compresses JSON and HTML responses.
- **Backend response cache** — `node-cache` 60 s TTL on the busiest endpoint (`GET /api/products`). Flushed on every product mutation.
- **Mongoose `.lean()` reads** — every read-only list controller now skips Mongoose Document construction.
- **Trust proxy** — `app.set('trust proxy', 1)` so `express-rate-limit` reads the correct client IP behind Render's proxy.
- **Lazy-loaded routes (both frontends)** — `AdminDashboard`, `AdminLoginPage`, `CheckoutPage`, `OrderHistoryPage`, `OrderDetailPage`, `SettingsPage` (Frontend01), and `DashboardPage`, `CompleteProductDetailsPage` (Frontend02).
- **Vite vendor chunks** — `react-vendor`, `ui-vendor`, `pdf-vendor`, `i18n-vendor`, plus `chart-vendor` on Frontend02.
- **Live weather widget** — Open-Meteo geocode + forecast + air-quality on the farmer dashboard, replacing the previous mock. Shows temperature, feels-like, today's high/low, humidity, wind, AQI with label, day/night-aware emoji.
- **41-product seed pipeline** — `Backend/scripts/seedData.js` (data array sourced from `/products/aaaProductDetails.ts`) + `Backend/scripts/seedProducts.js` (idempotent uploader / inserter). Populates the catalog with 80 images and 41 products in one command.
- **Admin redirect on `/signin`** — admins logging in at the regular sign-in page are auto-routed to `/admin/dashboard` instead of the home page.
- **Production CORS** — env-driven allow-list (`FRONTEND_URLS`) in production; permissive for any `localhost:*` origin in development.
- **Python ML production config** — env-driven `PORT` and `ALLOWED_ORIGINS`, `gunicorn` added to `requirements_ai.txt`, `debug=False` by default.
- **`vercel.json`** — SPA rewrites for both frontends so deep links don't 404 on hard refresh.
- **`render.yaml`** — Blueprint that provisions both Render services in one click.
- **Repo hygiene** — `.editorconfig`, `.gitattributes`, `.nvmrc`, `.prettierrc.json`, `.prettierignore`, `LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `ARCHITECTURE.md`, this CHANGELOG, GitHub Actions CI workflow, Dependabot config, issue + PR templates, VS Code recommended extensions, and the docs/ folder with deployment + ADRs.

### Changed

- **Backend `multer` middleware** — switched from local disk storage to `CloudinaryStorage`. The local `Backend/uploads/` directory is no longer used and would be wiped on every Render deploy anyway.
- **Backend image utility** — `getImageUrl()` is now a pass-through (Cloudinary already returns full HTTPS URLs); `deleteImage()` calls `cloudinary.uploader.destroy(publicId)` instead of `fs.unlink`.
- **Backend admin email** — `process.env.ADMIN_EMAIL` is now used in `contactController.js` and `emailService.js` instead of hardcoded `agroreach01@gmail.com`.
- **Frontend02 env var** — renamed `VITE_API_URL` → `VITE_API_BASE_URL` for consistency with Frontend01.
- **Frontend02 ML calls** — `DashboardPage.tsx` uses `import.meta.env.VITE_ML_API_URL` instead of hardcoded `http://localhost:5001`.

### Removed

- Hardcoded `http://localhost:5000` references in admin and farmer image components (13 instances across 6 files).
- Hardcoded `http://localhost:5001` direct fetches in the farmer dashboard ML calls.
- Static `/uploads` directory served by Express — no longer needed after Cloudinary migration.
- Verbose `console.log` debug statements in `orderService.ts`, `orderController.js`, `contactController.js`, `emailService.js`, and others.

### Security

- All committed `.env` files now flagged in `.gitignore`. Pre-deploy checklist requires rotating MongoDB password, JWT secret, Gmail App Password, and Cloudinary API secret.
- CORS in production uses a strict allow-list — no more wildcard hardcoded local ports.

### Migration notes

If upgrading from a pre-1.0.0 install:

1. Clear `Backend/uploads/` from production storage if you have any legacy local-disk images.
2. Re-run `npm run create-admin` and `npm run seed-products` against your production MongoDB to populate Cloudinary.
3. Rotate every secret in `Backend/.env` before pushing the upgraded branch.
4. Re-deploy both Render services and both Vercel projects.

---

## [0.x] - Pre-1.0

Initial development. Local-only, hardcoded URLs, mock weather, no seed pipeline. See git history.
