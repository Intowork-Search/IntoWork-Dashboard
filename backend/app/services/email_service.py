"""
Service d'envoi d'emails avec Resend
"""
import os
import logging
from typing import Optional
from datetime import datetime

# Configuration du logger
logger = logging.getLogger(__name__)

# Vérifier si resend est disponible
try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    logger.warning("Resend package not installed. Email sending will be disabled.")


# Configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
FROM_EMAIL = os.getenv("FROM_EMAIL", "INTOWORK <noreply@intowork.com>")


class EmailService:
    """Service pour l'envoi d'emails via Resend"""

    def __init__(self):
        if RESEND_AVAILABLE and RESEND_API_KEY:
            resend.api_key = RESEND_API_KEY
            self.enabled = True
            logger.info("✅ Email service ENABLED - Resend is configured")
        else:
            self.enabled = False
            if not RESEND_AVAILABLE:
                logger.warning("❌ Email service disabled: Resend package not available")
            if not RESEND_API_KEY:
                logger.error("❌ Email service disabled: RESEND_API_KEY environment variable NOT SET - Check Railway variables")
                logger.error(f"   FROM_EMAIL value: {FROM_EMAIL}")
                logger.error(f"   FRONTEND_URL value: {FRONTEND_URL}")

    def send_password_reset_email(
        self,
        email: str,
        token: str,
        user_name: Optional[str] = None
    ) -> bool:
        """
        Envoyer un email de réinitialisation de mot de passe

        Args:
            email: Adresse email du destinataire
            token: Token de réinitialisation
            user_name: Nom de l'utilisateur (optionnel)

        Returns:
            True si l'email a été envoyé avec succès, False sinon
        """
        if not self.enabled:
            logger.error(f"❌ Cannot send email to {email}: Email service is DISABLED")
            logger.error(f"   RESEND_API_KEY is set: {bool(RESEND_API_KEY)}")
            logger.error(f"   Resend package available: {RESEND_AVAILABLE}")
            return False

        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

        # Préparer le contenu HTML
        html_content = self._get_password_reset_template(
            reset_link=reset_link,
            user_name=user_name or "Utilisateur"
        )

        try:
            params = {
                "from": FROM_EMAIL,
                "to": [email],
                "subject": "Réinitialisation de votre mot de passe INTOWORK",
                "html": html_content,
            }

            logger.info(f"📧 Sending password reset email from {FROM_EMAIL} to {email}")
            response = resend.Emails.send(params)
            
            if response and 'id' in response:
                logger.info(f"✅ Password reset email sent successfully to {email}. ID: {response.get('id')}")
                return True
            else:
                logger.error(f"❌ Resend API returned unexpected response: {response}")
                return False

        except Exception as e:
            logger.error(f"❌ Failed to send password reset email to {email}: {str(e)}")
            logger.error(f"   Exception type: {type(e).__name__}")
            return False

    async def send_from_template(
        self,
        template_id: int,
        to_email: str,
        variables: dict,
        db
    ) -> bool:
        """
        Envoyer un email en utilisant un template de la base de données
        
        Args:
            template_id: ID du template EmailTemplate dans la base de données
            to_email: Adresse email du destinataire
            variables: Dictionnaire des variables à remplacer, ex:
                {
                    "candidate_name": "Jean Dupont",
                    "job_title": "Développeur Python",
                    "company_name": "ACME Corp",
                    "interview_date": "15 mars 2026",
                    ...
                }
            db: Session de base de données (AsyncSession)
        
        Returns:
            True si l'email a été envoyé avec succès, False sinon
            
        Exemple:
            await email_service.send_from_template(
                template_id=5,
                to_email="candidat@example.com",
                variables={
                    "candidate_name": "Marie Martin",
                    "job_title": "Chef de Projet",
                    "company_name": "TechCorp",
                    "interview_date": "20 mars 2026",
                    "interview_time": "14:00",
                    "interview_location": "Siège social, Paris"
                },
                db=db
            )
        """
        if not self.enabled:
            logger.error(f"❌ Cannot send email to {to_email}: Email service is DISABLED")
            return False
        
        from sqlalchemy import select, update
        from app.models.base import EmailTemplate
        
        try:
            # Récupérer le template depuis la base de données
            result = await db.execute(
                select(EmailTemplate).where(EmailTemplate.id == template_id)
            )
            template = result.scalar_one_or_none()
            
            if not template:
                logger.error(f"❌ Template {template_id} not found")
                return False
            
            if not template.is_active:
                logger.warning(f"⚠️ Template {template_id} is inactive but will be used")
            
            # Remplacer les variables dans le sujet et le corps
            subject = template.subject
            body = template.body
            
            for key, value in variables.items():
                placeholder = f"{{{key}}}"
                subject = subject.replace(placeholder, str(value))
                body = body.replace(placeholder, str(value))
            
            # Envoyer l'email
            params = {
                "from": FROM_EMAIL,
                "to": [to_email],
                "subject": subject,
                "html": body,
            }
            
            logger.info(f"📧 Sending email from template '{template.name}' (ID: {template_id}) to {to_email}")
            response = resend.Emails.send(params)
            
            if response and 'id' in response:
                # Incrémenter le compteur d'utilisation du template
                await db.execute(
                    update(EmailTemplate)
                    .where(EmailTemplate.id == template_id)
                    .values(
                        usage_count=EmailTemplate.usage_count + 1,
                        last_used_at=datetime.utcnow()
                    )
                )
                await db.commit()
                
                logger.info(f"✅ Email sent successfully from template {template_id}. Resend ID: {response.get('id')}")
                return True
            else:
                logger.error(f"❌ Resend API returned unexpected response: {response}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to send email from template {template_id}: {str(e)}")
            logger.error(f"   Exception type: {type(e).__name__}")
            return False

    def _get_password_reset_template(self, reset_link: str, user_name: str) -> str:
        """
        Template HTML pour l'email de réinitialisation de mot de passe
        """
        return f"""
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
        }}
        .logo {{
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 12px;
            margin-bottom: 20px;
            backdrop-filter: blur(10px);
        }}
        .logo-text {{
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
        }}
        .header h1 {{
            color: #ffffff;
            font-size: 28px;
            margin-bottom: 10px;
        }}
        .header p {{
            color: rgba(255, 255, 255, 0.9);
            font-size: 16px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 18px;
            color: #333333;
            margin-bottom: 20px;
        }}
        .message {{
            font-size: 16px;
            color: #666666;
            line-height: 1.6;
            margin-bottom: 30px;
        }}
        .cta-button {{
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s;
        }}
        .cta-button:hover {{
            transform: translateY(-2px);
        }}
        .link-fallback {{
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }}
        .link-fallback p {{
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
        }}
        .link-fallback a {{
            color: #667eea;
            word-break: break-all;
            text-decoration: none;
        }}
        .expiration {{
            margin-top: 30px;
            padding: 15px;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
        }}
        .expiration p {{
            font-size: 14px;
            color: #856404;
            margin: 0;
        }}
        .security-notice {{
            margin-top: 30px;
            padding: 15px;
            background-color: #e7f3ff;
            border-left: 4px solid #2196F3;
            border-radius: 4px;
        }}
        .security-notice p {{
            font-size: 14px;
            color: #0d47a1;
            margin: 0;
        }}
        .footer {{
            padding: 30px;
            background-color: #f8f9fa;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }}
        .footer p {{
            font-size: 14px;
            color: #999999;
            margin: 5px 0;
        }}
        .footer a {{
            color: #667eea;
            text-decoration: none;
        }}
        .divider {{
            height: 1px;
            background-color: #e9ecef;
            margin: 30px 0;
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <span class="logo-text">✨</span>
            </div>
            <h1>INTOWORK</h1>
            <p>Plateforme de Recrutement B2B2C</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p class="greeting">Bonjour {user_name},</p>

            <p class="message">
                Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte INTOWORK.
                Pour créer un nouveau mot de passe, cliquez sur le bouton ci-dessous :
            </p>

            <div style="text-align: center;">
                <a href="{reset_link}" class="cta-button">
                    Réinitialiser mon mot de passe
                </a>
            </div>

            <!-- Link fallback -->
            <div class="link-fallback">
                <p><strong>Le bouton ne fonctionne pas ?</strong></p>
                <p>Copiez et collez ce lien dans votre navigateur :</p>
                <a href="{reset_link}">{reset_link}</a>
            </div>

            <!-- Expiration notice -->
            <div class="expiration">
                <p><strong>⏰ Important :</strong> Ce lien expire dans <strong>24 heures</strong>. Après ce délai, vous devrez faire une nouvelle demande de réinitialisation.</p>
            </div>

            <!-- Security notice -->
            <div class="security-notice">
                <p><strong>🔒 Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel reste inchangé.</p>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #666666; text-align: center;">
                Besoin d'aide ? Contactez notre équipe support à
                <a href="mailto:support@intowork.com" style="color: #667eea; text-decoration: none;">support@intowork.com</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>INTOWORK</strong> - Votre Partenaire Recrutement</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            <p style="margin-top: 15px;">
                <a href="{FRONTEND_URL}">Accéder à la plateforme</a> •
                <a href="{FRONTEND_URL}/support">Support</a> •
                <a href="{FRONTEND_URL}/privacy">Confidentialité</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #999999;">
                © 2025 INTOWORK. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>
        """


# Instance singleton du service email
email_service = EmailService()
