import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import Ring from "./ring.model";
import BeltCluster from "./beltCluster.model";

@Entity("asteroid_belts")
export default class AsteroidBelt extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "ring_id", type: "bigint", unsigned: true })
  public ringId?: number;
  @OneToOne(() => Ring)
  @JoinColumn({ name: "ring_id" })
  public ring?: Ring;

  @OneToMany(() => BeltCluster, (beltCluster) => beltCluster.belt)
  public beltClusters?: BeltCluster[];
}
