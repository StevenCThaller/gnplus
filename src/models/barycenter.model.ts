import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import CelestialBody from "./celestialBody.model";
import StarSystem from "./starSystem.model";

@Entity("barycenters")
@Index("barycenter_id", ["bodyId", "systemAddress"], { unique: false })
export default class Barycenter extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  public id?: number;

  @Column({ name: "body_id", type: "smallint", unsigned: true })
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

  public static convertScan(data: ScanData): BarycenterParams {
    return this.getBasic(data);
  }

  public static convertScanBarycenter(data: ScanBarycentreData): BarycenterParams {
    return this.getBasic(data);
  }

  private static getBasic(data: any): BarycenterParams {
    return {
      bodyId: data.BodyID,
      system: StarSystem.convertScanBarycenter(data),
      ascendingNode: data.AscendingNode,
      meanAnomaly: data.MeanAnomaly
    };
  }
}
