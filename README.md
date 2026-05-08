# Agroreach-NextGen

A four-tier agricultural marketplace:

| Tier | Stack | Folder | Hosted on |
|------|-------|--------|-----------|
| Customer + Admin storefront | React 19 + Vite + TS | `Frontend01/` | Vercel |
| Farmer portal | React 19 + Vite + TS | `Frontend02/` | Vercel |
| REST API | Node + Express + Mongoose | `Backend/` | Render |
| ML predictions (price + crop) | Python + Flask + scikit-learn | `Backend/backend_api.py` | Render |

Persistent stores: **MongoDB Atlas** (data) and **Cloudinary** (images).

---

## Local development

You need four processes running at once.

```bash
# 1) Node API on :5000
cd Backend && npm install && npm run dev

# 2) Python ML on :5001
cd Backend && pip install -r requirements_ai.txt && python backend_api.py

# 3) Customer/Admin frontend on Vite's chosen port (usually :5173 or :5174)
cd Frontend01 && npm install && npm run dev

# 4) Farmer portal frontend on Vite's chosen port (usually :5175)
cd Frontend02 && npm install && npm run dev
```

Each app has a `.env.example`. Copy it to `.env` and fill in the values:

```bash
cp Backend/.env.example     Backend/.env
cp Frontend01/.env.example  Frontend01/.env
cp Frontend02/.env.example  Frontend02/.env
```

`Backend/.env` needs a real `MONGODB_URI`, Cloudinary credentials, and (optionally) Gmail SMTP credentials. For local dev MongoDB, run `mongod` locally or use the Atlas connection string.

### One-time admin user
After the Node API can talk to Mongo:
```bash
cd Backend && npm run create-admin
```

### Seed the catalog (41 products from `/products/`)
After admin exists, with Cloudinary credentials in `Backend/.env`:
```bash
cd Backend && npm run seed-products
```
This uploads ~80 image files to Cloudinary and inserts the products. Idempotent — safe to rerun.

---

## Production deployment

The complete deployment plan lives in
[`~/.claude/plans/deep-dive-into-the-humble-platypus.md`](~/.claude/plans/deep-dive-into-the-humble-platypus.md). Quick summary below.

### Pre-flight: rotate any leaked secrets
The original `Backend/.env` was committed to git history. Before deploying, rotate:
- **MongoDB Atlas** user password
- **JWT_SECRET** (any 64-byte random string; this invalidates all existing user/farmer tokens)
- **Gmail App Password**
- **Cloudinary API Secret** (Cloudinary dashboard → Settings → Security → Reset)

### Render (Backend Node + Python ML)

A `render.yaml` blueprint at repo root provisions both services. Either:
- New → Blueprint → connect this repo → apply → fill env vars in Render UI.
- Or create each service manually with these settings:

**`agroreach-api`** (Node)
- Root Directory: `Backend`
- Build: `npm install`
- Start: `node server.js`
- Health Check: `/api/health`
- Env vars (set in Render dashboard):
  ```
  NODE_ENV=production
  MONGODB_URI=<atlas SRV>
  JWT_SECRET=<rotated>
  JWT_EXPIRE=7d
  EMAIL_SERVICE=gmail
  EMAIL_USER=<gmail address>
  EMAIL_PASS=<rotated app password>
  ADMIN_EMAIL=<gmail address>
  CLOUDINARY_CLOUD_NAME=<from cloudinary>
  CLOUDINARY_API_KEY=<from cloudinary>
  CLOUDINARY_API_SECRET=<rotated>
  FRONTEND_URLS=https://<shop>.vercel.app,https://<farmer>.vercel.app
  ```

**`agroreach-ml`** (Python 3)
- Root Directory: `Backend`
- Build: `pip install -r requirements_ai.txt`
- Start: `gunicorn backend_api:app -b 0.0.0.0:$PORT --timeout 120 --workers 1`
- Health Check: `/health`
- Env vars:
  ```
  FLASK_DEBUG=false
  ALLOWED_ORIGINS=https://<farmer>.vercel.app
  ```

### Vercel (both frontends)

Two Vercel projects, both pointing at this same monorepo:

| Project | Root Directory | Required env vars |
|---------|---------------|-------------------|
| `agroreach-shop` | `Frontend01` | `VITE_API_BASE_URL=https://<api>.onrender.com/api` |
| `agroreach-farmer` | `Frontend02` | `VITE_API_BASE_URL=https://<api>.onrender.com/api`, `VITE_ML_API_URL=https://<ml>.onrender.com`, `VITE_WEATHER_API_KEY=...` |

Each has a `vercel.json` that rewrites all paths to `/index.html` for SPA routing.

### Wire CORS back to Render

Once the Vercel URLs are stable, update on Render:
- `agroreach-api` → `FRONTEND_URLS=https://<shop>.vercel.app,https://<farmer>.vercel.app`
- `agroreach-ml` → `ALLOWED_ORIGINS=https://<farmer>.vercel.app`

Render redeploys automatically.

### Seed production data

Run **locally** with `Backend/.env` pointing at the production MongoDB and Cloudinary:
```bash
cd Backend
npm run create-admin
npm run seed-products
```

### Smoke test

1. `curl https://<api>.onrender.com/api/health` → `{"status":"OK"}`
2. `curl https://<ml>.onrender.com/health` → models loaded
3. Visit shop URL → 41 products appear with WebP/AVIF images.
4. Visit farmer URL → sign up → submit product request → admin (in shop) approves → farmer completes details → product goes live.
5. Farmer dashboard → AI Model → both predictions return numbers.

---

## Architecture notes

- **Two auth realms.** User/admin tokens live in `localStorage` under `user_token`/`admin_token` (Frontend01); farmer tokens under `farmer_token` (Frontend02). The Node API issues separate JWTs and uses `auth.js` vs `farmerAuth.js` middleware.
- **Cloudinary as source of truth** for images. `req.file.path` returned by `multer-storage-cloudinary` is the secure HTTPS URL — stored directly in MongoDB.
- **60-second product cache** in `productController.js` (node-cache) absorbs the load of repeat shop visits; flushed on any product mutation.
- **Frontend02 calls the ML service directly** from the browser — not proxied through the Node backend. `VITE_ML_API_URL` controls where it points.
- **Cold starts.** Render free tier sleeps services after 15 min idle; first request after sleep takes 30-60s. Add UptimeRobot pings if this matters.
