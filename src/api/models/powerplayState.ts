import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity
} from "typeorm";
import StarSystem from "./starSystem";

@Entity("powerplay_states")
export default class PowerplayState extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "powerplay_state", nullable: false, unique: true })
  public powerplayState!: string;

  @OneToMany(() => StarSystem, (starSystem) => starSystem.powerplayState)
  public systems!: StarSystem[];
}
