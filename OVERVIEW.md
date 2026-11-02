# SolarSmart - Visual Project Overview

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Landing Page  →  Lead Form  →  Success Page                  │
│       ↓              ↓              ↓                           │
│  [Hero]        [4-Step Wizard]  [AI Score]                    │
│  [Features]    [Validation]     [Recommended kW]              │
│  [CTA]         [Bill Upload]    [Next Steps]                  │
│                                                                 │
│  Sales Dashboard  →  Lead Detail  →  Quote Builder            │
│       ↓                  ↓              ↓                       │
│  [Stats Cards]     [AI Confirm]   [Live Preview]              │
│  [Leads Table]     [Actions]      [PDF Download]              │
│  [Filters]         [Quotes]       [Create Quote]              │
│                                                                 │
│  Project Tracker  →  Customer Status  →  Admin Page           │
│       ↓                  ↓                  ↓                   │
│  [Timeline]        [Public Link]     [Subsidy Rules]          │
│  [Progress Bar]    [No Login]        [Prices]                 │
│  [Stuck Alert]     [Milestones]      [Generation]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js + Node)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Auth Routes          Lead Routes         Quote Routes        │
│  ├─ register          ├─ POST /leads      ├─ POST /quotes     │
│  ├─ login             ├─ GET /leads       ├─ GET /quotes      │
│  └─ me                ├─ GET /leads/:id   ├─ POST /preview    │
│                       ├─ PATCH /confirm   └─ GET /pdf         │
│  Project Routes       └─ PATCH /status                        │
│  ├─ POST /projects                       Admin Routes        │
│  ├─ GET /projects     AI Service          ├─ subsidy-rules   │
│  ├─ PATCH /status     ├─ readBillWithAI  ├─ prices          │
│  └─ GET /status/:token├─ scoreLead       └─ generation      │
│                       └─ calcRecommendedKw                   │
│                                                                 │
│  Quote Service        PDF Service         Middleware          │
│  ├─ calculateQuote    ├─ generateQuotePDF ├─ auth (JWT)      │
│  ├─ getSubsidyRule    └─ save to disk     ├─ requireRole     │
│  └─ calcSubsidy                          └─ validation       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (SQLite / PostgreSQL)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Users          Leads           Quotes          Projects       │
│  ├─ id          ├─ id           ├─ id           ├─ id         │
│  ├─ email       ├─ leadId       ├─ quoteNumber  ├─ projectId  │
│  ├─ password    ├─ name         ├─ leadId       ├─ leadId     │
│  ├─ role        ├─ phone        ├─ systemSizeKw├─ status     │
│  └─ timestamps  ├─ billPhoto    ├─ netCost     ├─ dates      │
│                 ├─ score        ├─ subsidy     └─ timestamps  │
│  SubsidyRules   ├─ aiData       └─ pdfPath                   │
│  ├─ id          └─ timestamps                                 │
│  ├─ name                        Documents       StatusHistory  │
│  ├─ slabs       PriceConfig     ├─ id           ├─ id        │
│  ├─ maxSubsidy  ├─ id           ├─ projectId    ├─ projectId │
│  └─ dates       ├─ itemName     ├─ filePath     ├─ fromStatus│
│                 ├─ price        └─ docType      ├─ toStatus  │
│  GenerationConfig└─ dates                       └─ date      │
│  ├─ id                                                        │
│  ├─ unitsPerKwPerYear                                        │
│  └─ dates                                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### Lead Submission Flow
```
Homeowner
    ↓
[Lead Form - 4 Steps]
    ├─ Step 1: Personal details
    ├─ Step 2: Roof & bill info
    ├─ Step 3: Upload bill photo
    └─ Step 4: Review & submit
    ↓
[Backend Processing]
    ├─ Validate inputs
    ├─ Save lead to database
    ├─ Send bill to Gemini Vision API
    ├─ Extract: consumer#, tariff, units, load
    ├─ Calculate recommended kW
    ├─ Score lead (High/Medium/Low)
    └─ Save AI data to database
    ↓
[Success Page]
    ├─ Show lead ID
    ├─ Show AI score
    ├─ Show recommended system
    ├─ Show extracted bill data
    └─ Show next steps timeline
    ↓
Sales Staff
    ├─ Reviews lead in dashboard
    ├─ Confirms/edits AI data
    └─ Builds quote
```

### Quote Generation Flow
```
Sales Staff
    ↓
[Quote Builder Page]
    ├─ Select system size (1-10 kW)
    ├─ See live preview
    └─ Click "Create Quote"
    ↓
[Backend Calculation]
    ├─ Fetch active subsidy rule
    ├─ Calculate base cost
    │  └─ kW × (panel + inverter + BOS + install)
    ├─ Calculate subsidy
    │  └─ Apply PM Surya Ghar slabs, cap at max
    ├─ Calculate net cost
    │  └─ base - subsidy
    ├─ Calculate generation
    │  └─ kW × 1400 units/kW/year
    ├─ Calculate payback
    │  └─ netCost / (generation × ₹7.5/unit)
    ├─ Generate PDF
    └─ Save quote to database
    ↓
[Quote Success]
    ├─ Show quote number
    ├─ Show net cost
    ├─ Download PDF button
    └─ Back to leads button
    ↓
Customer
    └─ Receives quote PDF
```

### Project Tracking Flow
```
Sales Staff
    ↓
[Create Project]
    ├─ From converted lead
    ├─ Generate unique customer token
    └─ Set initial status: advance_pending
    ↓
[Project Tracker]
    ├─ View all projects
    ├─ See status timeline
    ├─ Update status
    │  └─ advance_pending → advance_paid → ... → completed
    ├─ Log each status change
    └─ Track dates
    ↓
[Customer Status Link]
    ├─ Public URL: /status/{token}
    ├─ No login required
    ├─ Show progress (%)
    ├─ Show timeline
    └─ Show dates for each milestone
```

---

## 🎨 UI Component Hierarchy

```
App
├─ Landing Page
│  ├─ Navbar
│  ├─ Hero Section
│  ├─ Stats Cards
│  ├─ How It Works
│  ├─ CTA Section
│  └─ Footer
│
├─ Auth Pages
│  ├─ Login Page
│  │  ├─ Form
│  │  └─ Demo Buttons
│  └─ Register Page
│     └─ Form
│
├─ Lead Form Page
│  ├─ Progress Bar
│  ├─ Step 1: Personal Details
│  ├─ Step 2: Roof & Bill
│  ├─ Step 3: Bill Upload
│  ├─ Step 4: Review
│  └─ Navigation Buttons
│
├─ Lead Success Page
│  ├─ Success Icon
│  ├─ Score Badge
│  ├─ AI Analysis Card
│  ├─ System Recommendation
│  ├─ Next Steps Timeline
│  └─ CTA Buttons
│
├─ Layout (with Sidebar)
│  ├─ Sidebar
│  │  ├─ Logo
│  │  ├─ Nav Items
│  │  └─ User Profile
│  └─ Main Content
│     ├─ Sales Dashboard
│     │  ├─ Stats Cards
│     │  ├─ Filters
│     │  └─ Leads Table
│     ├─ Lead Detail Page
│     │  ├─ Lead Info
│     │  ├─ AI Bill Analysis
│     │  ├─ Score Analysis
│     │  └─ Actions
│     ├─ Quote Builder
│     │  ├─ System Size Selector
│     │  └─ Quote Preview
│     ├─ Project Tracker
│     │  ├─ Projects Grid
│     │  ├─ Status Timeline
│     │  └─ Stuck Alert
│     └─ Admin Page
│        ├─ Subsidy Rules Tab
│        ├─ Prices Tab
│        └─ Generation Config Tab
│
└─ Customer Status Page
   ├─ Header
   ├─ Progress Bar
   ├─ Timeline
   └─ Contact Button
```

---

## 🔄 User Journeys

### Homeowner Journey
```
1. Visit landing page
2. Click "Get Free Quote"
3. Fill 4-step lead form
4. Upload electricity bill
5. See AI score & recommendation
6. Receive quote PDF
7. Track project via public link
```

### Sales Staff Journey
```
1. Login to dashboard
2. View leads (filtered by score/status)
3. Click lead to see details
4. Confirm AI-extracted bill data
5. Build quote (select system size)
6. Generate & download PDF
7. Create project
8. Update project status
9. View stuck projects alert
```

### Admin Journey
```
1. Login to admin page
2. View/add subsidy rules
3. View/add price config
4. Update generation rate
5. Set effective dates
6. Activate/deactivate rules
```

---

## 📱 Responsive Breakpoints

```
Mobile (< 640px)
├─ Single column layout
├─ Hamburger menu
├─ Full-width buttons
└─ Stacked cards

Tablet (640px - 1024px)
├─ Two column layout
├─ Collapsible sidebar
├─ Responsive tables
└─ Flexible grid

Desktop (> 1024px)
├─ Three column layout
├─ Fixed sidebar
├─ Full tables
└─ Multi-column grid
```

---

## 🎯 Key Metrics Dashboard

```
┌─────────────────────────────────────────┐
│         SALES DASHBOARD STATS           │
├─────────────────────────────────────────┤
│                                         │
│  Total Leads: 5                         │
│  ├─ High Score: 2 (40%)                │
│  ├─ Medium Score: 1 (20%)              │
│  ├─ Low Score: 2 (40%)                 │
│  └─ Converted: 1 (20%)                 │
│                                         │
│  Leads by Status:                       │
│  ├─ New: 2                             │
│  ├─ Contacted: 1                       │
│  ├─ Surveyed: 1                        │
│  ├─ Quoted: 1                          │
│  └─ Converted: 0                       │
│                                         │
│  Projects:                              │
│  ├─ In Progress: 1                     │
│  ├─ Stuck (7+ days): 0                 │
│  └─ Completed: 0                       │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
Frontend
├─ Input validation
├─ File type checking
└─ Token storage (localStorage)

Backend
├─ JWT verification
├─ Role-based access control
├─ Input sanitization
├─ File upload validation
└─ Error handling

Database
├─ Password hashing
├─ Timestamps
└─ Foreign key constraints

Infrastructure
├─ HTTPS only
├─ CORS configuration
└─ Environment variables
```

---

## 📈 Performance Optimizations

```
Frontend
├─ Code splitting (Vite)
├─ Lazy loading routes
├─ Image compression
├─ Browser caching
└─ Minified CSS/JS

Backend
├─ Database indexes
├─ API pagination
├─ Query optimization
└─ Error handling

Deployment
├─ CDN for static assets
├─ Database connection pooling
├─ Caching headers
└─ Gzip compression
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────┐
│         PRODUCTION DEPLOYMENT           │
├─────────────────────────────────────────┤
│                                         │
│  Frontend (Vercel/Netlify)              │
│  ├─ React app (dist/)                  │
│  ├─ CDN distribution                   │
│  └─ Auto-deploy on push                │
│                                         │
│  Backend (Render/Railway/Heroku)        │
│  ├─ Node.js server                     │
│  ├─ Environment variables              │
│  └─ Auto-deploy on push                │
│                                         │
│  Database (PostgreSQL)                  │
│  ├─ Managed service                    │
│  ├─ Automated backups                  │
│  └─ Connection pooling                 │
│                                         │
│  Storage (S3 / Cloud Storage)           │
│  ├─ Bill photos                        │
│  ├─ Quote PDFs                         │
│  └─ Project documents                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📊 Database Schema Overview

```
Users (1) ──→ (Many) Leads
              ├─→ (Many) Quotes
              └─→ (Many) Projects
                  ├─→ (Many) Documents
                  └─→ (Many) StatusHistory

SubsidyRules (1) ──→ (Many) Quotes
PriceConfig (1) ──→ (Many) Quotes
GenerationConfig (1) ──→ (Many) Quotes
```

---

## ✨ Feature Highlights

```
🎯 Lead Qualification
   ├─ AI bill reading
   ├─ Automatic scoring
   └─ Recommended system size

💰 Quote Generation
   ├─ Live calculation
   ├─ Subsidy integration
   ├─ Payback analysis
   └─ PDF export

📊 Project Tracking
   ├─ Status timeline
   ├─ Progress tracking
   ├─ Stuck alerts
   └─ Customer link

⚙️ Admin Control
   ├─ Subsidy rules
   ├─ Price management
   └─ Generation config

🎨 Beautiful UI
   ├─ Responsive design
   ├─ Smooth animations
   ├─ Loading states
   └─ Error handling
```

---

**Built with ❤️ for solar installers**
