/**
 * UserRepository : encapsule les opérations TypeORM sur l'entité User.
 */

import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";

export const UserRepository = AppDataSource.getRepository(User);

export class UserRepo {
  static async createUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    photo?: string,
    role: UserRole = UserRole.ORGANIZER
  ): Promise<User> {
    const user = UserRepository.create({
      email,
      password,
      firstName,
      lastName,
      photo,
      role,
    });
    return await UserRepository.save(user);
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await UserRepository.findOne({
      where: { email },
    });
  }

  static async findById(id: string): Promise<User | null> {
    return await UserRepository.findOne({
      where: { id },
    });
  }

  static async findAll(): Promise<User[]> {
    return await UserRepository.find({
      order: { createdAt: "DESC" },
    });
  }
}
