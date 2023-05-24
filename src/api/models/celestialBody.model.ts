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
import Ring from "./ring.model";
import RotationParameters from "./rotationParameters.model";

@Entity("celestial_bodies")
@Index("system_body", ["bodyId", "systemAddress"], { unique: true })
export default class CelestialBody extends BaseEntity {
  /**
   * Composite Primary key
   */
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({
    name: "system_address",
    foreignKeyConstraintName: "body_is_in_system",
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
  @OneToOne(() => Orbit, (orbit) => orbit.body, { cascade: ["insert"] })
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
  @ManyToOne(() => Barycenter, (barycenter) => barycenter.bodies, {
    createForeignKeyConstraints: false
  })
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId",
    foreignKeyConstraintName: "barycenter_of_this_body"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress",
    foreignKeyConstraintName: "barycenter_of_this_body"
  })
  public barycenter?: Barycenter[];

  /**
   * One to One with Rotational Parameters -> the rotation parameters
   * that describe the rotation of this body
   */
  @OneToOne(
    () => RotationParameters,
    (rotationParameters) => rotationParameters.body,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId",
    foreignKeyConstraintName: "body_rotation_parameters_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress",
    foreignKeyConstraintName: "body_rotation_parameters_fk"
  })
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
