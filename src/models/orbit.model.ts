import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import CelestialBody from "./celestialBody.model";

@Entity("orbits")
@Index(["systemAddress", "bodyId"], { unique: true })
export default class Orbit extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;
  /**
   * Composite Foreign Key - the orbiting body
   */
  @Column({ name: "body_id", type: "smallint" })
  public bodyId?: number;
  @Column({ name: "system_address" })
  public systemAddress?: number;

  /**
   * Orbital Measurements
   */
  @Column({ name: "orbital_inclination", type: "float" })
  public orbitalInclination?: number;
  @Column({ type: "float" })
  public periapsis?: number;
  @Column({ name: "semi_major_axis", type: "float" })
  public semiMajorAxis?: number;
  @Column({ name: "orbital_period", type: "float" })
  public orbitalPeriod?: number;
  @Column({ type: "float" })
  public eccentricity?: number;

  /**
   * One to One with celestial body - body of which this orbit describes
   */
  @OneToOne(() => CelestialBody, (celestialBody) => celestialBody.orbit, {
    createForeignKeyConstraints: false
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

  public static convertScan(data: ScanData): OrbitParams {
    return {
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      eccentricity: data.Eccentricity as number,
      orbitalInclination: data.OrbitalInclination as number,
      orbitalPeriod: data.OrbitalPeriod as number,
      periapsis: data.Periapsis as number,
      semiMajorAxis: data.SemiMajorAxis as number
    };
  }

  public static convertScanBarycenter(data: ScanBarycentreData): OrbitParams {
    return {
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      eccentricity: data.Eccentricity,
      orbitalInclination: data.OrbitalInclination,
      orbitalPeriod: data.OrbitalPeriod,
      periapsis: data.Periapsis,
      semiMajorAxis: data.SemiMajorAxis
    };
  }
}
