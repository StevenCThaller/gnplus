import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique
} from "typeorm";
import PlanetAtmosphere from "./planetAtmosphere.model";
import SurfaceMaterial from "./surfaceMaterial.model";
import PlanetClass from "./planetClass.model";
import PlanetarySurfaceDetails from "./planetarySurfaceDetails.model";
import PlanetComposition from "./planetComposition.model";
import RingedBody from "./ringedBody.model";

@Entity("planetary_bodies")
@Index(["bodyId", "systemAddress"], { unique: true })
export default class PlanetaryBody extends BaseEntity {
  // @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  // public id?: number;

  @PrimaryColumn({
    name: "body_id",
    type: "tinyint",
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

  @Column({ name: "body_name", unique: true, nullable: false })
  public bodyName?: string;

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
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
  })
  public surfaceDetails?: PlanetarySurfaceDetails;

  @Column({ name: "planet_composition_id", nullable: true })
  public planetCompositionId?: number;
  @OneToOne(() => PlanetComposition, { nullable: true, cascade: ["insert"] })
  @JoinColumn({
    name: "planet_composition_id"
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
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
  })
  public planetAtmosphere?: PlanetAtmosphere;

  @OneToOne(() => RingedBody, (ringedBody) => ringedBody.planet)
  // @JoinColumn({
  //   name: "body_id",
  //   referencedColumnName: "bodyId"
  // })
  // @JoinColumn({
  //   name: "system_address",
  //   referencedColumnName: "systemAddress"
  // })
  public ringedBody?: RingedBody;

  @OneToMany(() => SurfaceMaterial, (surfaceMaterial) => surfaceMaterial.planet)
  public surfaceMaterials?: SurfaceMaterial[];
}
