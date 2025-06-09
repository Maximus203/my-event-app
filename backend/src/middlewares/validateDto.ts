/**
 * Middleware validateDto : transforme et valide le corps de la requête
 * Utilise class-transformer + class-validator
 */

import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { ResponseFormatter } from "../utils/ResponseFormatter";

export function validateDto(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transformer les données de la requête en instance de DTO
      const dto = plainToClass(dtoClass, req.body);

      // Valider le DTO
      const errors: ValidationError[] = await validate(dto);
      if (errors.length > 0) {
        // Formater les erreurs de validation
        const errorDetails = errors.map((error) => {
          const constraints = error.constraints;
          return {
            field: error.property,
            value: error.value,
            errors: constraints ? Object.values(constraints) : ["Erreur de validation"],
          };
        });

        const errorMessages = errorDetails.map((detail) => `${detail.field}: ${detail.errors.join(", ")}`);

        ResponseFormatter.error(res, `Erreurs de validation: ${errorMessages.join("; ")}`, 400, errorDetails);
        return;
      }

      // Si tout est valide, remplacer req.body par le DTO transformé
      req.body = dto;
      next();
    } catch (error) {
      ResponseFormatter.error(
        res,
        "Erreur lors de la validation des données",
        500,
        [{ error: error instanceof Error ? error.message : String(error) }]
      );
      return;
    }
  };
}
