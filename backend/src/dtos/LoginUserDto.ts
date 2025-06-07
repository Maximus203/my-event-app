/**
 * LoginUserDto : DTO pour la connexion d'un utilisateur
 */

import { IsEmail, IsString, Min } from "class-validator";

export class LoginUserDto {
  @IsEmail({}, { message: "Email invalide" })
  email: string;

  @IsString({ message: "Le mot de passe doit être une chaîne" })
  password: string;
}
