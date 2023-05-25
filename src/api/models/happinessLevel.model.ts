import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import SystemFaction from "./systemFaction.model";

@Entity("happiness_levels")
export default class HappinessLevel extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "happiness_level", unique: true, nullable: false })
  public happinessLevel?: string;

  @OneToMany(
    () => SystemFaction,
    (systemFaction) => systemFaction.happinessLevel
  )
  public systemFactions?: SystemFaction[];
}
