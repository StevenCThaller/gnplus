import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import RingClass from "./ringClass.model";
import RingedBody from "./ringedBody.model";

@Entity("rings")
@Index(["bodyId", "systemAddress"], { unique: false })
export default class Ring extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @Column({ name: "body_id", type: "smallint", unsigned: true })
  public bodyId?: number;
  @Column({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  /**
   * Ring's name
   */
  @Column({ name: "ring_name" })
  @Index({ unique: true })
  public ringName?: string;

  /**
   * Ring measurement data
   */
  @Column({ name: "inner_radius", type: "float", unsigned: true })
  public innerRadius?: number;
  @Column({ name: "outer_radius", type: "float", unsigned: true })
  public outerRadius?: number;
  @Column({ name: "mass_megatons", type: "bigint", unsigned: true })
  public massMegatons?: number;

  @Column({ name: "ring_class_id" })
  public ringClassId?: number;
  @ManyToOne(() => RingClass, (ringClass) => ringClass.rings)
  @JoinColumn({ name: "ring_class_id" })
  public ringClass?: RingClass;

  @ManyToOne(() => RingedBody, (ringedBody) => ringedBody.rings, {
    createForeignKeyConstraints: false
  })
  @JoinColumn([
    { name: "body_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public ringedBody?: RingedBody;

  public static convertScan(data: ScanData): RingParams[] {
    if (!data.Rings) return [];
    return data.Rings.map(
      (ring: RingData): RingParams => ({
        bodyId: data.BodyID,
        systemAddress: data.SystemAddress,
        ringName: ring.Name,
        innerRadius: ring.InnerRad,
        outerRadius: ring.OuterRad,
        massMegatons: ring.MassMT,
        ringClass: ring.RingClass
      })
    );
  }
}
