import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany
} from "typeorm";
import SystemConflict from "./systemConflict.model";

@Entity("conflict_war_types")
export default class ConflictWarType extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "war_type", unique: true, nullable: false })
  public warType?: string;

  /**
   * One to Many with System Conflicts
   */
  @OneToMany(() => SystemConflict, (systemConflict) => systemConflict.warType)
  public conflicts?: SystemConflict[];
}
