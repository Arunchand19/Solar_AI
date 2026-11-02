# SolarSmart - Deployment Guide

## GitHub Repository
https://github.com/yourusername/solarsmart

## Live Application
https://solarsmart.vercel.app (when deployed)

---

## Local Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup database and seed sample data
npm run setup

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

**Environment Variables** (`.env`):
```
DATABASE_URL=file:./dev.db
JWT_SECRET=your_jwt_secret_here
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

**Environment Variables** (`.env.local`):
```
VITE_API_URL=http://localhost:5000/api
```

---

## Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@solarsmart.in | admin123 |
| Sales | sales@solarsmart.in | sales123 |
| Customer | prashant@example.com | home123 |

---

## Database

SQLite database is auto-created at `backend/prisma/dev.db`

### Prisma Commands
```bash
# Run migrations
npm run db:migrate

# Generate Prisma Client
npm run db:generate

# Open Prisma Studio (GUI)
npm run db:studio

# Seed sample data
npm run seed
```

---

## Testing

```bash
cd backend

# Run tests
npm test
```

Tests cover:
- Lead scoring logic
- Subsidy calculation (PM Surya Ghar scheme)
- Recommended system size calculation

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Leads
- `POST /api/leads` - Submit lead form with bill upload
- `GET /api/leads` - List all leads (sales/admin)
- `GET /api/leads/:id` - Get lead details
- `PATCH /api/leads/:id/confirm-ai` - Confirm AI-extracted bill data
- `PATCH /api/leads/:id/status` - Update lead status
- `GET /api/leads/stats/summary` - Dashboard stats

### Quotes
- `POST /api/quotes` - Create quote and generate PDF
- `GET /api/quotes/:id` - Get quote details
- `GET /api/quotes/lead/:leadId` - Get quotes for a lead
- `POST /api/quotes/preview` - Preview quote calculation
- `GET /api/quotes/:id/pdf` - Download quote PDF

### Projects
- `POST /api/projects` - Create project from lead
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id/status` - Update project status
- `GET /api/projects/status/:token` - Public customer status link
- `POST /api/projects/:id/documents` - Upload project document
- `GET /api/projects/dashboard/stuck` - Get stuck projects (7+ days)

### Admin
- `GET /admin/subsidy-rules` - List subsidy rules
- `POST /admin/subsidy-rules` - Create subsidy rule
- `GET /admin/prices` - List price config
- `POST /admin/prices` - Create price config
- `GET /admin/generation-config` - Get generation rate
- `POST /admin/generation-config` - Update generation rate

---

## Deployment

### Backend (Render/Railway/Heroku)

1. Push code to GitHub
2. Connect repository to hosting platform
3. Set environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Strong random string
   - `GEMINI_API_KEY` - Google Gemini API key
   - `NODE_ENV=production`
4. Deploy

### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Connect repository to Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment variable: `VITE_API_URL=https://your-backend-url/api`
6. Deploy

---

## Production Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Set up PostgreSQL database (not SQLite)
- [ ] Configure GEMINI_API_KEY for bill reading
- [ ] Enable HTTPS
- [ ] Set up CORS for frontend domain
- [ ] Configure email/SMS for notifications (mock in MVP)
- [ ] Set up error logging (Sentry)
- [ ] Enable rate limiting
- [ ] Backup database regularly
- [ ] Monitor API performance

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database issues
```bash
# Reset database
rm backend/prisma/dev.db
npm run setup
```

### CORS errors
Check `server.js` CORS configuration matches frontend URL

### Bill upload not working
- Ensure `backend/uploads/bills` directory exists
- Check file permissions
- Verify GEMINI_API_KEY is set (or use mock data)

---

## Support

For issues or questions, contact: support@solarsmart.in
