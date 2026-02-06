# SamiShops Deployment Checklist

Use this checklist to ensure everything is ready for production deployment.

---

## Pre-Deployment

### Code Review
- [ ] All features work locally
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] All tests passing (if any)
- [ ] Code is pushed to GitHub

### Security
- [ ] `.env` files added to `.gitignore`
- [ ] No sensitive data in code
- [ ] Strong `SECRET_KEY` generated
- [ ] Database uses SSL (`sslmode=require`)
- [ ] CORS configured for production domains

### Environment Files
- [ ] `backend/.env` created with production values
- [ ] `frontend/.env.local` created with production values
- [ ] All required variables set

---

## Backend Deployment (Railway/Render)

### Initial Setup
- [ ] Railway/Render account created
- [ ] GitHub connected to platform
- [ ] Project created from repository
- [ ] Root directory set to `backend/`

### Configuration
- [ ] `ENVIRONMENT=production`
- [ ] `DATABASE_URL` set (or using built-in)
- [ ] `FRONTEND_URL` set (will update after frontend deploy)
- [ ] `SECRET_KEY` generated and set (32+ chars)
- [ ] `ALGORITHM=HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES=43200`
- [ ] `PORT=8000`

### Database
- [ ] Database provisioned (Railway/Render/Neon)
- [ ] Prisma schema pushed: `prisma db push`
- [ ] Or migrations deployed: `prisma migrate deploy`

### Deployment
- [ ] Dockerfile exists in backend/
- [ ] railway.json or render.yaml exists
- [ ] Deployment successful
- [ ] Health check passing
- [ ] Backend URL obtained

### Verification
- [ ] `GET /` returns JSON response
- [ ] `/docs` returns 404 (disabled in prod)
- [ ] `/api/v1/products` returns products
- [ ] Database is accessible

---

## Frontend Deployment (Vercel)

### Initial Setup
- [ ] Vercel account created
- [ ] GitHub connected to Vercel
- [ ] Project created from repository
- [ ] Root directory set to `frontend/`

### Configuration
- [ ] `NEXT_PUBLIC_API_URL` set to backend URL
- [ ] `NEXT_PUBLIC_SITE_URL` set to Vercel URL (or custom domain)
- [ ] Framework detection: Next.js

### Deployment
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Deployment successful
- [ ] Frontend URL obtained

### Verification
- [ ] Homepage loads
- [ ] Products are displayed
- [ ] Images load correctly
- [ ] Navigation works
- [ ] No console errors

---

## Post-Deployment

### Update CORS
- [ ] Update backend `FRONTEND_URL` with actual Vercel URL
- [ ] Redeploy backend

### End-to-End Testing
- [ ] User registration works
- [ ] User login works
- [ ] Add to cart works
- [ ] Checkout process works
- [ ] Product search works
- [ ] Category filtering works
- [ ] Vendor dashboard accessible (for vendor users)
- [ ] Admin dashboard accessible (for admin users)

### Performance
- [ ] Lighthouse score 90+ on mobile
- [ ] Lighthouse score 90+ on desktop
- [ ] Images optimized
- [ ] API response times under 500ms
- [ ] No CLS (Cumulative Layout Shift)

### SEO
- [ ] Meta titles correct
- [ ] Meta descriptions present
- [ ] OpenGraph tags working
- [ ] Twitter Card tags working
- [ ] JSON-LD structured data present
- [ ] Sitemap generated (if applicable)
- [ ] Robots.txt configured

### Monitoring Setup
- [ ] Railway/Render monitoring enabled
- [ ] Vercel Analytics enabled
- [ ] Error tracking set up (Sentry, optional)
- [ ] Uptime monitoring (optional)

---

## Custom Domain (Optional)

### Frontend (Vercel)
- [ ] Custom domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] `NEXT_PUBLIC_SITE_URL` updated
- [ ] Frontend redeployed

### Backend (Railway/Render)
- [ ] Custom domain added
- [ ] DNS records configured
- [ ] SSL certificate issued
- [ ] `FRONTEND_URL` updated in backend
- [ ] Backend redeployed

---

## Production URLs (Fill After Deployment)

| Service | URL | Status |
|---------|-----|--------|
| Frontend | `https://samishops.vercel.app` | [ ] Live |
| Backend | `https://samishops-backend.up.railway.app` | [ ] Live |
| Database | Railway PostgreSQL | [ ] Connected |

---

## Rollback Plan

If deployment fails:

1. **Backend Issues**
   - Check Railway/Render logs
   - Revert to previous commit
   - Redeploy

2. **Frontend Issues**
   - Check Vercel deployment logs
   - Rollback to previous deployment in Vercel
   - Fix issues in new branch

3. **Database Issues**
   - Restore from backup (if available)
   - Run `prisma migrate resolve --applied "migration_name"`

---

## Notes

```
Date Deployed: _______________

Backend URL: ________________________

Frontend URL: ______________________

Database: __________________________

Known Issues: _______________________

_____________________________________

_____________________________________
```
