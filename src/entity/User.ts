import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import bcrypt from "bcrypt";
import { Task } from "./Task";

export enum Role {
  SUPER_ADMIN = "Super Admin",
  ADMIN = "Admin",
  USER = "User",
}

export enum Status {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  @IsNotEmpty()
  first_name: string;

  @Column({ type: "varchar", nullable: false })
  @IsNotEmpty()
  last_name: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  @IsEmail()
  email: string;

  @Column({ type: "varchar", nullable: false, select: false })
  password: string;

  @Column({ type: "varchar", nullable: true, select: false })
  reset_password_token: string | null;

  @Column({ type: "timestamp with time zone", nullable: true, select: false })
  reset_password_expiry: Date | null;

  @Column({ type: "enum", enum: Role, default: Role.USER, nullable: false })
  role: Role;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.ACTIVE,
    nullable: false,
  })
  status: Status;

  @OneToMany(() => Task, (task) => task.created_by, {
    onDelete: "CASCADE",
  })
  tasks: Task[];

  @CreateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @Column({ type: "timestamp with time zone", nullable: true })
  deleted_at: Date | null;

  /**
   * Hashes the password before saving to the database.
   */
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && this.isPasswordModified()) {
      try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      } catch (error) {
        throw new Error("Failed to hash the password");
      }
    }
  }

  /**
   * Checks if the password field has been modified.
   */
  private isPasswordModified(): boolean {
    return this.hasOwnProperty("password");
  }

  /**
   * Compares a plain-text password with the hashed password.
   * @param plainPassword - The plain-text password to compare.
   * @returns True if the passwords match, otherwise false.
   */
  async comparePassword(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.password);
  }
}
