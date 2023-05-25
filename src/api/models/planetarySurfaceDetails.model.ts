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
import TerraformState from "./terraformState.model";
import Volcanism from "./volcanism.model";
import PlanetaryBody from "./planetaryBody.model";

@Entity("planetary_surface_details")
@Index("surface_details_id", ["bodyId", "systemAddress"], { unique: true })
export default class PlanetarySurfaceDetails extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "mass_em", type: "float" })
  public massEM?: number;
  @Column({ name: "tidal_lock", nullable: true })
  public tidalLock?: boolean;
  @Column()
  public landable?: boolean;
  @Column({ name: "surface_gravity", type: "float" })
  public surfaceGravity?: number;
  @Column({ name: "surface_pressure", type: "float" })
  public surfacePressure?: number;
  @Column({ name: "surface_temperature", type: "float" })
  public surfaceTemperature?: number;
  @Column({ name: "terraform_state_id" })
  public terraformStateId?: number;
  @Column({ name: "volcanism_id" })
  public volcanismId?: number;

  @OneToOne(
    () => PlanetaryBody,
    (planetaryBody) => planetaryBody.surfaceDetails
  )
  @JoinColumn({ name: "body_id", referencedColumnName: "bodyId" })
  @JoinColumn({ name: "system_address", referencedColumnName: "systemAddress" })
  public planet?: PlanetaryBody;

  @ManyToOne(() => Volcanism, (volcanism) => volcanism.surfaces)
  @JoinColumn({ name: "volcanism_id" })
  public volcanism?: Volcanism;

  @ManyToOne(
    () => TerraformState,
    (terraformState) => terraformState.terraformSurfaces
  )
  @JoinColumn({
    name: "terraform_state_id",
    referencedColumnName: "id"
  })
  public terraformState?: TerraformState;
}
