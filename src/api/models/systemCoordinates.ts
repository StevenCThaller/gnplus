import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  OneToOne,
  Unique,
  BaseEntity
} from "typeorm";
import StarSystem from "./starSystem";

@Entity("system_coordinates")
@Index(["x", "y", "z"])
export default class SystemCoordinates extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @OneToOne(() => StarSystem, (starSystem) => starSystem.systemCoordinates)
  public system!: StarSystem;

  @Column({ nullable: false })
  public x!: number;

  @Column({ nullable: false })
  public y!: number;

  @Column({ nullable: false })
  public z!: number;
}
