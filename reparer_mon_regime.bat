@echo off
echo ================================
echo  🛠  REPARATION MON_REGIME IA
echo ================================
echo.

REM Aller dans le dossier du script
cd /d "%~dp0"

REM 1️⃣ Corrige automatiquement la ligne fautive du server.js
echo Correction du fichier server.js ...
powershell -Command "(Get-Content server.js) -replace \"Impossible d'extraire\", 'Impossible d''extraire' | Set-Content server.js"

REM 2️⃣ Autorise l'exécution de scripts Node.js (si nécessaire)
echo Autorisation des scripts PowerShell ...
powershell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"

REM 3️⃣ Installation des dépendances
echo Installation des dépendances npm ...
call npm install

REM 4️⃣ Lancement du serveur
echo.
echo 🚀 Démarrage du serveur Mon Regime ...
start "" "http://localhost:3000/mon_regime.html"
node server.js
pause
