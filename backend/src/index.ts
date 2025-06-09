/**
 * Point d'entrée principal du serveur Express
 * Inclut la connexion à la base de données, les routes et middlewares
 */

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import "reflect-metadata";
import { AppDataSource } from "./config/database";
import { errorHandler } from "./middlewares/errorHandler";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import authRoutes from "./routes/auth.routes";
import { emailRoutes } from "./routes/email";
import eventRoutes from "./routes/event.routes";
import uploadRoutes from "./routes/upload.routes";
import { CronService } from "./services/CronService";
import { Logger } from "./utils/Logger";
import { ResponseFormatter } from "./utils/ResponseFormatter";

// Charger .env
dotenv.config();

async function bootstrap() {
  const logger = Logger.getInstance();

  try {
    // Initialiser la base de données
    logger.log("info", "Initialisation de la base de données...");
    await AppDataSource.initialize();
    logger.log("info", "✅ Base de données connectée avec succès");

    // Créer l'app Express
    const app = express();
    const PORT = process.env.PORT || 5000;    // Middlewares globaux
    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(morgan("combined"));

    // Servir les fichiers statiques (uploads)
    app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

    // Routes principales
    app.use("/api/auth", authRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/email", emailRoutes);
    app.use("/api/upload", uploadRoutes);

    // Route de santé pour tester
    app.get("/api/health", (req, res) => {
      logger.log("info", "Route /api/health appelée");
      ResponseFormatter.success(
        res,
        {
          status: "ok",
          timestamp: new Date().toISOString(),
          database: "connected",
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || "development",
          version: "1.0.0"
        },
        "Backend My Event est fonctionnel !",
        200
      );
    });

    // Route par défaut
    app.get("/", (req, res) => {
      ResponseFormatter.success(
        res, 
        {
          name: "My Event API",
          version: "1.0.0",
          description: "API de gestion d'événements",          endpoints: {
            health: "/api/health",
            auth: "/api/auth/*",
            events: "/api/events/*",
            email: "/api/email/*",
            upload: "/api/upload/*",
            static: "/uploads/*"
          }
        }, 
        " Bienvenue API My Event !",
        200
      );
    });

    // Route pour tester différents codes de statut (uniquement en développement)
    if (process.env.NODE_ENV === "development" || process.env.DEBUG_BACKEND === "true") {
      app.get("/api/test-status/:code", (req, res) => {
        const code = parseInt(req.params.code);
        
        if (code >= 200 && code < 300) {
          ResponseFormatter.success(res, { testCode: code }, `Test du code ${code}`, code);
        } else if (code >= 300 && code < 400) {
          ResponseFormatter.redirect(res, "/api/health", `Test de redirection ${code}`, code);
        } else {
          ResponseFormatter.error(res, `Test du code d'erreur ${code}`, code, [{ testCode: code }]);
        }
      });
    }

    // Middleware pour les routes non trouvées (404) - AVANT errorHandler
    app.use(notFoundHandler);

    // Middleware de gestion d'erreurs (doit être en dernier)
    app.use(errorHandler);    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.log("info", `📍 API disponible sur: http://localhost:${PORT}`);
      
      // Démarrer le service cron pour les rappels d'événements
      try {
        const cronService = CronService.getInstance();
        cronService.startReminderService();
        logger.log("info", "🕐 Service de rappel automatique démarré");
      } catch (error) {
        logger.log("error", "Erreur lors du démarrage du service cron", {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    });
  } catch (err: any) {
    const logger = Logger.getInstance();
    logger.log("error", "❌ Erreur lors du démarrage du serveur", {
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
}

bootstrap();
