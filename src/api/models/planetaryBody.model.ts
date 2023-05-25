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

@Entity("planetary_bodies")
// @Index("planetary_body_id", ["bodyId", "systemAddress"], { unique: true })
export default class PlanetaryBody extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "body_name", unique: true, nullable: false })
  public bodyName?: string;

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
    referencedColumnName: "bodyId"
    // foreignKeyConstraintName: "surface_details_id"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "surface_details_id"
  })
  public surfaceDetails?: PlanetarySurfaceDetails;

  @Column({ name: "planet_composition_id", nullable: true })
  public planetCompositionId?: number;
  @OneToOne(() => PlanetComposition, { nullable: true, cascade: ["insert"] })
  @JoinColumn({
    name: "planet_composition_id"
    // foreignKeyConstraintName: "planet_composition_id"
  })
  public planetComposition?: PlanetComposition;

  @OneToOne(
    () => PlanetAtmosphere,
    (planetAtmosphere) => planetAtmosphere.planet,
    { cascade: ["insert"], createForeignKeyConstraints: false }
  )
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
    // foreignKeyConstraintName: "planet_atmosphere_id"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "planet_atmosphere_id"
  })
  public planetAtmosphere?: PlanetAtmosphere;

  @OneToOne(() => RingedBody, (ringedBody) => ringedBody.planet)
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
    // foreignKeyConstraintName: "ringed_body_id"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "ringed_body_id"
  })
  public ringedBody?: RingedBody;

  @OneToMany(() => SurfaceMaterial, (surfaceMaterial) => surfaceMaterial.planet)
  public surfaceMaterials?: SurfaceMaterial[];
}
