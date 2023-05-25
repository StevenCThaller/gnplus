import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import RingClass from "./ringClass.model";
import CelestialBody from "./celestialBody.model";

@Entity("rings")
export default class Ring extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @Column({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Ring's name
   */
  @Column({ name: "ring_name", unique: true })
  public ringName?: string;

  /**
   * Ring measurement data
   */
  @Column({ name: "inner_radius", type: "float", unsigned: true })
  public innerRadius?: number;
  @Column({ name: "outer_radius", type: "float", unsigned: true })
  public outerRadius?: number;
  @Column({ name: "mass_megatons" })
  public massMegatons?: number;

  @Column({ name: "ring_class_id" })
  public ringClassId?: number;
  @ManyToOne(() => RingClass, (ringClass) => ringClass.rings)
  @JoinColumn({ name: "ring_class_id" })
  public ringClass?: RingClass;

  // @ManyToOne(() => CelestialBody, (celestialBody) => celestialBody.rings)
  // @JoinColumn({
  //   name: "body_id",
  //   referencedColumnName: "bodyId",
  //   // foreignKeyConstraintName: "ringed_body"
  // })
  // @JoinColumn({
  //   name: "system_address",
  //   referencedColumnName: "systemAddress",
  //   // foreignKeyConstraintName: "ringed_body"
  // })
  // public ringedBody?: CelestialBody;
}
