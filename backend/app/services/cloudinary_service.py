"""
Cloudinary Service - Gestion des uploads d'images vers Cloudinary

Ce service gère l'upload, la suppression et la transformation d'images
vers Cloudinary CDN pour un stockage persistant et performances optimales.

Features:
- Upload d'images avec optimisation automatique
- Suppression d'images
- Génération d'URLs optimisées
- Support de transformations (resize, crop, format)
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
import os
from typing import Optional, Dict, Any
from fastapi import UploadFile
import logging

logger = logging.getLogger(__name__)

# Configuration Cloudinary depuis variables d'environnement
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True  # Force HTTPS
)


class CloudinaryService:
    """Service pour gérer les uploads d'images vers Cloudinary"""

    @staticmethod
    def is_configured() -> bool:
        """Vérifie si Cloudinary est correctement configuré"""
        config = cloudinary.config()
        return all([
            config.cloud_name,
            config.api_key,
            config.api_secret
        ])

    @staticmethod
    async def upload_image(
        file: UploadFile,
        folder: str = "uploads",
        public_id: Optional[str] = None,
        transformation: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """
        Upload une image vers Cloudinary
        
        Args:
            file: Fichier à uploader (FastAPI UploadFile)
            folder: Dossier de destination dans Cloudinary
            public_id: ID public optionnel (auto-généré si None)
            transformation: Transformations optionnelles (resize, crop, etc.)
            
        Returns:
            Dict avec 'url' (URL HTTPS) et 'public_id'
            
        Raises:
            Exception: Si l'upload échoue
        """
        if not CloudinaryService.is_configured():
            raise Exception(
                "Cloudinary not configured. "
                "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
            )
        
        try:
            # Lire le contenu du fichier
            contents = await file.read()
            
            # Options d'upload
            upload_options = {
                "folder": folder,
                "resource_type": "auto",  # Détecte automatiquement le type
                "quality": "auto:eco",    # Optimisation automatique
                "fetch_format": "auto",   # Format optimal (WebP si supporté)
            }
            
            if public_id:
                upload_options["public_id"] = public_id
                
            if transformation:
                upload_options["transformation"] = transformation
            
            # Upload vers Cloudinary
            result = cloudinary.uploader.upload(contents, **upload_options)
            
            logger.info(f"Image uploaded to Cloudinary: {result['public_id']}")
            
            return {
                "url": result['secure_url'],  # URL HTTPS
                "public_id": result['public_id'],
                "width": result.get('width'),
                "height": result.get('height'),
                "format": result.get('format'),
                "resource_type": result.get('resource_type')
            }
            
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {str(e)}")
            raise Exception(f"Failed to upload image to Cloudinary: {str(e)}")
    
    @staticmethod
    async def upload_company_logo(
        file: UploadFile,
        company_id: int
    ) -> Dict[str, str]:
        """
        Upload un logo d'entreprise avec transformations optimisées
        
        Args:
            file: Fichier logo
            company_id: ID de l'entreprise
            
        Returns:
            Dict avec 'url' et 'public_id'
        """
        # Transformation pour logo: carré 500x500, crop au centre
        transformation = {
            "width": 500,
            "height": 500,
            "crop": "fill",
            "gravity": "auto",  # Centre automatiquement sur le sujet
            "quality": "auto:good"
        }
        
        return await CloudinaryService.upload_image(
            file=file,
            folder=f"company_logos/company_{company_id}",
            transformation=transformation
        )
    
    @staticmethod
    async def upload_cv(
        file: UploadFile,
        candidate_id: int,
        filename: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Upload un CV (PDF) vers Cloudinary
        
        Args:
            file: Fichier CV
            candidate_id: ID du candidat
            filename: Nom optionnel du fichier
            
        Returns:
            Dict avec 'url' et 'public_id'
        """
        public_id = filename.replace('.pdf', '') if filename else None
        
        return await CloudinaryService.upload_image(
            file=file,
            folder=f"cvs/candidate_{candidate_id}",
            public_id=public_id
        )
    
    @staticmethod
    async def delete_image(public_id: str) -> bool:
        """
        Supprime une image de Cloudinary
        
        Args:
            public_id: ID public de l'image à supprimer
            
        Returns:
            True si succès, False sinon
        """
        if not CloudinaryService.is_configured():
            logger.warning("Cloudinary not configured, skipping delete")
            return False
        
        try:
            result = cloudinary.uploader.destroy(public_id)
            success = result.get('result') == 'ok'
            
            if success:
                logger.info(f"Image deleted from Cloudinary: {public_id}")
            else:
                logger.warning(f"Image not found or already deleted: {public_id}")
                
            return success
            
        except Exception as e:
            logger.error(f"Cloudinary delete failed: {str(e)}")
            return False
    
    @staticmethod
    def get_optimized_url(
        public_id: str,
        width: Optional[int] = None,
        height: Optional[int] = None,
        format: Optional[str] = None,
        quality: str = "auto"
    ) -> str:
        """
        Génère une URL optimisée avec transformations
        
        Args:
            public_id: ID public de l'image
            width: Largeur optionnelle
            height: Hauteur optionnelle
            format: Format optionnel (webp, jpg, png)
            quality: Qualité (auto, auto:eco, auto:good, auto:best)
            
        Returns:
            URL HTTPS optimisée
        """
        if not CloudinaryService.is_configured():
            return ""
        
        transformation = {"quality": quality}
        
        if width:
            transformation["width"] = width
        if height:
            transformation["height"] = height
        if format:
            transformation["fetch_format"] = format
            
        # Crop intelligent si dimensions spécifiées
        if width and height:
            transformation["crop"] = "fill"
            transformation["gravity"] = "auto"
        
        url = cloudinary.CloudinaryImage(public_id).build_url(**transformation)
        return url


# Instance singleton
cloudinary_service = CloudinaryService()
