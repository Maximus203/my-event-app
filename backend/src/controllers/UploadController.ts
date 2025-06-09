/**
 * UploadController : gestion des endpoints d'upload de fichiers
 */

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { FileUploadService } from "../services/FileUploadService";
import { Logger } from "../utils/Logger";
import { ResponseFormatter } from "../utils/ResponseFormatter";

export class UploadController {
  private static logger = Logger.getInstance();
  /**
   * Upload d'une photo de profil
   */
  static async uploadProfilePhoto(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        ResponseFormatter.error(res, "Aucun fichier fourni", 400);
        return;
      }

      const userId = (req as any).user?.userId;
      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }

      // Générer l'URL du fichier
      const fileUrl = FileUploadService.getFileUrl(req.file.filename, "profile");

      // Mettre à jour l'utilisateur avec l'URL de la photo
      try {
        await AuthService.updateUser(userId, { photo: fileUrl });
        
        UploadController.logger.log("info", "Photo de profil uploadée et utilisateur mis à jour", {
          userId,
          filename: req.file.filename,
          fileUrl,
        });
      } catch (updateError) {
        UploadController.logger.log("error", "Photo uploadée mais échec de mise à jour utilisateur", {
          userId,
          filename: req.file.filename,
          fileUrl,
          updateError: updateError instanceof Error ? updateError.message : String(updateError),
        });
      }

      ResponseFormatter.success(
        res,
        {
          filename: req.file.filename,
          url: fileUrl,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
        "Photo de profil uploadée avec succès"
      );
    } catch (error) {
      UploadController.logger.log("error", "Erreur lors de l'upload de la photo de profil", {
        error: error instanceof Error ? error.message : String(error),
        userId: (req as any).user?.userId,
      });

      const message = error instanceof Error ? error.message : "Erreur lors de l'upload";
      ResponseFormatter.error(res, message, 500);
    }
  }

  /**
   * Upload de médias pour un événement (image, bannière, vidéo)
   */
  static async uploadEventMedia(req: Request, res: Response): Promise<void> {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        ResponseFormatter.error(res, "Aucun fichier fourni", 400);
        return;
      }

      const userId = (req as any).user?.userId;
      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }      const uploadedFiles: { [key: string]: any } = {};
      
      // Traiter les fichiers uploadés
      if (Array.isArray(req.files)) {
        // Si les fichiers sont dans un tableau
        for (const file of req.files) {
          const fileUrl = FileUploadService.getFileUrl(file.filename, "event");
          uploadedFiles[file.fieldname] = {
            filename: file.filename,
            url: fileUrl,
            size: file.size,
            mimetype: file.mimetype,
          };
        }
      } else if (req.files) {
        // Si les fichiers sont organisés par fieldname
        for (const [fieldname, files] of Object.entries(req.files)) {
          if (Array.isArray(files)) {
            for (const file of files) {
              const fileUrl = FileUploadService.getFileUrl(file.filename, "event");
              uploadedFiles[fieldname] = {
                filename: file.filename,
                url: fileUrl,
                size: file.size,
                mimetype: file.mimetype,
              };
            }
          } else {
            const file = files as Express.Multer.File;
            const fileUrl = FileUploadService.getFileUrl(file.filename, "event");
            uploadedFiles[fieldname] = {
              filename: file.filename,
              url: fileUrl,
              size: file.size,
              mimetype: file.mimetype,
            };
          }
        }
      }

      UploadController.logger.log("info", "Médias d'événement uploadés avec succès", {
        userId,
        uploadedFiles: Object.keys(uploadedFiles),
      });

      ResponseFormatter.success(
        res,
        uploadedFiles,
        "Médias uploadés avec succès"
      );
    } catch (error) {
      UploadController.logger.log("error", "Erreur lors de l'upload des médias d'événement", {
        error: error instanceof Error ? error.message : String(error),
        userId: (req as any).user?.userId,
      });

      const message = error instanceof Error ? error.message : "Erreur lors de l'upload";
      ResponseFormatter.error(res, message, 500);
    }
  }

  /**
   * Suppression d'un fichier uploadé
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { filename, type } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }

      if (!filename || !type || !["profile", "event"].includes(type)) {
        ResponseFormatter.error(res, "Paramètres invalides", 400);
        return;
      }

      const deleted = await FileUploadService.deleteFile(filename, type as "profile" | "event");

      if (deleted) {
        UploadController.logger.log("info", "Fichier supprimé avec succès", {
          userId,
          filename,
          type,
        });

        ResponseFormatter.success(res, null, "Fichier supprimé avec succès");
      } else {
        ResponseFormatter.error(res, "Fichier introuvable", 404);
      }
    } catch (error) {
      UploadController.logger.log("error", "Erreur lors de la suppression du fichier", {
        error: error instanceof Error ? error.message : String(error),
        userId: (req as any).user?.userId,
        filename: req.params.filename,
        type: req.params.type,
      });

      const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
      ResponseFormatter.error(res, message, 500);
    }
  }
}
