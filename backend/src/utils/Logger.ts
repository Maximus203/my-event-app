/**
 * Logger (Singleton) : gère les logs en fonction de DEBUG_BACKEND.
 * Si DEBUG_BACKEND=true, affiche des logs "debug" ; sinon, seulement info et error.
 */

type LogLevel = "debug" | "info" | "error";

export class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    if (level === "debug" && process.env.DEBUG_BACKEND !== "true") {
      return;
    }
    const logObject: any = { timestamp, level, message };
    if (meta) logObject.meta = meta;
    console.log(JSON.stringify(logObject));
  }
}
