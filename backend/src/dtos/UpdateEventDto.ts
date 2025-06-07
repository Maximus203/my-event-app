/**
 * UpdateEventDto : DTO pour la mise à jour d'un événement
 */

import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from "class-validator";

export class UpdateEventDto {
  @IsOptional()
  @IsString({ message: "Le titre doit être une chaîne" })
  title?: string;

  @IsOptional()
  @IsString({ message: "La description doit être une chaîne" })
  description?: string;

  @IsOptional()
  @IsDateString({}, { message: "La date doit être au format ISO" })
  date?: string;

  @IsOptional()
  @IsString({ message: "Le lieu doit être une chaîne" })
  location?: string;

  @IsOptional()
  @IsNumber(
    {},
    { message: "Le nombre maximum de participants doit être un nombre" }
  )
  @Min(1, { message: "Le nombre maximum de participants doit être au moins 1" })
  maxParticipants?: number;
}
