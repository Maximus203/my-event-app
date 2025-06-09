/**
 * UploadService : Service pour gérer les uploads de fichiers
 */

import { apiService } from './apiService';

export interface UploadResponse {
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

export interface EventMediaUploadResponse {
  [fieldname: string]: UploadResponse;
}

class UploadService {  /**
   * Upload d'une photo de profil
   */
  async uploadProfilePhoto(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiService.upload<UploadResponse>('/upload/profile-photo', formData);
    return response.data!;
  }

  /**
   * Upload de médias pour un événement
   * @param files - Object contenant les fichiers à uploader avec leurs noms de champs
   * @example
   * uploadEventMedia({
   *   imageUrl: file1,
   *   bannerImage: file2,
   *   videoUrl: file3
   * })
   */
  async uploadEventMedia(files: { [fieldname: string]: File }): Promise<EventMediaUploadResponse> {
    const formData = new FormData();
    
    // Ajouter chaque fichier avec son nom de champ
    Object.entries(files).forEach(([fieldname, file]) => {
      if (file) {
        formData.append(fieldname, file);
      }
    });

    const response = await apiService.upload<EventMediaUploadResponse>('/upload/event-media', formData);
    return response.data!;
  }

  /**
   * Upload d'une seule image d'événement
   */
  async uploadEventImage(file: File, type: 'imageUrl' | 'bannerImage' = 'imageUrl'): Promise<string> {
    const files = { [type]: file };
    const response = await this.uploadEventMedia(files);
    return response[type]?.url || '';
  }

  /**
   * Upload d'une vidéo d'événement
   */
  async uploadEventVideo(file: File): Promise<string> {
    const files = { videoUrl: file };
    const response = await this.uploadEventMedia(files);
    return response.videoUrl?.url || '';
  }

  /**
   * Suppression d'un fichier uploadé
   */
  async deleteFile(filename: string, type: 'profile' | 'event'): Promise<void> {
    await apiService.delete(`/upload/${type}/${filename}`);
  }

  /**
   * Valider qu'un fichier est une image
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 50 * 1024 * 1024; // 50 MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Type de fichier non supporté. Types autorisés: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)} MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Valider qu'un fichier est une vidéo
   */
  validateVideoFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
    const maxSize = 50 * 1024 * 1024; // 50 MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Type de fichier non supporté. Types autorisés: ${allowedTypes.join(', ')}`
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)} MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Obtenir une preview URL pour un fichier
   */
  getPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Libérer une preview URL
   */
  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const uploadService = new UploadService();
