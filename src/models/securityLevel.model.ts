import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import StarSystem from "./starSystem.model";

@Entity("security_levels")
export default class SecurityLevel {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "security_level", nullable: false, unique: true })
  public securityLevel?: string;

  @OneToMany(() => StarSystem, (starSystem) => starSystem.securityLevel)
  public systems?: StarSystem[];
}
