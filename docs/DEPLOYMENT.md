# Deployment Guide

Step-by-step procedure to deploy AgroReach NextGen to production. End-state:

- Frontend01 → `https://agroreach-shop.vercel.app` (Vercel)
- Frontend02 → `https://agroreach-farmer-ai.vercel.app` (Vercel)
- Node API → `https://agroreach-api.onrender.com` (Render)
- ML service → `https://agroreach-ml.onrender.com` (Render)
- Database → MongoDB Atlas (existing)
- Image storage → Cloudinary (existing)

Total time: **~45 minutes**, mostly waiting for first builds.

---

## Phase A — Pre-flight (5 min, do this first)

### A.1 Rotate the leaked secrets

`Backend/.env` was committed to git history. Rotate before pushing:

| Secret | How |
| ------ | --- |
| Cloudinary API Secret | cloudinary.com → Settings (gear) → Security → "Reset API Secret". Copy the new value. |
| Gmail App Password | Google Account → Security → 2-Step Verification → App passwords → revoke `pzgz nkmh swhg xaks` → generate new 16-char password. Copy. |
| MongoDB password | Atlas → Database Access → edit user → "Edit Password" → autogenerate. Update the SRV string in your env files. |
| JWT_SECRET | Generate any 64-char random string (e.g. on Windows PowerShell: `[guid]::NewGuid().ToString() + [guid]::NewGuid().ToString()`). This invalidates every existing user token, forcing re-login. Acceptable. |

### A.2 Untrack the committed `.env` files

```bash
git rm --cached Backend/.env Frontend01/.env
git commit -m "chore: untrack committed .env files"
```

The `.gitignore` already covers them going forward.

### A.3 Push to GitHub

```bash
git push origin main
```

If the repo doesn't exist yet, create it on github.com first, then `git remote add origin git@github.com:<user>/Agroreach-NextGen.git && git push -u origin main`.

---

## Phase B — MongoDB Atlas (5 min, do not skip)

Your `.env` may already point at an Atlas cluster, but you still need to verify the IP allow-list. **This is the single most common deploy-day failure** — if Atlas refuses connections from Render, the Node service crashes on startup with `mongoose.connect()` rejection and Render returns 502 to every request.

- **Network Access** → IP Allow List → **add `0.0.0.0/0`** (Render free-tier dyno IPs are dynamic and not announced; restrict later via VPC peering on a paid plan)
- **Database Access** → at least one user with `readWrite` on the target database
- **SRV string** → ends with `?retryWrites=true&w=majority` (defaults are fine)

Test connectivity locally:

```bash
cd Backend
npm run dev
# Should log "MONGODB connected successfully..."
```

---

## Phase C — Render: Backend Node + Python ML (15 min)

The repo includes a Blueprint at `render.yaml` that provisions both services in one click.

### C.1 Create the services from the Blueprint

1. Go to [render.com](https://render.com) → sign in → **New +** → **Blueprint**.
2. Click **Connect a repository** → authorize GitHub → pick `Agroreach-NextGen`.
3. Render reads `render.yaml` and previews two services: `agroreach-api` and `agroreach-ml`. Click **Apply**.
4. The first build for each service starts immediately. Don't wait yet — fill env vars next.

### C.2 Fill `agroreach-api` env vars

In Render UI, click on `agroreach-api` → **Environment** tab → fill the variables marked `sync: false` in the Blueprint:

```
NODE_ENV                = production
MONGODB_URI             = <your rotated Atlas SRV>
JWT_SECRET              = <your new 64-char random>
JWT_EXPIRE              = 7d
EMAIL_SERVICE           = gmail
EMAIL_USER              = agroreach01@gmail.com
EMAIL_PASS              = <your rotated 16-char Gmail App Password>
ADMIN_EMAIL             = agroreach01@gmail.com
CLOUDINARY_CLOUD_NAME   = dvq1kiwqn
CLOUDINARY_API_KEY      = <existing — same as before>
CLOUDINARY_API_SECRET   = <your rotated Cloudinary secret>
FRONTEND_URLS           = (leave blank for now — fill after Vercel deploys)
```

Click **Save Changes**. Render automatically redeploys.

### C.3 Fill `agroreach-ml` env vars

Click on `agroreach-ml` → **Environment**:

```
FLASK_DEBUG       = false
ALLOWED_ORIGINS   = (leave blank for now)
```

Save.

### C.4 Wait for first builds

- `agroreach-api` build takes ~3-5 min (npm install + start).
- `agroreach-ml` build takes ~5-10 min (pip install scikit-learn + pandas is heavy).

Once both turn **green** (Live), copy the URLs:

```
https://agroreach-api.onrender.com
https://agroreach-ml.onrender.com
```

### C.5 Smoke-test both services

```bash
curl https://agroreach-api.onrender.com/api/health
# {"status":"OK","message":"Server is running"}

curl https://agroreach-ml.onrender.com/health
# {"status":"healthy","price_model":true,"crop_model":true,"message":"AI Model API Server Running"}
```

If `price_model: false`, the `.pkl` files didn't deploy. Confirm `Models/Price Prediction/*.pkl` is committed to git, and Render's build log shows them in the workspace.

---

## Phase D — Vercel: both frontends (10 min)

### D.1 Frontend01 (customer + admin)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**.
2. Import the same GitHub repo. Vercel sees the monorepo.
3. **Framework Preset:** Vite (auto-detected)
4. **Root Directory:** click "Edit" → enter `Frontend01` → save
5. **Environment Variables:**
   ```
   VITE_API_BASE_URL = https://agroreach-api.onrender.com/api
   ```
6. Click **Deploy**.
7. Wait ~2 minutes. Copy the URL: `https://agroreach-shop.vercel.app` (rename the project name first if you want a different subdomain).

### D.2 Frontend02 (farmer portal)

Same flow, second project:

1. **Add New Project** → import same repo
2. **Root Directory:** `Frontend02`
3. **Environment Variables:**
   ```
   VITE_API_BASE_URL    = https://agroreach-api.onrender.com/api
   VITE_ML_API_URL      = https://agroreach-ml.onrender.com
   VITE_WEATHER_API_KEY = (leave blank — Open-Meteo is keyless)
   ```
4. **Deploy**, wait ~2 minutes, copy URL: `https://agroreach-farmer-ai.vercel.app`

---

## Phase E — Wire CORS back to Render (2 min)

Now that you have the Vercel URLs, return to Render:

1. **`agroreach-api`** → Environment → set:
   ```
   FRONTEND_URLS = https://agroreach-shop.vercel.app,https://agroreach-farmer-ai.vercel.app
   ```
   Save (auto-redeploys, takes ~30 s).

2. **`agroreach-ml`** → Environment → set:
   ```
   ALLOWED_ORIGINS = https://agroreach-farmer-ai.vercel.app
   ```
   Save (auto-redeploys).

**Important:** no trailing slash, no path. Comma-separated, no spaces around the comma.

---

## Phase F — Smoke test the full stack (5 min)

### F.1 Customer storefront

1. Visit `https://agroreach-shop.vercel.app/shop`.
2. Should see all 41 seeded products with WebP images.
3. Right-click an image → "Inspect" → check the `<img src>` is `https://res.cloudinary.com/dvq1kiwqn/...` (not localhost).

### F.2 Admin login

1. Visit `https://agroreach-shop.vercel.app/signin`.
2. Email: `agroreach25@gmail.com`, Password: `Agroreach@321`.
3. Should auto-redirect to `https://agroreach-shop.vercel.app/admin/dashboard`.
4. Verify dashboard loads with stats. Open Browser DevTools → Network — no CORS errors.

### F.3 Farmer portal

1. Visit `https://agroreach-farmer-ai.vercel.app`.
2. Sign up as a new farmer (any email + a real city like "Pune" or "Mumbai" for the location).
3. Login. Land on the dashboard.
4. Weather widget should load real data with humidity, wind, AQI.
5. Submit a product request with an image — confirm it appears in admin's product-request list (Frontend01 → admin → Product Requests).

### F.4 AI predictions

1. Farmer dashboard → AI Model.
2. Run **Price Prediction** with any crop. First call may take 30-60 s (Render cold start). Subsequent calls are instant.
3. Run **Crop Recommendation** with any soil/weather inputs. Same cold-start behavior, but only on first call.

### F.5 Order flow

1. As a customer, add 2-3 items to cart.
2. Checkout. Use any test billing address.
3. Submit. Should see order confirmation + email arrives at `ADMIN_EMAIL`.

---

## Phase G — Optional polish

### G.1 Keep services warm

Render free dynos sleep after 15 minutes idle. To avoid 30-60 s cold starts:

- **UptimeRobot** (free): create two HTTP keyword monitors:
  - `https://agroreach-api.onrender.com/api/health` every 14 min
  - `https://agroreach-ml.onrender.com/health` every 14 min

Don't go below 14 min — Render will eventually rate-limit.

### G.2 Custom domain

- Buy a domain (Namecheap, Porkbun, etc).
- In each Vercel project → Settings → Domains → Add. Vercel walks through DNS setup.
- Suggested: `agroreach.com` → shop, `farmer.agroreach.com` → farmer portal.
- Update Render's `FRONTEND_URLS` to include the new domains.

### G.3 Upgrade to Render Starter

If cold starts hurt UX, upgrade either service to Starter ($7/mo each) → no sleep, faster CPU. The ML service benefits most because of model load time. Done in Render UI → service → Settings → Plan.

---

## Troubleshooting

### Backend returns HTTP 502 / `Operation buffering timed out after 10000ms`

Cause: `mongoose.connect()` failed → `process.exit(1)` in `server.js` → Render keeps restarting and failing the health check. Almost always means **Atlas Network Access doesn't include Render's IPs**. Fix: Atlas → Network Access → Add IP Address → "Allow access from anywhere" (`0.0.0.0/0`). Render auto-restarts; backend recovers within a minute.

### Vercel build fails with `Could not resolve "../../assets/<lowercase>/<File>.png"`

Cause: a Linux case-sensitivity bug. Windows and macOS treat `assets/about/X.png` and `assets/About/X.png` as the same path; Linux (Vercel's build env) does not. Fix: open the failing file, change the import path to match the on-disk directory name **exactly** (case included). Tip: run `git config core.ignorecase false` locally so future case changes show up as real diffs.

### Build fails on Render: `npm error ERESOLVE`

Cause: `multer-storage-cloudinary` declares an outdated peer dep. Fix: confirm `Backend/.npmrc` is committed and contains `legacy-peer-deps=true`.

### `agroreach-ml` builds successfully but `/health` returns 503 with `price_model: false`

Cause: `.pkl` files not committed. Run `git ls-files Models/` locally — should list 7 `.pkl` files. If empty, the files were git-ignored. Add to `.gitignore` exception or `git add -f Models/**/*.pkl`.

### CORS error in browser console

- Confirm `FRONTEND_URLS` on `agroreach-api` exactly matches the Vercel URL (no trailing slash).
- Restart the Render service if needed (Manual Deploy → Deploy latest commit).
- Check that the request actually originated from one of the allowed origins, not from a custom domain you forgot to whitelist.

### Image upload in admin returns 500

Check Render logs for `agroreach-api`. Most likely cause: incorrect `CLOUDINARY_*` env vars. Cloudinary returns 401 on auth failure, which our error handler logs. Re-rotate and re-paste.

### "Origin ... not allowed by CORS" on Open-Meteo

Open-Meteo doesn't issue CORS headers for browser-side calls in some environments. If you see this (only on the farmer dashboard), the fallback to Pune kicks in but the location label may be wrong. Workaround: proxy Open-Meteo through the Node backend. Out of scope for v1.0.

### `npm install` works locally but fails on Render

Render uses Node 18 by default. If `package.json` has `engines.node: ">=18.x"` (it does), this is fine. If the build fails with a node-not-found error, set `NODE_VERSION=18` in Render env vars.

### Email not sending in production

Gmail rate-limits SMTP from new IPs. After first deploy, the first email may fail. Subsequent ones work. Check Render logs for `Email sent successfully:` lines vs error stack traces.

---

## Verification checklist (before declaring deploy complete)

- [ ] `curl https://agroreach-api.onrender.com/api/health` returns 200
- [ ] `curl https://agroreach-ml.onrender.com/health` returns 200 with both models loaded
- [ ] Frontend01 shop page renders 41 products with Cloudinary images
- [ ] Frontend01 admin login works and redirects to `/admin/dashboard`
- [ ] Frontend02 sign-up works, dashboard loads, weather shows live data
- [ ] Frontend02 AI Model predictions return values (after warm-up)
- [ ] Customer can complete a full order (cart → checkout → email confirmation)
- [ ] Farmer request → admin approval → live product flow works end-to-end
- [ ] No CORS errors in browser console on either Vercel app
- [ ] No `localhost` references in Vercel-deployed bundles (view-source → search)
- [ ] Old leaked secrets confirmed rotated (try the old Cloudinary key against Cloudinary API → 401)

---

## What's deployed: file responsibility map

If something breaks, here's where to look:

| Symptom | Look at |
| ------- | ------- |
| 500 on any API call | `Backend/server.js`, relevant controller in `Backend/src/controllers/` |
| Image upload fails | `Backend/src/middleware/upload.js`, `Backend/src/config/cloudinary.js` |
| Auth flow broken | `Backend/src/controllers/authController.js`, `Frontend01/src/services/authService.ts` |
| Admin not redirecting | `Frontend01/src/components/sections/SignInForm.tsx` |
| ML prediction fails | `Backend/backend_api.py`, `Models/Price Prediction/fast_predict.py`, `Models/Next Crop/fast_predict.py` |
| Weather widget broken | `Frontend02/src/services/weatherService.ts`, `Frontend02/src/services/dashboardService.ts` |
| Cart / checkout breaks | `Backend/src/controllers/cartController.js`, `Backend/src/controllers/orderController.js` |
| CORS errors | `Backend/server.js` lines around `app.use(cors(...))`, `FRONTEND_URLS` env var on Render |
| Seeding broken | `Backend/scripts/seedProducts.js`, `Backend/scripts/seedData.js` |
