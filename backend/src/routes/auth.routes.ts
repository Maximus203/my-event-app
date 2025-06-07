/**
 * Routes d'authentification
 * /api/auth/register, /api/auth/login, /api/auth/profile
 * Association aux méthodes AuthController avec validation DTO
 */

import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateDto } from "../middlewares/validateDto";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { LoginUserDto } from "../dtos/LoginUserDto";

const router = Router();

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post("/register", validateDto(RegisterUserDto), AuthController.register);

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post("/login", validateDto(LoginUserDto), AuthController.login);

/**
 * GET /api/auth/profile
 * Récupérer le profil de l'utilisateur connecté
 */
router.get("/profile", authenticateJwt, AuthController.getProfile);

export default router;
