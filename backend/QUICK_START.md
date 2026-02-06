# 🚀 Quick Start - Deploy Backend (100% FREE)

## ✅ Bilkul FREE - No Credit Card!

---

## Step 1: Free Database Setup (2 minutes)

### Neon.tech Database (FREE Forever)

1. **Open**: https://neon.tech
2. **Sign Up** with GitHub (no credit card)
3. **Create Project**:
   - Name: `samishops`
   - Region: Choose any
   - Click **"Create Project"**
4. **Copy Connection String**:
   - You'll see something like:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx.aws.neon.tech/neondb?sslmode=require
   ```
   - **SAVE THIS** - aapko zaroorat padegi!

---

## Step 2: Deploy Backend on Vercel (3 minutes)

### Vercel Dashboard Method (Easiest)

1. **Open**: https://vercel.com/login
2. **Login** with GitHub
3. **New Project**:
   - Click **"Add New..."** → **"Project"**
   - Select repository: `abeer2626/sami-shops`
   - Click **"Import"**

4. **Configure**:
   - **Root Directory**: Click "Edit" → Type: `backend` → Save
   - **Framework Preset**: Other
   - **Build Command**: Leave EMPTY
   - **Output Directory**: Leave EMPTY
   - **Install Command**: `pip install -r requirements.txt && prisma generate`

5. **Environment Variables** (IMPORTANT):
   
   Click **"Environment Variables"** tab and add these **one by one**:

   ```
   DATABASE_URL
   Value: [Paste your Neon connection string from Step 1]
   ```

   ```
   SECRET_KEY
   Value: [Generate karne ke liye niche dekho]
   ```

   ```
   FRONTEND_URL
   Value: https://frontend-iota-rouge-95.vercel.app
   ```

   ```
   ENVIRONMENT
   Value: production
   ```

   ```
   ALGORITHM
   Value: HS256
   ```

   ```
   ACCESS_TOKEN_EXPIRE_MINUTES
   Value: 43200
   ```

   **SECRET_KEY Generate karne ka tarika:**
   - Windows PowerShell mein run karo:
   ```powershell
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   - Output copy karo aur SECRET_KEY mein paste karo

6. **Deploy**:
   - Click **"Deploy"**
   - Wait 2-3 minutes
   - Done! ✅

---

## Step 3: Get Your Backend URL

Deployment complete hone ke baad:
- Your backend URL: `https://samishops-backend-xxxxx.vercel.app`
- Test karo: Browser mein open karo - aapko welcome message dikhega

---

## Step 4: Initialize Database

Database ko setup karne ke liye:

### Option A: Local se (Recommended)

```powershell
# Backend folder mein jao
cd backend

# Environment variable set karo (temporary)
$env:DATABASE_URL="your-neon-connection-string-here"

# Prisma generate karo
prisma generate

# Database schema push karo
prisma db push
```

### Option B: Neon SQL Editor se

1. Neon Dashboard → Your Project → SQL Editor
2. Schema manually run karo (agar zaroorat ho)

---

## Step 5: Update Frontend

Frontend ke environment variables update karo:

1. **Vercel Dashboard** → Your Frontend Project → Settings → Environment Variables
2. Update:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.vercel.app
   ```
3. **Redeploy** frontend

---

## ✅ Verification

Test your backend:

```
https://your-backend-url.vercel.app/
https://your-backend-url.vercel.app/api/v1/products
```

---

## 🎉 Done!

**Your Stack (100% FREE):**
- ✅ Backend: Vercel (FREE)
- ✅ Database: Neon.tech (FREE - 0.5GB)
- ✅ Frontend: Vercel (FREE)

**Total Cost: ₹0 (FREE Forever!)**

---

## 🐛 Problems?

### Build fails?
- Check environment variables are correct
- Make sure `backend` is set as root directory

### Database connection error?
- Verify DATABASE_URL has `?sslmode=require` at end
- Check Neon project is active

### CORS error?
- Update FRONTEND_URL in Vercel env vars
- Redeploy

---

## 📞 Need Help?

Check detailed guide: `DEPLOYMENT_FREE.md`

---

**Happy Coding! 🚀**
