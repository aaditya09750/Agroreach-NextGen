# Architecture

This document describes the high-level system design of **AgroReach NextGen**.
For setup and deployment instructions, see [README.md](README.md) and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## Topology

```
                 Vercel                                    Render
   ┌──────────────────────────────┐         ┌────────────────────────────────┐
   │ Frontend01 (Customer+Admin)  │ HTTPS   │ Backend (Node/Express)         │
   │  agroreach-shop.vercel.app   │────────▶│  agroreach-api.onrender.com    │
   └──────────────────────────────┘   API   │  Root: /Backend                │
                                            └────────┬───────────────────────┘
   ┌──────────────────────────────┐ HTTPS            │
   │ Frontend02 (Farmer Portal)   │     API ─────────┤
   │  agroreach-farmer-ai.vercel.app │──────────────────┤
   └──────────────────────────────┘ HTTPS (ML calls) │
                                    ────────┐        ▼
                                            ▼  ┌──────────────────┐
                                   ┌────────────┴─────┐  │ MongoDB Atlas    │
                                   │ Python ML (Flask)│  │  Free M0         │
                                   │ agroreach-ml     │  └──────────────────┘
                                   │ .onrender.com    │  ┌──────────────────┐
                                   └──────────────────┘  │ Cloudinary       │
                                            ▲            │  free 25GB       │
                                            └─uploads───▶└──────────────────┘
```

Four independent services share a single GitHub monorepo. Each service has a clearly scoped root directory and is deployed independently.

| Service | Tech | Hosted on | Root | Deploy on push |
| ------- | ---- | --------- | ---- | -------------- |
| Frontend01 | React 19 + Vite + TS | Vercel | `Frontend01/` | Yes |
| Frontend02 | React 19 + Vite + TS | Vercel | `Frontend02/` | Yes |
| Backend Node | Express + Mongoose | Render Web Service | `Backend/` | Yes |
| Backend Python | Flask + scikit-learn | Render Web Service | `Backend/` | Yes |
| Database | MongoDB | Atlas (Free M0) | — | — |
| File storage | Image CDN | Cloudinary (Free 25 GB) | — | — |

---

## Request Lifecycles

### 1. Customer purchase

```
SignIn  →  Browse /shop  →  POST /api/cart  →  POST /api/orders
   │            │                  │                  │
   │            ▼                  ▼                  ▼
   │     getAllProducts()    addToCart()        createOrder()
   │     [60 s cache]        [stock check]      [decrement stock,
   │     [.lean()]           [snapshot price]    generate ORD-YYYY-#####,
   │                                             clear cart, send email]
   ▼
authService.login()
[role-aware token storage]
```

### 2. Farmer onboarding to live product

```
Farmer signup  →  Submit ProductRequest  →  Admin reviews  →  Approve/Reject
                  POST /farmer/                              PUT /admin/
                  product-requests                            product-requests/:id/accept
                  (multipart, 1 image)
                                                              ↓ (status: approved)
Live on storefront  ←  Complete details  ←  Notification  ←  ─┘
                       POST /farmer/
                       product-requests/:id/complete
                       (multipart, up to 5 images)
                       creates Product
```

### 3. AI Prediction (Frontend02 ↔ Python ML)

```
Farmer dashboard (AI Model)  →  POST https://agroreach-ml.onrender.com/api/predict-price
                                 │
                                 │  body: { date, crop, qualityGrade, farmersLocation, seasonMonth }
                                 ▼
                         backend_api.py loads
                         price_model.pkl + price_encoders.pkl
                         (RandomForestRegressor, ~95% R²)
                                 │
                                 ▼
                         { predicted_price, min_price, max_price }
```

Same pattern for `/api/predict-next-crop` (RandomForestClassifier + crop rotation).

---

## Key Architectural Decisions

The following decisions are recorded as ADRs in [docs/ADRs/](docs/ADRs/):

- **[ADR-0001](docs/ADRs/0001-monorepo-structure.md)** Monorepo with per-service root directories
- **[ADR-0002](docs/ADRs/0002-dual-realm-auth.md)** Dual-realm JWT authentication (User vs Farmer)
- **[ADR-0003](docs/ADRs/0003-cloudinary-storage.md)** Cloudinary as image storage of record
- **[ADR-0004](docs/ADRs/0004-open-meteo-weather.md)** Open-Meteo for weather data
- **[ADR-0005](docs/ADRs/0005-render-vercel-split.md)** Render + Vercel split deployment

---

## Data Models

All schemas live in `Backend/src/models/`. Brief overview:

- **User** — customers + admins. Discriminated by `role`. Has `billingAddress`, `profileImage`, `isActive`. Pre-save hook hashes password (bcrypt salt 10).
- **Farmer** — separate collection. KYC via `isVerified`. Bank details optional. Pre-save hook hashes password.
- **Product** — `seller` ref, `images: string[]` (Cloudinary URLs), text index on name + description, compound index on `category + price`.
- **ProductRequest** — `pending → approved → completed` (or `rejected`). Has `farmerId`, snapshot of farmer details, `rejectionReason`.
- **Cart** — 1-per-user via unique index. Snapshots price at add-time so cart prices don't shift while user shops.
- **Order** — unique `orderId` formatted `ORD-YYYY-#####` with retry on collision. Item-level snapshot of price + image.
- **Recommendation** — generated by the inventory rules engine. `type` enum: `EMERGENCY_AUCTION` / `FLASH_SALE` / `BULK_MODE` / `VALUE_ADDITION` / `INSURANCE`. `priority` enum: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`.
- **Newsletter** — soft-delete on unsubscribe via `isActive: false`.

---

## Auth Architecture

Two independent realms share the same JWT secret but use disjoint Mongoose schemas, middleware, and storage keys. They cannot impersonate each other.

| Realm | Schema | Middleware | Token key | User key |
| ----- | ------ | ---------- | --------- | -------- |
| Customer | `User` (role=user) | `auth.protect` | `user_token` | `user_user` |
| Admin | `User` (role=admin) | `auth.protect` + `roleCheck.adminOnly` | `admin_token` | `admin_user` |
| Farmer | `Farmer` | `farmerAuth` | `farmer_token` | `farmer_user` |

Frontend01's axios interceptor reads the URL path to choose which token to attach: `/admin/*` paths use `admin_token`, everything else uses `user_token`. Frontend02 only uses `farmer_token`.

When an admin signs in at the regular `/signin` page, `authService.login` reads `user.role === 'admin'` and stores under the admin keys, then `SignInForm.tsx` redirects to `/admin/dashboard`.

---

## Caching & Performance

- **Backend `node-cache`** — 60-second TTL on `GET /api/products` (busiest endpoint). Cache keyed on full query object. Flushed on `createProduct`, `updateProduct`, `deleteProduct`. Stale stock display is acceptable because `POST /api/orders` re-validates stock against the live document before decrementing.
- **Mongoose `.lean()`** — applied to every read-only list endpoint (products, orders, admin stats, farmer KYC). Returns plain JS objects instead of Mongoose Documents — 3-5× faster, much less memory.
- **HTTP compression** — `compression()` middleware gzips/deflates JSON and HTML, typically 60-80% smaller payloads.
- **Cloudinary `q_auto,f_auto`** — every image URL on both frontends passes through `optimizedImage()` which inserts the auto-format and auto-quality directives. Browsers receive WebP or AVIF, typically 40-60% smaller than the source JPG.
- **Vite manualChunks** — vendor code split into `react-vendor`, `ui-vendor`, `pdf-vendor`, `i18n-vendor`, `chart-vendor` (Frontend02). Browsers cache vendor chunks across deploys.
- **React.lazy** — heavy pages (`AdminDashboard`, `CheckoutPage`, `OrderHistoryPage`, `OrderDetailPage`, `SettingsPage`, `DashboardPage`, `CompleteProductDetailsPage`) lazy-loaded. Customers visiting `/shop` don't download the admin or order code.

---

## Security Posture

- JWT 7-day expiry, bcrypt password hashing
- Helmet security headers with cross-origin resource policy for Cloudinary
- CORS env-driven allow-list in production; permissive for `localhost:*` in dev
- `express-rate-limit` 100 req / 15 min on `/api/auth`
- `app.set('trust proxy', 1)` so rate limiting reads real client IP behind Render's proxy
- Multer file-size limit (5 MB) and mimetype filter (image/* only)
- Mongoose schema validation on every model
- 401 interceptors auto-clear stale tokens and redirect to the right sign-in page based on URL path
- `.env` files git-ignored and rotated before each production deploy

---

## Service Discovery & Configuration

There is **no service registry** — services discover each other via env vars at deploy time:

- Frontends discover the Node API via `VITE_API_BASE_URL`
- Frontend02 discovers the Python ML service via `VITE_ML_API_URL`
- Node backend discovers its allow-listed origins via `FRONTEND_URLS`
- Python ML discovers its allow-listed origins via `ALLOWED_ORIGINS`

For a complete env var reference, see [docs/env-setup.md](docs/env-setup.md).

---

## Failure Modes & Mitigations

| Failure | Mitigation |
| ------- | ---------- |
| Render free dyno cold start (~15 min idle → 30-60 s wake-up) | UptimeRobot pings `/api/health` and `/health` every 14 min |
| Cloudinary free tier quota exhausted (25 GB) | Monitor via Cloudinary dashboard; upgrade or migrate to S3 |
| MongoDB Atlas M0 storage exhausted (512 MB) | Monitor via Atlas dashboard; upgrade to M2 ($9/mo) |
| Open-Meteo geocoding fails | Service falls back to Pune coordinates so dashboard never shows broken state |
| Email send fails | `try/catch` around `sendEmail()` in order/contact controllers — order creation succeeds even if SMTP is down |
| ML `.pkl` not loaded | `/health` returns `{ price_model: false }` and prediction endpoints return 503 with helpful message |
| Image upload mid-request fails | Cleanup pass deletes any `req.files[i].path` from Cloudinary before responding 500 |

---

## What This Project Deliberately Does NOT Do

- No service mesh / API gateway — the two frontends call services directly
- No payment gateway integration — `paymentMethod` field exists but no Stripe / Razorpay wiring
- No background job queue — emails, recommendations, and stat aggregations all run inline on the request thread
- No Redis / external cache — `node-cache` is in-process, so cache misses on every redeploy and is per-instance
- No real-time / WebSocket — order status updates require user-initiated refresh
- No multi-tenancy — single MongoDB database, single Cloudinary cloud
- No A/B testing or feature flags — every change ships to all users
- No CI/CD beyond GitHub-push auto-deploy

These are deliberate tradeoffs for an MVP-stage marketplace. Every one is a real follow-up if traffic grows.
