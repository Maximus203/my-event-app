/**
 * Validateur personnalisé pour la taille des fichiers uploadés
 * Utilisé pour valider que les fichiers ne dépassent pas 50 Mo
 */

import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class FileSizeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    // Si la valeur est vide, on laisse les autres validateurs s'en occuper
    if (!value) return true;
    
    const [maxSizeInMB] = args.constraints;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    // Si c'est une URL (string), on considère qu'elle est valide pour la taille
    // (la validation de taille se fait côté multer lors de l'upload)
    if (typeof value === 'string') {
      return true;
    }
    
    // Si c'est un objet File (dans le cas d'un upload direct)
    if (value && typeof value === 'object' && 'size' in value) {
      return value.size <= maxSizeInBytes;
    }
    
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const [maxSizeInMB] = args.constraints;
    return `La taille du fichier ne doit pas dépasser ${maxSizeInMB} Mo`;
  }
}

export function FileSize(maxSizeInMB: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxSizeInMB],
      validator: FileSizeConstraint,
    });
  };
}
