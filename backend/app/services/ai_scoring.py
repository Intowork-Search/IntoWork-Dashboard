"""
Service de scoring IA pour l'analyse des candidatures
Utilise Anthropic Claude pour analyser la compatibilité candidat-offre
"""
import os
import json
from typing import Dict, Optional
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()

class AIEvaluationService:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY n'est pas définie dans les variables d'environnement")
        
        self.client = AsyncAnthropic(api_key=self.api_key)
        self.model = "claude-3-5-sonnet-20241022"  # Dernier modèle Claude 3.5 Sonnet
    
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
                temperature=0.3,  # Peu de créativité, plus de précision
                system="Tu es un expert en recrutement et évaluation de candidatures. "
                       "Tu analyses objectivement la compatibilité entre un candidat et une offre d'emploi. "
                       "Tu fournis des évaluations précises, structurées et factuelles basées sur les données fournies.",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            # Extraire le contenu de la réponse
            response_text = message.content[0].text
            
            # Parser la réponse JSON
            result = json.loads(response_text)
            
            return result
            
        except Exception as e:
            print(f"Erreur lors de l'analyse IA: {e}")
            # Retourner un score par défaut en cas d'erreur
            return {
                "score": 50.0,
                "strengths": ["Analyse IA indisponible"],
                "weaknesses": ["Analyse IA indisponible"],
                "skills_match": {"matched": [], "missing": [], "percentage": 0},
                "experience_match": "Non analysé",
                "recommendation": "Analyse manuelle recommandée",
                "error": str(e)
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


# Instance singleton du service
ai_service = AIEvaluationService()
