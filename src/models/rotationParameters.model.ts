import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import CelestialBody from "./celestialBody.model";

@Entity("rotation_parameters")
@Index(["bodyId", "systemAddress"], { unique: true })
export default class RotationParameters extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;
  /**
   * Composite Foreign Key
   */
  @Column({ name: "body_id", type: "smallint", unsigned: true })
  public bodyId?: number;
  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Rotation measurements
   */
  @Column({ name: "rotation_period", type: "float" })
  public rotationPeriod?: number;
  @Column({ name: "axial_tilt", type: "float" })
  public axialTilt?: number;
  @Column({ name: "radius", type: "bigint", unsigned: true })
  public radius?: number;

  /**
   * One to One with body - body this orbit is around
   */
  @OneToOne(() => CelestialBody, {
    createForeignKeyConstraints: false,
    nullable: true
  })
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
  })
  public body?: CelestialBody;

  public static convertScan(data: ScanData): RotationParametersParams {
    return this.getBasic(data);
  }

  private static getBasic(data: any): RotationParametersParams {
    return {
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      axialTilt: data.AxialTilt,
      rotationPeriod: data.RotationPeriod,
      radius: data.Radius
    };
  }
}
