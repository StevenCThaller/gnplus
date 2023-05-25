import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import AsteroidBelt from "./asteroidBelt.model";

@Entity("belt_clusters")
// @Index("belt_cluster_id", ["bodyId", "systemAddress", "beltId"], {
//   unique: true
// })
export default class BeltCluster extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({
    name: "belt_id",
    type: "tinyint",
    unsigned: true
  })
  public beltId?: number;

  @ManyToOne(() => AsteroidBelt, (asteroidBelt) => asteroidBelt.beltClusters)
  @JoinColumn({
    name: "belt_id",
    referencedColumnName: "id"
  })
  public belt?: AsteroidBelt;
}
