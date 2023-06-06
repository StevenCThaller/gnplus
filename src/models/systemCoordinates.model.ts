import { Entity, Column, Index, PrimaryGeneratedColumn, BaseEntity, OneToMany } from "typeorm";
import StarSystem from "./starSystem.model";

@Entity("system_coordinates")
@Index("position_coords_idx", ["x", "y", "z"], { unique: false })
export default class SystemCoordinates extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @OneToMany(() => StarSystem, (starSystem) => starSystem.systemCoordinates)
  public system?: StarSystem;

  @Column({ nullable: false, type: "float" })
  public x?: number;

  @Column({ nullable: false, type: "float" })
  public y?: number;

  @Column({ nullable: false, type: "float" })
  public z?: number;

  public static convertDocked(data: DockedData): SystemCoordinatesParams {
    return this.convertArray(data.StarPos);
  }

  public static convertFSDJump(data: FSDJumpData): SystemCoordinatesParams {
    return this.convertArray(data.StarPos);
  }

  private static convertArray(xyz: number[]): SystemCoordinatesParams {
    const [x, y, z] = xyz;
    return { x, y, z };
  }
}
