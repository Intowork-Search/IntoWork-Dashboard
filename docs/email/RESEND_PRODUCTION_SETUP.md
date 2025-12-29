# 🚀 Guide de Production Resend pour INTOWORK

## 🎯 Objectif

Passer de `onboarding@resend.dev` (domaine de test) à `noreply@intowork.com` (domaine personnalisé) pour envoyer des emails à n'importe qui.

---

## 📋 Prérequis

### Ce dont vous avez besoin :

1. ✅ Un domaine acheté (ex: `intowork.com`)
   - GoDaddy, Namecheap, OVH, CloudFlare, etc.
   - Déjà acheté ou à acheter (~$10-15/an)

2. ✅ Accès au panneau DNS du domaine
   - Vous devez pouvoir ajouter des enregistrements DNS

3. ✅ Compte Resend (déjà fait ✅)
   - Connecté avec votre clé API

4. ✅ 24-48h de patience
   - Vérification DNS prend du temps

---

## 🚀 Étape 1 : Acheter/Vérifier Votre Domaine

### Option A : Vous Avez Déjà un Domaine

Si vous avez déjà `intowork.com` ou autre, passez à l'étape 2.

### Option B : Acheter un Domaine

**Recommandations** :

1. **Namecheap** (Recommandé - Simple)
   - Site : https://www.namecheap.com
   - Prix : ~$10-15/an
   - DNS facile
   - Interface claire

2. **CloudFlare Registrar**
   - Site : https://www.cloudflare.com/products/registrar/
   - Prix : Prix de gros (le moins cher)
   - DNS ultra-rapide
   - Bonus : CDN gratuit

3. **OVH** (France)
   - Site : https://www.ovh.com
   - Prix : ~€10-15/an
   - Support français
   - Bon rapport qualité/prix

**Acheter** :
```
1. Visitez le site du registrar
2. Cherchez votre domaine (ex: "intowork.com")
3. Achetez pour 1 an minimum
4. Configurez les nameservers (garder ceux par défaut)
5. Attendez activation (5-30 minutes)
```

---

## 🌐 Étape 2 : Ajouter le Domaine sur Resend

### 2.1 Connexion à Resend

```
1. Visitez: https://resend.com/domains
2. Connectez-vous avec votre compte
3. Cliquez sur "Add Domain"
```

### 2.2 Ajouter le Domaine

```
1. Dans le champ "Domain":
   → Entrez: intowork.com (ou votre domaine)

2. Region:
   → Sélectionnez: "us-east-1" (ou plus proche de vos utilisateurs)

3. Cliquez "Add"
```

### 2.3 Resend Génère les Enregistrements DNS

Resend va vous donner 3 enregistrements à ajouter :

**Exemple d'enregistrements** :

```
1. SPF (TXT Record)
   Name:  @  (ou intowork.com)
   Type:  TXT
   Value: v=spf1 include:_spf.resend.com ~all

2. DKIM (TXT Record)
   Name:  resend._domainkey
   Type:  TXT
   Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN... (longue clé)

3. DMARC (TXT Record - Optionnel mais recommandé)
   Name:  _dmarc
   Type:  TXT
   Value: v=DMARC1; p=none; rua=mailto:dmarc@intowork.com
```

**⚠️ IMPORTANT** : NE copiez PAS ces valeurs - utilisez celles générées par Resend !

---

## 🔧 Étape 3 : Configurer les DNS

### 3.1 Accéder au Panneau DNS

**Namecheap** :
```
1. Connectez-vous sur namecheap.com
2. Dashboard → Domain List
3. Cliquez "Manage" à côté de votre domaine
4. Allez dans "Advanced DNS"
```

**CloudFlare** :
```
1. Connectez-vous sur cloudflare.com
2. Sélectionnez votre domaine
3. Cliquez sur "DNS"
```

**OVH** :
```
1. Connectez-vous sur ovh.com
2. Nom de domaine → Sélectionnez votre domaine
3. Zone DNS → Modifier en mode textuel
```

**GoDaddy** :
```
1. Connectez-vous sur godaddy.com
2. My Products → Domains
3. Cliquez sur votre domaine
4. DNS → Manage Zones
```

### 3.2 Ajouter les Enregistrements DNS

#### ✅ Enregistrement SPF

```
Type:  TXT
Name:  @  (ou laissez vide, ou "intowork.com")
Value: v=spf1 include:_spf.resend.com ~all
TTL:   3600 (ou Auto)
```

**Screenshot Guide** :
```
┌─────────────────────────────────────────┐
│ Type: TXT                              │
│ Name: @                                │
│ Value: v=spf1 include:_spf.resend.com ~all │
│ TTL: 3600                              │
│ [Add Record]                           │
└─────────────────────────────────────────┘
```

#### ✅ Enregistrement DKIM

```
Type:  TXT
Name:  resend._domainkey
Value: p=MIGfMA0GCSqG... (copiez depuis Resend)
TTL:   3600
```

**⚠️ Important** :
- Le nom est `resend._domainkey` (pas juste `_domainkey`)
- La valeur commence par `p=` et est très longue

#### ✅ Enregistrement DMARC (Recommandé)

```
Type:  TXT
Name:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@intowork.com
TTL:   3600
```

**Explication DMARC** :
- `p=none` : Mode monitoring (recommandé au début)
- `p=quarantine` : Emails suspects vont en spam (après tests)
- `p=reject` : Emails suspects sont rejetés (production mature)
- `rua=mailto:...` : Recevoir rapports DMARC

### 3.3 Sauvegarder les Enregistrements

```
1. Cliquez "Save" ou "Add Record" pour chaque enregistrement
2. Attendez quelques minutes
3. Vérifiez qu'ils apparaissent dans la liste
```

---

## ⏰ Étape 4 : Attendre la Vérification DNS

### 4.1 Propagation DNS

**Délai normal** : 5 minutes à 48 heures
**Délai typique** : 30 minutes à 2 heures

**Pourquoi ça prend du temps ?**
- Les serveurs DNS mondiaux doivent se synchroniser
- Différent selon registrar (CloudFlare = rapide, autres = plus lent)

### 4.2 Vérifier la Propagation

**Outil en ligne** :
```
https://dnschecker.org/

1. Entrez votre domaine: intowork.com
2. Type: TXT
3. Cliquez "Search"
4. Vérifiez que les serveurs mondiaux voient vos enregistrements
```

**Ligne de commande** :
```bash
# Vérifier SPF
dig +short TXT intowork.com

# Vérifier DKIM
dig +short TXT resend._domainkey.intowork.com

# Vérifier DMARC
dig +short TXT _dmarc.intowork.com
```

**Résultats attendus** :
```
SPF:   "v=spf1 include:_spf.resend.com ~all"
DKIM:  "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GN..."
DMARC: "v=DMARC1; p=none; rua=mailto:admin@intowork.com"
```

### 4.3 Vérification sur Resend

```
1. Retournez sur: https://resend.com/domains
2. Votre domaine devrait montrer:
   ✅ SPF: Verified
   ✅ DKIM: Verified
   ✅ DMARC: Verified (si ajouté)

3. Statut global: "Active" 🟢
```

**Si "Pending" ou "Not Verified"** :
- Attendez encore 1-2 heures
- Vérifiez que les enregistrements DNS sont corrects
- Utilisez dnschecker.org pour debug
- Cliquez "Verify" sur Resend pour re-checker

---

## ⚙️ Étape 5 : Mettre à Jour la Configuration

### 5.1 Backend - Fichier `.env`

Éditez `/backend/.env` :

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_9PDmb3bu_91NLA4pshg8uYAGRGDveXWPj
FROM_EMAIL=INTOWORK <noreply@intowork.com>  # ✅ Changez ici
FRONTEND_URL=https://intowork.com  # ✅ URL production
```

**Changements** :
- `FROM_EMAIL` : `onboarding@resend.dev` → `noreply@intowork.com`
- `FRONTEND_URL` : `http://localhost:3000` → `https://intowork.com`

### 5.2 Frontend - Variables d'environnement

**Local** (`.env.local`) :
```env
NEXT_PUBLIC_API_URL=http://localhost:8001/api
```

**Production Vercel** :
```
1. Allez sur: https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Settings → Environment Variables
4. Ajoutez:
   NEXT_PUBLIC_API_URL=https://votre-api.railway.app/api
```

### 5.3 Redémarrer les Services

**Backend** :
```bash
# Arrêtez le backend (Ctrl+C)
# Redémarrez
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

**Frontend** :
```bash
# Arrêtez (Ctrl+C)
# Redémarrez
cd frontend
npm run dev
```

---

## 🧪 Étape 6 : Tester l'Envoi

### 6.1 Test avec Script Direct

```bash
cd backend
source venv/bin/activate
python direct_email_test.py
```

**Entrez** : N'importe quel email (plus besoin de l'email Resend !)

**Résultat attendu** :
```
✅ EMAIL ENVOYÉ AVEC SUCCÈS !
📧 ID de l'email: xxxxxxxx
📬 Destinataire: test@gmail.com

Vérifiez votre boîte mail...
```

### 6.2 Test via l'Application

```
1. Visitez: http://localhost:3000/auth/forgot-password
2. Entrez N'IMPORTE QUEL email (ex: votre Gmail)
3. Cliquez "Envoyer"
4. Vérifiez la boîte mail (et spam)
```

### 6.3 Vérifier sur Resend Dashboard

```
1. Visitez: https://resend.com/emails
2. Vous devriez voir le nouvel email
3. Statut: "Delivered" ✅
4. From: noreply@intowork.com
```

---

## 🔒 Étape 7 : Sécurité & Best Practices

### 7.1 Configuration DMARC Progressive

**Phase 1 - Monitoring (Premier mois)** :
```
_dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@intowork.com"
```
→ Recevoir rapports, pas d'action

**Phase 2 - Quarantine (Après 1 mois)** :
```
_dmarc TXT "v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@intowork.com"
```
→ 10% des emails suspects en spam

**Phase 3 - Reject (Production mature)** :
```
_dmarc TXT "v=DMARC1; p=reject; rua=mailto:dmarc@intowork.com"
```
→ Rejeter emails non autorisés

### 7.2 Email de Contact DMARC

Créez `dmarc@intowork.com` pour recevoir les rapports :
```
1. Option 1: Redirection vers votre email principal
2. Option 2: Mailbox dédiée
3. Option 3: Service DMARC (dmarcian.com, postmark.com/dmarc)
```

### 7.3 Surveillance Délivrabilité

**Outils gratuits** :
- Mail-Tester : https://www.mail-tester.com/
- GlockApps : https://glockapps.com/ (payant mais précis)

**Test** :
```
1. Envoyez un email à l'adresse donnée par mail-tester
2. Vérifiez le score (objectif: 10/10)
3. Corrigez les problèmes identifiés
```

---

## 📊 Étape 8 : Configuration Production Complète

### 8.1 Backend Production (Railway)

**Variables d'environnement Railway** :
```env
DATABASE_URL=postgresql://...  (Railway PostgreSQL)
NEXTAUTH_SECRET=qAOQq0/2GxTybJqV/GOKC34zM/tguUenONRdVY88nLw=
JWT_SECRET=ErbiyWdwzgzrSwqroghtIsPU8jiEnxMwME4UQu7LD78=
RESEND_API_KEY=re_9PDmb3bu_91NLA4pshg8uYAGRGDveXWPj
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=https://intowork.com  # ✅ Votre domaine
RAILWAY_ENVIRONMENT=production
```

### 8.2 Frontend Production (Vercel)

**Variables d'environnement Vercel** :
```env
NEXTAUTH_URL=https://intowork.com
NEXTAUTH_SECRET=qAOQq0/2GxTybJqV/GOKC34zM/tguUenONRdVY88nLw=
AUTH_SECRET=qAOQq0/2GxTybJqV/GOKC34zM/tguUenONRdVY88nLw=
NEXT_PUBLIC_API_URL=https://votre-api.railway.app/api
NODE_ENV=production
```

### 8.3 Déploiement

```bash
# Backend (Railway)
git add .
git commit -m "feat: Configure production email with custom domain"
git push origin main
# Railway auto-deploy

# Frontend (Vercel)
git push origin main
# Vercel auto-deploy
```

---

## ✅ Checklist de Production

### Avant de Lancer

- [ ] Domaine acheté et configuré
- [ ] DNS propagés (vérifiés sur dnschecker.org)
- [ ] Resend domain status: "Active" ✅
- [ ] `FROM_EMAIL` mis à jour dans `.env`
- [ ] `FRONTEND_URL` pointant vers production
- [ ] Test envoi email réussi
- [ ] Email reçu dans boîte mail (pas spam)
- [ ] Score mail-tester.com > 8/10
- [ ] Variables production configurées (Railway + Vercel)
- [ ] Déploiement effectué et testé

### Post-Lancement

- [ ] Monitorer volume emails (Resend dashboard)
- [ ] Surveiller taux de bounce (< 2%)
- [ ] Vérifier rapports DMARC (si configuré)
- [ ] Tester avec différents providers (Gmail, Outlook, etc.)
- [ ] Upgrade DMARC vers `p=quarantine` après 1 mois
- [ ] Documentation équipe mise à jour

---

## 🐛 Troubleshooting

### Problème 1 : DNS Non Vérifiés

**Symptôme** : Resend montre "Not Verified" après 24h

**Solutions** :
```
1. Vérifiez dnschecker.org:
   → Tous les serveurs doivent voir les enregistrements

2. Vérifiez le nom exact:
   SPF:   @ (ou domaine)
   DKIM:  resend._domainkey (pas juste _domainkey)
   DMARC: _dmarc

3. Vérifiez qu'il n'y a pas de duplicate:
   → Certains registrars ajoutent automatiquement le domaine
   → resend._domainkey.intowork.com.intowork.com ❌

4. Attendez encore 24h
   → Parfois ça prend vraiment 48h

5. Contactez support Resend:
   → support@resend.com
   → Très réactifs, répondent en < 24h
```

### Problème 2 : Emails Vont en Spam

**Causes** :
- DMARC non configuré
- Contenu suspect (trop de liens, mots spam)
- Nouveau domaine (pas de réputation)
- Volume élevé soudain

**Solutions** :
```
1. Configurez DMARC
2. Warmup progressif:
   - Semaine 1: < 50 emails/jour
   - Semaine 2: < 200 emails/jour
   - Semaine 3: < 500 emails/jour
   - Semaine 4+: Normal

3. Améliorez le contenu:
   - Évitez majuscules excessives
   - Évitez trop de liens
   - Ajoutez lien désabonnement
   - Texte clair et professionnel

4. Testez avec mail-tester.com
5. Demandez aux utilisateurs d'ajouter à contacts
```

### Problème 3 : "Domain Not Found"

**Symptôme** : Erreur lors de l'envoi

**Solution** :
```
1. Vérifiez que le domaine est "Active" sur Resend
2. Vérifiez FROM_EMAIL exact:
   ✅ INTOWORK <noreply@intowork.com>
   ❌ noreply@intowork.com (manque format)
   ❌ INTOWORK <noreply@autredomaine.com>

3. Redémarrez le backend après changement .env
```

### Problème 4 : Bounce Rate Élevé

**Symptôme** : > 5% de bounces

**Causes** :
- Emails invalides dans DB
- Typos dans emails
- Emails temporaires

**Solutions** :
```
1. Validation email à l'inscription:
   → Vérification format
   → Confirmation email obligatoire

2. Nettoyage DB:
   → Supprimez emails invalides
   → Supprimez comptes non vérifiés > 7 jours

3. Soft bounces vs Hard bounces:
   → Hard (permanent): Supprimer de DB
   → Soft (temporaire): Retry après 24h
```

---

## 💰 Coûts de Production

### Coûts Annuels

```
Domaine:              $10-15/an    (Namecheap, CloudFlare)
Resend (gratuit):     $0/an        (< 3,000 emails/mois)
Resend Pro:           $240/an      (jusqu'à 50k/mois)
Resend Business:      $1,020/an    (jusqu'à 250k/mois)
DMARC reporting:      $0-50/an     (optionnel)

Total Début:          $10-15/an
Total Croissance:     $250-270/an
Total Scale:          $1,030-1,070/an
```

---

## 🎯 Résumé Rapide

### Étapes Résumées

```
1. Acheter domaine (si pas déjà fait)       → 10 min
2. Ajouter domaine sur Resend               → 5 min
3. Configurer DNS (SPF, DKIM, DMARC)        → 15 min
4. Attendre vérification DNS                → 2-48h
5. Mettre à jour FROM_EMAIL dans .env       → 2 min
6. Redémarrer backend                       → 1 min
7. Tester envoi email                       → 5 min
8. Déployer en production                   → 10 min

Total temps actif: ~1 heure
Total temps attente: 2-48 heures
```

### Commandes Rapides

```bash
# Vérifier DNS
dig +short TXT intowork.com
dig +short TXT resend._domainkey.intowork.com

# Tester email
cd backend && source venv/bin/activate && python direct_email_test.py

# Redémarrer backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8001
```

---

## 📞 Support

### Resend Support

- Email : support@resend.com
- Discord : https://resend.com/discord
- Docs : https://resend.com/docs
- Status : https://status.resend.com/

### Outils Utiles

- DNS Checker : https://dnschecker.org/
- Mail Tester : https://www.mail-tester.com/
- DMARC Analyzer : https://dmarcian.com/
- SPF Validator : https://www.kitterman.com/spf/validate.html

---

## ✨ Conclusion

Une fois configuré, vous aurez :

✅ Domaine email professionnel (`noreply@intowork.com`)
✅ Envoi vers n'importe quel email (plus de limitation)
✅ Meilleure délivrabilité (SPF, DKIM, DMARC)
✅ Branding professionnel
✅ Prêt pour production

**Temps total** : ~1 heure de setup + 24-48h d'attente DNS

**Première fois** : Suivez ce guide étape par étape
**Prochaine fois** : 15 minutes de setup

🎉 **Vous êtes prêt pour la production !**
