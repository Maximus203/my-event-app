/**
 * EventController : méthodes CRUD pour les événements
 * getAll, getById, create, update, remove, subscribe, unsubscribe
 * Utilise EventService pour la logique métier
 */

import { Request, Response } from "express";
import { EventService } from "../services/EventService";
import { CreateEventDto } from "../dtos/CreateEventDto";
import { UpdateEventDto } from "../dtos/UpdateEventDto";
import { ResponseFormatter } from "../utils/ResponseFormatter";
import { Logger } from "../utils/Logger";

export class EventController {
  private static logger = Logger.getInstance();
  /**
   * Récupérer tous les événements
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const events = await EventService.getAllEvents();

      ResponseFormatter.success(
        res,
        events,
        "Événements récupérés avec succès"
      );
    } catch (error) {
      EventController.logger.log(
        "error",
        "Erreur lors de la récupération des événements",
        {
          error: error instanceof Error ? error.message : String(error),
        }
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des événements";
      ResponseFormatter.error(res, message, 500);
    }
  }

  /**
   * Récupérer un événement par son ID
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);
      ResponseFormatter.success(res, event, "Événement récupéré avec succès");
    } catch (error) {
      EventController.logger.log(
        "error",
        "Erreur lors de la récupération de l'événement",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId: req.params.id,
        }
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération de l'événement";
      const status = message.includes("non trouvé") ? 404 : 500;
      ResponseFormatter.error(res, message, status);
    }
  }

  /**
   * Créer un nouvel événement
   */
  static async create(req: Request, res: Response) {
    try {
      const eventData: CreateEventDto = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }

      const event = await EventService.createEvent(eventData, userId);

      EventController.logger.log("info", "Événement créé via API", {
        eventId: event.id,
        title: event.title,
        createdBy: userId,
      });

      ResponseFormatter.success(res, event, "Événement créé avec succès", 201);
    } catch (error) {
      EventController.logger.log(
        "error",
        "Erreur lors de la création de l'événement",
        {
          error: error instanceof Error ? error.message : String(error),
          userId: (req as any).user?.userId,
        }
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'événement";
      ResponseFormatter.error(res, message, 400);
    }
  }

  /**
   * Mettre à jour un événement
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData: UpdateEventDto = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }

      const event = await EventService.updateEvent(id, updateData, userId);

      EventController.logger.log("info", "Événement mis à jour via API", {
        eventId: id,
        updatedBy: userId,
      });

      ResponseFormatter.success(res, event, "Événement mis à jour avec succès");
    } catch (error) {
      EventController.logger.log(
        "error",
        "Erreur lors de la mise à jour de l'événement",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId: req.params.id,
          userId: (req as any).user?.userId,
        }
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la mise à jour de l'événement";
      const status = message.includes("non trouvé")
        ? 404
        : message.includes("droits")
        ? 403
        : 400;
      ResponseFormatter.error(res, message, status);
    }
  }

  /**
   * Supprimer un événement
   */
  static async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }

      const success = await EventService.deleteEvent(id, userId);

      if (success) {
        EventController.logger.log("info", "Événement supprimé via API", {
          eventId: id,
          deletedBy: userId,
        });

        ResponseFormatter.success(res, null, "Événement supprimé avec succès");
      } else {
        ResponseFormatter.error(res, "Échec de la suppression", 500);
      }
    } catch (error) {
      EventController.logger.log(
        "error",
        "Erreur lors de la suppression de l'événement",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId: req.params.id,
          userId: (req as any).user?.userId,
        }
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression de l'événement";
      const status = message.includes("non trouvé")
        ? 404
        : message.includes("droits")
        ? 403
        : 500;
      ResponseFormatter.error(res, message, status);
    }
  }

  /**
   * S'inscrire à un événement
   */
  static async subscribe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      if (!email) {
        ResponseFormatter.error(res, "Email requis", 400);
        return;
      }

      const participant = await EventService.subscribeToEvent(id, { email, name });

      EventController.logger.log("info", "Inscription à l'événement via API", {
        eventId: id,
        email,
        participantId: participant.id,
      });

      ResponseFormatter.success(res, participant, "Inscription réussie", 201);
    } catch (error) {
      EventController.logger.log(
        "error",
        "Erreur lors de l'inscription à l'événement",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId: req.params.id,
          email: req.body?.email,
        }
      );

      const message =
        error instanceof Error ? error.message : "Erreur lors de l'inscription";
      const status = message.includes("non trouvé")
        ? 404
        : message.includes("complet") || message.includes("passé")
        ? 400
        : 500;
      ResponseFormatter.error(res, message, status);
    }
  }

  /**
   * Se désinscrire d'un événement
   */ static async unsubscribe(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email } = req.body;

      if (!email) {
        ResponseFormatter.error(res, "Email requis", 400);
        return;
      }

      const success = await EventService.unsubscribeFromEvent(id, email);

      if (success) {
        EventController.logger.log(
          "info",
          "Désinscription de l'événement via API",
          {
            eventId: id,
            email,
          }
        );

        ResponseFormatter.success(res, null, "Désinscription réussie");
      } else {
        ResponseFormatter.error(res, "Inscription non trouvée", 404);
      }
    } catch (error) {
      EventController.logger.log("error", "Erreur lors de la désinscription", {
        error: error instanceof Error ? error.message : String(error),
        eventId: req.params.id,
        email: req.body?.email,
      });

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la désinscription";
      ResponseFormatter.error(res, message, 500);
    }
  }

  /**
   * Récupérer les participants d'un événement
   */
  static async getParticipants(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        ResponseFormatter.error(res, "Token invalide", 401);
        return;
      }

      const participants = await EventService.getEventParticipants(id, userId);

      ResponseFormatter.success(
        res,
        participants,
        "Participants récupérés avec succès"
      );
    } catch (error) {
      EventController.logger.log(
        "error",
        "Erreur lors de la récupération des participants",
        {
          error: error instanceof Error ? error.message : String(error),
          eventId: req.params.id,
          userId: (req as any).user?.userId,
        }
      );

      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors de la récupération des participants";
      const status = message.includes("non trouvé")
        ? 404
        : message.includes("droits")
        ? 403
        : 500;
      ResponseFormatter.error(res, message, status);
    }
  }
}
