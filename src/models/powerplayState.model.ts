import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from "typeorm";
import StarSystem from "./starSystem.model";

@Entity("powerplay_states")
export default class PowerplayState extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "tinyint", unsigned: true })
  public id?: number;

  @Column({ name: "powerplay_state", nullable: false, unique: true })
  public powerplayState?: string;

  @OneToMany(() => StarSystem, (starSystem) => starSystem.powerplayState)
  public systems?: StarSystem[];
}
