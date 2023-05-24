import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import AsteroidBelt from "./asteroidBelt.model";

@Entity("belt_clusters")
export default class BeltCluster extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "belt_id", type: "tinyint", unsigned: true })
  public beltId?: number;
  @ManyToOne(() => AsteroidBelt, (asteroidBelt) => asteroidBelt.beltClusters)
  @JoinColumn({
    name: "belt_id",
    referencedColumnName: "bodyId",
    foreignKeyConstraintName: "cluster_belt_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress",
    foreignKeyConstraintName: "cluster_belt_fk"
  })
  public belt?: AsteroidBelt;
}
