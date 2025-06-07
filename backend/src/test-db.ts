/**
 * Test de la configuration de base de données
 */

import "reflect-metadata";
import dotenv from "dotenv";
import { AppDataSource } from "./config/database";
import { Logger } from "./utils/Logger";

// Charger les variables d'environnement
dotenv.config();

async function testDatabase() {
  const logger = Logger.getInstance();

  try {
    logger.log("info", "Tentative de connexion à la base de données...");

    // Initialiser la connexion
    await AppDataSource.initialize();
    logger.log("info", "✅ Connexion à la base de données réussie !");

    // Vérifier que les tables sont créées
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();

    logger.log(
      "info",
      `📊 Tables créées: ${tables.map((t) => t.name).join(", ")}`
    );

    await queryRunner.release();
    await AppDataSource.destroy();

    logger.log("info", "✅ Test de base de données terminé avec succès !");
  } catch (error) {
    logger.log("error", "❌ Erreur lors du test de base de données", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

testDatabase();
