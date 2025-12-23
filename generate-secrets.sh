#!/bin/bash

echo "🎯 Guide de génération des secrets pour IntoWork Dashboard"
echo ""
echo "Exécutez ces commandes pour générer des secrets sécurisés:"
echo ""

echo "1️⃣ JWT_SECRET (Backend):"
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
echo ""

echo "2️⃣ NEXTAUTH_SECRET (Backend + Frontend - DOIT ÊTRE IDENTIQUE):"
python3 -c "import secrets; print('NEXTAUTH_SECRET=' + secrets.token_urlsafe(32))"
echo ""

echo "3️⃣ SECRET_KEY (Backend - optionnel):"
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
echo ""

echo "📝 Copiez ces valeurs dans:"
echo "  - backend/.env"
echo "  - frontend/.env.local (NEXTAUTH_SECRET uniquement)"
echo ""
echo "⚠️  IMPORTANT: Le NEXTAUTH_SECRET doit être le MÊME dans les 2 fichiers!"
