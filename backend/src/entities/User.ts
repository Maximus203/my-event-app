/**
 * Entité User (TypeORM) : représente un utilisateur (Admin ou Organisateur).
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Event } from "./Event";

export enum UserRole {
  ADMIN = "ADMIN",
  ORGANIZER = "ORGANIZER",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;
  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  photo: string;

  @Column({
    type: "simple-enum",
    enum: UserRole,
    default: UserRole.ORGANIZER,
  })
  role: UserRole;

  @OneToMany(() => Event, (event) => event.createdBy)
  events: Event[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
