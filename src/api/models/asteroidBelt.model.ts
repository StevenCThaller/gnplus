import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import Ring from "./ring.model";
import BeltCluster from "./beltCluster.model";

@Entity("asteroid_belts")
@Index("asteroid_belt_id", ["bodyId", "systemAddress"], { unique: true })
export default class AsteroidBelt extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  public id?: number;

  @PrimaryColumn({
    name: "body_id",
    type: "tinyint",
    unsigned: true
  })
  public bodyId?: number;
  @PrimaryColumn({
    name: "system_address",
    type: "bigint",
    unsigned: true
  })
  public systemAddress?: number;

  @Column({ name: "ring_id", type: "bigint", unsigned: true })
  public ringId?: number;
  @OneToOne(() => Ring)
  @JoinColumn({ name: "ring_id" })
  public ring?: Ring;

  @OneToMany(() => BeltCluster, (beltCluster) => beltCluster.belt)
  public beltClusters?: BeltCluster[];
}
