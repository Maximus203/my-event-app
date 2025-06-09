/**
 * EmailService - Service centralisé pour l'envoi d'emails
 */

import { getConfirmationEmailTemplate, getReminderEmailTemplate, sendMail } from "../utils/EmailUtils";
import { Logger } from "../utils/Logger";

export interface EmailData {
  to: string;
  participantName?: string;
  eventTitle: string;
  eventDate: Date;
  eventId: string;
}

export class EmailService {
  private static instance: EmailService;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Envoie un email de confirmation d'inscription
   */
  async sendConfirmationEmail(emailData: EmailData): Promise<boolean> {
    try {
      this.logger.log("info", "Envoi d'email de confirmation", {
        eventId: emailData.eventId,
        to: emailData.to,
        eventTitle: emailData.eventTitle
      });

      const subject = `Confirmation d'inscription - ${emailData.eventTitle}`;
      const htmlContent = getConfirmationEmailTemplate(
        emailData.eventTitle,
        emailData.eventDate
      );

      const result = await sendMail(emailData.to, subject, htmlContent);

      if (result) {
        this.logger.log("info", "Email de confirmation envoyé avec succès", {
          eventId: emailData.eventId,
          to: emailData.to
        });
      } else {
        this.logger.log("error", "Échec de l'envoi de l'email de confirmation", {
          eventId: emailData.eventId,
          to: emailData.to
        });
      }

      return result;
    } catch (error) {
      this.logger.log("error", "Erreur lors de l'envoi de l'email de confirmation", {
        error: error instanceof Error ? error.message : String(error),
        eventId: emailData.eventId,
        to: emailData.to
      });
      return false;
    }
  }

  /**
   * Envoie un email de rappel (24h avant l'événement)
   */
  async sendReminderEmail(emailData: EmailData): Promise<boolean> {
    try {
      this.logger.log("info", "Envoi d'email de rappel", {
        eventId: emailData.eventId,
        to: emailData.to,
        eventTitle: emailData.eventTitle
      });

      const subject = `⏰ Rappel - ${emailData.eventTitle} dans 24h`;
      const htmlContent = getReminderEmailTemplate(
        emailData.eventTitle,
        emailData.eventDate
      );

      const result = await sendMail(emailData.to, subject, htmlContent);

      if (result) {
        this.logger.log("info", "Email de rappel envoyé avec succès", {
          eventId: emailData.eventId,
          to: emailData.to
        });
      } else {
        this.logger.log("error", "Échec de l'envoi de l'email de rappel", {
          eventId: emailData.eventId,
          to: emailData.to
        });
      }

      return result;
    } catch (error) {
      this.logger.log("error", "Erreur lors de l'envoi de l'email de rappel", {
        error: error instanceof Error ? error.message : String(error),
        eventId: emailData.eventId,
        to: emailData.to
      });
      return false;
    }
  }

  /**
   * Envoie des emails en lot
   */
  async sendBulkEmails(
    emailDataList: EmailData[],
    type: 'confirmation' | 'reminder'
  ): Promise<{ success: number; failed: number }> {
    let successCount = 0;
    let failedCount = 0;

    this.logger.log("info", `Début de l'envoi d'emails en lot (${type})`, {
      count: emailDataList.length
    });

    for (const emailData of emailDataList) {
      try {
        let result = false;
        
        if (type === 'confirmation') {
          result = await this.sendConfirmationEmail(emailData);
        } else if (type === 'reminder') {
          result = await this.sendReminderEmail(emailData);
        }

        if (result) {
          successCount++;
        } else {
          failedCount++;
        }

        // Délai entre les emails pour éviter de surcharger le serveur SMTP
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        failedCount++;
        this.logger.log("error", "Erreur lors de l'envoi d'email en lot", {
          error: error instanceof Error ? error.message : String(error),
          emailData
        });
      }
    }

    this.logger.log("info", `Envoi d'emails en lot terminé (${type})`, {
      success: successCount,
      failed: failedCount,
      total: emailDataList.length
    });

    return { success: successCount, failed: failedCount };
  }

  /**
   * Test de connectivité email
   */
  async testEmailConnection(): Promise<boolean> {
    try {
      this.logger.log("info", "Test de connectivité email");
      
      const testResult = await sendMail(
        process.env.EMAIL_USER || "test@example.com",
        "Test de connectivité - My Event",
        "<p>Ceci est un test de connectivité du service email de My Event.</p>"
      );

      this.logger.log("info", "Test de connectivité email terminé", {
        success: testResult
      });

      return testResult;
    } catch (error) {
      this.logger.log("error", "Erreur lors du test de connectivité email", {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
}
