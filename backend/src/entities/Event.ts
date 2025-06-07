/**
 * Entité Event (TypeORM) : représente un événement créé par un organisateur.
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Participant } from "./Participant";

@Entity()
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;
  @Column({ type: "datetime" })
  date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  maxParticipants: number;

  @ManyToOne(() => User, (user) => user.events, { eager: true })
  @JoinColumn({ name: "createdById" })
  createdBy: User;

  @Column()
  createdById: string;

  @OneToMany(() => Participant, (participant) => participant.event, {
    cascade: true,
  })
  participants: Participant[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
