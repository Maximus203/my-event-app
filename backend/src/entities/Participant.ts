/**
 * Entité Participant (TypeORM) : représente un participant inscrit à un événement.
 */

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "./Event";

@Entity()
export class Participant {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  @Column()
  email: string;

  @Column({ nullable: true })
  name: string;

  @ManyToOne(() => Event, (event) => event.participants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "eventId" })
  event: Event;

  @Column()
  eventId: string;
  @Column({ default: false })
  notified: boolean;

  @Column({ default: false })
  reminderSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
