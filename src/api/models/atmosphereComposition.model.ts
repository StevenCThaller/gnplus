import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import PlanetAtmosphere from "./planetAtmosphere.model";

@Entity("atmosphere_compositions")
// @Index(
//   "atmosphere_composition_id",
//   ["bodyId", "systemAddress", "atmosphereTypeId"],
//   { unique: true }
// )
export default class AtmosphereComposition extends BaseEntity {
  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @Column({ name: "atmosphere_type_id" })
  public atmosphereTypeId?: number;
  @Column({ type: "float" })
  public percent?: number;

  @ManyToOne(
    () => PlanetAtmosphere,
    (planetAtmosphere) => planetAtmosphere.atmosphereComposition
  )
  @JoinColumn({
    name: "body_id",
    referencedColumnName: "bodyId"
    // foreignKeyConstraintName: "planet_atmosphere_composition_fk"
  })
  @JoinColumn({
    name: "system_address",
    referencedColumnName: "systemAddress"
    // foreignKeyConstraintName: "planet_atmosphere_composition_fk"
  })
  public planetAtmosphere?: PlanetAtmosphere;
}
