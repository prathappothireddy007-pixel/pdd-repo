@echo off
echo Pushing updated app to GitHub to trigger Actions...
git add .
git commit -m "Fix image parsing bug for auction images"
git push origin main
echo.
echo Success! The Mega CI/CD pipeline and Android Build should now be running in your GitHub Actions tab.
pause
