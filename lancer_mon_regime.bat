@echo off
REM Script simple pour Windows 11 - lance le serveur et ouvre le navigateur
SETLOCAL

REM Optionnel: si vous avez un token Hugging Face gratuit, dé-commentez la ligne suivante et remplacez VOTRE_TOKEN
REM set HF_TOKEN=VOTRE_TOKEN_ICI

echo Installation des dépendances (une seule fois)...
npm install

echo Démarrage du serveur...
start "" "http://localhost:3000/mon_regime.html"
node server.js

ENDLOCAL
