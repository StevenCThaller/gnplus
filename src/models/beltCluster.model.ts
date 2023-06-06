import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn
} from "typeorm";
import AsteroidBelt from "./asteroidBelt.model";
import CelestialBody from "./celestialBody.model";

@Entity("belt_clusters")
// @Index("belt_cluster_id", ["clusterId", "systemAddress", "beltId"], {
//   unique: true
// })
export default class BeltCluster extends BaseEntity {
  @PrimaryColumn({ name: "cluster_id", type: "smallint", unsigned: true })
  public clusterId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({
    name: "belt_id",
    type: "bigint",
    unsigned: true
  })
  public beltId?: number;
  @ManyToOne(() => AsteroidBelt, (asteroidBelt) => asteroidBelt.beltClusters, {
    createForeignKeyConstraints: false
  })
  @JoinColumn([
    { name: "belt_id", referencedColumnName: "beltId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public belt?: AsteroidBelt;

  @OneToOne(() => CelestialBody, { createForeignKeyConstraints: false })
  @JoinColumn([
    { name: "cluster_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public beltBody?: CelestialBody;

  public static convertScan(data: ScanData): BeltClusterParams {
    if (!data.Parents) throw "No parents found.";
    return {
      beltId: Object.values(data.Parents[0])[0],
      clusterId: data.BodyID,
      systemAddress: data.SystemAddress
    };
  }
}
