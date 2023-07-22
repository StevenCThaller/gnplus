import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";
import TerraformState from "./terraformState.model";
import Volcanism from "./volcanism.model";
import PlanetaryBody from "./planetaryBody.model";
import CelestialBody from "./celestialBody.model";

@Entity("planetary_surface_details")
@Index("surface_details_id", ["bodyId", "systemAddress"], { unique: true })
export default class PlanetarySurfaceDetails {
  @PrimaryColumn({ name: "body_id", type: "smallint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "mass_em", type: "float" })
  public massEM?: number;
  @Column({ name: "tidal_lock", nullable: true })
  public tidalLock?: boolean;
  @Column({ default: false })
  public landable?: boolean;
  @Column({ name: "surface_gravity", type: "float" })
  public surfaceGravity?: number;
  @Column({ name: "surface_pressure", type: "float", nullable: true })
  public surfacePressure?: number;
  @Column({ name: "surface_temperature", type: "float", nullable: true })
  public surfaceTemperature?: number;
  @Column({ name: "terraform_state_id", nullable: true })
  public terraformStateId?: number;
  @Column({ name: "volcanism_id", nullable: true })
  public volcanismId?: number;

  @OneToOne(() => PlanetaryBody, (planetaryBody) => planetaryBody.surfaceDetails)
  public planet?: PlanetaryBody;

  @ManyToOne(() => Volcanism, (volcanism) => volcanism.surfaces)
  @JoinColumn({ name: "volcanism_id" })
  public volcanism?: Volcanism;

  @ManyToOne(() => TerraformState, (terraformState) => terraformState.terraformSurfaces)
  @JoinColumn({
    name: "terraform_state_id",
    referencedColumnName: "id"
  })
  public terraformState?: TerraformState;

  public static convertScan(data: PlanetScanData): SurfaceDetailsParams {
    return {
      bodyId: data.BodyID,
      systemAddress: data.SystemAddress,
      massEM: data.MassEM,
      tidalLock: data.TidalLock,
      surfaceGravity: data.SurfaceGravity,
      surfacePressure: data.SurfacePressure,
      surfaceTemperature: data.SurfaceTemperature,
      terraformState: data.TerraformState,
      volcanism: data.Volcanism
    };
  }

  constructor(
    bodyID: number,
    systemAddress: number,
    massEM: number,
    tidalLock: boolean | "",
    landable: boolean,
    surfaceGravity: number,
    surfacePressure: number,
    surfaceTemperature: number
  ) {
    this.bodyId = bodyID;
    this.systemAddress = systemAddress;
    this.massEM = massEM;
    this.tidalLock = tidalLock !== "" ? tidalLock : false;
    this.landable = landable;
    this.surfaceGravity = surfaceGravity;
    this.surfacePressure = surfacePressure;
    this.surfaceTemperature = surfaceTemperature;
  }
}
