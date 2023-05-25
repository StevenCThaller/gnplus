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
import ReserveLevel from "./reserveLevel.model";
import PlanetRing from "./planetRing.model";
import PlanetaryBody from "./planetaryBody.model";

@Entity("ringed_bodies")
@Index("ringed_body_idx", ["bodyId", "systemAddress"], { unique: true })
export default class RingedBody extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Many to One with Reserve Level -> level of material reserves
   * in this body's rings
   */
  @Column({ name: "reserve_level_id", nullable: false })
  public reserveLevelId?: number;
  @ManyToOne(() => ReserveLevel, (reserveLevel) => reserveLevel.ringedBodies)
  @JoinColumn({ name: "reserve_level_id" })
  public reserves?: ReserveLevel;

  /**
   * One to Many with Planet Ring -> the rings surrounding this
   * body
   */
  @OneToMany(() => PlanetRing, (ring) => ring.ringedBody)
  public rings?: PlanetRing[];

  @OneToOne(() => PlanetaryBody, (planetaryBody) => planetaryBody.ringedBody)
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
    // foreignKeyConstraintName: "ringed_body_planet_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "ringed_body_planet_fk"
  })
  public planet?: PlanetaryBody;

  /**
   * Timestamps
   */
  @Column({
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public createdAt?: Date;

  @Column({
    name: "updated_at",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP"
  })
  public updatedAt?: Date;
}
