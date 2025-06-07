/**
 * Middleware validateDto : transforme et valide le corps de la requête
 * Utilise class-transformer + class-validator
 */

import { Request, Response, NextFunction } from "express";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transformer les données de la requête en instance de DTO
      const dto = plainToClass(dtoClass, req.body);

      // Valider le DTO
      const errors: ValidationError[] = await validate(dto);
      if (errors.length > 0) {
        // Formater les erreurs de validation
        const errorMessages = errors.map((error) => {
          const constraints = error.constraints;
          if (constraints) {
            return Object.values(constraints).join(", ");
          }
          return "Erreur de validation";
        });

        res.status(400).json({
          success: false,
          message: `Erreurs de validation: ${errorMessages.join("; ")}`,
          data: null,
        });
        return;
      }

      // Si tout est valide, remplacer req.body par le DTO transformé
      req.body = dto;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la validation des données",
        data: null,
      });
      return;
    }
  };
}
