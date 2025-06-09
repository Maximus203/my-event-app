/**
 * UpdateUserDto : DTO pour la mise à jour d'un utilisateur
 */

import { IsEmail, IsOptional, IsString, IsUrl, Matches, ValidateIf } from "class-validator";
import { FileSize } from "../validators/FileSize";
import { FileType, IMAGE_TYPES } from "../validators/FileType";

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: "Email invalide" })
  email?: string;

  @IsOptional()
  @IsString({ message: "Le prénom doit être une chaîne" })
  firstName?: string;

  @IsOptional()
  @IsString({ message: "Le nom doit être une chaîne" })
  lastName?: string;
  @IsOptional()
  @ValidateIf((o) => o.photo !== undefined && o.photo !== null && o.photo !== "")
  @IsUrl({}, { message: "L'URL de la photo doit être une URL valide" })
  @FileType(IMAGE_TYPES, { message: "La photo doit être un fichier image valide (jpg, jpeg, png, gif, webp)" })
  @FileSize(50, { message: "La photo ne doit pas dépasser 50 Mo" })
  @Matches(
    /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
    { message: "L'URL de la photo doit pointer vers un fichier image valide (jpg, jpeg, png, gif, webp)" }
  )
  photo?: string;
}
