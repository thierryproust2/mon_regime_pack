@echo off
title Lancement - Mon Regime IA

echo ========================================
echo  MON REGIME IA - DEMARRAGE
echo ========================================
echo.

REM Vérifie si Ollama tourne
echo Vérification de Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" | find /I "ollama.exe" >nul

if %ERRORLEVEL%==0 (
    echo ⚙️  Ollama est deja en cours d execution.
) else (
    echo 🚀 Lancement de Ollama...
    start "" "C:\Program Files\Ollama\ollama.exe"
    timeout /t 3 >nul
)

echo.
echo 📦 Installation des dependances (si necessaire)...
call npm install

echo.
echo 🌐 Ouverture du navigateur...
start "" "http://localhost:3000/mon_regime.html"

echo.
echo ▶️ Demarrage du serveur Node...
node server.js

echo.
echo Appuyez sur une touche pour quitter.
pause >nul
