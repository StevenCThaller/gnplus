import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity
} from "typeorm";
import SystemFaction from "./systemFaction.model";

@Entity("happiness_levels")
export default class HappinessLevel extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column()
  public happiness?: string;

  @OneToMany(() => SystemFaction, (systemFaction) => systemFaction.happiness)
  public systemFactions?: SystemFaction[];
}
