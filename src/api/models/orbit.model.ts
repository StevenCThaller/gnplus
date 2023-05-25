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
  @Column({ name: "body_id", type: "tinyint" })
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

  /**
   * Many to One with Celestial Body - the body
   * around which this orbit describes
   */
  @Column({ name: "parent_body_id" })
  public parentBodyId?: number;
  @ManyToOne(
    () => CelestialBody,
    (celestialBody) => celestialBody.bodiesOrbitingThisBody,
    { createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "parent_body_id",
    referencedColumnName: "bodyId"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
  })
  public parentBody?: CelestialBody;
}
