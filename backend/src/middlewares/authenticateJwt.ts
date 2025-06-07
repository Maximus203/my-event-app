/**
 * Middleware authenticateJwt : vérifie le header Authorization
 * Décode JWT (jsonwebtoken), ajoute req.user ou renvoie 401
 */

import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/JwtUtils";
import { ResponseFormatter } from "../utils/ResponseFormatter";
import { Logger } from "../utils/Logger";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authenticateJwt(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const logger = Logger.getInstance();

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      ResponseFormatter.error(res, "Token d'authentification manquant", 401);
      return;
    } // Vérifier le format "Bearer <token>"
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      ResponseFormatter.error(
        res,
        "Format de token invalide. Utilisez: Bearer <token>",
        401
      );
      return;
    }

    const token = tokenParts[1];

    // Vérifier et décoder le token
    const payload = verifyToken(token);
    if (!payload) {
      ResponseFormatter.error(res, "Token invalide ou expiré", 401);
      return;
    }

    // Ajouter les informations utilisateur à la requête
    req.user = {
      userId: payload.userId,
      email: payload.email,
    };

    logger.log("debug", "Authentification JWT réussie", {
      userId: payload.userId,
      email: payload.email,
      route: req.originalUrl,
      method: req.method,
    });

    next();
  } catch (error) {
    logger.log("error", "Erreur lors de l'authentification JWT", {
      error: error instanceof Error ? error.message : String(error),
      route: req.originalUrl,
      method: req.method,
    });

    ResponseFormatter.error(res, "Erreur d'authentification", 401);
  }
}
