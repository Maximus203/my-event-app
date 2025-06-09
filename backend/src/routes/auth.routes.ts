/**
 * Routes d'authentification
 * /api/auth/register, /api/auth/login, /api/auth/profile
 * Association aux méthodes AuthController avec validation DTO
 */

import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { LoginUserDto } from "../dtos/LoginUserDto";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { UpdateUserDto } from "../dtos/UpdateUserDto";
import { authenticateJwt } from "../middlewares/authenticateJwt";
import { validateDto } from "../middlewares/validateDto";

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

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil de l'utilisateur connecté
 */
router.put("/profile", authenticateJwt, validateDto(UpdateUserDto), AuthController.updateProfile);

export default router;
