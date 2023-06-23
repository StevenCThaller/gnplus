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
import PlanetAtmosphere from "./planetAtmosphere.model";
import SurfaceMaterial from "./surfaceMaterial.model";
import PlanetClass from "./planetClass.model";
import PlanetarySurfaceDetails from "./planetarySurfaceDetails.model";
import PlanetComposition from "./planetComposition.model";
import RingedBody from "./ringedBody.model";
import CelestialBody from "./celestialBody.model";

@Entity("planetary_bodies")
@Index(["bodyId", "systemAddress"], { unique: true })
export default class PlanetaryBody {
  @PrimaryColumn({
    name: "body_id",
    type: "smallint",
    unsigned: true,
    unique: false,
    primaryKeyConstraintName: "planet_idx"
  })
  public bodyId?: number;
  @PrimaryColumn({
    name: "system_address",
    type: "bigint",
    unsigned: true,
    primaryKeyConstraintName: "planet_idx"
  })
  public systemAddress?: number;

  @Column({ name: "planet_class_id" })
  public planetClassId?: number;
  @ManyToOne(() => PlanetClass, (planetClass) => planetClass.planets)
  @JoinColumn({ name: "planet_class_id" })
  public planetClass?: PlanetClass;

  @OneToOne(
    () => PlanetarySurfaceDetails,
    (planetarySurfaceDetails) => planetarySurfaceDetails.planet,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn([
    { name: "body_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public surfaceDetails?: PlanetarySurfaceDetails;

  @Column({ name: "planet_composition_id", nullable: true, type: "bigint", unsigned: true })
  public planetCompositionId?: number;
  @ManyToOne(() => PlanetComposition, (planetComposition) => planetComposition.planets, {
    cascade: ["insert", "update"]
  })
  @JoinColumn({
    name: "planet_composition_id",
    referencedColumnName: "id"
  })
  public planetComposition?: PlanetComposition;

  @OneToOne(() => PlanetAtmosphere, (planetAtmosphere) => planetAtmosphere.planet, {
    cascade: ["insert"],
    createForeignKeyConstraints: false
  })
  @JoinColumn([
    { name: "body_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public planetAtmosphere?: PlanetAtmosphere;

  @OneToOne(() => RingedBody, (ringedBody) => ringedBody.planet)
  public ringedBody?: RingedBody;

  @OneToOne(() => CelestialBody)
  @JoinColumn([
    { name: "body_id", referencedColumnName: "bodyId" },
    { name: "system_address", referencedColumnName: "systemAddress" }
  ])
  public body?: CelestialBody;

  @OneToMany(() => SurfaceMaterial, (surfaceMaterial) => surfaceMaterial.planet)
  public surfaceMaterials?: SurfaceMaterial[];

  public static convertScan(data: PlanetScanData): PlanetaryBodyParams {
    return {
      ...CelestialBody.convertScan(data as ScanData),
      planetClass: data.PlanetClass,
      planetAtmosphere: PlanetAtmosphere.convertScan(data),
      planetComposition: PlanetComposition.convertScan(data),
      surfaceDetails: PlanetarySurfaceDetails.convertScan(data),
      ringedBody: RingedBody.convertScan(data),
      surfaceMaterials: SurfaceMaterial.convertScan(data)
    };
  }

  constructor(bodyId: number, systemAddress: number) {
    this.bodyId = bodyId;
    this.systemAddress = systemAddress;
  }
}
