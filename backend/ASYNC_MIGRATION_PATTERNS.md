# SQLAlchemy Async Migration Patterns

Guide de référence rapide pour migrer du code SQLAlchemy synchrone vers async.

## Table des matières
1. [Imports](#imports)
2. [Session](#session)
3. [Queries de base](#queries-de-base)
4. [Aggregations](#aggregations)
5. [Joins & Relations](#joins--relations)
6. [Modifications](#modifications)
7. [Transactions](#transactions)

---

## Imports

### Avant (Sync)
```python
from sqlalchemy.orm import Session
from sqlalchemy import func
```

### Après (Async)
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
```

---

## Session

### Avant (Sync)
```python
def my_endpoint(db: Session = Depends(get_db)):
    pass
```

### Après (Async)
```python
async def my_endpoint(db: AsyncSession = Depends(get_db)):
    pass
```

---

## Queries de base

### 1. Count

#### Avant (Sync)
```python
count = db.query(User).count()
```

#### Après (Async)
```python
result = await db.execute(select(func.count()).select_from(User))
count = result.scalar()
```

### 2. Count avec filtre

#### Avant (Sync)
```python
count = db.query(User).filter(User.is_active == True).count()
```

#### Après (Async)
```python
result = await db.execute(
    select(func.count()).select_from(User).filter(User.is_active == True)
)
count = result.scalar()
```

### 3. Get by ID (first)

#### Avant (Sync)
```python
user = db.query(User).filter(User.id == user_id).first()
```

#### Après (Async)
```python
result = await db.execute(select(User).filter(User.id == user_id))
user = result.scalar_one_or_none()
```

### 4. Get all

#### Avant (Sync)
```python
users = db.query(User).all()
```

#### Après (Async)
```python
result = await db.execute(select(User))
users = result.scalars().all()
```

### 5. Filter + All

#### Avant (Sync)
```python
active_users = db.query(User).filter(User.is_active == True).all()
```

#### Après (Async)
```python
result = await db.execute(select(User).filter(User.is_active == True))
active_users = result.scalars().all()
```

### 6. Order By + Limit + Offset

#### Avant (Sync)
```python
users = (
    db.query(User)
    .order_by(User.created_at.desc())
    .offset(skip)
    .limit(limit)
    .all()
)
```

#### Après (Async)
```python
query = (
    select(User)
    .order_by(User.created_at.desc())
    .offset(skip)
    .limit(limit)
)
result = await db.execute(query)
users = result.scalars().all()
```

---

## Aggregations

### 1. Group By

#### Avant (Sync)
```python
results = (
    db.query(Job.status, func.count(Job.id).label('count'))
    .group_by(Job.status)
    .all()
)
```

#### Après (Async)
```python
result = await db.execute(
    select(Job.status, func.count(Job.id).label('count'))
    .group_by(Job.status)
)
results = result.all()
```

### 2. Sum/Avg/Max/Min

#### Avant (Sync)
```python
total = db.query(func.sum(Order.amount)).scalar()
avg = db.query(func.avg(Order.amount)).scalar()
```

#### Après (Async)
```python
result = await db.execute(select(func.sum(Order.amount)))
total = result.scalar()

result = await db.execute(select(func.avg(Order.amount)))
avg = result.scalar()
```

---

## Joins & Relations

### 1. Simple Join

#### Avant (Sync)
```python
jobs = db.query(Job).join(Company).all()
```

#### Après (Async)
```python
result = await db.execute(select(Job).join(Company))
jobs = result.scalars().all()
```

### 2. Outer Join

#### Avant (Sync)
```python
employers = (
    db.query(Employer)
    .join(User)
    .outerjoin(Company)
    .all()
)
```

#### Après (Async)
```python
result = await db.execute(
    select(Employer)
    .join(User)
    .outerjoin(Company)
)
employers = result.scalars().all()
```

### 3. Eager Loading (selectinload)

#### Avant (Sync)
```python
# Lazy loading (N+1 problem)
jobs = db.query(Job).all()
for job in jobs:
    print(job.company.name)  # N+1 queries
```

#### Après (Async)
```python
# Eager loading (1 query)
query = select(Job).options(selectinload(Job.company))
result = await db.execute(query)
jobs = result.scalars().all()
for job in jobs:
    print(job.company.name)  # No extra queries
```

### 4. Multiple Relations

#### Avant (Sync)
```python
employers = db.query(Employer).all()
for emp in employers:
    print(emp.user.email, emp.company.name)  # N+1 + N+1
```

#### Après (Async)
```python
query = select(Employer).options(
    selectinload(Employer.user),
    selectinload(Employer.company)
)
result = await db.execute(query)
employers = result.scalars().all()
for emp in employers:
    print(emp.user.email, emp.company.name)  # No extra queries
```

---

## Modifications

### 1. Create

#### Avant (Sync)
```python
new_user = User(email="test@example.com", name="Test")
db.add(new_user)
db.commit()
db.refresh(new_user)
```

#### Après (Async)
```python
new_user = User(email="test@example.com", name="Test")
db.add(new_user)
await db.commit()
await db.refresh(new_user)
```

### 2. Update

#### Avant (Sync)
```python
user = db.query(User).filter(User.id == user_id).first()
user.is_active = False
db.commit()
db.refresh(user)
```

#### Après (Async)
```python
result = await db.execute(select(User).filter(User.id == user_id))
user = result.scalar_one_or_none()
user.is_active = False
await db.commit()
await db.refresh(user)
```

### 3. Delete

#### Avant (Sync)
```python
user = db.query(User).filter(User.id == user_id).first()
db.delete(user)
db.commit()
```

#### Après (Async)
```python
result = await db.execute(select(User).filter(User.id == user_id))
user = result.scalar_one_or_none()
await db.delete(user)
await db.commit()
```

### 4. Bulk Update (avec update())

#### Avant (Sync)
```python
from sqlalchemy import update as sql_update

db.execute(
    sql_update(User)
    .where(User.is_active == False)
    .values(is_active=True)
)
db.commit()
```

#### Après (Async)
```python
from sqlalchemy import update as sql_update

await db.execute(
    sql_update(User)
    .where(User.is_active == False)
    .values(is_active=True)
)
await db.commit()
```

---

## Transactions

### 1. Rollback

#### Avant (Sync)
```python
try:
    db.add(new_user)
    db.commit()
except Exception:
    db.rollback()
    raise
```

#### Après (Async)
```python
try:
    db.add(new_user)
    await db.commit()
except Exception:
    await db.rollback()
    raise
```

### 2. Manual Transaction

#### Avant (Sync)
```python
db.begin()
try:
    db.add(user1)
    db.add(user2)
    db.commit()
except Exception:
    db.rollback()
    raise
```

#### Après (Async)
```python
async with db.begin():
    db.add(user1)
    db.add(user2)
    # Commit automatique si pas d'exception
```

---

## Résultats (result.*)

Après `await db.execute(query)`, utilisez:

- `.scalar()`: Retourne une valeur unique (premier élément de la première ligne)
- `.scalar_one()`: Retourne une valeur unique, erreur si 0 ou >1 résultat
- `.scalar_one_or_none()`: Retourne une valeur unique ou None, erreur si >1 résultat
- `.scalars()`: Retourne un itérateur de valeurs (première colonne)
- `.scalars().all()`: Retourne une liste de valeurs (première colonne)
- `.all()`: Retourne une liste de tuples (toutes les colonnes)
- `.first()`: Retourne le premier tuple ou None
- `.one()`: Retourne un tuple unique, erreur si 0 ou >1 résultat
- `.one_or_none()`: Retourne un tuple unique ou None, erreur si >1 résultat

### Exemples

```python
# Pour un count
result = await db.execute(select(func.count()).select_from(User))
count = result.scalar()  # int

# Pour un objet unique
result = await db.execute(select(User).filter(User.id == 1))
user = result.scalar_one_or_none()  # User | None

# Pour une liste d'objets
result = await db.execute(select(User))
users = result.scalars().all()  # list[User]

# Pour des tuples (select multiple colonnes)
result = await db.execute(select(Job.status, func.count(Job.id)))
rows = result.all()  # list[tuple[str, int]]
```

---

## Checklist de Migration

- [ ] Changer `Session` → `AsyncSession`
- [ ] Ajouter `async` devant la fonction
- [ ] Changer `db.query(Model)` → `select(Model)`
- [ ] Ajouter `await db.execute(...)` pour toutes les queries
- [ ] Ajouter `.scalar()` ou `.scalars().all()` selon le besoin
- [ ] Ajouter `await` devant `db.commit()`
- [ ] Ajouter `await` devant `db.refresh()`
- [ ] Ajouter `await` devant `db.delete()`
- [ ] Ajouter `await` devant `db.rollback()`
- [ ] Ajouter `selectinload()` pour les relations
- [ ] Tester avec `python3 -m py_compile`
- [ ] Vérifier qu'il n'y a plus de `db: Session`

---

## Ressources

- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [AsyncIO Support](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Migration Guide](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
