/**
 * Entité Participant (TypeORM) : représente un participant inscrit à un événement.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Event } from "./Event";

@Entity()
export class Participant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  email: string;

  @ManyToOne(() => Event, (event) => event.participants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column()
  eventId: string;

  @Column({ default: false })
  notified: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
