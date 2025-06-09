/**
 * Middleware de validation pour les uploads de fichiers
 * Complète les validations des DTOs pour s'assurer que les fichiers respectent les contraintes
 */

import { NextFunction, Request, Response } from 'express';
import { Logger } from '../utils/Logger';
import { ResponseFormatter } from '../utils/ResponseFormatter';

const logger = Logger.getInstance();

// Tailles maximales autorisées (en bytes)
const MAX_SIZES = {
  profile: 50 * 1024 * 1024, // 50 Mo pour les photos de profil
  event: 50 * 1024 * 1024,   // 50 Mo pour les médias d'événements
};

// Types MIME autorisés
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ],
  videos: [
    'video/mp4',
    'video/avi',
    'video/x-msvideo',
    'video/quicktime',
    'video/x-ms-wmv',
    'video/webm'
  ]
};

/**
 * Valide les fichiers uploadés selon le type d'upload
 */
export const validateFileUpload = (uploadType: 'profile' | 'event') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined;
      
      if (!files) {
        return next(); // Pas de fichiers, on continue
      }

      const maxSize = MAX_SIZES[uploadType];
      const allMimeTypes = [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.videos];
      
      // Fonction pour valider un fichier
      const validateFile = (file: Express.Multer.File): string | null => {
        // Vérification de la taille
        if (file.size > maxSize) {
          return `Le fichier "${file.originalname}" dépasse la taille maximale autorisée de ${maxSize / (1024 * 1024)} Mo`;
        }

        // Vérification du type MIME
        if (!allMimeTypes.includes(file.mimetype)) {
          return `Le type de fichier "${file.mimetype}" n'est pas autorisé pour "${file.originalname}"`;
        }

        // Vérifications spécifiques selon le type d'upload
        if (uploadType === 'profile') {
          // Pour les photos de profil, seules les images sont autorisées
          if (!ALLOWED_MIME_TYPES.images.includes(file.mimetype)) {
            return `Seules les images sont autorisées pour les photos de profil`;
          }
        }

        return null; // Fichier valide
      };

      // Traitement selon le format des fichiers reçus
      if (Array.isArray(files)) {
        // Format: Express.Multer.File[]
        for (const file of files) {
          const error = validateFile(file);
          if (error) {
            logger.log('error', 'Fichier rejeté lors de l\'upload', {
              filename: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
              error
            });
            ResponseFormatter.error(res, error, 400);
            return;
          }
        }
      } else {
        // Format: { [fieldname: string]: Express.Multer.File[] }
        for (const fieldname in files) {
          const fieldFiles = files[fieldname];
          for (const file of fieldFiles) {
            const error = validateFile(file);
            if (error) {
              logger.log('error', 'Fichier rejeté lors de l\'upload', {
                fieldname,
                filename: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                error
              });
              ResponseFormatter.error(res, error, 400);
              return;
            }
          }
        }
      }

      logger.log('info', 'Fichiers validés avec succès', {
        uploadType,
        fileCount: Array.isArray(files) ? files.length : Object.keys(files).length
      });

      next();
    } catch (error) {
      logger.log('error', 'Erreur lors de la validation des fichiers', {
        error: error instanceof Error ? error.message : String(error),
        uploadType
      });
      
      ResponseFormatter.error(res, 'Erreur lors de la validation des fichiers', 500);
    }
  };
};

/**
 * Middleware spécifique pour les uploads de photos de profil
 */
export const validateProfileUpload = validateFileUpload('profile');

/**
 * Middleware spécifique pour les uploads de médias d'événements
 */
export const validateEventUpload = validateFileUpload('event');
