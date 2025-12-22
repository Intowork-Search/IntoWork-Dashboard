# Modèles pour mise à jour des candidatures (à ajouter dans applications.py)

from pydantic import BaseModel
from typing import Optional

class UpdateApplicationStatusRequest(BaseModel):
    status: str  # pending, viewed, shortlisted, interview, accepted, rejected
    
class UpdateApplicationNotesRequest(BaseModel):
    notes: str
