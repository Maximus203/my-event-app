/**
 * Routes pour les événements
 * /api/events - CRUD complet avec authentification
 * Association aux méthodes EventController avec validation DTO
 */

import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { validateDto } from "../middlewares/validateDto";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { CreateEventDto } from "../dtos/CreateEventDto";
import { UpdateEventDto } from "../dtos/UpdateEventDto";

const router = Router();

/**
 * GET /api/events
 * Récupérer tous les événements (public)
 */
router.get("/", EventController.getAll);

/**
 * GET /api/events/:id
 * Récupérer un événement par son ID (public)
 */
router.get("/:id", EventController.getById);

/**
 * POST /api/events
 * Créer un nouvel événement (authentifié)
 */
router.post(
  "/",
  authenticateJwt,
  validateDto(CreateEventDto),
  EventController.create
);

/**
 * PUT /api/events/:id
 * Mettre à jour un événement (authentifié, créateur ou admin)
 */
router.put(
  "/:id",
  authenticateJwt,
  validateDto(UpdateEventDto),
  EventController.update
);

/**
 * DELETE /api/events/:id
 * Supprimer un événement (authentifié, créateur ou admin)
 */
router.delete("/:id", authenticateJwt, EventController.remove);

/**
 * POST /api/events/:id/subscribe
 * S'inscrire à un événement (public)
 */
router.post("/:id/subscribe", EventController.subscribe);

/**
 * POST /api/events/:id/unsubscribe
 * Se désinscrire d'un événement (public)
 */
router.post("/:id/unsubscribe", EventController.unsubscribe);

/**
 * GET /api/events/:id/participants
 * Récupérer les participants d'un événement (authentifié, créateur ou admin)
 */
router.get(
  "/:id/participants",
  authenticateJwt,
  EventController.getParticipants
);

export default router;
