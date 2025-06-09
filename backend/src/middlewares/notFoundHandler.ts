/**
 * Middleware pour gérer les routes non trouvées (404)
 */

import { NextFunction, Request, Response } from "express";
import { Logger } from "../utils/Logger";
import { ResponseFormatter } from "../utils/ResponseFormatter";

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const logger = Logger.getInstance();
  
  logger.log("info", "Route non trouvée", {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent")
  });

  ResponseFormatter.error(
    res,
    `Route ${req.method} ${req.originalUrl} non trouvée`,
    404,
    [{
      requestedRoute: req.originalUrl,
      method: req.method,
      availableRoutes: [
        "GET /",
        "GET /api/health",
        "POST /api/auth/register",
        "POST /api/auth/login",
        "GET /api/auth/profile",
        "GET /api/events",
        "POST /api/events",
        "GET /api/events/:id",
        "PUT /api/events/:id",
        "DELETE /api/events/:id",
        "POST /api/events/:id/subscribe",
        "POST /api/events/:id/unsubscribe",
        "GET /api/events/:id/participants",
        "POST /api/upload/profile-photo",
        "POST /api/upload/event-media",
        "DELETE /api/upload/:type/:filename",
        "POST /api/email/test-connection",
        "POST /api/email/send-test",
        "GET /api/email/cron/status",
        "POST /api/email/cron/start",
        "POST /api/email/cron/stop",
        "POST /api/email/cron/manual-run",
        "POST /api/email/test-reminder/:eventId"
      ]
    }]
  );
}