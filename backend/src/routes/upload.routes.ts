/**
 * Routes pour les uploads de fichiers
 */

import { Router } from "express";
import { UploadController } from "../controllers/UploadController";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { validateProfileUpload } from "../middlewares/validateFileUpload";
import { FileUploadService } from "../services/FileUploadService";

const router = Router();

// Middleware d'authentification pour toutes les routes d'upload
router.use(authenticateJwt);

/**
 * POST /api/upload/profile-photo
 * Upload d'une photo de profil
 */
router.post(
  "/profile-photo",
  FileUploadService.getProfileUpload().single("photo"),
  validateProfileUpload,
  UploadController.uploadProfilePhoto
);

/**
 * POST /api/upload/event-media
 * Upload de médias pour un événement (image, bannière, vidéo)
 * Champs possibles: imageUrl, bannerImage, videoUrl
 */
router.post(
  "/event-media",
  FileUploadService.getEventUpload().fields([
    { name: "imageUrl", maxCount: 1 },
    { name: "bannerImage", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 },
  ]),
  UploadController.uploadEventMedia
);

/**
 * DELETE /api/upload/:type/:filename
 * Suppression d'un fichier uploadé
 * :type = "profile" ou "event"
 * :filename = nom du fichier
 */
router.delete("/:type/:filename", UploadController.deleteFile);

export default router;
