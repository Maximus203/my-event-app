/**
 * Validateur personnalisé pour les types de fichiers
 * Utilisé pour valider les extensions et types MIME des fichiers
 */

import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class FileTypeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // Si la valeur est vide, on laisse les autres validateurs s'en occuper
    if (!value) return true;
    
    const [allowedTypes] = args.constraints;
    
    // Si c'est une URL (string), on vérifie l'extension
    if (typeof value === 'string') {
      const url = value.toLowerCase();
      return allowedTypes.some((type: string) => url.includes(`.${type}`));
    }
    
    // Si c'est un objet File (dans le cas d'un upload direct)
    if (value && typeof value === 'object' && 'mimetype' in value) {
      const mimeTypeMap: { [key: string]: string[] } = {
        'jpg': ['image/jpeg'],
        'jpeg': ['image/jpeg'],
        'png': ['image/png'],
        'gif': ['image/gif'],
        'webp': ['image/webp'],
        'mp4': ['video/mp4'],
        'avi': ['video/avi', 'video/x-msvideo'],
        'mov': ['video/quicktime'],
        'wmv': ['video/x-ms-wmv'],
        'webm': ['video/webm'],
      };
      
      const allowedMimeTypes = allowedTypes.flatMap((type: string) => mimeTypeMap[type] || []);
      return allowedMimeTypes.includes(value.mimetype);
    }
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const [allowedTypes] = args.constraints;
    return `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`;
  }
}

export function FileType(allowedTypes: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [allowedTypes],
      validator: FileTypeConstraint,
    });
  };
}

// Constantes pour les types de fichiers couramment utilisés
export const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
export const VIDEO_TYPES = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
export const MEDIA_TYPES = [...IMAGE_TYPES, ...VIDEO_TYPES];
