"""
Tests de conformite — Integration CinetPay (Mobile Money).

CLAUDE.md exige CinetPay comme gateway principal avec :
- Un service backend (cinetpay_service.py)
- Des exceptions custom (PaymentGatewayError, CinetPayWebhookError)
- Des variables d'environnement dediees

Tous ces tests sont marques xfail car CinetPay n'est pas encore implemente.
"""

import importlib
import os
from pathlib import Path

import pytest

pytestmark = [pytest.mark.business_context, pytest.mark.cinetpay]

BACKEND_ROOT = Path(__file__).resolve().parent.parent


# ===========================================================================
# 1. Existence du service CinetPay
# ===========================================================================


class TestCinetPayService:

    @pytest.mark.xfail(reason="cinetpay_service.py n'existe pas encore")
    def test_cinetpay_service_module_exists(self):
        service_path = BACKEND_ROOT / "app" / "services" / "cinetpay_service.py"
        assert service_path.is_file(), (
            f"Le fichier {service_path} doit exister"
        )

    @pytest.mark.xfail(reason="Module cinetpay_service non importable")
    def test_cinetpay_service_is_importable(self):
        mod = importlib.import_module("app.services.cinetpay_service")
        assert hasattr(mod, "CinetPayService") or hasattr(mod, "cinetpay_service"), (
            "Le module doit exporter CinetPayService ou cinetpay_service"
        )


# ===========================================================================
# 2. Exceptions custom de paiement
# ===========================================================================


class TestPaymentExceptions:

    @pytest.mark.xfail(reason="PaymentGatewayError non definie")
    def test_payment_gateway_error_exists(self):
        try:
            from app.exceptions import PaymentGatewayError
        except ImportError:
            pytest.fail(
                "PaymentGatewayError doit etre importable depuis app.exceptions"
            )

    @pytest.mark.xfail(reason="CinetPayWebhookError non definie")
    def test_cinetpay_webhook_error_exists(self):
        try:
            from app.exceptions import CinetPayWebhookError
        except ImportError:
            pytest.fail(
                "CinetPayWebhookError doit etre importable depuis app.exceptions"
            )


# ===========================================================================
# 3. Variables d'environnement CinetPay
# ===========================================================================


class TestCinetPayEnvVars:

    REQUIRED_VARS = [
        "CINETPAY_API_KEY",
        "CINETPAY_SITE_ID",
        "CINETPAY_SECRET_KEY",
    ]

    @pytest.mark.xfail(reason="Variables CinetPay non documentees dans le code")
    def test_cinetpay_env_vars_referenced_in_code(self):
        """Verifie qu'au moins une variable CinetPay est referencee dans le code source."""
        services_dir = BACKEND_ROOT / "app" / "services"
        found = False

        if services_dir.is_dir():
            for py_file in services_dir.glob("*.py"):
                content = py_file.read_text(encoding="utf-8", errors="ignore")
                if any(var in content for var in self.REQUIRED_VARS):
                    found = True
                    break

        assert found, (
            f"Au moins une des variables {self.REQUIRED_VARS} "
            "doit etre referencee dans app/services/"
        )
