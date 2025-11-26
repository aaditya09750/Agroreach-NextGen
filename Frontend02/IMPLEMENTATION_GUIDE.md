# Frontend02 Implementation Guide

## ✅ COMPLETED
1. Project configuration (package.json, vite.config.ts, tailwind.config.js, etc.)
2. Services layer (auth, product, dashboard, AI, support)
3. Context providers (FarmerContext, NotificationContext)
4. Protected routes
5. Main App.tsx with routing

## 📋 NEXT STEPS TO COMPLETE

### Phase 1: Copy Layout Components from Frontend01
Copy these files exactly from Frontend01 to Frontend02:

```
src/components/layout/
├── Header.tsx (modify navigation links)
├── Footer.tsx (exact copy)
```

**Header.tsx modifications:**
- Change navigation links to: Home, Contact, Dashboard (if logged in), Sign In/Sign Up
- Update user icon to show farmer name
- Change profile dropdown to farmer routes

### Phase 2: Create Pages

#### 1. Home Page (`src/pages/farmer/HomePage.tsx`)
```typescript
import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
// Import sections when created

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Header />
      {/* Home sections will go here */}
      <div className="py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to AgroReach Farmer Portal
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Empowering farmers with technology for better yields and fair prices
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
```

#### 2. Contact Page (`src/pages/farmer/ContactPage.tsx`)
**Copy EXACTLY from Frontend01's ContactPage** - No changes needed in UI

#### 3. Sign In Page (`src/pages/farmer/SignInPage.tsx`)
Copy from Frontend01's SignInPage and modify:
- API call to use `farmerAuthService`
- Redirect to `/dashboard` after login
- Link text: "New Farmer? Register here"

#### 4. Sign Up Page (`src/pages/farmer/SignUpPage.tsx`)
Copy from Frontend01's SignUpPage and add fields:
```typescript
Additional fields:
- Farm Name
- Farm Location  
- Land Area Size (number)
```

#### 5. Dashboard Page (`src/pages/farmer/DashboardPage.tsx`)
**EXACT UI from Frontend01's DashboardPage (My Account)**

```typescript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import FarmerDashboardSidebar from '../../components/farmer/FarmerDashboardSidebar';
import FarmerOverview from '../../components/farmer/FarmerOverview';
import FarmerProfile from '../../components/farmer/FarmerProfile';
import FarmerSellProduct from '../../components/farmer/FarmerSellProduct';
import FarmerAIModels from '../../components/farmer/FarmerAIModels';
import FarmerHelpSupport from '../../components/farmer/FarmerHelpSupport';
import FarmerSettings from '../../components/farmer/FarmerSettings';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Dashboard Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Home &gt; Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout - EXACT from Frontend01 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - 25% width on desktop */}
          <div className="lg:col-span-1">
            <FarmerDashboardSidebar />
          </div>

          {/* Content Area - 75% width on desktop */}
          <div className="lg:col-span-3">
            <Routes>
              <Route index element={<FarmerOverview />} />
              <Route path="profile" element={<FarmerProfile />} />
              <Route path="sell-product" element={<FarmerSellProduct />} />
              <Route path="ai-models" element={<FarmerAIModels />} />
              <Route path="help-support" element={<FarmerHelpSupport />} />
              <Route path="settings" element={<FarmerSettings />} />
            </Routes>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
```

### Phase 3: Dashboard Components

All dashboard components should use EXACT styling from Frontend01:
- Card classes: `bg-white rounded-lg shadow-sm p-6`
- Headings: `text-xl font-semibold text-gray-800 mb-6`
- Inputs: `w-full px-4 py-2.5 border border-gray-300 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors`
- Buttons: `bg-primary text-white px-6 py-2.5 rounded-md font-medium hover:bg-primary-600 transition-colors`

#### FarmerDashboardSidebar.tsx
Copy EXACT structure from Frontend01's DashboardSidebar.tsx
Menu items:
1. Overview (Home icon) → /dashboard
2. Profile (User icon) → /dashboard/profile
3. Sell Product (ShoppingBag icon) → /dashboard/sell-product
4. AI Models (Brain icon) → /dashboard/ai-models
5. Help & Support (HelpCircle icon) → /dashboard/help-support
6. Settings (Settings icon) → /dashboard/settings
7. Logout (LogOut icon) → logout function

#### FarmerOverview.tsx
Structure:
1. Weather Card (API integration)
2. 4 Stats Cards (Total Products, Active Orders, Total Revenue, Monthly Sales)
3. Sales Graph (recharts)
4. News Cards (3-4 cards)

#### FarmerProfile.tsx
Copy form layout from Frontend01 Settings page
Fields:
- Photo upload
- Name, Email, Phone (2 columns)
- Address, Location, Zipcode (2 columns)
- Land Area Size (full width)

#### FarmerSellProduct.tsx
Copy form from AdminAddProduct.tsx
Form fields:
- Product Name
- Category (dropdown)
- Quantity + Unit
- Price per Unit
- Description
- Images (multiple upload)

Below form: Product Requests Table (copy table styling from OrderHistoryTable)

#### FarmerAIModels.tsx
Tab layout (copy from Settings tabs):
- Price Prediction
- Next Crop Recommendation
- Audit System

Each tab has forms and results display

#### FarmerHelpSupport.tsx
Sections:
1. FAQ Accordion
2. Contact Support Form
3. Support Tickets Table

#### FarmerSettings.tsx
Copy EXACT from Frontend01 Settings page
Sections:
- Change Password
- Email Preferences
- Notification Settings
- Payment Settings

## 🎨 UI CONSISTENCY CHECKLIST

**Copy these EXACTLY from Frontend01:**
- ✅ Font: Poppins
- ✅ Colors: Primary #00B207
- ✅ Card padding: p-6
- ✅ Input height: h-11, py-2.5
- ✅ Button height: h-10 or h-11
- ✅ Border radius: rounded-md, rounded-lg
- ✅ Shadow: shadow-sm
- ✅ Hover effects: All buttons and links
- ✅ Focus states: ring-2 ring-primary/20
- ✅ Grid gaps: gap-6
- ✅ Responsive: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

## 📦 File Structure Summary

```
Frontend02/
├── src/
│   ├── App.tsx ✅
│   ├── main.tsx ✅
│   ├── index.css ✅
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx (copy from Frontend01)
│   │   │   └── Footer.tsx (copy from Frontend01)
│   │   ├── farmer/
│   │   │   ├── FarmerDashboardSidebar.tsx
│   │   │   ├── FarmerOverview.tsx
│   │   │   ├── FarmerProfile.tsx
│   │   │   ├── FarmerSellProduct.tsx
│   │   │   ├── FarmerAIModels.tsx
│   │   │   ├── FarmerHelpSupport.tsx
│   │   │   └── FarmerSettings.tsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.tsx ✅
│   │   └── ui/
│   │       └── NotificationToast.tsx ✅
│   ├── context/
│   │   ├── FarmerContext.tsx ✅
│   │   └── NotificationContext.tsx ✅
│   ├── services/
│   │   ├── api.ts ✅
│   │   ├── farmerAuthService.ts ✅
│   │   ├── farmerProductService.ts ✅
│   │   ├── farmerDashboardService.ts ✅
│   │   ├── farmerAIService.ts ✅
│   │   └── farmerSupportService.ts ✅
│   └── pages/
│       └── farmer/
│           ├── HomePage.tsx
│           ├── ContactPage.tsx
│           ├── SignInPage.tsx
│           ├── SignUpPage.tsx
│           └── DashboardPage.tsx
```

## 🔧 Backend Routes Needed

Create these routes in Backend folder:

### 1. routes/farmerAuthRoutes.js
```javascript
POST   /api/farmer/auth/register
POST   /api/farmer/auth/login
GET    /api/farmer/auth/profile
PUT    /api/farmer/auth/profile
```

### 2. routes/farmerProductRoutes.js
```javascript
POST   /api/farmer/products/request
GET    /api/farmer/products/requests
GET    /api/farmer/products/requests/:id
PUT    /api/farmer/products/requests/:id
DELETE /api/farmer/products/requests/:id
```

### 3. routes/farmerDashboardRoutes.js
```javascript
GET    /api/farmer/dashboard/stats
GET    /api/farmer/dashboard/sales-graph
GET    /api/farmer/dashboard/news
```

### 4. routes/farmerAIRoutes.js
```javascript
POST   /api/farmer/ai/price-prediction
POST   /api/farmer/ai/crop-recommendation
POST   /api/farmer/ai/audit-submit
GET    /api/farmer/ai/audit-results
```

### 5. routes/farmerSupportRoutes.js
```javascript
POST   /api/farmer/support/ticket
GET    /api/farmer/support/tickets
GET    /api/farmer/support/tickets/:id
PUT    /api/farmer/support/tickets/:id
GET    /api/farmer/support/faq
```

### 6. models/Farmer.js
```javascript
{
  userId: ObjectId,
  name: String,
  email: String,
  phone: String,
  password: String (hashed),
  farmName: String,
  location: String,
  landAreaSize: Number,
  photo: String,
  address: String,
  zipcode: String,
  isVerified: Boolean,
  createdAt: Date
}
```

### 7. models/ProductRequest.js
```javascript
{
  farmerId: ObjectId,
  productName: String,
  category: String,
  quantity: Number,
  unit: String,
  pricePerUnit: Number,
  description: String,
  images: [String],
  status: 'pending' | 'approved' | 'rejected' | 'under_review',
  rejectionReason: String,
  createdAt: Date
}
```

## ▶️ To Run the Project

1. **Backend:**
```bash
cd Backend
npm start
```

2. **Frontend02:**
```bash
cd Frontend02
npm run dev
```

3. **Access:**
- Frontend02: http://localhost:5173
- Backend: http://localhost:5000

## 🎯 Priority Implementation Order

1. ✅ Project setup (DONE)
2. Copy Header & Footer from Frontend01
3. Create simple placeholder pages (Home, Contact, SignIn, SignUp)
4. Create Dashboard layout with Sidebar
5. Create Overview page (simplest)
6. Create Profile page
7. Create Sell Product page
8. Create AI Models page
9. Create Help & Support page
10. Create Settings page
11. Implement Backend routes
12. Test all flows

## 📝 Notes

- All UI should match Frontend01 EXACTLY
- Use same colors, fonts, spacing, shadows
- Test responsiveness at all breakpoints
- Add proper error handling
- Add loading states
- Add form validation
