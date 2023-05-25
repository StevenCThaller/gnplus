import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import StarSystem from "./starSystem.model";
import BodyType from "./bodyType.model";
import Orbit from "./orbit.model";
import Barycenter from "./barycenter.model";
import RotationParameters from "./rotationParameters.model";

@Entity("celestial_bodies")
@Index("celestial_body_id", ["bodyId", "systemAddress"], { unique: true })
export default class CelestialBody extends BaseEntity {
  /**
   * Composite Primary key
   */
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({
    name: "system_address",
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;
  @ManyToOne(() => StarSystem, (starSystem) => starSystem.bodies, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "system_address" })
  public system?: StarSystem;

  @Column({ name: "body_name", unique: true })
  public bodyName?: string;

  @Column({ name: "distance_from_arrival", type: "float" })
  public distanceFromArrival?: number;

  /**
   * Many to One with Body Type
   */
  @Column({ name: "body_type_id", nullable: false })
  public bodyTypeId?: number;
  @ManyToOne(() => BodyType, (bodyType) => bodyType.bodiesWithType)
  @JoinColumn({ name: "body_type_id" })
  public bodyType?: BodyType;

  /**
   * Optional One to One with Orbit - this body's orbit
   */
  @Column({ name: "orbit_id", nullable: true, type: "bigint", unsigned: true })
  public orbitId?: number;
  @OneToOne(() => Orbit, (orbit) => orbit.body, { cascade: ["insert"] })
  @JoinColumn({ name: "orbit_id" })
  public orbit?: Orbit;

  /**
   * One to Many with Orbits - orbits around this body
   */
  @OneToMany(() => Orbit, (orbit) => orbit.parentBody)
  public bodiesOrbitingThisBody?: Orbit[];

  /**
   * Many to One with Barycenter -> the barycenter around which this
   * body orbits
   */
  @Column({ name: "barycenter_id", nullable: true })
  public barycenterId?: number;
  @ManyToOne(() => Barycenter, (barycenter) => barycenter.bodies, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({ name: "barycenter_id" })
  public barycenter?: Barycenter;

  /**
   * One to One with Rotational Parameters -> the rotation parameters
   * that describe the rotation of this body
   */
  @OneToOne(
    () => RotationParameters,
    (rotationParameters) => rotationParameters.body,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  public rotationParameters?: RotationParameters;

  /**
   * Timestamps
   */
  @Column({ name: "created_at", default: () => "CURRENT_TIMESTAMP" })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;
}
