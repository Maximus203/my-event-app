/**
 * JwtUtils : génération et vérification de JWT (Factory).
 */

import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  email: string;
}

export function generateToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET || "my-event-secret-key";

  const payload = { userId, email };
  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET || "my-event-secret-key";

    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    return null;
  }
}

export default class JwtUtils {
  static generateToken(userId: string, email: string): string {
    return generateToken(userId, email);
  }

  static verifyToken(token: string): JwtPayload | null {
    return verifyToken(token);
  }
}
