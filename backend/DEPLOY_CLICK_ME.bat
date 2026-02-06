@echo off
echo ===================================================
echo 🚀 SAMISHOPS BACKEND AUTO-DEPLOYER
echo ===================================================
echo.
echo Installing Vercel CLI...
call npm install -g vercel
echo.
echo ===================================================
echo Login to Vercel (If asked, please login via browser)
echo ===================================================
call vercel login
echo.
echo ===================================================
echo STARTING DEPLOYMENT...
echo ===================================================
echo.
call vercel link --yes
call vercel --prod
echo.
echo ===================================================
echo ✅ DEPLOYMENT FINISHED!
echo Check the URL above.
echo ===================================================
pause
