import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Index,
  JoinTable,
  BaseEntity
} from "typeorm";
import StarSystem from "./starSystem";

@Entity("security_levels")
export default class SecurityLevel extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "security_level", nullable: false, unique: true })
  public securityLevel!: string;

  @OneToMany(() => StarSystem, (starSystem) => starSystem.securityLevel)
  public systems!: StarSystem[];
}
