/**
 * EventService : logique métier CRUD pour Event
 * Vérification des droits (créateur ou admin)
 */

import { CreateEventDto } from "../dtos/CreateEventDto";
import { UpdateEventDto } from "../dtos/UpdateEventDto";
import { UserRole } from "../entities/User";
import { EventRepo } from "../repositories/EventRepository";
import { ParticipantRepo } from "../repositories/ParticipantRepository";
import { UserRepo } from "../repositories/UserRepository";
import {
  getConfirmationEmailTemplate,
  getReminderEmailTemplate,
  sendMail,
} from "../utils/EmailUtils";
import { Logger } from "../utils/Logger";

export class EventService {
  private static logger = Logger.getInstance();

  /**
   * Créer un nouvel événement
   */
  static async createEvent(eventData: CreateEventDto, createdById: string) {
    try {
      // Vérifier que l'utilisateur existe
      const creator = await UserRepo.findById(createdById);
      if (!creator) {
        throw new Error("Utilisateur créateur non trouvé");
      }      const event = await EventRepo.createEvent(
        eventData.title,
        eventData.description,
        new Date(eventData.date),
        eventData.location,
        eventData.maxParticipants,
        creator,
        eventData.imageUrl,
        eventData.bannerImage,
        eventData.videoUrl
      );

      this.logger.log("info", "Événement créé avec succès", {
        eventId: event.id,
        title: event.title,
        createdBy: creator.email,
      });

      return event;
    } catch (error) {
      this.logger.log("error", "Erreur lors de la création de l'événement", {
        error: error instanceof Error ? error.message : String(error),
        createdById,
      });
      throw error;
    }
  }

  /**
   * Récupérer tous les événements
   */
  static async getAllEvents() {
    try {
      return await EventRepo.findAll();
    } catch (error) {
      this.logger.log(
        "error",
        "Erreur lors de la récupération des événements",
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );
      throw error;
    }
  }

  /**
   * Récupérer un événement par son ID
   */
  static async getEventById(eventId: string) {
    try {
      const event = await EventRepo.findById(eventId);
      if (!event) {
        throw new Error("Événement non trouvé");
      }
      return event;
    } catch (error) {
      this.logger.log(
        "error",
        "Erreur lors de la récupération de l'événement",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId,
        }
      );
      throw error;
    }
  }

  /**
   * Mettre à jour un événement
   */
  static async updateEvent(
    eventId: string,
    updateData: UpdateEventDto,
    userId: string
  ) {
    try {
      const event = await EventRepo.findById(eventId);
      if (!event) {
        throw new Error("Événement non trouvé");
      }

      const user = await UserRepo.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérifier les droits (créateur ou admin)
      if (event.createdBy.id !== userId && user.role !== UserRole.ADMIN) {
        throw new Error(
          "Vous n'avez pas les droits pour modifier cet événement"
        );
      }

      const updatedEvent = await EventRepo.updateEvent(eventId, {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined
      });

      this.logger.log("info", "Événement mis à jour avec succès", {
        eventId,
        updatedBy: user.email,
      });

      return updatedEvent;
    } catch (error) {
      this.logger.log("error", "Erreur lors de la mise à jour de l'événement", {
        error: error instanceof Error ? error.message : String(error),
        eventId,
        userId,
      });
      throw error;
    }
  }

  /**
   * Supprimer un événement
   */
  static async deleteEvent(eventId: string, userId: string) {
    try {
      const event = await EventRepo.findById(eventId);
      if (!event) {
        throw new Error("Événement non trouvé");
      }

      const user = await UserRepo.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérifier les droits (créateur ou admin)
      if (event.createdBy.id !== userId && user.role !== UserRole.ADMIN) {
        throw new Error(
          "Vous n'avez pas les droits pour supprimer cet événement"
        );
      }

      const success = await EventRepo.deleteEvent(eventId);

      if (success) {
        this.logger.log("info", "Événement supprimé avec succès", {
          eventId,
          deletedBy: user.email,
        });
      }

      return success;
    } catch (error) {
      this.logger.log("error", "Erreur lors de la suppression de l'événement", {
        error: error instanceof Error ? error.message : String(error),
        eventId,
        userId,
      });
      throw error;
    }
  }

  /**
   * S'inscrire à un événement
   */
  static async subscribeToEvent(eventId: string, email: string) {
    try {
      const event = await EventRepo.findById(eventId);
      if (!event) {
        throw new Error("Événement non trouvé");
      }

      // Vérifier si l'événement est complet
      const currentParticipants = await ParticipantRepo.findByEvent(eventId);
      if (
        event.maxParticipants &&
        currentParticipants.length >= event.maxParticipants
      ) {
        throw new Error("Événement complet");
      }

      // Vérifier si l'événement n'est pas déjà passé
      if (event.date < new Date()) {
        throw new Error("Impossible de s'inscrire à un événement passé");
      }

      const participant = await ParticipantRepo.subscribe(event, email);

      // Envoyer email de confirmation
      const emailTemplate = getConfirmationEmailTemplate(
        event.title,
        event.date
      );
      await sendMail(
        email,
        `Confirmation d'inscription - ${event.title}`,
        emailTemplate
      );

      this.logger.log("info", "Inscription à l'événement réussie", {
        eventId,
        email,
        participantId: participant.id,
      });

      return participant;
    } catch (error) {
      this.logger.log("error", "Erreur lors de l'inscription à l'événement", {
        error: error instanceof Error ? error.message : String(error),
        eventId,
        email,
      });
      throw error;
    }
  }

  /**
   * Se désinscrire d'un événement
   */
  static async unsubscribeFromEvent(eventId: string, email: string) {
    try {
      const event = await EventRepo.findById(eventId);
      if (!event) {
        throw new Error("Événement non trouvé");
      }

      const success = await ParticipantRepo.unsubscribe(eventId, email);

      if (success) {
        this.logger.log("info", "Désinscription de l'événement réussie", {
          eventId,
          email,
        });
      }

      return success;
    } catch (error) {
      this.logger.log(
        "error",
        "Erreur lors de la désinscription de l'événement",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId,
          email,
        }
      );
      throw error;
    }
  }

  /**
   * Récupérer les participants d'un événement
   */
  static async getEventParticipants(eventId: string, userId: string) {
    try {
      const event = await EventRepo.findById(eventId);
      if (!event) {
        throw new Error("Événement non trouvé");
      }

      const user = await UserRepo.findById(userId);
      if (!user) {
        throw new Error("Utilisateur non trouvé");
      }

      // Vérifier les droits (créateur ou admin)
      if (event.createdBy.id !== userId && user.role !== UserRole.ADMIN) {
        throw new Error(
          "Vous n'avez pas les droits pour voir les participants"
        );
      }

      return await ParticipantRepo.findByEvent(eventId);
    } catch (error) {
      this.logger.log(
        "error",
        "Erreur lors de la récupération des participants",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId,
          userId,
        }
      );
      throw error;
    }
  }

  /**
   * Envoyer des rappels pour les événements qui approchent
   */
  static async sendReminders() {
    try {
      const participants =
        await ParticipantRepo.findByEventNotifiedFalseWithin24h();

      for (const participant of participants) {
        if (participant.event && participant.event.createdBy) {
          const emailTemplate = getReminderEmailTemplate(
            participant.event.title,
            participant.event.date
          );

          const success = await sendMail(
            participant.email,
            `Rappel - ${participant.event.title} demain`,
            emailTemplate
          );

          if (success) {
            await ParticipantRepo.markAsNotified(participant.id);
          }
        }
      }

      this.logger.log(
        "info",
        `Rappels envoyés à ${participants.length} participants`
      );
    } catch (error) {
      this.logger.log("error", "Erreur lors de l'envoi des rappels", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
