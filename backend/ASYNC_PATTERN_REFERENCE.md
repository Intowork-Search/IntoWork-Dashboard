# SQLAlchemy Async Pattern Reference

Guide de référence rapide pour la migration de SQLAlchemy synchrone vers async/await.

## Imports Requis

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete as sql_delete
from sqlalchemy.orm import selectinload  # Pour eager loading
```

## Patterns de Base

### 1. COUNT - Compter des enregistrements

**Avant (sync)**:
```python
count = db.query(Model).filter(Model.field == value).count()
```

**Après (async)**:
```python
result = await db.execute(
    select(func.count()).select_from(Model).filter(Model.field == value)
)
count = result.scalar()
```

### 2. SELECT ONE - Récupérer un enregistrement

**Avant (sync)**:
```python
obj = db.query(Model).filter(Model.id == id).first()
```

**Après (async)**:
```python
result = await db.execute(
    select(Model).filter(Model.id == id)
)
obj = result.scalar_one_or_none()  # ou .scalar() si on veut lever une exception
```

### 3. SELECT ALL - Récupérer plusieurs enregistrements

**Avant (sync)**:
```python
objs = db.query(Model).filter(Model.status == "active").all()
```

**Après (async)**:
```python
result = await db.execute(
    select(Model).filter(Model.status == "active")
)
objs = result.scalars().all()
```

### 4. SELECT avec ORDER BY et PAGINATION

**Avant (sync)**:
```python
objs = (
    db.query(Model)
    .filter(Model.active == True)
    .order_by(desc(Model.created_at))
    .offset(offset)
    .limit(limit)
    .all()
)
```

**Après (async)**:
```python
result = await db.execute(
    select(Model)
    .filter(Model.active == True)
    .order_by(desc(Model.created_at))
    .offset(offset)
    .limit(limit)
)
objs = result.scalars().all()
```

### 5. UPDATE - Mettre à jour des enregistrements

**Avant (sync)**:
```python
db.query(Model).filter(Model.id == id).update({
    "field1": value1,
    "field2": value2
})
db.commit()
```

**Après (async)**:
```python
await db.execute(
    update(Model)
    .filter(Model.id == id)
    .values(field1=value1, field2=value2)
)
await db.commit()
```

### 6. DELETE - Supprimer un enregistrement

**Avant (sync)**:
```python
obj = db.query(Model).filter(Model.id == id).first()
if obj:
    db.delete(obj)
    db.commit()
```

**Après (async)**:
```python
result = await db.execute(
    select(Model).filter(Model.id == id)
)
obj = result.scalar_one_or_none()
if obj:
    await db.delete(obj)
    await db.commit()
```

### 7. INSERT - Créer un enregistrement

**Avant (sync)**:
```python
obj = Model(field1=value1, field2=value2)
db.add(obj)
db.commit()
db.refresh(obj)  # Pour récupérer les valeurs générées (id, timestamps)
```

**Après (async)**:
```python
obj = Model(field1=value1, field2=value2)
db.add(obj)
await db.commit()
await db.refresh(obj)  # Pour récupérer les valeurs générées
```

## Patterns Avancés

### 8. SELECT avec JOINTURE (Eager Loading)

**Avant (sync)**:
```python
job = (
    db.query(Job)
    .options(selectinload(Job.employer))
    .filter(Job.id == job_id)
    .first()
)
```

**Après (async)**:
```python
result = await db.execute(
    select(Job)
    .options(selectinload(Job.employer))
    .filter(Job.id == job_id)
)
job = result.scalar_one_or_none()
```

### 9. COUNT avec Conditions Multiples

**Avant (sync)**:
```python
total = db.query(Notification).filter(
    Notification.user_id == user_id,
    Notification.is_read == False
).count()
```

**Après (async)**:
```python
result = await db.execute(
    select(func.count()).select_from(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    )
)
total = result.scalar()
```

### 10. UPDATE avec Valeurs Dynamiques

**Avant (sync)**:
```python
from datetime import datetime

db.query(Notification).filter(
    Notification.user_id == user_id
).update({
    "is_read": True,
    "read_at": datetime.now()
})
db.commit()
```

**Après (async)**:
```python
from datetime import datetime

await db.execute(
    update(Notification)
    .filter(Notification.user_id == user_id)
    .values(is_read=True, read_at=datetime.now())
)
await db.commit()
```

## Méthodes de Résultats

### Différentes façons d'extraire les résultats

```python
result = await db.execute(select(Model).filter(...))

# Une seule valeur (lève NoResultFound si aucun résultat)
obj = result.scalar_one()

# Une seule valeur ou None
obj = result.scalar_one_or_none()

# Première valeur (peut être None)
obj = result.scalar()

# Plusieurs valeurs (liste de tuples)
rows = result.all()

# Plusieurs valeurs scalaires (liste d'objets)
objs = result.scalars().all()

# Itérer sur les résultats
for obj in result.scalars():
    print(obj)
```

## Fonctions de Signature

### Avant (sync)
```python
def my_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    # ...
    db.commit()
```

### Après (async)
```python
async def my_endpoint(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_user)
):
    # ...
    await db.commit()
```

## Checklist de Migration

- [ ] Remplacer `Session` par `AsyncSession` dans les imports
- [ ] Ajouter `select, func, update, delete` dans les imports
- [ ] Remplacer tous les `db: Session` par `db: AsyncSession`
- [ ] Transformer `db.query(Model)` en `select(Model)`
- [ ] Ajouter `await` devant tous les `db.execute()`
- [ ] Ajouter `await` devant tous les `db.commit()`
- [ ] Ajouter `await` devant tous les `db.refresh()`
- [ ] Ajouter `await` devant tous les `db.delete()`
- [ ] Utiliser `.scalar()` ou `.scalar_one_or_none()` pour extraire les résultats
- [ ] Utiliser `.scalars().all()` pour les listes d'objets
- [ ] Transformer `.count()` en `select(func.count())`
- [ ] Transformer `.update({...})` en `update(...).values(...)`
- [ ] Vérifier que toutes les fonctions appelantes utilisent `await`
- [ ] Compiler avec `python3 -m py_compile` pour vérifier la syntaxe

## Erreurs Courantes

### 1. Oublier `await`
```python
# ❌ ERREUR
result = db.execute(select(Model))  # Retourne une coroutine, pas un résultat

# ✅ CORRECT
result = await db.execute(select(Model))
```

### 2. Utiliser `.count()` directement
```python
# ❌ ERREUR
count = select(Model).filter(...).count()  # count() n'existe pas sur select()

# ✅ CORRECT
result = await db.execute(select(func.count()).select_from(Model).filter(...))
count = result.scalar()
```

### 3. Oublier `.scalar()` ou `.scalars()`
```python
# ❌ ERREUR
obj = await db.execute(select(Model))  # Retourne un Result, pas un Model

# ✅ CORRECT
result = await db.execute(select(Model))
obj = result.scalar_one_or_none()
```

### 4. Utiliser `.first()` ou `.all()` sur select()
```python
# ❌ ERREUR
obj = select(Model).filter(...).first()  # first() n'existe pas sur select()

# ✅ CORRECT
result = await db.execute(select(Model).filter(...))
obj = result.scalar_one_or_none()
```

## Ressources

- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [FastAPI Async SQL Databases](https://fastapi.tiangolo.com/advanced/async-sql-databases/)
- [AsyncSession API](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
