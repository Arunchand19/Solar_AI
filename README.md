# SolarSmart - Rooftop Solar Lead Qualification & Project Tracker

A full-stack web application for solar installers to qualify leads, generate instant quotes with subsidy calculations, and track projects from advance to completion.

<img width="1918" height="902" alt="image" src="https://github.com/user-attachments/assets/833955d1-a5e4-4bc4-aea3-29335d437c1b" />
<img width="1917" height="905" alt="image" src="https://github.com/user-attachments/assets/3ca0361e-2eeb-495f-8cfc-46494c65258a" />
<img width="1915" height="903" alt="image" src="https://github.com/user-attachments/assets/d237c233-758a-4e74-b678-4727cfe9385c" />


## 🌟 Features

- **AI-Powered Lead Scoring:** Reads electricity bills with Google Gemini Vision API
- **Instant Quotes:** Live calculation with PM Surya Ghar subsidy and payback period
- **Project Tracker:** Timeline from advance payment to subsidy credited
- **Public Status Link:** Customers can track their project without login
- **Admin Dashboard:** Manage prices, subsidy rules, and generation rates
- **Beautiful UI:** Responsive design with animations, mobile-optimized

## 🎯 Core Metrics

- Reduces unqualified surveys from 40% to <15%
- Enables same-day quotes for 90% of surveys
- Cuts status update calls by 50%

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Backend Setup
```bash
cd backend
npm install
npm run setup  # Creates DB and seeds sample data
npm run dev    # Starts on http://localhost:5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev    # Starts on http://localhost:5173
```

### Demo Logins
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@solarsmart.in | admin123 |
| Sales | sales@solarsmart.in | sales123 |
| Customer | prashant@example.com | home123 |

## 📁 Project Structure

```
solarsmart/
├── backend/
│   ├── src/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic (AI, quotes, PDF)
│   │   └── middleware/    # Auth, validation
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.js        # Sample data
│   ├── tests/             # Jest tests
│   └── server.js          # Express app
├── frontend/
│   ├── src/
│   │   ├── pages/         # React pages
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context
│   │   ├── lib/           # API client
│   │   └── App.jsx        # Router
│   └── index.css          # Tailwind + custom styles
├── TDD.md                 # Technical Design Document
└── deployment.md          # Deployment guide
```

## 🔑 Key Flows

### 1. Lead Qualification
1. Homeowner fills form (name, phone, roof, bill)
2. Uploads electricity bill photo
3. AI reads bill → extracts consumer number, tariff, units
4. System scores lead (High/Medium/Low)
5. Shows recommended system size & next steps

### 2. Quote Generation
1. Sales staff selects system size (1-10 kW)
2. Live preview shows cost breakdown, subsidy, payback
3. Click "Create Quote" → PDF generated
4. Quote includes: system specs, cost, subsidy, annual savings

### 3. Project Tracking
1. Create project from converted lead
2. Update status: advance_pending → advance_paid → survey_done → ... → completed
3. Each status change logged with date
4. Customer gets public link to track progress

## 🤖 AI & Automation

### Bill Reading
- Google Gemini Vision API reads bill photos
- Extracts: consumer number, tariff, sanctioned load, monthly units
- Confidence score shown; manual confirmation if <75%
- Fallback to mock data if API unavailable

### Lead Scoring
- **High:** Monthly bill ≥ ₹2,500 (excellent candidate)
- **Medium:** ₹1,000-2,500 (good candidate)
- **Low:** <₹1,000 or tenant (needs call)

### Subsidy Calculation
- PM Surya Ghar scheme: ₹30K/kW up to 2kW + ₹18K for 3rd kW, max ₹78K
- Stored in database with effective dates
- Admin can update rules anytime

## 📊 Database Schema

**Core Tables:**
- Users (homeowner, sales, admin)
- Leads (with AI-extracted bill data)
- Quotes (with subsidy & payback)
- Projects (with status timeline)
- SubsidyRules (dated, editable)
- PriceConfig (panels, inverters, BOS, installation)
- GenerationConfig (units/kW/year)

## 🧪 Testing

```bash
cd backend
npm test  # Runs Jest tests
```

Tests cover:
- Lead scoring logic
- Subsidy calculation (all slab combinations)
- Recommended system size calculation

## 🔐 Security

- JWT authentication (7-day tokens)
- Password hashing (bcryptjs)
- Role-based access control
- Input validation (phone, pincode, email)
- HTTPS in production
- DPDP Act 2023 compliance (consumer data protection)

## 📱 Responsive Design

- Desktop: Full sidebar navigation
- Tablet: Collapsible sidebar
- Mobile: Hamburger menu, single-column layout
- Touch-friendly buttons and inputs

## 🎨 Design System

- **Colors:** Green (#1a6b3c), Orange (#e65c00), White, Gray
- **Typography:** Inter font, clear hierarchy
- **Spacing:** 4px grid system
- **Animations:** Framer Motion (fade, slide, scale)
- **Components:** Reusable UI kit (buttons, cards, badges)

## 📦 Deployment

### Backend
- Render/Railway/Heroku
- PostgreSQL database
- Environment: `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`

### Frontend
- Vercel/Netlify
- Environment: `VITE_API_URL`

See `deployment.md` for detailed instructions.

## 📚 Documentation

- **TDD.md** - Complete technical design, architecture, data model
- **deployment.md** - Setup, deployment, troubleshooting
- **API Docs** - See backend routes in `src/routes/`

## 🚧 What's Not Included (MVP)

- Email/SMS notifications (mocked)
- Payment gateway (mocked)
- Inverter monitoring
- Multi-language (UI ready for Marathi/Hindi)
- DISCOM subsidy portal integration
- Mobile app

## 🔮 Future Enhancements

1. Real email/SMS notifications
2. Razorpay/PayU payment integration
3. IoT monitoring for real-time generation
4. Advanced analytics dashboard
5. Bulk lead import
6. Surveyor field app
7. Customer mobile app

## 📞 Support

For issues or questions:
- Email: support@solarsmart.in
- GitHub Issues: [Create an issue](https://github.com/yourusername/solarsmart/issues)

## 📄 License

MIT License - See LICENSE file

---

**Built with ❤️ for solar installers in Nagpur**
