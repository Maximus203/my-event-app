/**
 * DataSource TypeORM (Singleton) pour SQLite.
 */

import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Event } from "../entities/Event";
import { Participant } from "../entities/Participant";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: process.env.DB_PATH || "./database.sqlite",
  synchronize: true, // Auto-création des tables en développement
  logging: process.env.DEBUG_BACKEND === "true",
  entities: [User, Event, Participant],
  migrations: [],
  subscribers: [],
});

export default AppDataSource;
