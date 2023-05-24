import {
  BaseEntity,
  Column,
  Entity,
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

@Entity("planetary_bodies")
export default class PlanetaryBody extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "tidal_lock" })
  public tidalLock?: boolean;

  @Column({ name: "planet_class_id" })
  public planetClassId?: number;
  @ManyToOne(() => PlanetClass, (planetClass) => planetClass.planets)
  public planetClass?: PlanetClass;

  @OneToOne(
    () => PlanetarySurfaceDetails,
    (planetarySurfaceDetails) => planetarySurfaceDetails.planet,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId",
    foreignKeyConstraintName: "planet_surface_details_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress",
    foreignKeyConstraintName: "planet_surface_details_fk"
  })
  public surfaceDetails?: PlanetarySurfaceDetails;

  @Column({ name: "planet_composition_id", nullable: true })
  public planetCompositionId?: number;
  @OneToOne(() => PlanetComposition, { nullable: true, cascade: ["insert"] })
  @JoinColumn({
    name: "planet_composition_id",
    foreignKeyConstraintName: "planet_composition_fk"
  })
  public planetComposition?: PlanetComposition;

  @OneToOne(
    () => PlanetAtmosphere,
    (planetAtmosphere) => planetAtmosphere.planet,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId",
    foreignKeyConstraintName: "planet_planet_atmosphere_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress",
    foreignKeyConstraintName: "planet_planet_atmosphere_fk"
  })
  public planetAtmosphere?: PlanetAtmosphere;

  @OneToOne(() => RingedBody, (ringedBody) => ringedBody.planet)
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId",
    foreignKeyConstraintName: "planet_ringed_body_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress",
    foreignKeyConstraintName: "planet_ringed_body_fk"
  })
  public ringedBody?: RingedBody;

  @OneToMany(() => SurfaceMaterial, (surfaceMaterial) => surfaceMaterial.planet)
  public surfaceMaterials?: SurfaceMaterial[];
}
