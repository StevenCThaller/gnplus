import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import CelestialBody from "./celestialBody.model";

@Entity("barycenters")
@Index("barycenter_body_fk", ["bodyId", "systemAddress"], { unique: false })
export default class Barycenter extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id?: number;

  /**
   * Composite FK
   */
  @Column({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Barycenter measurements
   */
  @Column({ name: "ascending_node", type: "float" })
  public ascendingNode?: number;
  @Column({ name: "mean_anomaly", type: "float" })
  public meanAnomaly?: number;

  /**
   * One to Many with Celestial Body - the bodies which share this
   * barycenter
   */
  @OneToMany(() => CelestialBody, (celestialBody) => celestialBody.barycenter)
  public bodies?: CelestialBody;
}
