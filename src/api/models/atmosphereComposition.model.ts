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
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetAtmosphere from "./planetAtmosphere.model";
import AtmosphereType from "./atmosphereType.model";

@Entity("atmosphere_compositions")
export default class AtmosphereComposition extends BaseEntity {
  // @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  // public id?: number;

  @PrimaryColumn({ name: "body_id", type: "tinyint", unsigned: true })
  public bodyId?: number;
  @PrimaryColumn({ name: "system_address", type: "bigint", unsigned: true })
  public systemAddress?: number;

  @PrimaryColumn({ name: "atmosphere_type_id" })
  public atmosphereTypeId?: number;
  @Column({ type: "float" })
  public percent?: number;

  // @Column({ name: "planet_atmosphere_id", type: "bigint", unsigned: true })
  // public planetAtmosphereId?: number;

  @ManyToOne(
    () => AtmosphereType,
    (atmosphereType) => atmosphereType.atmosphereCompositions
  )
  @JoinColumn({ name: "atmosphere_type_id" })
  public atmosphereType?: AtmosphereType;

  @Column({ name: "planet_atmosphere_id", type: "bigint", unsigned: true })
  public planetAtmosphereId?: number;
  @ManyToOne(
    () => PlanetAtmosphere,
    (planetAtmosphere) => planetAtmosphere.atmosphereComposition
  )
  @JoinColumn({
    name: "planet_atmosphere_id",
    referencedColumnName: "id"
  })
  public planetAtmosphere?: PlanetAtmosphere;
}
