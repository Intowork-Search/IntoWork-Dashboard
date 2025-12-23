# 🚀 BIENVENUE - IntoWork Dashboard

## 👋 Vous venez de cloner le projet ?

### ⚡ Démarrage Ultra-Rapide (5 min)

**Lisez ce fichier →** [**START_HERE.md**](./START_HERE.md) 

Il contient TOUTES les commandes à copier-coller pour lancer le projet.

---

## 📚 Documentation Disponible

### Pour Démarrer
| Fichier | Description | Pour Qui |
|---------|-------------|----------|
| **[START_HERE.md](./START_HERE.md)** | 🎯 Démarrage en 5 min | Tout le monde |
| **[QUICKSTART.md](./QUICKSTART.md)** | 📖 Guide complet détaillé | Développeurs |
| **[INSTALLATION.md](./INSTALLATION.md)** | 💻 Installation par OS | Setup initial |

### Pour Développer
| Fichier | Description |
|---------|-------------|
| **[README.md](./README.md)** | Architecture & Features du projet |
| **[CHANGELOG.md](./CHANGELOG.md)** | Historique des changements |
| **[PRE_PUSH_VERIFICATION.md](./PRE_PUSH_VERIFICATION.md)** | Checklist avant git push |

---

## 🎯 En Résumé (TL;DR)

```bash
# 1. PostgreSQL
docker run --name postgres-intowork -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15

# 2. Backend (Terminal 1)
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Éditer .env avec secrets (voir generate-secrets.sh)
alembic upgrade head
uvicorn app.main:app --reload --port 8001

# 3. Frontend (Terminal 2)
cd frontend
npm install
cp .env.local.example .env.local
# Éditer .env.local avec NEXTAUTH_SECRET (même que backend)
npm run dev

# 4. Ouvrir http://localhost:3000
```

---

## 🔑 Générer les Secrets

```bash
./generate-secrets.sh
```

Copiez les valeurs générées dans:
- `backend/.env`
- `frontend/.env.local`

⚠️ **IMPORTANT:** Le `NEXTAUTH_SECRET` doit être identique dans les 2 fichiers !

---

## 🏗️ Structure du Projet

```
IntoWork-Dashboard/
│
├── 📖 START_HERE.md          ← COMMENCEZ ICI
├── 📚 QUICKSTART.md          ← Guide complet
├── 💻 INSTALLATION.md        ← Setup par OS
├── 📝 README.md              ← Documentation projet
│
├── backend/                  ← API Python FastAPI
│   ├── app/                  ← Code source
│   ├── alembic/              ← Migrations BD
│   ├── requirements.txt      ← Dépendances Python
│   └── .env.example          ← Config à copier
│
├── frontend/                 ← App Next.js React
│   ├── src/                  ← Code source
│   ├── package.json          ← Dépendances Node
│   └── .env.local.example    ← Config à copier
│
└── start-dev.sh              ← Script lancement auto
```

---

## ✅ Checklist Rapide

Après avoir tout installé, vérifiez:

- [ ] PostgreSQL lancé: `docker ps | grep postgres-intowork`
- [ ] Backend répond: http://localhost:8001/ping
- [ ] Frontend accessible: http://localhost:3000
- [ ] Vous pouvez créer un compte (Sign Up)

---

## 🆘 Problèmes ?

### Port déjà utilisé
```bash
lsof -ti:8001 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Frontend
```

### PostgreSQL ne démarre pas
```bash
docker start postgres-intowork
# Si n'existe pas: voir START_HERE.md
```

### Plus de détails
Voir **[QUICKSTART.md](./QUICKSTART.md)** section "Problèmes Courants"

---

## 🎓 Technologies Utilisées

**Backend:**
- Python 3.9+ / FastAPI
- PostgreSQL 15
- JWT (HS256) / bcrypt
- SQLAlchemy / Alembic

**Frontend:**
- Next.js 16 + Turbopack
- React 18 / TypeScript
- NextAuth v5 / Tailwind CSS

**Économies:** $300k-600k/an (migration Clerk → NextAuth)

---

## 🚀 Prochaines Étapes

Une fois le projet lancé:

1. **Créer un compte Employer**
2. **Publier une offre d'emploi**
3. **Créer un compte Candidat**
4. **Postuler à l'offre**
5. **Vérifier les notifications** 🔔

---

## 📞 Support

- **Setup:** Voir [QUICKSTART.md](./QUICKSTART.md)
- **Bugs:** GitHub Issues
- **Questions:** Lire [README.md](./README.md)

---

**Bonne chance et bon développement ! 🎉**

*Dernière mise à jour: 23 décembre 2025*
