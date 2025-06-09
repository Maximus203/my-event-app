/**
 * CreateEventDto : DTO pour la création d'un événement
 */

import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  ValidateIf
} from "class-validator";
import { FileSize } from "../validators/FileSize";
import { FileType, IMAGE_TYPES, VIDEO_TYPES } from "../validators/FileType";

export class CreateEventDto {
  @IsString({ message: "Le titre doit être une chaîne" })
  title: string;

  @IsOptional()
  @IsString({ message: "La description doit être une chaîne" })
  description?: string;

  @IsDateString({}, { message: "La date doit être au format ISO" })
  date: string;

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
  @IsOptional()
  @ValidateIf((o) => o.imageUrl !== undefined && o.imageUrl !== null && o.imageUrl !== "")
  @IsUrl({}, { message: "L'URL de l'image doit être une URL valide" })
  @FileType(IMAGE_TYPES, { message: "L'image doit être un fichier valide (jpg, jpeg, png, gif, webp)" })
  @FileSize(50, { message: "L'image ne doit pas dépasser 50 Mo" })
  @Matches(
    /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
    { message: "L'URL de l'image doit pointer vers un fichier image valide (jpg, jpeg, png, gif, webp)" }
  )
  imageUrl?: string;

  @IsOptional()
  @ValidateIf((o) => o.bannerImage !== undefined && o.bannerImage !== null && o.bannerImage !== "")
  @IsUrl({}, { message: "L'URL de la bannière doit être une URL valide" })
  @FileType(IMAGE_TYPES, { message: "La bannière doit être un fichier image valide (jpg, jpeg, png, gif, webp)" })
  @FileSize(50, { message: "La bannière ne doit pas dépasser 50 Mo" })
  @Matches(
    /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i,
    { message: "L'URL de la bannière doit pointer vers un fichier image valide (jpg, jpeg, png, gif, webp)" }
  )
  bannerImage?: string;

  @IsOptional()
  @ValidateIf((o) => o.videoUrl !== undefined && o.videoUrl !== null && o.videoUrl !== "")
  @IsUrl({}, { message: "L'URL de la vidéo doit être une URL valide" })
  @FileType(VIDEO_TYPES, { message: "La vidéo doit être un fichier valide (mp4, avi, mov, wmv, webm)" })
  @FileSize(50, { message: "La vidéo ne doit pas dépasser 50 Mo" })
  @Matches(
    /^https?:\/\/.+\.(mp4|avi|mov|wmv|webm)(\?.*)?$/i,
    { message: "L'URL de la vidéo doit pointer vers un fichier vidéo valide (mp4, avi, mov, wmv, webm)" }
  )
  videoUrl?: string;
}
