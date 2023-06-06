import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany
} from "typeorm";
import SystemConflict from "./systemConflict.model";

@Entity("conflict_statuses")
export default class ConflictStatus extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({
    name: "conflict_status",
    unique: true,
    nullable: false,
    default: "---"
  })
  public conflictStatus?: string;

  /**
   * One to Many with System Conflicts
   */
  @OneToMany(
    () => SystemConflict,
    (systemConflict) => systemConflict.conflictStatus
  )
  public conflicts?: SystemConflict[];
}
