/**
 * Middleware authenticateJwt : vérifie le header Authorization
 * Décode JWT (jsonwebtoken), ajoute req.user ou renvoie 401
 */

import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/JwtUtils";
import { Logger } from "../utils/Logger";
import { ResponseFormatter } from "../utils/ResponseFormatter";

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
      ResponseFormatter.error(
        res,
        "Token d'authentification manquant",
        401,
        [
          {
            error: "Authorization header required",
            format: "Bearer <token>",
            received: "null",
          },
        ]
      );
      return;
    }

    // Vérifier le format "Bearer <token>"
    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      ResponseFormatter.error(
        res,
        "Format de token invalide. Utilisez: Bearer <token>",
        401,
        [
          {
            error: "Invalid token format",
            expected: "Bearer <token>",
            received: authHeader,
          },
        ]
      );
      return;
    }

    const token = tokenParts[1];

    // Vérifier et décoder le token
    const payload = verifyToken(token);
    if (!payload) {
      ResponseFormatter.error(
        res,
        "Token invalide ou expiré",
        401,
        [
          {
            error: "JWT verification failed",
            token: token.substring(0, 20) + "...",
          },
        ]
      );
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

    ResponseFormatter.error(
      res,
      "Erreur d'authentification",
      401,
      [
        {
          error: error instanceof Error ? error.message : String(error),
          type: "JWT_AUTH_ERROR",
        },
      ]
    );
  }
}
