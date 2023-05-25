import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetAtmosphere from "./planetAtmosphere.model";
import AtmosphereComposition from "./atmosphereComposition.model";

@Entity("atmosphere_types")
export default class AtmosphereType extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "atmosphere_type", unique: true, nullable: false })
  public atmosphereType?: string;

  @OneToMany(
    () => PlanetAtmosphere,
    (planetAtmosphere) => planetAtmosphere.atmosphereType
  )
  public planetAtmospheres?: PlanetAtmosphere[];

  @OneToMany(
    () => AtmosphereComposition,
    (atmosphereComposition) => atmosphereComposition.atmosphereType
  )
  public atmosphereCompositions?: AtmosphereComposition[];
}
