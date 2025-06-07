/**
 * AuthController : méthodes register et login
 * Formatage de la réponse JSON avec ResponseFormatter
 */

import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { LoginUserDto } from "../dtos/LoginUserDto";
import { ResponseFormatter } from "../utils/ResponseFormatter";
import { Logger } from "../utils/Logger";

export class AuthController {
  private static logger = Logger.getInstance();
  /**
   * Inscription d'un nouvel utilisateur
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterUserDto = req.body;

      // Le DTO sera validé par le middleware validateDto
      const result = await AuthService.register(userData);

      AuthController.logger.log("info", "Inscription réussie via API", {
        email: userData.email,
        userId: result.user.id,
      });

      ResponseFormatter.success(res, result, "Inscription réussie", 201);
    } catch (error) {
      AuthController.logger.log("error", "Erreur d'inscription via API", {
        error: error instanceof Error ? error.message : String(error),
        email: req.body?.email,
      });

      const message =
        error instanceof Error ? error.message : "Erreur lors de l'inscription";
      ResponseFormatter.error(res, message, 400);
    }
  }
  /**
   * Connexion d'un utilisateur
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginUserDto = req.body;

      // Le DTO sera validé par le middleware validateDto
      const result = await AuthService.login(loginData);

      AuthController.logger.log("info", "Connexion réussie via API", {
        email: loginData.email,
        userId: result.user.id,
      });

      ResponseFormatter.success(res, result, "Connexion réussie");
    } catch (error) {
      AuthController.logger.log("error", "Erreur de connexion via API", {
        error: error instanceof Error ? error.message : String(error),
        email: req.body?.email,
      });

      const message =
        error instanceof Error ? error.message : "Erreur lors de la connexion";
      ResponseFormatter.error(res, message, 401);
    }
  }
  /**
   * Récupérer le profil de l'utilisateur connecté
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // L'ID utilisateur est ajouté par le middleware authenticateJwt
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }

      const user = await AuthService.getUserById(userId);

      ResponseFormatter.success(res, user, "Profil récupéré avec succès");
    } catch (error) {
      AuthController.logger.log(
        "error",
        "Erreur lors de la récupération du profil",
        {
          error: error instanceof Error ? error.message : String(error),
          userId: (req as any).user?.userId,
        }
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération du profil";
      ResponseFormatter.error(res, message, 404);
    }
  }
}
