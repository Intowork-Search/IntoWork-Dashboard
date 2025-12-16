@echo off
REM Script pour lancer le backend FastAPI et le frontend Next.js simultanément
REM Usage: start-dev.bat

echo 🚀 Démarrage de INTOWORK - Environnement de développement
echo ==================================================

REM Vérifier que nous sommes dans le bon répertoire
if not exist "backend\" (
    echo ❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet IntoWork
    echo    Répertoires requis: backend\ et frontend\
    pause
    exit /b 1
)

if not exist "frontend\" (
    echo ❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet IntoWork
    echo    Répertoires requis: backend\ et frontend\
    pause
    exit /b 1
)

REM Vérifier que l'environnement virtuel Python existe
if not exist ".venv\" (
    echo ❌ Erreur: Environnement virtuel Python non trouvé (.venv)
    echo    Créez l'environnement virtuel d'abord avec: python -m venv .venv
    pause
    exit /b 1
)

REM Vérifier que node_modules existe dans le frontend
if not exist "frontend\node_modules\" (
    echo ❌ Erreur: Dépendances Node.js non installées
    echo    Installez les dépendances avec: cd frontend && npm install
    pause
    exit /b 1
)

echo ✅ Vérifications préliminaires réussies
echo.

REM Démarrer le backend FastAPI dans un nouveau terminal
echo 🐍 Démarrage du backend FastAPI (port 8001)...
start "INTOWORK Backend" cmd /k "cd /d backend && ..\\.venv\\Scripts\\python -m uvicorn app.main:app --reload --port 8001"

REM Attendre que le backend soit prêt
echo ⏳ Attente du démarrage du backend...
timeout /t 5 /nobreak >nul

REM Démarrer le frontend Next.js dans un nouveau terminal
echo ⚛️  Démarrage du frontend Next.js (port 3000)...
start "INTOWORK Frontend" cmd /k "cd /d frontend && npm run dev"

echo.
echo 🎉 Services démarrés avec succès !
echo ==================================================
echo 🐍 Backend FastAPI: http://localhost:8001
echo    - API Docs: http://localhost:8001/docs
echo    - Health Check: http://localhost:8001/api/ping
echo.
echo ⚛️  Frontend Next.js: http://localhost:3000
echo    - Application: http://localhost:3000
echo    - Sign In: http://localhost:3000/sign-in
echo.
echo 💡 Les services tournent dans des terminaux séparés
echo    Fermez les terminaux pour arrêter les services
echo ==================================================
pause
