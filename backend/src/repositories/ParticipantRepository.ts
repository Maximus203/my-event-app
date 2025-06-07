/**
 * ParticipantRepository : opérations CRUD pour l'entité Participant.
 */

import { AppDataSource } from "../config/database";
import { Participant } from "../entities/Participant";
import { Event } from "../entities/Event";

export const ParticipantRepository = AppDataSource.getRepository(Participant);

export class ParticipantRepo {
  static async subscribe(event: Event, email: string): Promise<Participant> {
    // Vérifier si le participant existe déjà
    const existingParticipant = await ParticipantRepository.findOne({
      where: { eventId: event.id, email },
    });

    if (existingParticipant) {
      return existingParticipant;
    }

    // Créer un nouveau participant
    const participant = ParticipantRepository.create({
      email,
      event,
      eventId: event.id,
      notified: false,
    });

    return await ParticipantRepository.save(participant);
  }

  static async findByEvent(eventId: string): Promise<Participant[]> {
    return await ParticipantRepository.find({
      where: { eventId },
      order: { createdAt: "DESC" },
    });
  }
  static async findByEventNotifiedFalseWithin24h(): Promise<Participant[]> {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    return await ParticipantRepository.createQueryBuilder("participant")
      .leftJoinAndSelect("participant.event", "event")
      .leftJoinAndSelect("event.createdBy", "createdBy")
      .where("participant.notified = :notified", { notified: false })
      .andWhere("event.date <= :in24Hours", { in24Hours })
      .andWhere("event.date > :in23Hours", { in23Hours })
      .getMany();
  }

  static async markAsNotified(participantId: string): Promise<void> {
    await ParticipantRepository.update(participantId, { notified: true });
  }
  static async unsubscribe(eventId: string, email: string): Promise<boolean> {
    const result = await ParticipantRepository.delete({
      eventId,
      email,
    });
    return (result.affected ?? 0) > 0;
  }
}
