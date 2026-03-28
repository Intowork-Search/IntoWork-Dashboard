"""
Service de chiffrement pour les secrets stockés en base de données.

Utilise Fernet (AES-128-CBC + HMAC-SHA256) via la bibliothèque cryptography.
La clé de chiffrement est dérivée de ENCRYPTION_KEY (ou NEXTAUTH_SECRET en fallback)
via PBKDF2-HMAC-SHA256 avec un salt fixe propre à l'application.
"""
import base64
import logging
import os
from typing import Optional

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Salt fixe — propre à IntoWork, ne pas changer après le premier chiffrement
_SALT = b"intowork-secret-encryption-v1"

_fernet: Optional[Fernet] = None


def _get_fernet() -> Fernet:
    """Initialise le Fernet singleton à partir des variables d'environnement."""
    global _fernet
    if _fernet is not None:
        return _fernet

    secret = os.getenv("ENCRYPTION_KEY") or os.getenv("NEXTAUTH_SECRET")
    if not secret:
        raise RuntimeError(
            "ENCRYPTION_KEY ou NEXTAUTH_SECRET doit être défini pour le chiffrement des secrets"
        )

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=_SALT,
        iterations=480_000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(secret.encode()))
    _fernet = Fernet(key)
    return _fernet


def encrypt_value(plaintext: str) -> str:
    """Chiffre une valeur et retourne le ciphertext encodé en base64 URL-safe."""
    f = _get_fernet()
    return f.encrypt(plaintext.encode()).decode()


def decrypt_value(ciphertext: str) -> str:
    """Déchiffre un ciphertext Fernet. Lève InvalidToken si la clé est mauvaise."""
    f = _get_fernet()
    try:
        return f.decrypt(ciphertext.encode()).decode()
    except InvalidToken:
        logger.error("Échec du déchiffrement — clé incorrecte ou donnée corrompue")
        raise


def is_encrypted(value: str) -> bool:
    """Heuristique : les valeurs chiffrées Fernet commencent par 'gAAAAA'."""
    return value.startswith("gAAAAA")
