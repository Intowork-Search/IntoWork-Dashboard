"""
Tests pour le système de réinitialisation de mot de passe
"""
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.base import User, UserRole, PasswordResetToken
from app.auth import PasswordHasher

# Configuration de la base de données de test en mémoire
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override de la dépendance get_db pour les tests"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override de la dépendance
app.dependency_overrides[get_db] = override_get_db

# Client de test
client = TestClient(app)


@pytest.fixture(scope="function")
def db_session():
    """Fixture pour créer une session de base de données de test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db_session):
    """Fixture pour créer un utilisateur de test"""
    user = User(
        email="test@example.com",
        password_hash=PasswordHasher.hash_password("OldPassword123!"),
        first_name="Test",
        last_name="User",
        name="Test User",
        role=UserRole.CANDIDATE,
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


class TestForgotPassword:
    """Tests pour la route /auth/forgot-password"""

    def test_forgot_password_with_valid_email(self, db_session, test_user):
        """Test : Demande de réinitialisation avec email valide"""
        response = client.post(
            "/api/auth/forgot-password",
            json={"email": test_user.email}
        )

        assert response.status_code == 200
        assert "message" in response.json()

        # Vérifier qu'un token a été créé en base de données
        token = db_session.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == test_user.id
        ).first()

        assert token is not None
        assert token.used_at is None
        assert token.expires_at > datetime.now(timezone.utc)
        assert len(token.token) > 40  # Token sécurisé (43 caractères normalement)

    def test_forgot_password_with_invalid_email(self, db_session):
        """Test : Demande avec email invalide (ne doit pas échouer pour sécurité)"""
        response = client.post(
            "/api/auth/forgot-password",
            json={"email": "nonexistent@example.com"}
        )

        # Doit retourner un succès même si l'email n'existe pas (sécurité)
        assert response.status_code == 200
        assert "message" in response.json()

        # Vérifier qu'aucun token n'a été créé
        token_count = db_session.query(PasswordResetToken).count()
        assert token_count == 0

    def test_forgot_password_invalidates_old_tokens(self, db_session, test_user):
        """Test : Une nouvelle demande invalide les anciens tokens"""
        # Première demande
        client.post(
            "/api/auth/forgot-password",
            json={"email": test_user.email}
        )

        first_token = db_session.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == test_user.id
        ).first()

        # Deuxième demande
        client.post(
            "/api/auth/forgot-password",
            json={"email": test_user.email}
        )

        # Rafraîchir le premier token
        db_session.refresh(first_token)

        # Le premier token doit être marqué comme utilisé
        assert first_token.used_at is not None

        # Il doit y avoir 2 tokens au total
        token_count = db_session.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == test_user.id
        ).count()
        assert token_count == 2

    def test_forgot_password_with_invalid_email_format(self):
        """Test : Email avec format invalide"""
        response = client.post(
            "/api/auth/forgot-password",
            json={"email": "invalid-email"}
        )

        # Doit retourner une erreur de validation
        assert response.status_code == 422


class TestResetPassword:
    """Tests pour la route /auth/reset-password"""

    def test_reset_password_with_valid_token(self, db_session, test_user):
        """Test : Réinitialisation avec token valide"""
        # Créer un token de test
        token_value = "test_token_" + "a" * 30
        reset_token = PasswordResetToken(
            user_id=test_user.id,
            token=token_value,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
        )
        db_session.add(reset_token)
        db_session.commit()

        # Tenter la réinitialisation
        new_password = "NewPassword123!"
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": token_value,
                "new_password": new_password
            }
        )

        assert response.status_code == 200
        assert "successfully" in response.json()["message"].lower()

        # Vérifier que le mot de passe a été changé
        db_session.refresh(test_user)
        assert PasswordHasher.verify_password(new_password, test_user.password_hash)

        # Vérifier que le token a été marqué comme utilisé
        db_session.refresh(reset_token)
        assert reset_token.used_at is not None

    def test_reset_password_with_expired_token(self, db_session, test_user):
        """Test : Réinitialisation avec token expiré"""
        # Créer un token expiré
        token_value = "expired_token_" + "a" * 30
        reset_token = PasswordResetToken(
            user_id=test_user.id,
            token=token_value,
            expires_at=datetime.now(timezone.utc) - timedelta(hours=1)  # Expiré
        )
        db_session.add(reset_token)
        db_session.commit()

        # Tenter la réinitialisation
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": token_value,
                "new_password": "NewPassword123!"
            }
        )

        assert response.status_code == 400
        assert "expired" in response.json()["detail"].lower()

    def test_reset_password_with_used_token(self, db_session, test_user):
        """Test : Réinitialisation avec token déjà utilisé"""
        # Créer un token déjà utilisé
        token_value = "used_token_" + "a" * 30
        reset_token = PasswordResetToken(
            user_id=test_user.id,
            token=token_value,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
            used_at=datetime.now(timezone.utc) - timedelta(hours=1)  # Déjà utilisé
        )
        db_session.add(reset_token)
        db_session.commit()

        # Tenter la réinitialisation
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": token_value,
                "new_password": "NewPassword123!"
            }
        )

        assert response.status_code == 400
        assert "already been used" in response.json()["detail"].lower()

    def test_reset_password_with_invalid_token(self, db_session):
        """Test : Réinitialisation avec token invalide"""
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": "nonexistent_token_12345",
                "new_password": "NewPassword123!"
            }
        )

        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

    def test_reset_password_with_short_password(self, db_session, test_user):
        """Test : Réinitialisation avec mot de passe trop court"""
        # Créer un token valide
        token_value = "valid_token_" + "a" * 30
        reset_token = PasswordResetToken(
            user_id=test_user.id,
            token=token_value,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
        )
        db_session.add(reset_token)
        db_session.commit()

        # Tenter avec un mot de passe trop court
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": token_value,
                "new_password": "short"  # Moins de 8 caractères
            }
        )

        assert response.status_code == 400
        assert "8 characters" in response.json()["detail"].lower()

    def test_reset_password_invalidates_other_tokens(self, db_session, test_user):
        """Test : Réinitialisation invalide les autres tokens de l'utilisateur"""
        # Créer deux tokens pour le même utilisateur
        token1_value = "token1_" + "a" * 30
        token2_value = "token2_" + "b" * 30

        token1 = PasswordResetToken(
            user_id=test_user.id,
            token=token1_value,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
        )
        token2 = PasswordResetToken(
            user_id=test_user.id,
            token=token2_value,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
        )
        db_session.add_all([token1, token2])
        db_session.commit()

        # Utiliser le premier token
        response = client.post(
            "/api/auth/reset-password",
            json={
                "token": token1_value,
                "new_password": "NewPassword123!"
            }
        )

        assert response.status_code == 200

        # Vérifier que le deuxième token a été invalidé
        db_session.refresh(token2)
        assert token2.used_at is not None

    def test_old_password_does_not_work_after_reset(self, db_session, test_user):
        """Test : L'ancien mot de passe ne fonctionne plus après réinitialisation"""
        old_password = "OldPassword123!"
        new_password = "NewPassword123!"

        # Vérifier que l'ancien mot de passe fonctionne avant reset
        assert PasswordHasher.verify_password(old_password, test_user.password_hash)

        # Créer un token et réinitialiser
        token_value = "reset_token_" + "a" * 30
        reset_token = PasswordResetToken(
            user_id=test_user.id,
            token=token_value,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24)
        )
        db_session.add(reset_token)
        db_session.commit()

        client.post(
            "/api/auth/reset-password",
            json={
                "token": token_value,
                "new_password": new_password
            }
        )

        # Rafraîchir l'utilisateur
        db_session.refresh(test_user)

        # Vérifier que l'ancien mot de passe ne fonctionne plus
        assert not PasswordHasher.verify_password(old_password, test_user.password_hash)

        # Vérifier que le nouveau mot de passe fonctionne
        assert PasswordHasher.verify_password(new_password, test_user.password_hash)


class TestPasswordResetIntegration:
    """Tests d'intégration du flux complet"""

    def test_complete_password_reset_flow(self, db_session, test_user):
        """Test : Flux complet de réinitialisation de mot de passe"""
        original_password = "OldPassword123!"
        new_password = "NewSecurePassword123!"

        # 1. Demander une réinitialisation
        forgot_response = client.post(
            "/api/auth/forgot-password",
            json={"email": test_user.email}
        )
        assert forgot_response.status_code == 200

        # 2. Récupérer le token créé
        reset_token = db_session.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == test_user.id
        ).first()
        assert reset_token is not None

        # 3. Utiliser le token pour réinitialiser
        reset_response = client.post(
            "/api/auth/reset-password",
            json={
                "token": reset_token.token,
                "new_password": new_password
            }
        )
        assert reset_response.status_code == 200

        # 4. Vérifier que le mot de passe a changé
        db_session.refresh(test_user)
        assert not PasswordHasher.verify_password(original_password, test_user.password_hash)
        assert PasswordHasher.verify_password(new_password, test_user.password_hash)

        # 5. Vérifier que le token a été marqué comme utilisé
        db_session.refresh(reset_token)
        assert reset_token.used_at is not None

        # 6. Vérifier qu'on ne peut pas réutiliser le token
        reuse_response = client.post(
            "/api/auth/reset-password",
            json={
                "token": reset_token.token,
                "new_password": "AnotherPassword123!"
            }
        )
        assert reuse_response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
