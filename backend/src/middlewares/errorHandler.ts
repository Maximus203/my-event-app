/**
 * Middleware errorHandler global : intercepte les erreurs non gérées
 * Renvoie JSON standardisé { success: false, message, errors }
 */

import { NextFunction, Request, Response } from "express";
import { Logger } from "../utils/Logger";
import { ResponseFormatter } from "../utils/ResponseFormatter";

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
  let errors: any[] = [];

  if (error.status || error.statusCode) {
    statusCode = error.status || error.statusCode;
  }

  if (error.message) {
    message = error.message;
  }

  // Erreurs spécifiques avec codes de statut appropriés
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Erreur de validation des données";
    errors = error.details || [error.message];
  } else if (error.name === "CastError") {
    statusCode = 400;
    message = "Format de données invalide";
    errors = [{ field: error.path, value: error.value }];
  } else if (error.name === "UnauthorizedError" || error.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Accès non autorisé - Token invalide";
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expiré";
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
    message = "Accès interdit";
  } else if (error.code === "ECONNREFUSED") {
    statusCode = 503;
    message = "Service temporairement indisponible";
  } else if (error.code === "ENOTFOUND") {
    statusCode = 502;
    message = "Service externe non disponible";
  } else if (error.code === "ETIMEDOUT") {
    statusCode = 504;
    message = "Timeout de la requête";
  }

  // En développement, inclure plus de détails dans les erreurs
  const isDevelopment = process.env.NODE_ENV === "development" || process.env.DEBUG_BACKEND === "true";
  
  if (isDevelopment) {
    errors.push({
      stack: error.stack,
      originalError: {
        name: error.name,
        message: error.message,
        code: error.code
      },
      requestInfo: {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        params: req.params,
        query: req.query
      }
    });
  }

  // Utiliser ResponseFormatter pour une réponse standardisée
  ResponseFormatter.error(res, message, statusCode, errors);
}
