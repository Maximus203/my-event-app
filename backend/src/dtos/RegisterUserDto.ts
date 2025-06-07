/**
 * RegisterUserDto : DTO pour l'inscription d'un utilisateur
 * Inclut email, password, firstName, lastName et photo (optionnelle)
 */

import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class RegisterUserDto {
  @IsEmail({}, { message: "Email invalide" })
  email: string;

  @IsString({ message: "Le mot de passe doit être une chaîne" })
  @MinLength(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères",
  })
  password: string;

  @IsString({ message: "Le prénom doit être une chaîne" })
  firstName: string;

  @IsString({ message: "Le nom doit être une chaîne" })
  lastName: string;

  @IsOptional()
  @IsString({ message: "La photo doit être au bon format" })
  photo?: string;
}
