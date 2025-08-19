@echo off
echo ========================================
echo   ClaugerMainHub - Test Piral Instance
echo ========================================
echo.

echo [1] Installation des dependances...
cd frontend
call npm install

echo.
echo [2] Verification TypeScript...
call npx tsc --noEmit --skipLibCheck

echo.
echo [3] Lancement du serveur de developpement...
echo.
echo L'application sera disponible sur http://localhost:5173
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
call npm run dev

pause