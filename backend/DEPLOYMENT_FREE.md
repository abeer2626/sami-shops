# 🚀 100% FREE Backend Deployment Guide

## ✅ Completely Free Stack
- **Backend Hosting**: Vercel (Free Forever)
- **Database**: Neon.tech (Free Forever - 0.5GB)
- **No Credit Card Required!**

---

## 📋 Step-by-Step FREE Deployment

### 1️⃣ Setup Free Database (Neon.tech)

1. **Create Neon Account** (No Credit Card):
   - Visit: https://neon.tech
   - Click **"Sign Up"** → Use GitHub/Google
   - ✅ Completely FREE - No expiry!

2. **Create Database**:
   - Click **"Create Project"**
   - Project Name: `samishops`
   - Region: Choose closest to you
   - PostgreSQL Version: 16 (latest)
   - Click **"Create Project"**

3. **Get Connection String**:
   - Copy the connection string (looks like):
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx.aws.neon.tech/neondb?sslmode=require
   ```
   - Save this - you'll need it!

---

### 2️⃣ Deploy Backend on Vercel (100% Free)

#### Method 1: Using Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from backend folder**:
   ```bash
   cd backend
   vercel
   ```

4. **Follow prompts**:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `samishops-backend`
   - In which directory is your code? `./`
   - Want to override settings? **Y**
   - Build Command: Leave empty (press Enter)
   - Output Directory: Leave empty (press Enter)
   - Development Command: Leave empty (press Enter)

5. **Add Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   ```
   Paste your Neon connection string

   ```bash
   vercel env add SECRET_KEY
   ```
   Generate using: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

   ```bash
   vercel env add FRONTEND_URL
   ```
   Enter: `https://your-frontend.vercel.app`

   Add these too:
   ```bash
   vercel env add ENVIRONMENT
   # Enter: production

   vercel env add ALGORITHM
   # Enter: HS256

   vercel env add ACCESS_TOKEN_EXPIRE_MINUTES
   # Enter: 43200
   ```

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

#### Method 2: Using Vercel Dashboard (Easier)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Import Project**:
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repo: `abeer2626/sami-shops`
   - Click **"Import"**

3. **Configure Project**:
   - Framework Preset: **Other**
   - Root Directory: Click **"Edit"** → Select `backend`
   - Build Command: Leave empty
   - Output Directory: Leave empty
   - Install Command: `pip install -r requirements.txt`

4. **Add Environment Variables**:
   Click **"Environment Variables"** and add:
   
   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | Your Neon connection string |
   | `SECRET_KEY` | Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` |
   | `ENVIRONMENT` | `production` |
   | `ALGORITHM` | `HS256` |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | `43200` |

5. **Deploy**:
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Your backend will be live at: `https://samishops-backend.vercel.app`

---

### 3️⃣ Initialize Database

After deployment, run migrations:

```bash
# Set DATABASE_URL temporarily
$env:DATABASE_URL="your-neon-connection-string"

# Generate Prisma client
prisma generate

# Push schema to database
prisma db push
```

Or use Neon's SQL Editor:
1. Go to Neon Dashboard → Your Project → SQL Editor
2. Run the schema manually (if needed)

---

### 4️⃣ Update Frontend

Update your frontend environment variables:

```env
NEXT_PUBLIC_API_URL=https://samishops-backend.vercel.app
```

Redeploy frontend:
```bash
cd ../frontend
vercel --prod
```

---

## 🎯 Alternative FREE Options

### Option 2: Railway.app ($5/month free credit)

1. **Sign up**: https://railway.app (GitHub login)
2. **New Project** → **Deploy from GitHub**
3. Select `abeer2626/sami-shops`
4. **Add PostgreSQL** (from Railway):
   - Click **"+ New"** → **"Database"** → **"PostgreSQL"**
   - Free $5 credit covers small usage
5. **Configure Service**:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Add Environment Variables** (same as above)
7. **Deploy**

### Option 3: Fly.io (Free tier)

1. **Install Fly CLI**:
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login**:
   ```bash
   fly auth login
   ```

3. **Deploy**:
   ```bash
   cd backend
   fly launch
   ```

4. **Add Database** (Free):
   ```bash
   fly postgres create
   ```

---

## 🔍 Verify Deployment

Test your deployed backend:

```bash
# Health check
curl https://samishops-backend.vercel.app/

# Get products
curl https://samishops-backend.vercel.app/api/v1/products
```

---

## 💰 Cost Comparison

| Platform | Cost | Database | Limitations |
|----------|------|----------|-------------|
| **Vercel** | ✅ FREE | Use Neon | Serverless (cold starts) |
| **Neon.tech** | ✅ FREE | 0.5GB | Perfect for small apps |
| **Railway** | $5 credit/month | Included | Good for testing |
| **Fly.io** | ✅ FREE | 3GB free | 3 VMs free |
| **Render** | ❌ Paid | 90-day trial | Not recommended |

---

## 🚨 Important Notes

### Vercel Serverless Limitations
- **Cold Starts**: First request may take 3-5 seconds
- **Execution Time**: Max 10 seconds per request (free tier)
- **Perfect for**: REST APIs, not for WebSockets

### Neon Database
- **Free Tier**: 0.5GB storage (enough for 1000s of products)
- **No Expiry**: Permanent free tier
- **Auto-suspend**: After 5 min inactivity (wakes up instantly)

---

## 🐛 Troubleshooting

### Vercel Build Fails
```bash
# Check logs
vercel logs

# Redeploy
vercel --prod --force
```

### Database Connection Issues
- Ensure `?sslmode=require` is in connection string
- Check Neon project is active
- Verify DATABASE_URL is correct

### CORS Errors
- Update `FRONTEND_URL` in Vercel env vars
- Redeploy: `vercel --prod`

---

## 📊 Monitor Your App

- **Vercel Logs**: https://vercel.com/dashboard → Your Project → Logs
- **Neon Metrics**: https://console.neon.tech → Your Project → Monitoring
- **Free Uptime Monitor**: https://uptimerobot.com (ping every 5 min)

---

## 🔄 Auto Deployment

Both Vercel and GitHub are connected:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Vercel automatically redeploys! ✅

---

## ✅ Final Checklist

- [ ] Neon database created
- [ ] Backend deployed on Vercel
- [ ] Environment variables added
- [ ] Database schema pushed
- [ ] Frontend updated with new backend URL
- [ ] Test API endpoints working

---

**🎉 Congratulations! Your backend is now 100% FREE and deployed!**

**Live URLs:**
- Backend: `https://samishops-backend.vercel.app`
- Frontend: `https://your-frontend.vercel.app`
- Database: Neon.tech (managed)

---

## 💡 Pro Tips

1. **Keep Warm**: Use UptimeRobot to ping `/` every 5 minutes (prevents cold starts)
2. **Backup Data**: Export database weekly using Neon dashboard
3. **Monitor Usage**: Check Vercel analytics monthly
4. **Scale Later**: Upgrade to paid tier only when needed ($20/month)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Railway Docs: https://docs.railway.app
