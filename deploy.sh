#!/bin/bash

echo "🚀 Déploiement IntoWork Dashboard"
echo "=================================="

# Vérifier que nous sommes sur la branche main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "❌ Veuillez basculer sur la branche main avant le déploiement"
    exit 1
fi

# Vérifier que tout est committé
if ! git diff-index --quiet HEAD --; then
    echo "❌ Il y a des modifications non committées. Committez d'abord."
    exit 1
fi

echo "✅ Vérifications préliminaires réussies"

# Pousser vers GitHub
echo "📤 Push vers GitHub..."
git push origin main

echo ""
echo "🎯 Étapes de déploiement :"
echo ""
echo "1️⃣  BACKEND (Railway) :"
echo "   • Connectez-vous à : https://railway.app"
echo "   • Créez un nouveau projet"
echo "   • Connectez votre repo GitHub: Intowork-Search/IntoWork-Dashboard"
echo "   • Sélectionnez le dossier 'backend'"
echo "   • Railway détectera automatiquement le Dockerfile"
echo ""
echo "2️⃣  FRONTEND (Vercel) :"
echo "   • Connectez-vous à : https://vercel.com"
echo "   • Importez le projet GitHub: Intowork-Search/IntoWork-Dashboard"
echo "   • Sélectionnez le framework Next.js"
echo "   • Root Directory: frontend"
echo ""
echo "3️⃣  VARIABLES D'ENVIRONNEMENT :"
echo ""
echo "   🐘 Railway (Backend) :"
echo "   DATABASE_URL=postgresql://..."
echo "   CLERK_SECRET_KEY=sk_live_..."
echo "   PORT=8000"
echo ""
echo "   ⚛️  Vercel (Frontend) :"
echo "   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_..."
echo "   CLERK_SECRET_KEY=sk_live_..."
echo "   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api"
echo ""
echo "✅ Push terminé ! Suivez les étapes ci-dessus pour déployer."
