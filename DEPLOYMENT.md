# SamiShops Deployment Guide

Complete deployment guide for SamiShops E-Commerce Platform.

## Overview

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | `https://samishops.vercel.app` |
| Backend | Railway/Render | `https://samishops-backend.up.railway.app` |
| Database | Neon PostgreSQL | Built-in |

---

## Prerequisites

- GitHub repository with code pushed
- Accounts:
  - [Vercel](https://vercel.com) (Free tier available)
  - [Railway](https://railway.app) or [Render](https://render.com) (Free tier available)
  - [Neon](https://neon.tech) or use built-in database (Free tier available)

---

## Part 1: Backend Deployment (Railway)

### Step 1: Prepare Railway Project

1. Go to [Railway](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your SamiShops repository
4. Select the `backend` folder as root directory

### Step 2: Configure Environment Variables

In Railway Dashboard → Settings → Variables, add:

| Key | Value |
|-----|-------|
| `ENVIRONMENT` | `production` |
| `FRONTEND_URL` | `https://samishops.vercel.app` |
| `SECRET_KEY` | Generate: `openssl rand -base64 32` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` |
| `PORT` | `8000` |

### Step 3: Add Database

1. In Railway project, click **+ New Service**
2. Select **Database** → **PostgreSQL**
3. Railway will automatically set `DATABASE_URL`

### Step 4: Deploy

1. Click **Deploy**
2. Railway will build using `Dockerfile`
3. Wait for deployment to complete (~3-5 minutes)
4. Copy your backend URL from Railway dashboard

### Step 5: Run Migrations (First Time)

Railway generates a URL like: `https://samishops-backend-production.up.railway.app`

```bash
# Via Railway CLI
railway run prisma migrate deploy

# Or connect to your database and run:
prisma migrate deploy
```

---

## Part 2: Backend Deployment (Render Alternative)

### Step 1: Create Render Account

1. Go to [Render](https://render.com)
2. Sign up with GitHub

### Step 2: Deploy Backend

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `samishops-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && prisma generate`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Click **Advanced** → Add Environment Variables (same as Railway above)

### Step 3: Add Database

1. Click **New** → **PostgreSQL**
2. Render will automatically set `DATABASE_URL`

### Step 4: Deploy

Click **Create Web Service** and wait for deployment.

---

## Part 3: Database Setup

### Option A: Use Railway/Render Built-in Database

The platform will automatically provide `DATABASE_URL`.

### Option B: Neon (Recommended for Production)

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Replace `DATABASE_URL` in your deployment

### Run Prisma Migrations

```bash
# Generate Prisma Client
prisma generate

# Push schema to database (development)
prisma db push

# Or run migrations (production)
prisma migrate deploy
```

---

## Part 4: Frontend Deployment (Vercel)

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your SamiShops repository
4. Select the `frontend` folder as root directory

### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Your Railway/Render backend URL | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://samishops.vercel.app` | Production |

### Step 3: Deploy

1. Click **Deploy**
2. Vercel will build and deploy automatically
3. Get your frontend URL: `https://samishops.vercel.app`

### Step 4: Update Backend CORS

Update your backend's `FRONTEND_URL` environment variable to match your Vercel URL.

---

## Part 5: Post-Deployment Checklist

### Backend Verification

- [ ] Backend is accessible: `https://your-backend.railway.app/`
- [ ] API Docs disabled in production (check `/docs` returns 404)
- [ ] CORS allows only your frontend domain
- [ ] Database migrations ran successfully
- [ ] Health check endpoint returns 200

### Frontend Verification

- [ ] Frontend loads at your domain
- [ ] Products are fetched from API
- [ ] User registration/login works
- [ ] Add to cart functionality works
- [ ] Checkout flow works

### Security Checks

- [ ] `SECRET_KEY` is strong and unique
- [ ] `DATABASE_URL` uses SSL (`sslmode=require`)
- [ ] CORS is restricted to production domains
- [ ] Environment variables are not in git
- [ ] API docs are disabled in production

---

## Environment Variables Reference

### Backend (Railway/Render)

```bash
ENVIRONMENT=production
DATABASE_URL=postgresql://...
FRONTEND_URL=https://samishops.vercel.app
SECRET_KEY=your-generated-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
PORT=8000
```

### Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SITE_URL=https://samishops.vercel.app
```

---

## Troubleshooting

### Backend Issues

**Problem:** Database connection fails
```bash
# Check DATABASE_URL has sslmode=require
# Verify database is accessible
# Run: prisma db push
```

**Problem:** CORS errors
```bash
# Ensure FRONTEND_URL matches your Vercel domain exactly
# Check CORS configuration in main.py
```

**Problem:** 500 errors on API calls
```bash
# Check Railway/Render logs
# Verify all environment variables are set
# Ensure Prisma client is generated
```

### Frontend Issues

**Problem:** API calls fail
```bash
# Check NEXT_PUBLIC_API_URL is correct
# Verify backend is accessible
# Check browser console for CORS errors
```

**Problem:** Build fails
```bash
# Check next.config.ts is valid
# Verify all imports are correct
# Check for TypeScript errors
```

---

## Live URLs (After Deployment)

| Service | URL |
|---------|-----|
| **Frontend** | `https://samishops.vercel.app` |
| **Backend** | `https://samishops-backend.up.railway.app` |
| **API Docs** | Disabled in production |
| **Database** | Railway/Render PostgreSQL |

---

## Custom Domain Setup (Optional)

### Frontend (Vercel)

1. Go to Vercel → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL`

### Backend (Railway)

1. Go to Railway → Project → Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Update `FRONTEND_URL` environment variable

---

## Monitoring

### Railway Monitoring

- Dashboard: View metrics, logs, and deployment status
- Logs: `railway logs` or use dashboard
- Uptime: Automatic health checks

### Vercel Analytics

- Dashboard: View page views, core web vitals
- Speed Insights: Check Lighthouse scores
- Logs: View build and deployment logs

---

## Cost Estimate

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | 100GB bandwidth/month | $20/month |
| Railway | $5 free credit/month | $5-$20/month |
| Render | Free tier limited | $7/month |
| Neon | 0.5GB storage free | $19/month |

**Estimated monthly cost (production): $25-$50**

---

## Support

For issues:
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Neon: https://neon.tech/docs
