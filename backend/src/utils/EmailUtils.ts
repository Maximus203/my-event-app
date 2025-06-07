/**
 * EmailUtils : configure nodemailer (SMTP Gmail) et expose sendMail().
 */

import nodemailer from "nodemailer";
import { Logger } from "./Logger";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true, // true pour 465, false pour d'autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendMail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const logger = Logger.getInstance();

  try {
    logger.log("debug", "Envoi d'email", { to, subject });

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.log(
        "error",
        "Configuration email manquante - EMAIL_USER ou EMAIL_PASS"
      );
      return false;
    }

    const info = await transporter.sendMail({
      from: `"My Event" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    logger.log("info", "Email envoyé avec succès", {
      messageId: info.messageId,
    });
    return true;
  } catch (error) {
    logger.log("error", "Erreur lors de l'envoi d'email", {
      error: error instanceof Error ? error.message : String(error),
      to,
      subject,
    });
    return false;
  }
}

// Templates d'emails
export function getConfirmationEmailTemplate(
  eventTitle: string,
  eventDate: Date
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Confirmation d'inscription</h2>
      <p>Bonjour,</p>
      <p>Vous êtes maintenant inscrit(e) à l'événement :</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">${eventTitle}</h3>
        <p style="margin: 0; color: #6b7280;">📅 ${eventDate.toLocaleDateString(
          "fr-FR",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}</p>
      </div>
      <p>Vous recevrez un rappel 24 heures avant l'événement.</p>
      <p>À bientôt !</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #6b7280;">My Event - Plateforme de gestion d'événements</p>
    </div>
  `;
}

export function getReminderEmailTemplate(
  eventTitle: string,
  eventDate: Date
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">⏰ Rappel - Événement dans 24h</h2>
      <p>Bonjour,</p>
      <p>Nous vous rappelons que vous êtes inscrit(e) à l'événement suivant qui aura lieu <strong>demain</strong> :</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937;">${eventTitle}</h3>
        <p style="margin: 0; color: #6b7280;">📅 ${eventDate.toLocaleDateString(
          "fr-FR",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}</p>
      </div>
      <p>N'oubliez pas de vous y rendre !</p>
      <p>À bientôt !</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      <p style="font-size: 12px; color: #6b7280;">My Event - Plateforme de gestion d'événements</p>
    </div>
  `;
}
