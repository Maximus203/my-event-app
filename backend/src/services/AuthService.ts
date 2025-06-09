/**
 * AuthService : logique métier pour l'authentification
 * Inscription (hash password avec bcrypt) et connexion (vérification + génération JWT)
 */

import bcrypt from "bcryptjs";
import { LoginUserDto } from "../dtos/LoginUserDto";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { UpdateUserDto } from "../dtos/UpdateUserDto";
import { UserRepo } from "../repositories/UserRepository";
import { generateToken } from "../utils/JwtUtils";
import { Logger } from "../utils/Logger";

export class AuthService {
  private static logger = Logger.getInstance();

  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(userData: RegisterUserDto) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await UserRepo.findByEmail(userData.email);
      if (existingUser) {
        throw new Error("Un utilisateur avec cet email existe déjà");
      }

      // Hasher le mot de passe
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds); // Créer l'utilisateur avec les nouveaux champs
      const user = await UserRepo.createUser(
        userData.email,
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.photo
      );
      this.logger.log("info", "Utilisateur créé avec succès", {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }); // Générer le token JWT
      const token = generateToken(user.id, user.email);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.photo,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      this.logger.log("error", "Erreur lors de l'inscription", {
        error: error instanceof Error ? error.message : String(error),
        email: userData.email,
      });
      throw error;
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  static async login(loginData: LoginUserDto) {
    try {
      // Rechercher l'utilisateur
      const user = await UserRepo.findByEmail(loginData.email);
      if (!user) {
        throw new Error("Email ou mot de passe incorrect");
      }

      // Vérifier le mot de passe
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Email ou mot de passe incorrect");
      }

      this.logger.log("info", "Connexion réussie", {
        userId: user.id,
        email: user.email,
      });

      // Générer le token JWT
      const token = generateToken(user.id, user.email);
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          photo: user.photo,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      this.logger.log("error", "Erreur lors de la connexion", {
        error: error instanceof Error ? error.message : String(error),
        email: loginData.email,
      });
      throw error;
    }
  }

  /**
   * Récupérer les informations d'un utilisateur par son ID
   */
  static async getUserById(userId: string) {
    try {
      const user = await UserRepo.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        photo: user.photo,
        createdAt: user.createdAt,
      };
    } catch (error) {
      this.logger.log(
        "error",
        "Erreur lors de la récupération de l'utilisateur",
        {
          error: error instanceof Error ? error.message : String(error),
          userId,
        }
      );
      throw error;
    }
  }

  /**
   * Mettre à jour les informations d'un utilisateur
   */
  static async updateUser(userId: string, updateData: UpdateUserDto) {
    try {
      const user = await UserRepo.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Mettre à jour les champs fournis
      if (updateData.email) {
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        const existingUser = await UserRepo.findByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          throw new Error("Cet email est déjà utilisé");
        }
        user.email = updateData.email;
      }

      if (updateData.firstName) {
        user.firstName = updateData.firstName;
      }

      if (updateData.lastName) {
        user.lastName = updateData.lastName;
      }

      if (updateData.photo) {
        user.photo = updateData.photo;
      }

      const updatedUser = await UserRepo.updateUser(user);

      this.logger.log("info", "Profil utilisateur mis à jour avec succès", {
        userId: updatedUser.id,
        email: updatedUser.email,
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        photo: updatedUser.photo,
        createdAt: updatedUser.createdAt,
      };
    } catch (error) {
      this.logger.log("error", "Erreur lors de la mise à jour de l'utilisateur", {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      throw error;
    }
  }
}
