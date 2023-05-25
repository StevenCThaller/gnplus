import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import CelestialBody from "./celestialBody.model";

@Entity("orbits")
@Index("body_orbit_idx", ["systemAddress", "bodyId"], { unique: true })
export default class Orbit extends BaseEntity {
  /**
   * Composite Key - the orbiting body
   */
  @PrimaryColumn({ name: "body_id", type: "tinyint" })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address" })
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
    // foreignKeyConstraintName: "body_orbit_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "body_orbit_fk"
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
    // foreignKeyConstraintName: "body_orbiting_body_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "body_orbiting_body_fk"
  })
  public parentBody?: CelestialBody;
}
