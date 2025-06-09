/**
 * FileUploadService : gestion des uploads de fichiers (images/vidéos)
 * Pour les photos de profil et les médias d'événements
 */

import { Request } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import { Logger } from "../utils/Logger";

export class FileUploadService {
  private static logger = Logger.getInstance();

  /**
   * Configuration du stockage pour les photos de profil
   */
  static getProfileStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../..", "uploads", "profiles");
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${extension}`);
      },
    });
  }

  /**
   * Configuration du stockage pour les médias d'événements
   */
  static getEventStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../..", "uploads", "events");
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        let prefix = "event";
        
        // Déterminer le préfixe selon le type de fichier
        if (file.fieldname === "bannerImage") {
          prefix = "banner";
        } else if (file.fieldname === "videoUrl") {
          prefix = "video";
        } else if (file.fieldname === "imageUrl") {
          prefix = "image";
        }
        
        cb(null, `${prefix}-${uniqueSuffix}${extension}`);
      },
    });
  }

  /**
   * Filtre pour valider les types de fichiers
   */
  static fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
    const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    const allowedVideoTypes = ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Types autorisés: ${allowedTypes.join(", ")}`));
    }
  }

  /**
   * Configuration pour les uploads de photos de profil
   */
  static getProfileUpload() {
    return multer({
      storage: this.getProfileStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 1, // Une seule photo de profil
      },
    });
  }

  /**
   * Configuration pour les uploads de médias d'événements
   */
  static getEventUpload() {
    return multer({
      storage: this.getEventStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max pour vidéos
        files: 3, // Image, bannière et vidéo
      },
    });
  }

  /**
   * Génère l'URL publique pour un fichier uploadé
   */
  static getFileUrl(filename: string, type: "profile" | "event"): string {
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    return `${baseUrl}/uploads/${type}s/${filename}`;
  }

  /**
   * Supprime un fichier du système de fichiers
   */
  static async deleteFile(filename: string, type: "profile" | "event"): Promise<boolean> {
    try {
      const filePath = path.join(__dirname, "../..", "uploads", `${type}s`, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log("info", "Fichier supprimé avec succès", { filename, type });
        return true;
      } else {
        this.logger.log("warning", "Fichier introuvable pour suppression", { filename, type });
        return false;
      }
    } catch (error) {
      this.logger.log("error", "Erreur lors de la suppression du fichier", {
        error: error instanceof Error ? error.message : String(error),
        filename,
        type,
      });
      return false;
    }
  }

  /**
   * Valide qu'un fichier uploadé existe et retourne son chemin
   */
  static validateUploadedFile(filename: string, type: "profile" | "event"): string | null {
    try {
      const filePath = path.join(__dirname, "../..", "uploads", `${type}s`, filename);
      
      if (fs.existsSync(filePath)) {
        return this.getFileUrl(filename, type);
      }
      
      return null;
    } catch (error) {
      this.logger.log("error", "Erreur lors de la validation du fichier", {
        error: error instanceof Error ? error.message : String(error),
        filename,
        type,
      });
      return null;
    }
  }

  /**
   * Nettoie les anciens fichiers (optionnel - pour une tâche cron)
   */
  static async cleanupOldFiles(olderThanDays: number = 30): Promise<void> {
    try {
      const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      const directories = [
        path.join(__dirname, "../..", "uploads", "profiles"),
        path.join(__dirname, "../..", "uploads", "events"),
      ];

      for (const dir of directories) {
        if (!fs.existsSync(dir)) continue;

        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.mtime.getTime() < cutoffDate) {
            fs.unlinkSync(filePath);
            this.logger.log("info", "Ancien fichier supprimé", { file, dir });
          }
        }
      }
    } catch (error) {
      this.logger.log("error", "Erreur lors du nettoyage des anciens fichiers", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
