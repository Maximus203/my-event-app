/**
 * Routes pour la gestion des emails et notifications
 */

import { Request, Response, Router } from "express";
import { CronService } from "../services/CronService";
import { EmailService } from "../services/EmailService";
import { Logger } from "../utils/Logger";
import { ResponseFormatter } from "../utils/ResponseFormatter";

const router = Router();
const emailService = EmailService.getInstance();
const cronService = CronService.getInstance();
const logger = Logger.getInstance();

/**
 * POST /api/email/test-connection
 * Teste la connexion SMTP
 */
router.post("/test-connection", async (req: Request, res: Response) => {
  try {
    logger.log("info", "Test de connexion email demandé");
    
    const result = await emailService.testEmailConnection();
    
    if (result) {
      return ResponseFormatter.success(res, {
        connected: true,
        message: "Connexion email fonctionnelle"
      }, "Test de connexion email réussi");
    } else {
      return ResponseFormatter.error(res, "Échec du test de connexion email", 500);
    }
  } catch (error) {
    logger.log("error", "Erreur lors du test de connexion email", {
      error: error instanceof Error ? error.message : String(error)
    });
    return ResponseFormatter.error(res, "Erreur lors du test de connexion", 500);
  }
});

/**
 * POST /api/email/send-test
 * Envoie un email de test
 */
router.post("/send-test", async (req: Request, res: Response) => {
  try {
    const { to, type } = req.body;

    if (!to || !type) {
      return ResponseFormatter.error(res, "Email destinataire et type requis", 400);
    }

    if (!["confirmation", "reminder"].includes(type)) {
      return ResponseFormatter.error(res, "Type d'email invalide (confirmation ou reminder)", 400);
    }

    logger.log("info", "Envoi d'email de test demandé", { to, type });    const testEmailData = {
      to,
      eventTitle: "Événement de test - My Event",
      eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
      eventId: "test-uuid-123"
    };

    let result = false;

    if (type === "confirmation") {
      result = await emailService.sendConfirmationEmail(testEmailData);
    } else if (type === "reminder") {
      result = await emailService.sendReminderEmail(testEmailData);
    }

    if (result) {
      return ResponseFormatter.success(res, {
        sent: true,
        type,
        to
      }, `Email de test (${type}) envoyé avec succès`);
    } else {
      return ResponseFormatter.error(res, `Échec de l'envoi de l'email de test (${type})`, 500);
    }

  } catch (error) {
    logger.log("error", "Erreur lors de l'envoi d'email de test", {
      error: error instanceof Error ? error.message : String(error)
    });
    return ResponseFormatter.error(res, "Erreur lors de l'envoi de l'email de test", 500);
  }
});

/**
 * GET /api/email/cron/status
 * Obtient le statut du service cron
 */
router.get("/cron/status", async (req: Request, res: Response) => {
  try {
    const status = cronService.getServiceStatus();
    
    return ResponseFormatter.success(res, status, "Statut du service cron récupéré");
  } catch (error) {
    logger.log("error", "Erreur lors de la récupération du statut cron", {
      error: error instanceof Error ? error.message : String(error)
    });
    return ResponseFormatter.error(res, "Erreur lors de la récupération du statut", 500);
  }
});

/**
 * POST /api/email/cron/start
 * Démarre le service cron
 */
router.post("/cron/start", async (req: Request, res: Response) => {
  try {
    cronService.startReminderService();
    
    return ResponseFormatter.success(res, {
      started: true,
      schedule: "Tous les jours à 9h00"
    }, "Service de rappel démarré");
  } catch (error) {
    logger.log("error", "Erreur lors du démarrage du service cron", {
      error: error instanceof Error ? error.message : String(error)
    });
    return ResponseFormatter.error(res, "Erreur lors du démarrage du service", 500);
  }
});

/**
 * POST /api/email/cron/stop
 * Arrête le service cron
 */
router.post("/cron/stop", async (req: Request, res: Response) => {
  try {
    cronService.stopReminderService();
    
    return ResponseFormatter.success(res, {
      stopped: true
    }, "Service de rappel arrêté");
  } catch (error) {
    logger.log("error", "Erreur lors de l'arrêt du service cron", {
      error: error instanceof Error ? error.message : String(error)
    });
    return ResponseFormatter.error(res, "Erreur lors de l'arrêt du service", 500);
  }
});

/**
 * POST /api/email/cron/manual-run
 * Exécute manuellement l'envoi des rappels
 */
router.post("/cron/manual-run", async (req: Request, res: Response) => {
  try {
    logger.log("info", "Exécution manuelle des rappels demandée");
    
    const result = await cronService.manualReminderExecution();
    
    if (result.success) {
      return ResponseFormatter.success(res, result, "Rappels exécutés manuellement");
    } else {
      return ResponseFormatter.error(res, result.message, 500);
    }
  } catch (error) {
    logger.log("error", "Erreur lors de l'exécution manuelle des rappels", {
      error: error instanceof Error ? error.message : String(error)
    });
    return ResponseFormatter.error(res, "Erreur lors de l'exécution manuelle", 500);
  }
});

/**
 * POST /api/email/test-reminder/:eventId
 * Teste l'envoi de rappels pour un événement spécifique
 */
router.post("/test-reminder/:eventId", async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    
    if (!eventId) {
      return ResponseFormatter.error(res, "ID d'événement requis", 400);
    }

    logger.log("info", "Test de rappel pour événement spécifique", { eventId });
    
    const result = await cronService.testReminderForEvent(eventId);
    
    if (result.success) {
      return ResponseFormatter.success(res, result, `Test de rappel pour l'événement ${eventId}`);
    } else {
      return ResponseFormatter.error(res, result.message, 400);
    }
  } catch (error) {
    logger.log("error", "Erreur lors du test de rappel pour événement", {
      error: error instanceof Error ? error.message : String(error)
    });
    return ResponseFormatter.error(res, "Erreur lors du test de rappel", 500);
  }
});

export { router as emailRoutes };
