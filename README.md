# AgroReach NextGen - Agricultural Marketplace Platform

![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-FFB300?style=for-the-badge&logo=jsonwebtokens&logoColor=black)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![Open-Meteo](https://img.shields.io/badge/Open--Meteo-Weather-7EBC6F?style=for-the-badge)

A four-tier full-stack agricultural marketplace connecting farmers, customers, and administrators with AI-powered crop and pricing intelligence.

**Author:** Aaditya Gunjal (Full Stack Developer)

---

## Core Features

- **Customer Storefront:** Browse 41+ farm-fresh products across Vegetables, Fresh Fruit, Dry Fruits, and Dairy categories. Search, filter, sort, paginate, multi-image product gallery, modal-based detail view, persistent cart, secure checkout with billing address validation, order history with progress tracker, and PDF invoice export.
- **Admin Dashboard:** End-to-end product CRUD with multi-image Cloudinary uploads, monthly revenue + growth analytics, top-products aggregation, full order management (filterable by status / date / search), customer management with deactivation, farmer registry with KYC verification toggle, and product-request approval workflow with rejection-reason flow.
- **Farmer Portal:** Dedicated farmer-only application with profile + farm details, multi-step product submission (initial submission to admin → completion with full description/images/tags after approval), live product management (edit, delete, audit), AI Model section for price + crop predictions, and dashboard overview with land area, monthly revenue, and yield analysis.
- **AI Price Prediction:** RandomForestRegressor trained on Indian APMC market data. Input: date, crop, quality grade, location, season month → output: predicted modal price (₹/kg) with min/max range. Sub-second inference on a Flask service.
- **AI Next-Crop Recommendation:** RandomForestClassifier with crop-rotation logic. Input: soil pH, soil type, previous crop, area (ha), rainfall, temperature, planting month, district → output: recommended crop with confidence %, top-5 alternatives ranked by probability, and rotation-benefit explanation.
- **Smart Inventory Recommendations:** Rules engine for farmers that analyzes inventory health and emits prioritized actions: **EMERGENCY_AUCTION** (perishables nearing shelf-life with high stock, suggested 25% price cut), **FLASH_SALE** (over-stocked items with low discount), **BULK_MODE** (wholesale pricing trigger ≥ 50 kg stock), **VALUE_ADDITION** (processing suggestions for perishables: jam, dried, frozen), and **INSURANCE** (advisory for total inventory value ≥ ₹10 K).
- **Live Weather Widget:** Real-time weather on the farmer dashboard via Open-Meteo (free, key-less). Geocodes the farmer's stored location → fetches current conditions, today's high/low, humidity, wind, European AQI + PM2.5 / PM10 air quality. Includes day/night-aware emoji + 27 WMO weather-code mappings.
- **Multi-Currency Support:** Toggle between INR (₹) and USD ($) on every storefront and dashboard view. All prices stored in INR; converted at fixed exchange rate (1 USD = 88.221 INR), preference persisted to `localStorage`.
- **Multi-Language Support (Frontend01):** i18next-driven English / Marathi / Hindi switcher across Headers, Footers, product cards, FAQs, auth, contact and dashboard pages.
- **Cloudinary CDN:** All product, profile, and farmer-request images stored in Cloudinary `agroreach/` folder. Delivery URLs include `q_auto,f_auto` so browsers receive WebP/AVIF, typically 40-60% smaller than the source JPGs.
- **Dual-Realm JWT Auth:** Separate `User` and `Farmer` Mongoose schemas, separate `auth.js` and `farmerAuth.js` middleware, and dual `localStorage` token namespaces (`user_token` / `admin_token` / `farmer_token`). Admins logging in at `/signin` are auto-routed to `/admin/dashboard`.
- **Secure Authentication:** JWT (7-day expiry), bcrypt password hashing (salt 10), express-rate-limit on `/api/auth` (100 req / 15 min), Helmet security headers, env-driven CORS allow-list, gzip/deflate compression, 60-second `node-cache` on the busiest read endpoint, `mongoose .lean()` on all read-only list queries.
- **Email Notifications:** Welcome email on signup, branded HTML order confirmation invoice with INR/USD formatting, and contact-form-to-admin emails via Nodemailer + Gmail App Password.
- **Newsletter & Contact:** Public newsletter subscribe/unsubscribe with reactivation logic, soft-delete on unsubscribe, admin-only subscriber list, and authenticated contact form with both admin notification and user confirmation emails.
- **Static Chatbot:** JSON-driven Q&A widget on both frontends — tree-based question flow, reset / close controls, no LLM dependency.

---

## Technology Stack

| Technology | Version | Purpose |
| ---------- | ------- | ------- |
| React | 19.1.x | Frontend framework (Frontend01 + Frontend02) |
| Vite | 6.3.x | Frontend build tooling |
| TypeScript | 5.8.x | Frontend type safety |
| React Router DOM | 7.9.x | Client-side routing with lazy-loaded routes |
| Tailwind CSS | 3.4.x | Utility-first styling |
| Framer Motion | 12.23.x | UI animation |
| Lucide React | 0.544.x | Icon system |
| Recharts | 2.15.x | Farmer dashboard charts |
| html2canvas + jspdf | 1.4 + 3.0 | PDF invoice and audit export |
| i18next + react-i18next | 25.6.x + 16.x | Internationalization (EN/MR/HI) |
| Axios | 1.9.x | HTTP client with dual-token interceptors |
| Node.js | 18+ | Backend runtime |
| Express | 4.18.x | Backend framework |
| MongoDB | 7.x | Database |
| Mongoose | 7.6.x | ODM for MongoDB |
| JWT | 9.0.x | Authentication |
| bcryptjs | 2.4.x | Password hashing |
| Multer | 1.4.x | Multipart upload parsing |
| multer-storage-cloudinary | 4.0.x | Direct upload to Cloudinary |
| Cloudinary SDK | 2.5.x | CDN + image transformations |
| compression | 1.7.x | gzip/deflate response compression |
| node-cache | 5.1.x | In-memory product list cache (60 s TTL) |
| express-rate-limit | 7.0.x | Rate limiting on auth routes |
| Helmet | 7.0.x | Security headers |
| Nodemailer | 6.10.x | Transactional email (Gmail SMTP) |
| express-validator | 7.0.x | Request validation |
| Python | 3.10+ recommended | ML services runtime |
| Flask | 3.0.x | ML service framework |
| Flask-CORS | 4.0.x | CORS for ML service |
| scikit-learn | 1.4.x+ | RandomForest training and inference |
| pandas + numpy + joblib | latest | Data prep + model serialization |
| gunicorn | 21.2.x | Production WSGI for Flask |
| Open-Meteo | Public API | Weather + geocoding + air quality (keyless) |
| Cloudinary | CDN | Image storage and delivery |

---

## Project Structure

```text
Agroreach-NextGen/
+-- Backend/
|   +-- src/
|   |   +-- config/
|   |   |   +-- database.js
|   |   |   +-- cloudinary.js
|   |   +-- controllers/
|   |   |   +-- authController.js
|   |   |   +-- userController.js
|   |   |   +-- productController.js          (60s node-cache, .lean(), Cloudinary)
|   |   |   +-- cartController.js
|   |   |   +-- orderController.js
|   |   |   +-- adminController.js            (dashboard stats + monthly revenue)
|   |   |   +-- adminFarmerController.js
|   |   |   +-- adminProductRequestController.js
|   |   |   +-- farmerAuthController.js
|   |   |   +-- farmerProductController.js
|   |   |   +-- farmerProductRequestController.js
|   |   |   +-- farmerRecommendationController.js
|   |   |   +-- contactController.js
|   |   |   +-- newsletterController.js
|   |   +-- middleware/
|   |   |   +-- auth.js                       (req.user from user_token)
|   |   |   +-- farmerAuth.js                 (req.farmer from farmer_token)
|   |   |   +-- roleCheck.js                  (adminOnly, userOrAdmin)
|   |   |   +-- upload.js                     (CloudinaryStorage, 5 MB limit)
|   |   |   +-- errorHandler.js
|   |   +-- models/
|   |   |   +-- User.js                       (with isActive, billingAddress, role)
|   |   |   +-- Farmer.js                     (with location, landAreaSize, isVerified)
|   |   |   +-- Product.js                    (text + compound indexes)
|   |   |   +-- ProductRequest.js             (pending -> approved -> completed)
|   |   |   +-- Cart.js                       (calculateTotal method)
|   |   |   +-- Order.js                      (ORD-YYYY-##### unique generator)
|   |   |   +-- Recommendation.js             (5 priority levels)
|   |   |   +-- Newsletter.js
|   |   +-- routes/                           (14 route files)
|   |   +-- services/
|   |   |   +-- productRecommendationService.js   (rules engine: 5 action types)
|   |   +-- utils/
|   |   |   +-- emailService.js               (HTML invoice generator + Gmail SMTP)
|   |   |   +-- imageHandler.js               (Cloudinary URL pass-through + destroy)
|   |   |   +-- helpers.js                    (pagination + percentage change)
|   |   |   +-- tokenGenerator.js
|   |   +-- validators/
|   +-- scripts/
|   |   +-- createAdmin.js                    (idempotent admin seed)
|   |   +-- seedProducts.js                   (uploads 80 images + inserts 41 products)
|   |   +-- seedData.js                       (41-product hardcoded array)
|   |   +-- updateStockUnit.js                (legacy data migration)
|   +-- backend_api.py                        (Flask ML service, port 5001)
|   +-- requirements_ai.txt
|   +-- run_ai_server.bat
|   +-- train_models.bat
|   +-- AI_INTEGRATION_README.md
|   +-- AR-Ecommerce-API.postman_collection.json
|   +-- .env.example
|   +-- .npmrc                                (legacy-peer-deps for cloudinary v2)
|   +-- package.json
|   +-- server.js                             (compression + env CORS + trust proxy)
|
+-- Frontend01/                               (Customer storefront + Admin panel)
|   +-- src/
|   |   +-- pages/
|   |   |   +-- user/
|   |   |   |   +-- HomePage.tsx
|   |   |   |   +-- ShopPage.tsx
|   |   |   |   +-- CartPage.tsx
|   |   |   |   +-- CheckoutPage.tsx          (lazy)
|   |   |   |   +-- DashboardPage.tsx         (lazy)
|   |   |   |   +-- OrderHistoryPage.tsx      (lazy)
|   |   |   |   +-- OrderDetailPage.tsx       (lazy)
|   |   |   |   +-- SettingsPage.tsx          (lazy)
|   |   |   |   +-- SignInPage.tsx
|   |   |   |   +-- SignUpPage.tsx
|   |   |   |   +-- AboutPage.tsx
|   |   |   |   +-- ContactPage.tsx
|   |   |   +-- admin/
|   |   |   |   +-- AdminLoginPage.tsx        (lazy)
|   |   |   |   +-- AdminDashboard.tsx        (lazy, sidebar + tab views)
|   |   +-- components/
|   |   |   +-- admin/
|   |   |   |   +-- AdminOverview.tsx
|   |   |   |   +-- AdminAddProduct.tsx
|   |   |   |   +-- AdminOrders.tsx
|   |   |   |   +-- AdminCustomers.tsx
|   |   |   |   +-- AdminFarmers.tsx
|   |   |   |   +-- AdminProductRequests.tsx
|   |   |   +-- chatbot/                      (static JSON Q&A widget)
|   |   |   +-- sections/                     (Hero, FeaturedProducts, FAQ, Testimonials)
|   |   |   +-- ui/                           (ProductCard, Pagination, modals, etc.)
|   |   +-- context/
|   |   |   +-- UserContext.tsx               (login, register, dual-token storage)
|   |   |   +-- CartContext.tsx
|   |   |   +-- ProductContext.tsx
|   |   |   +-- OrderContext.tsx
|   |   |   +-- CurrencyContext.tsx           (INR <-> USD)
|   |   |   +-- LanguageContext.tsx           (EN/MR/HI)
|   |   |   +-- NotificationContext.tsx
|   |   +-- services/
|   |   |   +-- api.ts                        (path-based admin/user token attach)
|   |   |   +-- authService.ts                (role-aware storage prefix)
|   |   |   +-- productService.ts
|   |   |   +-- cartService.ts
|   |   |   +-- orderService.ts
|   |   |   +-- userService.ts
|   |   |   +-- adminService.ts
|   |   |   +-- adminFarmerService.ts
|   |   |   +-- adminProductRequestService.ts
|   |   |   +-- contactService.ts
|   |   |   +-- newsLetterService.ts
|   |   +-- utils/
|   |   |   +-- imageUtils.ts                 (getImageUrl + optimizedImage helper)
|   |   |   +-- pdfGenerator.ts
|   |   +-- i18n/
|   |   |   +-- config.ts
|   |   |   +-- locales/
|   |   |   |   +-- en.json
|   |   |   |   +-- mr.json
|   |   |   |   +-- hi.json
|   |   +-- App.tsx                           (7 nested context providers + Suspense)
|   +-- vite.config.ts                        (manualChunks: react/ui/pdf/i18n vendors)
|   +-- vercel.json                           (SPA rewrites)
|   +-- .env.example
|   +-- package.json
|
+-- Frontend02/                               (Farmer Portal)
|   +-- src/
|   |   +-- pages/
|   |   |   +-- farmer/
|   |   |   |   +-- HomePage.tsx
|   |   |   |   +-- SignInPage.tsx
|   |   |   |   +-- SignUpPage.tsx
|   |   |   |   +-- ContactPage.tsx
|   |   |   |   +-- DashboardPage.tsx         (lazy, ~1235 lines: overview/sell/manage/AI)
|   |   |   |   +-- CompleteProductDetailsPage.tsx (lazy)
|   |   +-- components/
|   |   |   +-- dashboard/                    (Sidebar, ProfileCard, BillingCard)
|   |   |   +-- farmer/                       (ProductRequestTable, ManageProductsTable)
|   |   |   +-- chatbot/
|   |   |   +-- sections/                     (SignInForm, SignUpForm, ContactContent)
|   |   |   +-- settings/                     (AccountSettingsForm, BillingAddressForm)
|   |   |   +-- ui/                           (InputField, SelectField, Toast)
|   |   +-- context/
|   |   |   +-- FarmerContext.tsx
|   |   |   +-- NotificationContext.tsx
|   |   |   +-- CurrencyContext.tsx
|   |   +-- services/
|   |   |   +-- api.ts                        (farmer_token interceptor)
|   |   |   +-- farmerAuthService.ts
|   |   |   +-- farmerProductService.ts
|   |   |   +-- farmerProductRequestService.ts
|   |   |   +-- farmerAIService.ts
|   |   |   +-- dashboardService.ts           (delegates to weatherService)
|   |   |   +-- weatherService.ts             (Open-Meteo geocode + forecast + air quality)
|   |   |   +-- contactService.ts
|   |   +-- utils/
|   |   |   +-- imageUtils.ts                 (getImageUrl + optimizedImage)
|   |   |   +-- auditReportGenerator.ts       (jspdf-autotable PDF export)
|   |   +-- App.tsx                           (3 providers + lazy DashboardPage)
|   +-- vite.config.ts                        (manualChunks: react/ui/pdf/chart/i18n)
|   +-- vercel.json                           (SPA rewrites)
|   +-- .env.example
|   +-- package.json
|
+-- Models/
|   +-- Price Prediction/
|   |   +-- train_and_save_model.py
|   |   +-- fast_predict.py
|   |   +-- modal_price_model.pkl
|   |   +-- price_model.pkl
|   |   +-- price_encoders.pkl
|   |   +-- price_feature_info.pkl
|   +-- Next Crop/
|   |   +-- train_and_save_model.py
|   |   +-- fast_predict.py
|   |   +-- crop_model.pkl
|   |   +-- crop_feature_info.pkl
|   |   +-- crop_prediction_vegetables_model.pkl
|
+-- products/                                 (41-product seed source)
|   +-- aaaProductDetails.ts                  (product spec list)
|   +-- *.jpg / *.png                         (80 source images)
|
+-- render.yaml                               (Render Blueprint for both services)
+-- .gitignore
+-- README.md
```

---

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (7.0+ local or Atlas)
- Python (3.10+ recommended for ML service)
- Cloudinary account (free tier — 25 GB)
- Git
- npm

### Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
# Update .env values (Mongo URI, Cloudinary, Gmail App Password), then run:
npm run dev
# Backend: http://localhost:5000
```

Windows alternative:

```powershell
copy .env.example .env
```

**Backend `.env` example:**

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB (Atlas in production)
MONGODB_URI=mongodb://localhost:27017/agroreach

# JWT
JWT_SECRET=replace-with-64-byte-random-string
JWT_EXPIRE=7d

# CORS — comma-separated frontend origins (production)
# In dev, any localhost:* port is auto-allowed
FRONTEND_URLS=http://localhost:5174,http://localhost:5175
FRONTEND_URL=http://localhost:5173

# Email (Gmail App Password — Google Account -> Security -> App passwords)
EMAIL_SERVICE=gmail
EMAIL_USER=agroreach01@gmail.com
EMAIL_PASS=your-16-char-app-password
ADMIN_EMAIL=agroreach01@gmail.com

# Cloudinary (cloudinary.com -> Dashboard -> Settings -> API Keys)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend01 Setup (Customer + Admin)

```bash
cd Frontend01
npm install
cp .env.example .env
# Default points at local backend:
# VITE_API_BASE_URL=http://localhost:5000/api
npm run dev
# Frontend01: http://localhost:5174
```

**Frontend01 `.env` example:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Frontend02 Setup (Farmer Portal)

```bash
cd Frontend02
npm install
cp .env.example .env
npm run dev
# Frontend02: http://localhost:5175
```

**Frontend02 `.env` example:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_ML_API_URL=http://localhost:5001
# Open-Meteo is free and key-less — VITE_WEATHER_API_KEY is unused
```

### Python ML Service Setup

```bash
cd Backend
pip install -r requirements_ai.txt
python backend_api.py
# ML Service: http://localhost:5001
```

Train models only when regenerating artifacts:

```bash
cd "Models/Price Prediction"
python train_and_save_model.py

cd "../Next Crop"
python train_and_save_model.py
```

Health check:

```bash
curl http://localhost:5001/health
# {"status":"healthy","price_model":true,"crop_model":true,...}
```

### One-Time Bootstrap

After all four services run locally:

```bash
cd Backend
npm run create-admin    # creates agroreach25@gmail.com / Agroreach@321
npm run seed-products   # uploads 80 images to Cloudinary, inserts 41 products
```

The seed script is **idempotent** — safe to rerun. Already-uploaded images are overwritten by stable Cloudinary `public_id`; already-inserted products are skipped by name.

---

## Usage Flow

1. **Customer:** Sign up → browse `/shop` → add to cart → checkout → track order via dashboard.
2. **Farmer:** Register on Frontend02 → submit product request with image → wait for admin approval → complete details (description, additional images, tags, discount) → product goes live on the customer storefront.
3. **Admin:** Log in at `/signin` (auto-routed to `/admin/dashboard`) → review pending product requests → approve or reject with reason → manage live products, orders, customers, and farmer KYC verification.
4. **AI Models:** Farmer dashboard → AI Model section → Price Prediction or Crop Recommendation → submit form → view predicted price range or recommended crop with top-5 alternatives and rotation benefit.
5. **Smart Recommendations:** Farmer dashboard auto-generates inventory action cards (Emergency Auction, Flash Sale, Bulk Mode, Value Addition, Insurance) — accept or dismiss each.

---

## Demo Credentials

| Email | Password | Role |
| ----- | -------- | ---- |
| agroreach25@gmail.com | Agroreach@321 | Admin |
| _Sign up at /signup_ | _your-choice_ | Customer |
| _Sign up at Frontend02 /signup_ | _your-choice_ | Farmer |

Login flow: admins entering credentials at the regular `/signin` page are auto-redirected to `/admin/dashboard` thanks to role-aware routing in `SignInForm.tsx`.

---

## UI & Design

- Tailwind CSS-based design system with shared brand palette (primary green `#00B207`, warning orange `#FF8A00`, sale red `#EA4B48`)
- Poppins font, custom shadows (`shadow-feature`, `shadow-product-hover`, `shadow-testimonial`), custom keyframes (`slideInTop`, `slideInRight`)
- Fully responsive layouts on both frontends, tested down to 375 px mobile viewports
- Smooth animations via Framer Motion across cards, modals, sidebars, and route transitions
- Lazy-loaded heavy pages (Admin Dashboard, Checkout, Order detail, Farmer dashboard) so first-paint stays fast for casual browsers
- Vendor chunks split (`react-vendor`, `ui-vendor`, `pdf-vendor`, `i18n-vendor`, `chart-vendor`) so framework code is cached across deploys
- Cloudinary `q_auto,f_auto,w_*` transformations on every product image — browsers receive WebP/AVIF, typically 40-60% smaller than the source JPGs
- Native lazy-load (`loading="lazy" decoding="async"`) on grid and table images
- Component-level `React.memo` on `ProductCard`, `CartItemRow`, and farmer table rows to prevent re-renders during parent state churn
- Skeleton loaders, gradient progress bars, color-coded stat badges, and pill-toggles across both dashboards
- Brand-consistent gradient buttons, accent-stripe cards, and tone-mapped status chips (pending / approved / rejected / completed)

---

## Security Features

- JWT authentication with 7-day expiry
- Password hashing with bcrypt (salt 10)
- Role-based middleware: `adminOnly`, `userOrAdmin`, `farmerAuth`
- Dual-realm auth — independent User and Farmer schemas + tokens, no cross-realm access
- Path-aware token attachment in axios interceptors so admin and customer sessions can coexist in the same browser
- Express-rate-limit (100 req / 15 min) on `/api/auth`
- Helmet security headers with `crossOriginResourcePolicy: 'cross-origin'` for Cloudinary asset loading
- CORS env-driven allow-list in production (`FRONTEND_URLS`); permissive `localhost:*` only in development
- Input validation via `express-validator` on auth, product, and order routes
- Mongoose schema validation on every model (regex on emails, enum on roles/statuses/units, min/max on quantities and prices)
- 401 interceptors on both frontends auto-clear stale tokens and redirect to the correct sign-in page based on URL path
- Multer file-size and mimetype filters (5 MB max, image/jpeg|png|gif|webp only)
- `.env` files git-ignored and rotated before production deploy

---

## API Endpoints

### Base URL

```text
http://localhost:5000/api
```

### Authentication

- `POST /api/auth/signup` - Register new customer
- `POST /api/auth/signin` - Login (admin or customer)
- `GET /api/auth/me` - Get current user (Protected)
- `POST /api/auth/logout` - Logout (Protected)

### User

- `GET /api/users/profile` - Current user profile (Protected)
- `PUT /api/users/profile` - Update profile + avatar upload (Protected, multipart)
- `PUT /api/users/billing-address` - Update billing address (Protected)
- `PUT /api/users/password` - Change password (Protected)

### Products (Public read, Admin write)

- `GET /api/products` - List with `category`, `minPrice`, `maxPrice`, `tags`, `search`, `sort`, `page`, `limit`, `status`, `isHotDeal`, `isBestSeller`, `isTopRated` filters; 60-second cached
- `GET /api/products/search` - Text search across name + description
- `GET /api/products/:id` - Single product detail
- `PATCH /api/products/:id/view` - Increment view count
- `POST /api/products` - Create with up to 5 Cloudinary images (Admin)
- `PUT /api/products/:id` - Update including image replacement (Admin)
- `DELETE /api/products/:id` - Delete + Cloudinary cleanup (Admin)

### Cart (Protected)

- `GET /api/cart` - Get cart with subtotal
- `POST /api/cart` - Add item (validates stock)
- `PUT /api/cart/:productId` - Update quantity
- `DELETE /api/cart/:productId` - Remove item
- `DELETE /api/cart/clear` - Empty cart

### Orders (Protected)

- `POST /api/orders` - Create order (decrements stock, generates `ORD-YYYY-#####`, sends invoice email)
- `GET /api/orders/user` - User's order history (paginated)
- `GET /api/orders/:id` - Single order detail with populated items
- `PATCH /api/orders/:id/cancel` - Cancel pending order (refunds stock)

### Admin (adminOnly)

- `GET /api/admin/dashboard/stats` - Composite: orders by status, monthly revenue + growth %, customers, top 5 products
- `GET /api/admin/orders` - All orders, filterable by status / date / search / userId
- `GET /api/admin/orders/:id` - Single order with full populate
- `PATCH /api/admin/orders/:id/status` - Update status (pending → processing → shipped → delivered)
- `DELETE /api/admin/orders/:id` - Delete order
- `GET /api/admin/users` - All customers with pagination
- `PATCH /api/admin/users/:id/toggle-active` - Deactivate / reactivate
- `DELETE /api/admin/users/:id` - Delete customer + orders + cart cascade
- `GET /api/admin/products/recent` - Recently created products
- `GET /api/admin/farmers` - All farmers with computed stats (totalRequests, approved, rejected, activeProducts)
- `GET /api/admin/farmers/:id` - Single farmer + stats
- `GET /api/admin/farmers/:id/requests` - Farmer's product-request history
- `PUT /api/admin/farmers/:id/toggle-verification` - Toggle KYC verification
- `GET /api/admin/product-requests` - All requests filterable by status + category
- `GET /api/admin/product-requests/stats` - Per-status counts
- `GET /api/admin/product-requests/:id` - Single request detail
- `PUT /api/admin/product-requests/:id/accept` - Approve (records approvedBy + approvedAt)
- `PUT /api/admin/product-requests/:id/reject` - Reject with `rejectionReason`

### Farmer Auth (no token / farmerAuth)

- `POST /api/farmer/auth/register` - Farmer signup (name, email, phone, location, landAreaSize)
- `POST /api/farmer/auth/login` - Farmer login (returns farmer + JWT)
- `GET /api/farmer/auth/profile` - Farmer profile (farmerAuth)
- `PUT /api/farmer/auth/profile` - Update profile + Cloudinary photo (farmerAuth, multipart)

### Farmer Products (farmerAuth)

- `GET /api/farmer/products` - List own live products
- `GET /api/farmer/products/stats` - Inventory totals (in stock, out of stock, value)
- `GET /api/farmer/products/dashboard-stats` - Land area, monthly revenue, growth %
- `GET /api/farmer/products/audit` - Audit data for PDF export
- `PUT /api/farmer/products/:id` - Update own product
- `DELETE /api/farmer/products/:id` - Delete own product

### Farmer Product Requests (farmerAuth)

- `POST /api/farmer/product-requests` - Submit with initial image (multipart)
- `GET /api/farmer/product-requests` - Own request history with status + rejection reasons
- `GET /api/farmer/product-requests/:id` - Single request
- `POST /api/farmer/product-requests/:requestId/complete` - Add description, tags, discount, additional images (multipart, up to 5)
- `DELETE /api/farmer/product-requests/:id` - Delete pending request only

### Farmer Recommendations (farmerAuth)

- `GET /api/farmer/recommendations` - Generate or fetch top 5 prioritized actions
- `GET /api/farmer/recommendations/product/:productId` - Per-product recommendation with action steps
- `POST /api/farmer/recommendations/:id/dismiss` - Mark dismissed
- `POST /api/farmer/recommendations/:id/acted` - Mark acted

### Contact & Newsletter

- `POST /api/contact` - Send contact form (Protected) — emails admin + sends user confirmation
- `POST /api/newsletter/subscribe` - Subscribe (Public, idempotent reactivation)
- `POST /api/newsletter/unsubscribe` - Soft-delete (Public)
- `GET /api/newsletter/subscribers` - All active subscribers (adminOnly)

### Health Check

- `GET /api/health` - `{ "status": "OK", "message": "Server is running" }`

---

## Python ML Service

The Flask ML service in `Backend/backend_api.py` runs on port `5001` and exposes two ML predictions backed by pre-trained scikit-learn artifacts.

### Endpoints

- `GET /health` - Service status + model load state
- `POST /api/predict-price` - Body: `{ date, crop, qualityGrade, farmersLocation, seasonMonth }` → `{ predicted_price, min_price, max_price }`
- `POST /api/predict-next-crop` - Body: `{ ph, soilType, previousCrop, areaHa, rainfall, temperature, month, district }` → `{ recommended_crop, confidence, top_crops, rotation_benefit }`
- `GET /api/options/price` - Dropdown options for the price prediction form
- `GET /api/options/crop` - Dropdown options for the crop recommendation form

### Models

- **Price Prediction:** RandomForestRegressor trained on Indian APMC market data, ~95% R²
- **Next Crop:** RandomForestClassifier with crop-rotation-aware exclusion of the previous crop, ~85% accuracy

### Production

```bash
gunicorn backend_api:app -b 0.0.0.0:$PORT --timeout 120 --workers 1
```

`Backend/backend_api.py` reads `PORT`, `FLASK_DEBUG`, and `ALLOWED_ORIGINS` from env. Default `debug=False`. Models load once at process start so inference is sub-second after warm-up.

---

## Live Weather Widget

The farmer dashboard weather card uses **Open-Meteo** (free, key-less, no rate-limit issues for dashboard usage).

**Flow** (`Frontend02/src/services/weatherService.ts`):

1. Geocode the farmer's stored `location` string via `https://geocoding-api.open-meteo.com/v1/search` → `{ latitude, longitude, name }`
2. Forecast call: `https://api.open-meteo.com/v1/forecast` with `current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m` and `daily=temperature_2m_max,temperature_2m_min` → temperature, feels-like, today's high/low, humidity, wind
3. Air quality call: `https://air-quality-api.open-meteo.com/v1/air-quality` → European AQI, PM2.5, PM10
4. WMO weather-code → human description + day/night-aware emoji (27 conditions mapped)
5. AQI numeric → label (Good / Fair / Moderate / Poor / Very Poor / Extreme)

**Fallback** — if geocoding fails or returns no results, the service falls back to Pune coordinates so the dashboard never shows a broken state.

---

## Smart Inventory Recommendations

Rules engine in `Backend/src/services/productRecommendationService.js` analyzes a farmer's `Product` collection and emits up to 5 prioritized actions.

| Type | Trigger | Suggestion | Priority |
| ---- | ------- | ---------- | -------- |
| EMERGENCY_AUCTION | Perishable + ≥ 50 % shelf-life elapsed + stock > 20 | 25 % price cut, mark Quick Sale, social promotion | CRITICAL |
| FLASH_SALE | Stock > 50 + discount < 20 % | Discount 15-35 % based on age, calculates revenue uplift | HIGH |
| BULK_MODE | Stock ≥ 50 kg | Wholesale pricing (15 % discount), min bulk quantity = 20 % of stock | MEDIUM |
| VALUE_ADDITION | Perishable + stock ≥ 30 | Processing options (jam, dried, frozen), 40-60 % margin uplift | MEDIUM |
| INSURANCE | Total inventory value ≥ ₹10 K | Crop insurance advisory (~2 % premium estimate) | LOW |

Old recommendations are deleted on each refresh; new ones are inserted with action steps, implementation time, and expected outcome. Farmers can `dismiss` or mark `acted` per recommendation.

---

## Testing

```bash
# Smoke-test the AI service
curl http://localhost:5001/health

# Smoke-test the Node API
curl http://localhost:5000/api/health

# Manual product seed (idempotent)
cd Backend && npm run seed-products
```

The repo includes a Postman collection at `Backend/AR-Ecommerce-API.postman_collection.json` covering every public + protected endpoint with example payloads.

---

## Deployment

| Tier | Host | Notes |
| ---- | ---- | ----- |
| Frontend01 (Customer + Admin) | Vercel | Root: `Frontend01`, env: `VITE_API_BASE_URL` |
| Frontend02 (Farmer Portal) | Vercel | Root: `Frontend02`, env: `VITE_API_BASE_URL` + `VITE_ML_API_URL` |
| Backend (Node/Express) | Render Web Service | Root: `Backend`, build: `npm install`, start: `node server.js` |
| ML Service (Flask) | Render Web Service | Root: `Backend`, build: `pip install -r requirements_ai.txt`, start: `gunicorn backend_api:app -b 0.0.0.0:$PORT --timeout 120 --workers 1` |
| Database | MongoDB Atlas (Free M0) | Network access `0.0.0.0/0` for Render's dynamic IPs |
| File storage | Cloudinary (Free 25 GB) | Folder `agroreach/products/` and `agroreach/` |

Infrastructure-as-code: [`render.yaml`](render.yaml) at repo root provisions both Render services via Blueprint. [`Frontend01/vercel.json`](Frontend01/vercel.json) and [`Frontend02/vercel.json`](Frontend02/vercel.json) configure SPA rewrites.

**Pre-flight before first deploy:**

1. Rotate the leaked secrets that were in committed `.env` files: MongoDB password, JWT secret (any 64-byte random), Gmail App Password, Cloudinary API secret.
2. `git rm --cached Backend/.env Frontend01/.env` so production secrets never get committed.
3. Push to GitHub.
4. **Render → New → Blueprint** → connect repo → fill `sync: false` env vars (`MONGODB_URI`, `JWT_SECRET`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_EMAIL`, `CLOUDINARY_*`, `FRONTEND_URLS`).
5. **Vercel** → Add New Project → import same repo twice (once per `Root Directory`).
6. Once Vercel URLs are stable, set `FRONTEND_URLS` and `ALLOWED_ORIGINS` on Render. Both auto-redeploy.

**Build commands:**

- Frontend01 / Frontend02: `npm run build` → output `dist/`
- Backend Node: `npm install` (no build step)
- Backend Python: `pip install -r requirements_ai.txt` (no build step)

### Render free-tier cold-start notes

Render free-tier dynos sleep after ~15 minutes of inactivity. The first request after sleep takes 30-60 s, especially for the Python ML service which has to reload `.pkl` artifacts. Two free mitigations:

- **UptimeRobot** pinging `/api/health` and `/health` every 14 min keeps both warm.
- The Vercel `vite-plugin-react` SPAs include preconnect hints for both Render origins, so DNS + TLS handshakes start during HTML parse.

---

## NPM Scripts

### Backend (`Backend/package.json`)

- `npm start` - Start production server
- `npm run dev` - Start dev server with nodemon
- `npm run create-admin` - Idempotent admin user seed (`agroreach25@gmail.com` / `Agroreach@321`)
- `npm run seed-products` - Upload 80 images to Cloudinary + insert 41 products

### Frontend01 (`Frontend01/package.json`)

- `npm run dev` - Start Vite dev server (default :5174)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Frontend02 (`Frontend02/package.json`)

- `npm run dev` - Start Vite dev server (default :5175)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

---

## Troubleshooting

**MongoDB Connection Error**

- Ensure local MongoDB service is running, or that the Atlas SRV string in `MONGODB_URI` is reachable.
- If using Atlas, confirm Network Access has the current IP whitelisted (or `0.0.0.0/0` for ephemeral hosts).

**CORS errors in browser console**

- In dev, any `localhost:*` origin is allowed automatically. If you still see CORS errors, restart the Backend after changing `.env`.
- In production, edit `FRONTEND_URLS` on Render to include the exact Vercel URLs (no trailing slash, no path), then redeploy.

**Cloudinary upload fails**

- Verify all three env vars are set: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- Re-check that the secret has not been rotated since you last copied it.
- The `legacy-peer-deps=true` line in `Backend/.npmrc` is required because `multer-storage-cloudinary` declares an outdated peer dep on `cloudinary@^1`.

**ML service returns 503**

- The Flask service prints `Loaded` / `Not Loaded` for each model on startup. If `Not Loaded`, re-run `python train_and_save_model.py` in the relevant `Models/` subfolder.
- Confirm `gunicorn` is in `requirements_ai.txt` and `--timeout 120` is on the start command (model warm-up can be slow on first request).

**Auth / token issues**

- Clear `localStorage` (`user_token`, `admin_token`, `farmer_token`, plus their `_user` siblings) and log in again.
- Confirm `JWT_SECRET` is identical across all instances of the backend (rotating invalidates every existing token, forcing re-login).

**Images render as broken on the live site**

- Check the stored URL in MongoDB starts with `https://res.cloudinary.com/...` — if it still says `/uploads/`, you're seeing legacy data. Re-upload via the admin UI or re-seed.
- Confirm `VITE_API_BASE_URL` on Vercel points at the Render API URL, not localhost.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Contact & Support

- Email: aadigunjal0975@gmail.com
- Issues: [GitHub Issues](https://github.com/aaditya09750/Agroreach-NextGen/issues)
- Discussions: [GitHub Discussions](https://github.com/aaditya09750/Agroreach-NextGen/discussions)

---

## Acknowledgments

- **Open-Meteo** for free, key-less weather, geocoding, and air-quality APIs
- **Cloudinary** for free-tier image CDN with auto WebP/AVIF transformations
- **scikit-learn** for the RandomForest implementations powering price and crop predictions
- **MongoDB Atlas** for the free M0 cluster
- **Render** and **Vercel** for free-tier hosting
- **Tailwind CSS** for the design system
- React, Node.js, and Python communities

---

## License

This project is licensed under the MIT License.
