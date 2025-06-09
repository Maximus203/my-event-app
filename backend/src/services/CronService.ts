/**
 * CronService - Service pour les tâches programmées (rappels d'événements)
 */

import cron from "node-cron";
import { Between } from "typeorm";
import { AppDataSource } from "../config/database";
import { Event } from "../entities/Event";
import { Logger } from "../utils/Logger";
import { EmailData, EmailService } from "./EmailService";

export class CronService {
  private static instance: CronService;
  private logger: Logger;
  private emailService: EmailService;
  private reminderTask: cron.ScheduledTask | null = null;

  private constructor() {
    this.logger = Logger.getInstance();
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  /**
   * Démarre le service cron pour les rappels
   * S'exécute tous les jours à 9h00 pour envoyer les rappels 24h avant
   */
  startReminderService(): void {
    if (this.reminderTask) {
      this.logger.log("warn", "Service de rappel déjà démarré");
      return;
    }

    // Cron expression: "0 9 * * *" = tous les jours à 9h00
    this.reminderTask = cron.schedule("0 9 * * *", async () => {
      await this.sendDailyReminders();
    }, {
      scheduled: false,
      timezone: "Europe/Paris"
    });

    this.reminderTask.start();
    this.logger.log("info", "Service de rappel démarré - s'exécute tous les jours à 9h00");
  }

  /**
   * Arrête le service cron
   */
  stopReminderService(): void {
    if (this.reminderTask) {
      this.reminderTask.stop();
      this.reminderTask = null;
      this.logger.log("info", "Service de rappel arrêté");
    }
  }

  /**
   * Envoie les rappels quotidiens pour les événements dans 24h
   */
  async sendDailyReminders(): Promise<void> {
    try {
      this.logger.log("info", "Début de l'envoi des rappels quotidiens");

      if (!AppDataSource.isInitialized) {
        this.logger.log("error", "Base de données non initialisée pour l'envoi des rappels");
        return;
      }

      // Calculer la date de demain (24h)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Définir la plage horaire pour "demain" (de 00:00 à 23:59)
      const tomorrowStart = new Date(tomorrow);
      tomorrowStart.setHours(0, 0, 0, 0);
      
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(23, 59, 59, 999);      // Récupérer les événements qui ont lieu demain
      const eventRepository = AppDataSource.getRepository(Event);
      const eventsToRemind = await eventRepository.find({
        where: {
          date: Between(tomorrowStart, tomorrowEnd),
          isActive: true
        },
        relations: ["participants"]
      });

      this.logger.log("info", `${eventsToRemind.length} événement(s) trouvé(s) pour demain`, {
        date: tomorrow.toISOString().split('T')[0],
        eventIds: eventsToRemind.map(e => e.id)
      });

      let totalEmailsSent = 0;
      let totalEmailsFailed = 0;

      // Pour chaque événement, envoyer des rappels aux participants
      for (const event of eventsToRemind) {
        if (!event.participants || event.participants.length === 0) {
          this.logger.log("info", `Aucun participant pour l'événement ${event.id}`);
          continue;
        }

        const emailDataList: EmailData[] = event.participants.map(participant => ({
          to: participant.email,
          participantName: participant.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventId: event.id
        }));

        this.logger.log("info", `Envoi de rappels pour l'événement "${event.title}"`, {
          eventId: event.id,
          participantCount: emailDataList.length
        });

        const result = await this.emailService.sendBulkEmails(emailDataList, 'reminder');
        
        totalEmailsSent += result.success;
        totalEmailsFailed += result.failed;

        // Délai entre les événements
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      this.logger.log("info", "Envoi des rappels quotidiens terminé", {
        eventsProcessed: eventsToRemind.length,
        totalEmailsSent,
        totalEmailsFailed
      });

    } catch (error) {
      this.logger.log("error", "Erreur lors de l'envoi des rappels quotidiens", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Exécute manuellement l'envoi des rappels (pour les tests)
   */
  async manualReminderExecution(): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log("info", "Exécution manuelle des rappels demandée");
      await this.sendDailyReminders();
      return {
        success: true,
        message: "Rappels envoyés avec succès"
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.log("error", "Erreur lors de l'exécution manuelle des rappels", {
        error: errorMessage
      });
      return {
        success: false,
        message: `Erreur: ${errorMessage}`
      };
    }
  }

  /**
   * Obtient le statut du service cron
   */
  getServiceStatus(): { isRunning: boolean; nextExecution?: string } {
    if (!this.reminderTask) {
      return { isRunning: false };
    }

    return {
      isRunning: this.reminderTask.running,
      nextExecution: this.reminderTask.running ? "Tous les jours à 9h00" : undefined
    };
  }
  /**
   * Teste l'envoi d'un rappel pour un événement spécifique
   */
  async testReminderForEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log("info", "Test de rappel pour un événement spécifique", { eventId });

      if (!AppDataSource.isInitialized) {
        return {
          success: false,
          message: "Base de données non initialisée"
        };
      }

      const eventRepository = AppDataSource.getRepository(Event);
      const event = await eventRepository.findOne({
        where: { id: eventId, isActive: true },
        relations: ["participants"]
      });

      if (!event) {
        return {
          success: false,
          message: `Événement ${eventId} non trouvé ou inactif`
        };
      }

      if (!event.participants || event.participants.length === 0) {
        return {
          success: false,
          message: `Aucun participant pour l'événement ${eventId}`
        };
      }

      const emailDataList: EmailData[] = event.participants.map(participant => ({
        to: participant.email,
        participantName: participant.name,
        eventTitle: event.title,
        eventDate: event.date,
        eventId: event.id
      }));

      const result = await this.emailService.sendBulkEmails(emailDataList, 'reminder');

      return {
        success: true,
        message: `Rappels envoyés: ${result.success} succès, ${result.failed} échecs`
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.log("error", "Erreur lors du test de rappel", {
        error: errorMessage,
        eventId
      });
      return {
        success: false,
        message: `Erreur: ${errorMessage}`
      };
    }
  }
}
