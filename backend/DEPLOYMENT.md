# 🚀 SamiShops Backend Deployment Guide

## Free Deployment on Render.com

### Prerequisites
- GitHub account
- Render account (free) - [Sign up here](https://render.com)

---

## 📋 Step-by-Step Deployment

### 1️⃣ Push Code to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2️⃣ Deploy on Render

#### Option A: Using Blueprint (Recommended - Easiest)
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository: `abeer2626/sami-shops`
4. Render will automatically detect `render.yaml` in the `backend` folder
5. Click **"Apply"** - Render will create:
   - PostgreSQL Database (Free)
   - Web Service (Backend API)
6. Wait 5-10 minutes for deployment to complete

#### Option B: Manual Setup
1. **Create PostgreSQL Database:**
   - Go to Render Dashboard
   - Click **"New +"** → **"PostgreSQL"**
   - Name: `samishops-db`
   - Database: `samishops`
   - User: `samishops_user`
   - Region: `Oregon (US West)`
   - Plan: **Free**
   - Click **"Create Database"**
   - Copy the **Internal Database URL**

2. **Create Web Service:**
   - Click **"New +"** → **"Web Service"**
   - Connect GitHub repository: `abeer2626/sami-shops`
   - Name: `samishops-backend`
   - Region: `Oregon (US West)`
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: 
     ```bash
     pip install -r requirements.txt && prisma generate && prisma db push
     ```
   - Start Command:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - Plan: **Free**

3. **Add Environment Variables:**
   - Click **"Environment"** tab
   - Add these variables:
     ```
     PYTHON_VERSION=3.11.0
     ENVIRONMENT=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     DATABASE_URL=<paste-internal-database-url>
     SECRET_KEY=<generate-random-32-char-string>
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=43200
     ```
   - Generate SECRET_KEY using:
     ```bash
     python -c "import secrets; print(secrets.token_urlsafe(32))"
     ```

4. **Deploy:**
   - Click **"Create Web Service"**
   - Wait for deployment (5-10 minutes)

---

## 3️⃣ Verify Deployment

Once deployed, your backend will be available at:
```
https://samishops-backend.onrender.com
```

Test endpoints:
- Health Check: `https://samishops-backend.onrender.com/`
- API Docs: `https://samishops-backend.onrender.com/docs` (only in development)
- Products: `https://samishops-backend.onrender.com/api/v1/products`

---

## 4️⃣ Update Frontend

Update your frontend `.env` file with the new backend URL:
```env
NEXT_PUBLIC_API_URL=https://samishops-backend.onrender.com
```

Redeploy your frontend on Vercel.

---

## 🔧 Important Notes

### Free Tier Limitations
- **Database**: 1GB storage, expires after 90 days
- **Web Service**: 
  - Spins down after 15 minutes of inactivity
  - First request after spin-down takes 30-60 seconds
  - 750 hours/month free (enough for 1 service)

### Database Persistence
⚠️ **Render's free PostgreSQL expires after 90 days!**

**Alternative Free Databases (No Expiry):**
1. **Neon** (Recommended): https://neon.tech
   - 0.5GB storage (permanent)
   - No expiry
   - Setup: Create DB → Copy connection string → Add to Render env vars

2. **Supabase**: https://supabase.com
   - 500MB storage (permanent)
   - No expiry

3. **Railway**: https://railway.app
   - $5 free credit/month
   - Good for testing

### Using Neon Database (Recommended)
1. Sign up at [Neon.tech](https://neon.tech)
2. Create new project: `samishops`
3. Copy connection string (looks like):
   ```
   postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```
4. In Render, update `DATABASE_URL` environment variable
5. Trigger manual deploy

---

## 🐛 Troubleshooting

### Build Fails
- Check Python version is 3.11
- Ensure `requirements.txt` is correct
- Check build logs in Render dashboard

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure SSL mode is enabled: `?sslmode=require`

### CORS Errors
- Update `FRONTEND_URL` in environment variables
- Redeploy backend

### Service Spinning Down
- This is normal for free tier
- First request after 15 min inactivity will be slow
- Consider upgrading to paid plan ($7/month) for always-on service

---

## 📊 Monitoring

- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Render Dashboard → Your Service → Metrics
- **Database**: Render Dashboard → Your Database → Metrics

---

## 🔄 Continuous Deployment

Render automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Render will detect changes and redeploy automatically (takes 3-5 minutes).

---

## 💡 Tips

1. **Keep Service Alive**: Use a free uptime monitor like [UptimeRobot](https://uptimerobot.com) to ping your API every 5 minutes
2. **Database Backups**: Export data regularly (Render free tier doesn't include backups)
3. **Monitor Logs**: Check logs regularly for errors
4. **Use Neon DB**: For permanent free database without 90-day expiry

---

## 📞 Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- FastAPI Docs: https://fastapi.tiangolo.com

---

**Happy Deploying! 🎉**
