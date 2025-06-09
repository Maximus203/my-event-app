/**
 * Entité Event (TypeORM) : représente un événement créé par un organisateur.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Participant } from "./Participant";
import { User } from "./User";

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
  location: string;  @Column({ nullable: true })
  maxParticipants: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  bannerImage: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ default: true })
  isActive: boolean;

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
