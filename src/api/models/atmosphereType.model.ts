import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetAtmosphere from "./planetAtmosphere.model";

@Entity("gases")
export default class AtmosphereType extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "gas_name", unique: true, nullable: false })
  public gasName?: string;

  @OneToMany(
    () => PlanetAtmosphere,
    (planetAtmosphere) => planetAtmosphere.atmosphereType
  )
  public planetAtmospheres?: PlanetAtmosphere[];
}
