# CLAUDE.md

Guidance for AI agents (Claude Code, Cursor, Copilot, etc.) working in this repo.
The format follows the Claude Code project-context convention.

## TL;DR

**AgroReach NextGen** is a four-tier agricultural marketplace:

- `Frontend01/` — React/Vite/TS — customer storefront + admin panel — deploys to Vercel
- `Frontend02/` — React/Vite/TS — farmer portal — deploys to Vercel
- `Backend/server.js` — Node/Express + Mongoose — deploys to Render
- `Backend/backend_api.py` — Flask + scikit-learn ML service — deploys to Render
- MongoDB Atlas + Cloudinary as managed dependencies

## Common commands

```bash
# Local dev (run all four in separate terminals)
cd Backend && npm run dev                      # API on :5000
cd Backend && python backend_api.py            # ML on :5001
cd Frontend01 && npm run dev                   # Customer + admin on :5174
cd Frontend02 && npm run dev                   # Farmer portal on :5175

# Bootstrap (one-time)
cd Backend && npm run create-admin             # creates agroreach25@gmail.com / Agroreach@321
cd Backend && npm run seed-products            # uploads 80 images, inserts 41 products

# Builds (run in CI)
cd Frontend01 && npm run build
cd Frontend02 && npm run build

# Lint
cd Frontend01 && npm run lint
cd Frontend02 && npm run lint
```

## Where things live

- **Auth flow** — `Frontend01/src/services/authService.ts` chooses storage prefix (`user_` vs `admin_`) based on `response.user.role`. `Frontend01/src/services/api.ts` reads `window.location.pathname` to pick which token to attach. `Frontend02/src/services/api.ts` only uses `farmer_token`.
- **Cloudinary uploads** — `Backend/src/middleware/upload.js` uses `multer-storage-cloudinary`; `req.file.path` is the secure HTTPS URL and is stored verbatim in MongoDB.
- **CORS** — `Backend/server.js` env-driven allow-list in prod, permissive for `localhost:*` in dev. Controlled by `FRONTEND_URLS` env var.
- **Product cache** — `Backend/src/controllers/productController.js` has a 60-second `node-cache` keyed on the full query object. Flushed on every mutation.
- **Live weather** — `Frontend02/src/services/weatherService.ts` calls Open-Meteo (no API key). Falls back to Pune coordinates if geocoding fails.
- **AI predictions** — `Backend/backend_api.py` loads `.pkl` files from `Models/Price Prediction/` and `Models/Next Crop/` at startup. Frontend02 calls these endpoints directly from the browser via `VITE_ML_API_URL`.
- **Smart inventory recommendations** — `Backend/src/services/productRecommendationService.js` is a pure rules engine (5 action types: `EMERGENCY_AUCTION`, `FLASH_SALE`, `BULK_MODE`, `VALUE_ADDITION`, `INSURANCE`).

## Style and conventions

- **Imports** — relative imports for in-package, package-name imports for npm deps.
- **Comments** — minimal. Only explain *why*, not *what*. Don't write headers for routine code.
- **Hardcoded URLs** — never. Use `VITE_API_BASE_URL`, `VITE_ML_API_URL`, `process.env.FRONTEND_URLS`.
- **Hardcoded admin emails** — never. Use `process.env.ADMIN_EMAIL`.
- **Image references** — always go through `getImageUrl()` from the per-frontend `imageUtils.ts`. Use `optimizedImage(url, width)` for thumbnails so Cloudinary serves WebP/AVIF.
- **Mongoose reads** — append `.lean()` to read-only list queries. Don't `.lean()` if you need instance methods like `comparePassword`, `calculateTotal`, or virtuals.
- **Error responses** — `{ success: false, message: '...', error: process.env.NODE_ENV === 'development' ? err.message : undefined }`.
- **Token storage keys** — `user_token` / `user_user` for customers, `admin_token` / `admin_user` for admins, `farmer_token` / `farmer_user` for farmers. Never reuse keys across realms.

## Don't touch zones

- **`Backend/.npmrc`** — `legacy-peer-deps=true` is required because `multer-storage-cloudinary` declares an outdated peer dep on `cloudinary@^1`. Removing this breaks `npm install`.
- **WMO weather codes in `weatherService.ts`** — the mapping covers 27 standardized codes. Don't add fictional codes.
- **`/products/` folder** — these images are the seed source for Cloudinary. Renaming or removing files will break `npm run seed-products`. The script will warn about missing files but skip them.
- **`Backend/scripts/seedData.js`** — the 41-product array is keyed by exact product `name`. Renaming a product means re-running the seed, which also means re-uploading its Cloudinary images.

## Testing

There is no formal unit-test suite. Verification is by:

1. `npm run build` for both frontends — catches type errors and bundling issues.
2. `curl http://localhost:5000/api/health` and `curl http://localhost:5001/health` — confirms both services boot.
3. Manual smoke testing through the UI for each role (customer / admin / farmer).
4. Postman collection at `Backend/AR-Ecommerce-API.postman_collection.json` covers every protected endpoint.

## When making changes

1. **Run both frontend builds** before committing — they catch most errors.
2. **Restart `npm run dev`** in `Backend/` after changing any `.env` — the dev server doesn't auto-reload env vars.
3. **Don't commit `.env`** — it's git-ignored. Add new env vars to the relevant `.env.example` and document them in `docs/env-setup.md`.
4. **Don't commit Cloudinary or Mongo URLs** with real credentials in any markdown or code comment.
5. **Update the CHANGELOG** for user-visible changes.

## Deployment runbook

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full step-by-step deploy procedure.

## Related docs

- [README.md](README.md) — project overview and quick start
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design + ADRs index
- [CONTRIBUTING.md](CONTRIBUTING.md) — branching, commits, PRs
- [SECURITY.md](SECURITY.md) — vulnerability disclosure
- [docs/SETUP.md](docs/SETUP.md) — extended local setup
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — production deploy walkthrough
- [docs/env-setup.md](docs/env-setup.md) — env var reference
- [docs/API.md](docs/API.md) — API endpoint reference
- [docs/ADRs/](docs/ADRs/) — architectural decision records
