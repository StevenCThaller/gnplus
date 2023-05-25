import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  BaseEntity
} from "typeorm";
import StarSystem from "./starSystem.model";

@Entity("powers")
export default class Power extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "power_name", nullable: false, unique: true })
  public powerName?: string;

  @ManyToMany(() => StarSystem, (starSystem) => starSystem.systemPowers)
  public systems?: Power[];
}
