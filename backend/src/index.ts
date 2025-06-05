/**
 * Point d'entrée Express simple pour le "Hello World"
 */

import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import "reflect-metadata";
import { Logger } from "./utils/Logger";
import { ResponseFormatter } from "./utils/ResponseFormatter";

// Charger .env
dotenv.config();

async function bootstrap() {
  const logger = Logger.getInstance();

  try {
    // Créer l'app Express
    const app = express();
    const PORT = process.env.PORT || 5000;

    // Middlewares
    app.use(helmet());
    app.use(cors());
    app.use(express.json());
    app.use(morgan("combined"));

    // Route de santé pour tester
    app.get("/api/health", (req, res) => {
      logger.log("info", "Route /api/health appelée");
      res.json(ResponseFormatter.success(
        { status: "ok", timestamp: new Date().toISOString() },
        "Backend My Event est fonctionnel !"
      ));
    });

    // Route par défaut
    app.get("/", (req, res) => {
      res.json(ResponseFormatter.success(
        null,
        "API My Event - ça marche ❤️‍🔥 !"
      ));
    });

    // Démarrer le serveur
    app.listen(PORT, () => {
      logger.log("info", `Serveur backend démarré sur le port ${PORT}`);
      logger.log("info", `API Health: http://localhost:${PORT}/api/health`);
    });

  } catch (err: any) {
    const logger = Logger.getInstance();
    logger.log("error", "Erreur lors du démarrage du serveur", { error: err.message });
    process.exit(1);
  }
}

bootstrap();

