/**
 * Point d'entrée principal du serveur Express
 * Inclut la connexion à la base de données, les routes et middlewares
 */

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import { AppDataSource } from "./config/database";
import { errorHandler } from "./middlewares/errorHandler";
import authRoutes from "./routes/auth.routes";
import eventRoutes from "./routes/event.routes";
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
    const PORT = process.env.PORT || 3000;

    // Middlewares globaux
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined"));

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/events", eventRoutes);

    // Route de santé pour tester
    app.get("/api/health", (req, res) => {
      logger.log("info", "Route /api/health appelée");
      ResponseFormatter.success(
        res,
        {
          status: "ok",
          timestamp: new Date().toISOString(),
          database: "connected",
        },
        "Backend My Event est fonctionnel !"
      );
    });

    // Route par défaut
    app.get("/", (req, res) => {
      ResponseFormatter.success(res, null, "API My Event - ça marche ❤️‍🔥 !");
    });

    // Middleware de gestion d'erreurs (doit être en dernier)
    app.use(errorHandler);

    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.log("info", `🚀 Serveur backend démarré sur le port ${PORT}`);
      logger.log("info", `📡 API Health: http://localhost:${PORT}/api/health`);
      logger.log("info", `🔐 Auth routes: http://localhost:${PORT}/api/auth`);
      logger.log(
        "info",
        `📅 Event routes: http://localhost:${PORT}/api/events`
      );
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
