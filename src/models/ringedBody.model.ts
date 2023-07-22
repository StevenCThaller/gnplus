import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryColumn } from "typeorm";
import ReserveLevel from "./reserveLevel.model";
import Ring from "./ring.model";
import CelestialBody from "./celestialBody.model";

@Entity("ringed_bodies")
export default class RingedBody {
  @PrimaryColumn({ name: "body_id", type: "smallint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Many to One with Reserve Level -> level of material reserves
   * in this body's rings
   */
  @Column({ name: "reserve_level_id", nullable: true })
  public reserveLevelId?: number;
  @ManyToOne(() => ReserveLevel, (reserveLevel) => reserveLevel.ringedBodies)
  @JoinColumn({ name: "reserve_level_id" })
  public reserves?: ReserveLevel;

  /**
   * One to Many with Celestial Body Ring -> the rings surrounding this
   * body
   */
  @OneToMany(() => Ring, (ring) => ring.ringedBody)
  public rings?: Ring[];

  @OneToOne(() => CelestialBody, (celestialBody) => celestialBody.ringedBody)
  @JoinColumn([
    {
      name: "body_id",
      referencedColumnName: "bodyId"
    },
    {
      name: "system_address",
      referencedColumnName: "systemAddress"
    }
  ])
  public celestialBody?: CelestialBody;

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

  public static convertScan(data: ScanData): RingedBodyParams | undefined {
    if (!data.Rings) return;
    return {
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      reserves: data.ReserveLevel,
      rings: Ring.convertScan(data),
      timestamp: new Date(data.timestamp)
    };
  }

  constructor(params: RingedBodyParams) {
    if (!params) return this;

    this.bodyId = params.bodyId;
    this.systemAddress = params.systemAddress;
    this.createdAt = new Date(params.timestamp);
    this.updatedAt = new Date(params.timestamp);
  }
}
