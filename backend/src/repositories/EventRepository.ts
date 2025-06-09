/**
 * EventRepository : opérations CRUD pour l'entité Event.
 */

import { AppDataSource } from "../config/database";
import { Event } from "../entities/Event";
import { User } from "../entities/User";

export const EventRepository = AppDataSource.getRepository(Event);

export class EventRepo {
  static async createEvent(
    title: string,
    description: string | undefined,
    date: Date,
    location: string | undefined,
    maxParticipants: number | undefined,
    createdBy: User,
    imageUrl?: string,
    bannerImage?: string,
    videoUrl?: string
  ): Promise<Event> {
    const event = EventRepository.create({
      title,
      description,
      date,
      location,
      maxParticipants,
      imageUrl,
      bannerImage,
      videoUrl,
      createdBy,
      createdById: createdBy.id,
    });
    return await EventRepository.save(event);
  }

  static async findAllByOrganizer(organizerId: string): Promise<Event[]> {
    return await EventRepository.find({
      where: { createdById: organizerId },
      order: { date: "ASC" },
      relations: ["participants"],
    });
  }

  static async findAll(): Promise<Event[]> {
    return await EventRepository.find({
      order: { date: "ASC" },
      relations: ["createdBy", "participants"],
    });
  }

  static async findById(id: string): Promise<Event | null> {
    return await EventRepository.findOne({
      where: { id },
      relations: ["createdBy", "participants"],
    });
  }
  static async updateEvent(
    id: string,
    updates: Partial<Pick<Event, "title" | "description" | "date" | "location" | "maxParticipants" | "imageUrl" | "bannerImage" | "videoUrl">>
  ): Promise<Event | null> {
    await EventRepository.update(id, updates);
    return await this.findById(id);
  }
  static async deleteEvent(id: string): Promise<boolean> {
    const result = await EventRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  static async findPublicById(id: string): Promise<Event | null> {
    return await EventRepository.findOne({
      where: { id },
      relations: ["createdBy"],
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        createdAt: true,
        createdBy: {
          id: true,
          email: true,
        },
      },
    });
  }
}
