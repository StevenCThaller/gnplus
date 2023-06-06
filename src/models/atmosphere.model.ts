import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetAtmosphere from "./planetAtmosphere.model";

@Entity("atmospheres")
export default class Atmosphere extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true, nullable: false })
  public atmosphere?: string;

  @OneToMany(
    () => PlanetAtmosphere,
    (planetAtmosphere) => planetAtmosphere.atmosphere
  )
  public planetAtmospheres?: PlanetAtmosphere[];
}
