#!/bin/bash

echo "🧪 Test de la route forgot-password"
echo "===================================="
echo ""

# Demander l'email
read -p "Entrez votre email (celui de votre compte Resend): " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo "❌ Email requis"
    exit 1
fi

echo ""
echo "📤 Envoi de la requête à l'API backend..."
echo ""

# Faire l'appel API
RESPONSE=$(curl -s -X POST http://localhost:8001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\"}" \
  -w "\nHTTP_CODE:%{http_code}")

# Extraire le code HTTP
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE:/d')

echo "📊 Résultat:"
echo "─────────────"
echo "Code HTTP: $HTTP_CODE"
echo "Réponse: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Requête réussie !"
    echo ""
    echo "📧 Vérifications:"
    echo "   1. Vérifiez votre boîte mail: $TEST_EMAIL"
    echo "   2. Regardez dans le dossier spam"
    echo "   3. Consultez les logs backend (terminal où tourne uvicorn)"
    echo "   4. Vérifiez https://resend.com/emails"
    echo ""
    echo "⚠️  RAPPEL: Avec le domaine de test 'onboarding@resend.dev',"
    echo "   vous devez utiliser l'email de votre compte Resend !"
else
    echo "❌ Erreur lors de l'envoi"
    echo ""
    echo "🔍 Vérifications:"
    echo "   1. Le backend est-il démarré ? (uvicorn sur port 8001)"
    echo "   2. L'email existe-t-il dans la base de données ?"
    echo "   3. Consultez les logs backend"
fi

echo ""
echo "📊 Pour voir les logs backend:"
echo "   → Terminal où tourne: uvicorn app.main:app --reload --port 8001"
echo ""
