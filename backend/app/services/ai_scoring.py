"""
Service de scoring IA pour l'analyse des candidatures
Utilise Anthropic Claude pour analyser la compatibilité candidat-offre
"""
import os
import json
from typing import Dict, List, Optional
from anthropic import Anthropic, AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

# Client synchrone pour les fonctions utilitaires de conversation
_anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
client: Optional[Anthropic] = Anthropic(api_key=_anthropic_api_key) if _anthropic_api_key else None
model = "claude-sonnet-4-6"


# ── Fonctions utilitaires de gestion des conversations ──────────────────────

def add_user_message(messages: List[Dict], text: str) -> None:
    """Ajoute un message utilisateur à la liste des messages."""
    messages.append({"role": "user", "content": text})


def add_assistant_message(messages: List[Dict], text: str) -> None:
    """Ajoute un message assistant à la liste des messages."""
    messages.append({"role": "assistant", "content": text})


def chat(messages: List[Dict]) -> str:
    """Envoie les messages à Claude et retourne la réponse texte."""
    if client is None:
        raise RuntimeError("ANTHROPIC_API_KEY non configurée — scoring IA indisponible")
    message = client.messages.create(
        model=model,
        max_tokens=1000,
        messages=messages,
    )
    return message.content[0].text

class AIEvaluationService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY n'est pas définie dans les variables d'environnement")

        self.client = AsyncAnthropic(api_key=self.api_key)
        self.model = "claude-sonnet-4-6"
    
    async def score_candidate(
        self,
        job_title: str,
        job_description: str,
        job_requirements: Optional[str],
        job_responsibilities: Optional[str],
        candidate_cv_text: str,
        candidate_experience: Optional[str] = None,
        candidate_skills: Optional[str] = None,
    ) -> Dict:
        """
        Analyse la compatibilité entre un candidat et une offre d'emploi
        
        Returns:
            Dict avec:
            - score: float (0-100)
            - strengths: List[str] - Points forts du candidat
            - weaknesses: List[str] - Points à améliorer
            - skills_match: Dict - Compétences matchées
            - experience_match: str - Évaluation de l'expérience
            - recommendation: str - Recommandation globale
        """
        
        prompt = self._build_evaluation_prompt(
            job_title=job_title,
            job_description=job_description,
            job_requirements=job_requirements,
            job_responsibilities=job_responsibilities,
            candidate_cv_text=candidate_cv_text,
            candidate_experience=candidate_experience,
            candidate_skills=candidate_skills,
        )
        
        try:
            message = await self.client.messages.create(
                model=self.model,
                max_tokens=2000,
                temperature=0.3,
                system="Tu es un expert en recrutement et évaluation de candidatures. "
                       "Tu analyses objectivement la compatibilité entre un candidat et une offre d'emploi. "
                       "Tu fournis des évaluations précises, structurées et factuelles basées sur les données fournies.",
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = message.content[0].text

            # Parser et valider la réponse JSON
            try:
                result = json.loads(response_text)
            except json.JSONDecodeError:
                # Tenter d'extraire le JSON si Claude a ajouté du texte autour
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    raise ValueError("Réponse Claude non parseable en JSON")

            # Valider les champs obligatoires
            required_keys = {"score", "strengths", "weaknesses", "skills_match", "experience_match", "recommendation"}
            missing = required_keys - set(result.keys())
            if missing:
                raise ValueError(f"Champs manquants dans la réponse IA: {missing}")

            return result

        except Exception as e:
            from app.logging_config import logger
            logger.error(f"Erreur lors de l'analyse IA: {type(e).__name__}")
            return {
                "score": None,
                "strengths": [],
                "weaknesses": [],
                "skills_match": {"matched": [], "missing": [], "percentage": 0},
                "experience_match": "Analyse IA indisponible",
                "recommendation": "Analyse manuelle recommandée",
                "error": "Service IA temporairement indisponible"
            }
    
    def _build_evaluation_prompt(
        self,
        job_title: str,
        job_description: str,
        job_requirements: Optional[str],
        job_responsibilities: Optional[str],
        candidate_cv_text: str,
        candidate_experience: Optional[str],
        candidate_skills: Optional[str],
    ) -> str:
        """Construit le prompt pour Claude"""
        
        prompt = f"""Analyse la compatibilité entre ce candidat et cette offre d'emploi.

📋 OFFRE D'EMPLOI:
Titre: {job_title}

Description:
{job_description}
"""
        
        if job_requirements:
            prompt += f"\nExigences:\n{job_requirements}\n"
        
        if job_responsibilities:
            prompt += f"\nResponsabilités:\n{job_responsibilities}\n"
        
        prompt += f"""

👤 PROFIL CANDIDAT:

CV:
{candidate_cv_text[:3000]}  # Limiter à 3000 caractères pour éviter dépassement token
"""
        
        if candidate_experience:
            prompt += f"\nExpériences:\n{candidate_experience}\n"
        
        if candidate_skills:
            prompt += f"\nCompétences:\n{candidate_skills}\n"
        
        prompt += """

📊 ANALYSE DEMANDÉE:
Évalue la compatibilité du candidat avec l'offre sur une échelle de 0 à 100.

Fournis ta réponse UNIQUEMENT en format JSON valide (sans markdown, sans backticks) avec cette structure exacte:

{
  "score": 85.5,
  "strengths": [
    "Force 1 détectée",
    "Force 2 détectée",
    "Force 3 détectée"
  ],
  "weaknesses": [
    "Point faible 1",
    "Point faible 2"
  ],
  "skills_match": {
    "matched": ["Compétence 1", "Compétence 2", "Compétence 3"],
    "missing": ["Compétence manquante 1", "Compétence manquante 2"],
    "percentage": 75
  },
  "experience_match": "Description de l'adéquation de l'expérience (2-3 phrases)",
  "recommendation": "Recommandation finale (shortlist / interview / review / reject) avec justification courte"
}

Critères d'évaluation:
- Compétences techniques: 40%
- Expérience pertinente: 30%
- Formation/diplômes: 15%
- Soft skills (si mentionnés): 10%
- Adéquation culturelle/sectorielle: 5%

Réponds UNIQUEMENT avec le JSON, rien d'autre.
"""
        
        return prompt


# Instance singleton du service — initialisée à la demande pour ne pas crasher
# le backend au démarrage si ANTHROPIC_API_KEY est absente
_ai_service: Optional[AIEvaluationService] = None


def get_ai_service() -> AIEvaluationService:
    """Retourne le singleton AIEvaluationService, initialisé au premier appel."""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIEvaluationService()
    return _ai_service
