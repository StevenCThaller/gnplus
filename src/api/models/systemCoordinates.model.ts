import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToOne,
  Unique,
  BaseEntity
} from "typeorm";
import StarSystem from "./starSystem.model";

@Entity("system_coordinates")
@Index("position_coords_idx", ["x", "y", "z"], { unique: true })
export default class SystemCoordinates extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @OneToOne(() => StarSystem, (starSystem) => starSystem.systemCoordinates)
  public system?: StarSystem;

  @Column({ nullable: false, type: "float" })
  public x?: number;

  @Column({ nullable: false, type: "float" })
  public y?: number;

  @Column({ nullable: false, type: "float" })
  public z?: number;
}
