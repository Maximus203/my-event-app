/**
 * Middleware errorHandler global : intercepte les erreurs non gérées
 * Renvoie JSON standardisé { success: false, message, errors }
 */

import { Request, Response, NextFunction } from "express";
import { ResponseFormatter } from "../utils/ResponseFormatter";
import { Logger } from "../utils/Logger";

export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const logger = Logger.getInstance();

  // Logger l'erreur avec le maximum de contexte
  logger.log("error", "Erreur non gérée capturée par errorHandler", {
    error: error.message || String(error),
    stack: error.stack,
    route: req.originalUrl,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  // Déterminer le status code et le message
  let statusCode = 500;
  let message = "Erreur interne du serveur";

  if (error.status || error.statusCode) {
    statusCode = error.status || error.statusCode;
  }

  if (error.message) {
    message = error.message;
  }

  // Erreurs spécifiques
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Erreur de validation des données";
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Format de données invalide";
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Accès non autorisé";
  } else if (error.code === "ECONNREFUSED") {
    statusCode = 503;
    message = "Service temporairement indisponible";
  }

  // En développement, inclure plus de détails
  const isDevelopment = process.env.NODE_ENV === "development";
  const errorDetails = isDevelopment
    ? [
        {
          stack: error.stack,
          originalError: error,
        },
      ]
    : undefined;
  ResponseFormatter.error(res, message, statusCode, errorDetails);
}
