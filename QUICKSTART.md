# SolarSmart - Quick Start Guide

Get the app running in 5 minutes.

## Prerequisites
- Node.js 18+ installed
- npm installed

## Step 1: Backend Setup (2 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create database and seed sample data
npm run setup

# Start backend server
npm run dev
```

✅ Backend running on `http://localhost:5000`

## Step 2: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend server
npm run dev
```

✅ Frontend running on `http://localhost:5173`

## Step 3: Open in Browser

Visit: **http://localhost:5173**

## Demo Logins

### Admin Dashboard
- Email: `admin@solarsmart.in`
- Password: `admin123`
- Access: Admin settings (prices, subsidies, generation config)

### Sales Dashboard
- Email: `sales@solarsmart.in`
- Password: `sales123`
- Access: Lead management, quote builder, project tracker

### Customer
- Email: `prashant@example.com`
- Password: `home123`
- Access: View their lead and quotes

## What to Try

### 1. Submit a Lead (Homeowner)
1. Click "Get Free Quote" on landing page
2. Fill the 4-step form
3. Upload a bill photo (or skip)
4. See AI score and recommended system

### 2. Build a Quote (Sales)
1. Login as sales@solarsmart.in
2. Go to Dashboard
3. Click on a lead (e.g., Prashant Wankhede)
4. Click "Build Quote"
5. Select system size (3 kW recommended)
6. Click "Create Quote & Generate PDF"
7. Download the PDF

### 3. Track Project (Sales)
1. From lead detail, click "Create Project"
2. Go to Projects page
3. See project timeline
4. Update status (advance_paid, survey_done, etc.)

### 4. Customer Status Link
1. From project, copy the customer token
2. Visit: `http://localhost:5173/status/{token}`
3. See public project progress (no login needed)

### 5. Admin Settings
1. Login as admin@solarsmart.in
2. Go to Admin page
3. View/add subsidy rules, prices, generation config

## Sample Data Included

**5 Leads:**
- Prashant Wankhede (High score, 3 kW)
- Rohit Meshram (Low score, tenant)
- Ayesha Siddiqui (Low score, small bill)
- Vijay Deshmukh (High score, 5 kW, in installation)
- Sunita Patil (Medium score, 2.5 kW, quoted)

**1 Quote:**
- For Prashant: 3 kW, ₹57K net cost

**1 Project:**
- For Vijay: In installation stage

## Troubleshooting

### Port 5000 already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Port 5173 already in use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database error
```bash
cd backend
rm prisma/dev.db
npm run setup
```

### Dependencies not installing
```bash
# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

## Key Features to Explore

✅ **Lead Form:** 4-step wizard with validation  
✅ **AI Bill Reading:** Mock data (set GEMINI_API_KEY to use real API)  
✅ **Lead Scoring:** High/Medium/Low based on bill amount  
✅ **Quote Builder:** Live preview with subsidy calculation  
✅ **PDF Generation:** Download professional quote  
✅ **Project Tracker:** Status timeline with dates  
✅ **Customer Link:** Public status page (no login)  
✅ **Admin Config:** Manage prices and subsidies  
✅ **Responsive Design:** Works on mobile, tablet, desktop  
✅ **Animations:** Smooth transitions and loading states  

## Next Steps

1. **Explore the code:** Check `backend/src/routes/` and `frontend/src/pages/`
2. **Read the docs:** See `TDD.md` for architecture and `deployment.md` for production setup
3. **Run tests:** `cd backend && npm test`
4. **Deploy:** Follow `deployment.md` for Render/Vercel setup

## API Documentation

### Create a Lead
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "9876543210",
    "pincode": "440001",
    "ownerOrTenant": "owner",
    "roofType": "flat",
    "roofArea": 300,
    "monthlyBill": 3000
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sales@solarsmart.in",
    "password": "sales123"
  }'
```

### Get Leads
```bash
curl -X GET http://localhost:5000/api/leads \
  -H "Authorization: Bearer {token}"
```

## File Structure

```
backend/
├── src/routes/        # API endpoints
├── src/services/      # Business logic
├── prisma/            # Database
├── tests/             # Unit tests
└── server.js          # Express app

frontend/
├── src/pages/         # React pages
├── src/components/    # Reusable components
├── src/context/       # Auth state
└── src/lib/           # API client
```

## Environment Variables

**Backend (.env):**
```
DATABASE_URL=file:./dev.db
JWT_SECRET=solar_jwt_secret_change_in_production
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:5000/api
```

## Support

- 📖 Read `README.md` for full overview
- 📋 Read `TDD.md` for technical details
- 🚀 Read `deployment.md` for production setup
- 💬 Create GitHub issue for bugs

---

**Happy coding! 🌞**
