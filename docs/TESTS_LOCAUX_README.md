# 🧪 Tests Locaux - Guide de Démarrage Rapide

Ce dossier contient tout ce dont vous avez besoin pour tester IntoWork Dashboard localement.

---

## 🚀 Démarrage Ultra-Rapide (3 étapes)

### 1. Démarrer les services
```bash
./start-test-local.sh
```
Cela démarre automatiquement :
- ✅ PostgreSQL (si nécessaire)
- ✅ Backend FastAPI (port 8001)
- ✅ Frontend Next.js (port 3000)

### 2. Ouvrir dans le navigateur
```
http://localhost:3000
```

### 3. Lancer les tests automatisés
```bash
./test-local-auto.sh
```

---

## 📁 Fichiers Disponibles

### Scripts d'Automatisation
| Fichier | Description |
|---------|-------------|
| `start-test-local.sh` | ▶️ Démarre backend + frontend en arrière-plan |
| `stop-test-local.sh` | ⏹️ Arrête tous les services proprement |
| `test-local-auto.sh` | 🧪 Lance 12 tests automatisés |

### Documentation
| Fichier | Description |
|---------|-------------|
| `GUIDE_TESTS_LOCAUX.md` | 📖 Guide complet des tests manuels (1h30) |
| `TESTS_LOCAUX_README.md` | 📄 Ce fichier - démarrage rapide |

---

## 📊 Workflow Recommandé

### Option A : Tests Automatisés (Rapide - 2min)
```bash
# 1. Démarrer les services
./start-test-local.sh

# 2. Attendre 10 secondes que tout démarre
sleep 10

# 3. Lancer les tests automatisés
./test-local-auto.sh

# 4. Arrêter les services
./stop-test-local.sh
```

**Résultat attendu** :
```
🧪 TESTS AUTOMATISÉS - INTOWORK DASHBOARD
==========================================

✅ Test 1: PostgreSQL running... PASSED
✅ Test 2: API Health Check... PASSED
✅ Test 3: Swagger Documentation... PASSED
✅ Test 4: Signup Endpoint... PASSED
✅ Test 5: Signin Endpoint... PASSED
...

📊 RÉSULTATS FINAUX
Total tests: 12
✅ Passed: 12
❌ Failed: 0

Taux de réussite: 100%
🎉 TOUS LES TESTS SONT PASSÉS !
```

---

### Option B : Tests Manuels Complets (Approfondi - 1h30)

1. **Démarrer les services**
   ```bash
   ./start-test-local.sh
   ```

2. **Suivre le guide manuel**
   - Ouvrir `GUIDE_TESTS_LOCAUX.md`
   - Suivre les 7 phases de tests
   - Cocher chaque checkpoint

3. **Arrêter les services**
   ```bash
   ./stop-test-local.sh
   ```

**Couverture des tests manuels** :
- ✅ Backend API (Swagger, endpoints)
- ✅ Frontend UI (pages, navigation)
- ✅ Authentification complète (signup, signin, logout)
- ✅ Password reset flow (email, token, reset)
- ✅ Dashboards (admin, candidat, employer)
- ✅ Notifications
- ✅ Performance (indexes, temps réponse)

---

## 🛠️ Commandes Utiles

### Vérifier l'état des services
```bash
# Backend
curl http://localhost:8001/api/ping

# Frontend
curl http://localhost:3000
```

### Voir les logs en temps réel
```bash
# Backend
tail -f logs/backend.log

# Frontend
tail -f logs/frontend.log
```

### Vérifier les process en cours
```bash
# Voir les PIDs
cat logs/backend.pid
cat logs/frontend.pid

# Vérifier qu'ils tournent
ps aux | grep uvicorn
ps aux | grep next
```

### Arrêter manuellement (si nécessaire)
```bash
# Méthode 1: Script
./stop-test-local.sh

# Méthode 2: Par PID
kill $(cat logs/backend.pid)
kill $(cat logs/frontend.pid)

# Méthode 3: Par port
kill $(lsof -ti:8001)  # Backend
kill $(lsof -ti:3000)  # Frontend
```

---

## 📋 Checklist Rapide

Avant de commencer les tests :

- [ ] PostgreSQL installé et accessible
- [ ] Docker en cours d'exécution
- [ ] Python 3.12+ installé
- [ ] Node.js 18+ installé
- [ ] Variables d'environnement configurées (`backend/.env` et `frontend/.env.local`)
- [ ] Migrations appliquées (automatique via script)

---

## 🐛 Troubleshooting

### Problème : Script ne démarre pas

**Erreur** : `Permission denied`
```bash
# Solution: Rendre exécutable
chmod +x start-test-local.sh stop-test-local.sh test-local-auto.sh
```

### Problème : Port déjà utilisé

**Erreur** : `Address already in use`
```bash
# Solution: Arrêter le processus sur le port
kill $(lsof -ti:8001)  # Pour le backend
kill $(lsof -ti:3000)  # Pour le frontend
```

### Problème : PostgreSQL ne démarre pas

**Erreur** : `Cannot start postgres`
```bash
# Solution 1: Vérifier Docker
docker ps -a | grep postgres

# Solution 2: Recréer le container
docker stop postgres
docker rm postgres
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=intowork -p 5433:5432 -d postgres:15
```

### Problème : Backend ne répond pas

**Vérification** :
```bash
# 1. Vérifier les logs
cat logs/backend.log

# 2. Vérifier le processus
ps aux | grep uvicorn

# 3. Redémarrer
./stop-test-local.sh
./start-test-local.sh
```

### Problème : Frontend erreur de build

**Solution** :
```bash
cd frontend
rm -rf .next node_modules
npm install
cd ..
./start-test-local.sh
```

---

## 📊 Résultats Attendus

### Tests Automatisés
- **Durée** : ~30 secondes
- **Tests** : 12
- **Succès attendu** : 100%

### Tests Manuels Complets
- **Durée** : ~1h30
- **Phases** : 7
- **Checkpoints** : 25+
- **Couverture** : Backend, Frontend, Auth, Features, Performance

---

## 🎯 Prochaines Étapes

Une fois tous les tests validés ✅ :

1. **Créer un tag de version**
   ```bash
   git tag -a v3.0.0 -m "Production ready"
   git push origin v3.0.0
   ```

2. **Déployer sur Railway + Vercel**
   - Voir `DEPLOYMENT_SUMMARY.md`

3. **Configurer domaine Resend**
   - Aller sur https://resend.com/domains
   - Vérifier `intowork.co`

---

## 💡 Astuces

### Raccourci : Tout tester en une commande
```bash
./start-test-local.sh && sleep 10 && ./test-local-auto.sh
```

### Raccourci : Démarrer et ouvrir navigateur
```bash
./start-test-local.sh && sleep 5 && xdg-open http://localhost:3000
```

### Raccourci : Logs des deux services côte à côte
```bash
# Terminal 1
tail -f logs/backend.log

# Terminal 2
tail -f logs/frontend.log
```

---

## 📞 Support

En cas de problème :

1. Vérifier les logs : `logs/backend.log` et `logs/frontend.log`
2. Consulter `GUIDE_TESTS_LOCAUX.md` section Troubleshooting
3. Vérifier que toutes les dépendances sont installées
4. Redémarrer les services : `./stop-test-local.sh && ./start-test-local.sh`

---

**Bon test ! 🚀**

*Dernière mise à jour : 5 janvier 2026*
