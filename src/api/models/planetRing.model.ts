import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import RingedBody from "./ringedBody.model";

@Entity("planet_rings")
export default class PlanetRing extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Many to One with Ringed Body -> the body this ring surrounds
   */
  @ManyToOne(() => RingedBody, (ringedBody) => ringedBody.rings)
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
    // // foreignKeyConstraintName: "ringed_body_id"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // // foreignKeyConstraintName: "ringed_body_id"
  })
  public ringedBody?: RingedBody;
}
