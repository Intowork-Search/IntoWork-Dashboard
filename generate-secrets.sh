#!/bin/bash

# Script pour générer les secrets de production de manière sécurisée
# Usage: ./generate-secrets.sh

echo "======================================"
echo "🔐 Génération des Secrets de Production"
echo "======================================"
echo ""

# Générer NEXTAUTH_SECRET (32 bytes = 256 bits)
echo "✅ NEXTAUTH_SECRET généré:"
python3 -c "import secrets; print('NEXTAUTH_SECRET=' + secrets.token_urlsafe(32))"
echo ""

# Générer SECRET_KEY (32 bytes = 256 bits)
echo "✅ SECRET_KEY généré:"
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
echo ""

# Générer JWT_SECRET (optionnel)
echo "✅ JWT_SECRET généré (optionnel):"
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
echo ""

echo "======================================"
echo "📋 Instructions de Configuration:"
echo "======================================"
echo ""
echo "1. 🚂 Railway Backend:"
echo "   - Allez sur Railway Dashboard > Variables"
echo "   - Ajoutez NEXTAUTH_SECRET (requis)"
echo "   - Ajoutez SECRET_KEY (requis)"
echo "   - Ajoutez DATABASE_URL (auto-injecté si PostgreSQL ajouté)"
echo ""
echo "2. ▲ Vercel Frontend:"
echo "   - Allez sur Vercel Dashboard > Settings > Environment Variables"
echo "   - Ajoutez NEXTAUTH_SECRET (DOIT être identique au backend)"
echo "   - Ajoutez NEXTAUTH_URL=https://votre-domaine.vercel.app"
echo "   - Ajoutez NEXT_PUBLIC_API_URL=https://votre-backend.railway.app/api"
echo ""
echo "3. 💻 Développement Local:"
echo "   - Ajoutez dans backend/.env"
echo "   - Ajoutez dans frontend/.env.local"
echo "   - NE COMMITEZ JAMAIS ces fichiers"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Gardez ces secrets en sécurité"
echo "   - Ne les partagez JAMAIS dans le code ou les commits"
echo "   - Le NEXTAUTH_SECRET doit être IDENTIQUE backend/frontend"
echo ""
