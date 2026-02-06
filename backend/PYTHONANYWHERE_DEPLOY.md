# 🚀 PythonAnywhere - 100% FREE Forever Deployment

## ✅ Best FREE Solution - No Credit Card, No Expiry!

**Why PythonAnywhere?**
- ✅ **Completely FREE** (forever, no credit card)
- ✅ Perfect FastAPI support
- ✅ Always-on (no cold starts)
- ✅ Easy setup (10 minutes)
- ✅ No payment info needed

---

## 📋 Step-by-Step Deployment (10 Minutes)

### Step 1: Create Account (2 minutes)

1. **Open**: https://www.pythonanywhere.com
2. **Click**: "Start running Python online in less than a minute!"
3. **Create Account**: 
   - Username: Choose any
   - Email: Your email
   - Password: Create password
4. **Free Plan**: Select "Beginner" (FREE forever)
5. **Verify Email**: Check inbox and verify

---

### Step 2: Setup Web App (5 minutes)

1. **Dashboard**: https://www.pythonanywhere.com/user/YOUR_USERNAME/

2. **Web Tab**: Click "Web" in top menu

3. **Add New Web App**:
   - Click "Add a new web app"
   - Click "Next"
   - Select **"Manual configuration"**
   - Python version: **Python 3.10**
   - Click "Next"

4. **Configure**:
   - Your app will be at: `https://YOUR_USERNAME.pythonanywhere.com`

---

### Step 3: Upload Code (3 minutes)

#### Option A: Using Git (Recommended)

1. **Consoles Tab** → **Bash**

2. **Clone Repository**:
   ```bash
   git clone https://github.com/abeer2626/sami-shops.git
   cd sami-shops/backend
   ```

3. **Create Virtual Environment**:
   ```bash
   python3.10 -m venv venv
   source venv/bin/activate
   ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   prisma generate
   ```

#### Option B: Upload Files

1. **Files Tab**
2. **Upload** your backend folder
3. Follow same venv steps above

---

### Step 4: Configure WSGI File

1. **Web Tab** → **Code section**

2. **Click** on WSGI configuration file link (e.g., `/var/www/username_pythonanywhere_com_wsgi.py`)

3. **Replace entire content** with:

```python
import sys
import os

# Add your project directory to the sys.path
project_home = '/home/YOUR_USERNAME/sami-shops/backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['DATABASE_URL'] = 'postgresql://neondb_owner:npg_7FtxKvjRlXQ4@ep-sweet-sun-aifg5zio-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
os.environ['SECRET_KEY'] = 'oLzZdF0BQtyYvOqym9JN42aUsRX7ag1p5-zvtlEF2bw'
os.environ['FRONTEND_URL'] = 'https://frontend-iota-rouge-95.vercel.app'
os.environ['ENVIRONMENT'] = 'production'
os.environ['ALGORITHM'] = 'HS256'
os.environ['ACCESS_TOKEN_EXPIRE_MINUTES'] = '43200'

# Import FastAPI app
from main import app as application
```

**Replace** `YOUR_USERNAME` with your actual PythonAnywhere username

4. **Save** the file (Ctrl+S or click Save)

---

### Step 5: Configure Virtual Environment

1. **Web Tab** → **Virtualenv section**

2. **Enter path**:
   ```
   /home/YOUR_USERNAME/sami-shops/backend/venv
   ```

3. **Click** the checkmark to save

---

### Step 6: Reload & Test

1. **Web Tab** → **Reload** button (green button at top)

2. **Wait** 10-20 seconds

3. **Test** your app:
   ```
   https://YOUR_USERNAME.pythonanywhere.com/
   https://YOUR_USERNAME.pythonanywhere.com/api/v1/products
   ```

4. **Success!** ✅

---

## 🔧 Troubleshooting

### Error Logs

1. **Web Tab** → **Log files**
2. **Error log**: Click to view errors
3. **Server log**: Click to view access logs

### Common Issues

#### 1. Import Error
**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Fix**:
```bash
# In Bash console
cd ~/sami-shops/backend
source venv/bin/activate
pip install -r requirements.txt
```

#### 2. Database Connection Error
**Error**: `Can't connect to database`

**Fix**: Check DATABASE_URL in WSGI file is correct

#### 3. Prisma Error
**Error**: `prisma.errors.PrismaError`

**Fix**:
```bash
cd ~/sami-shops/backend
source venv/bin/activate
prisma generate
prisma db push
```

#### 4. 502 Bad Gateway
**Fix**: 
- Check error log
- Make sure virtual environment path is correct
- Reload web app

---

## 💰 Free Tier Limits

**PythonAnywhere Free Plan:**
- ✅ 1 web app
- ✅ Always-on (no sleep)
- ✅ 512MB storage
- ✅ 100 seconds CPU time/day
- ✅ HTTPS included
- ✅ **No expiry, no credit card!**

**Perfect for:**
- Development
- Small projects
- Learning
- Portfolio projects

---

## 🔄 Update Your App

When you push changes to GitHub:

1. **Bash Console**:
   ```bash
   cd ~/sami-shops/backend
   git pull origin main
   source venv/bin/activate
   pip install -r requirements.txt  # if requirements changed
   ```

2. **Web Tab** → **Reload**

---

## 📝 After Deployment

### Update Frontend

1. **Your Backend URL**: `https://YOUR_USERNAME.pythonanywhere.com`

2. **Frontend `.env`**:
   ```env
   NEXT_PUBLIC_API_URL=https://YOUR_USERNAME.pythonanywhere.com
   ```

3. **Redeploy** frontend on Vercel

---

## ✅ Complete Setup Checklist

- [ ] PythonAnywhere account created
- [ ] Web app created (Manual config, Python 3.10)
- [ ] Code cloned/uploaded
- [ ] Virtual environment created
- [ ] Dependencies installed
- [ ] Prisma generated
- [ ] WSGI file configured
- [ ] Virtual environment path set
- [ ] Web app reloaded
- [ ] Tested URLs working
- [ ] Frontend updated

---

## 🎯 Quick Commands Reference

```bash
# Navigate to project
cd ~/sami-shops/backend

# Activate virtual environment
source venv/bin/activate

# Update code
git pull origin main

# Install dependencies
pip install -r requirements.txt

# Generate Prisma client
prisma generate

# Push database schema
prisma db push

# Check logs
tail -f /var/log/YOUR_USERNAME.pythonanywhere.com.error.log
```

---

## 🎉 Why PythonAnywhere is Perfect

**vs Vercel:**
- ✅ No serverless issues
- ✅ No 404 errors
- ✅ Proper WSGI/ASGI support

**vs Railway/Render:**
- ✅ Truly free (no credit needed)
- ✅ No expiry
- ✅ No payment info

**vs Others:**
- ✅ Simple setup
- ✅ Great for beginners
- ✅ Good documentation
- ✅ Active community

---

## 📞 Support

- **Docs**: https://help.pythonanywhere.com
- **Forum**: https://www.pythonanywhere.com/forums/
- **FastAPI Guide**: https://help.pythonanywhere.com/pages/FastAPI/

---

**🚀 Start Here**: https://www.pythonanywhere.com

**100% FREE, No Credit Card, Works Perfectly! 🎉**
