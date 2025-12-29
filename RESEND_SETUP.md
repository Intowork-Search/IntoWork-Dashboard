# Configuration Resend pour l'envoi d'emails

Ce guide vous aide à configurer Resend pour l'envoi d'emails de réinitialisation de mot de passe.

## Étape 1 : Créer un compte Resend

1. Visitez [https://resend.com/signup](https://resend.com/signup)
2. Créez un compte gratuit (100 emails/jour gratuits)
3. Vérifiez votre email

## Étape 2 : Obtenir votre clé API

1. Connectez-vous à [https://resend.com/api-keys](https://resend.com/api-keys)
2. Cliquez sur **"Create API Key"**
3. Donnez un nom à votre clé (ex: "INTOWORK Development")
4. Sélectionnez les permissions : **"Sending access"**
5. Cliquez sur **"Create"**
6. **IMPORTANT** : Copiez immédiatement la clé (elle commence par `re_`)
7. Vous ne pourrez plus la voir après avoir fermé la fenêtre !

## Étape 3 : Configurer le domaine d'envoi

### Option A : Utiliser le domaine de test Resend (Recommandé pour développement)

Par défaut, Resend fournit un domaine de test : `onboarding@resend.dev`

**Configuration dans `.env` :**
```env
RESEND_API_KEY=re_votre_cle_api_ici
FROM_EMAIL=INTOWORK <onboarding@resend.dev>
FRONTEND_URL=http://localhost:3000
```

**Limitations du domaine de test :**
- ✅ Gratuit et immédiat
- ✅ Parfait pour le développement
- ⚠️ Vous ne pouvez envoyer qu'à VOTRE propre email
- ❌ Ne fonctionne pas en production

### Option B : Configurer votre propre domaine (Production)

1. Allez sur [https://resend.com/domains](https://resend.com/domains)
2. Cliquez sur **"Add Domain"**
3. Entrez votre domaine (ex: `intowork.com`)
4. Ajoutez les enregistrements DNS fournis par Resend :
   - **SPF** (TXT)
   - **DKIM** (TXT)
   - **DMARC** (TXT) - optionnel mais recommandé
5. Attendez la vérification DNS (peut prendre 24-48h)
6. Une fois vérifié, utilisez votre domaine :

```env
RESEND_API_KEY=re_votre_cle_api_ici
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=https://votre-domaine.com
```

## Étape 4 : Mettre à jour le fichier .env

Éditez `/backend/.env` :

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_votre_cle_api_obtenue_etape_2
FROM_EMAIL=INTOWORK <onboarding@resend.dev>  # Ou votre domaine
FRONTEND_URL=http://localhost:3000            # Ou votre URL de production
```

## Étape 5 : Tester l'envoi d'email

### Test 1 : Vérifier que le backend démarre sans erreur

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

Vérifiez les logs - vous devriez voir :
```
INFO:     Email service enabled with Resend
```

Si vous voyez des avertissements sur Resend, vérifiez votre clé API.

### Test 2 : Tester la réinitialisation de mot de passe

1. Démarrez le frontend :
```bash
cd frontend
npm run dev
```

2. Visitez [http://localhost:3000/auth/forgot-password](http://localhost:3000/auth/forgot-password)

3. Entrez votre email (avec le domaine de test, utilisez l'email de votre compte Resend)

4. Cliquez sur "Envoyer le lien de réinitialisation"

5. Vérifiez votre boîte mail - vous devriez recevoir un email INTOWORK avec un design premium

### Test 3 : Test programmatique (optionnel)

Créez un fichier `test_email.py` :

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Test manuel
import resend
resend.api_key = os.getenv("RESEND_API_KEY")

params = {
    "from": os.getenv("FROM_EMAIL", "INTOWORK <onboarding@resend.dev>"),
    "to": ["votre.email@example.com"],  # Remplacez par votre email
    "subject": "Test INTOWORK",
    "html": "<h1>Test réussi !</h1><p>Le service email fonctionne correctement.</p>"
}

try:
    email = resend.Emails.send(params)
    print(f"✅ Email envoyé avec succès ! ID: {email['id']}")
except Exception as e:
    print(f"❌ Erreur: {e}")
```

Exécutez :
```bash
cd backend
source venv/bin/activate
python test_email.py
```

## Dépannage

### Erreur : "Invalid API key"

- Vérifiez que `RESEND_API_KEY` commence par `re_`
- Régénérez une nouvelle clé sur resend.com
- Assurez-vous qu'il n'y a pas d'espaces avant/après la clé

### Erreur : "Email not sent - domain not verified"

- Vous utilisez un domaine personnalisé non vérifié
- Solution temporaire : utilisez `onboarding@resend.dev`
- Solution permanente : configurez et vérifiez votre domaine (Étape 3, Option B)

### Pas d'email reçu

1. Vérifiez le dossier spam
2. Si vous utilisez le domaine de test, vérifiez que vous envoyez à l'email de votre compte Resend
3. Vérifiez les logs du backend pour les erreurs
4. Consultez les logs sur [https://resend.com/emails](https://resend.com/emails)

### Service email désactivé

Si vous voyez dans les logs :
```
WARNING: Email service disabled: RESEND_API_KEY not configured
```

Cela signifie que l'application fonctionne, mais sans envoi d'email. Pour activer :
1. Ajoutez votre `RESEND_API_KEY` dans `.env`
2. Redémarrez le backend

## Quotas Resend

### Plan Gratuit
- 100 emails/jour
- 3,000 emails/mois
- Parfait pour le développement et les petites applications

### Plans Payants
- À partir de $20/mois pour 50,000 emails/mois
- Voir les prix : [https://resend.com/pricing](https://resend.com/pricing)

## Sécurité

⚠️ **IMPORTANT** : Ne commitez JAMAIS votre clé API Resend dans Git !

- ✅ Les fichiers `.env` sont dans `.gitignore`
- ✅ Utilisez des variables d'environnement en production
- ✅ Régénérez la clé si elle est exposée

## Support

- Documentation Resend : [https://resend.com/docs](https://resend.com/docs)
- API Reference : [https://resend.com/docs/api-reference](https://resend.com/docs/api-reference)
- Support Resend : [support@resend.com](mailto:support@resend.com)

---

✨ **Une fois configuré, votre système d'envoi d'email est prêt à l'emploi !**
