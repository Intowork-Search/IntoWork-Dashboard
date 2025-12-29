# ⚡ Resend Production - Guide Ultra-Rapide

## 🎯 Objectif
Passer de `onboarding@resend.dev` → `noreply@intowork.com` en 1 heure

---

## 📋 Checklist Visuelle

```
┌─────────────────────────────────────────────────────┐
│  CONFIGURATION RESEND PRODUCTION                   │
└─────────────────────────────────────────────────────┘

□ 1. Domaine acheté (intowork.com)
      ↓ 10 min

□ 2. Domaine ajouté sur Resend
      ↓ 5 min
      https://resend.com/domains → Add Domain

□ 3. DNS configurés (SPF, DKIM, DMARC)
      ↓ 15 min
      Panneau DNS de votre registrar

□ 4. DNS vérifiés
      ↓ 2-48h (attente)
      https://dnschecker.org/

□ 5. FROM_EMAIL mis à jour
      ↓ 2 min
      backend/.env → FROM_EMAIL=INTOWORK <noreply@intowork.com>

□ 6. Backend redémarré
      ↓ 1 min

□ 7. Test envoi email
      ↓ 5 min
      python direct_email_test.py

□ 8. Production déployée
      ↓ 10 min
      Git push → Railway + Vercel

✅ TERMINÉ !
```

---

## 🚀 Étapes Ultra-Rapides

### Étape 1 : Ajouter Domaine sur Resend (5 min)

```
1. https://resend.com/domains
2. Cliquez "Add Domain"
3. Entrez: intowork.com
4. Region: us-east-1
5. Cliquez "Add"
```

**Resend génère 3 enregistrements DNS** → Gardez cette page ouverte

---

### Étape 2 : Configurer DNS (15 min)

**Accédez au DNS** de votre domaine (Namecheap, CloudFlare, OVH, etc.)

**Ajoutez ces 3 enregistrements** :

#### SPF
```
Type:  TXT
Name:  @
Value: v=spf1 include:_spf.resend.com ~all
TTL:   3600
```

#### DKIM
```
Type:  TXT
Name:  resend._domainkey
Value: p=MIGfMA0... (copiez depuis Resend)
TTL:   3600
```

#### DMARC
```
Type:  TXT
Name:  _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@intowork.com
TTL:   3600
```

**Sauvegardez** chaque enregistrement.

---

### Étape 3 : Attendre Vérification (2-48h)

**Vérifier propagation** :
```bash
dig +short TXT intowork.com
dig +short TXT resend._domainkey.intowork.com
```

Ou : https://dnschecker.org/

**Sur Resend** :
- https://resend.com/domains
- Attendre que status = "Active" ✅

---

### Étape 4 : Mettre à Jour Config (5 min)

**Backend** `/backend/.env` :
```env
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=https://intowork.com
```

**Redémarrer** :
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8001
```

---

### Étape 5 : Tester (5 min)

```bash
cd backend
source venv/bin/activate
python direct_email_test.py
```

**Entrez** : N'importe quel email (ex: votre Gmail)

**Résultat attendu** :
```
✅ EMAIL ENVOYÉ AVEC SUCCÈS !
```

Vérifiez votre boîte mail (et spam).

---

### Étape 6 : Production (10 min)

**Railway** (Backend) :
```
Settings → Variables
FROM_EMAIL=INTOWORK <noreply@intowork.com>
FRONTEND_URL=https://intowork.com
```

**Vercel** (Frontend) :
```
Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://votre-api.railway.app/api
```

**Déployer** :
```bash
git add .
git commit -m "feat: Production email with custom domain"
git push origin main
```

---

## 🎯 Résumé 1 Minute

```
1. Resend → Add Domain → intowork.com
2. DNS → Ajouter SPF, DKIM, DMARC
3. Attendre 2-48h → Vérifier sur dnschecker.org
4. .env → FROM_EMAIL=noreply@intowork.com
5. Redémarrer backend
6. Tester avec direct_email_test.py
7. Déployer production
```

**Temps actif** : 1 heure
**Temps attente** : 2-48 heures

---

## 🆘 Troubleshooting Express

### DNS non vérifiés après 24h ?
```bash
# Vérifier
dig +short TXT resend._domainkey.intowork.com

# Si vide → Vérifiez le nom exact dans votre DNS
# Doit être: resend._domainkey (pas juste _domainkey)
```

### Email va en spam ?
```
1. Ajoutez DMARC (si pas fait)
2. Testez: https://www.mail-tester.com/
3. Warmup: Commencez avec < 50 emails/jour
```

### "Domain not found" ?
```
1. Vérifiez status Resend = "Active"
2. FROM_EMAIL = INTOWORK <noreply@intowork.com>
3. Redémarrez backend après changement .env
```

---

## 📚 Documentation Complète

Besoin de plus de détails ? Voir :
- `RESEND_PRODUCTION_SETUP.md` - Guide complet pas-à-pas
- `RESEND_SETUP.md` - Setup initial Resend
- `EMAIL_CONFIG_READY.md` - Configuration actuelle

---

## ✅ Checklist Post-Production

Après mise en production, vérifiez :

- [ ] Email test envoyé et reçu
- [ ] Pas de spam (Gmail, Outlook, Yahoo)
- [ ] Score mail-tester.com > 8/10
- [ ] Resend dashboard montre emails envoyés
- [ ] Tous les emails ont status "Delivered"
- [ ] Bounce rate < 2%
- [ ] Frontend affiche bon message confirmation
- [ ] Lien de réinitialisation fonctionne

---

## 🎉 Vous Êtes Prêt !

✅ Domaine configuré
✅ DNS vérifiés
✅ Email professionnel
✅ Production opérationnelle

**Prochain niveau** : Monitorer volume et délivrabilité

💡 **Tip** : Gardez un œil sur https://resend.com/emails pour suivre vos envois
