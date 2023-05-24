import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetaryBody from "./planetaryBody.model";
import PlanetarySurfaceDetails from "./planetarySurfaceDetails.model";

@Entity("terraform_states")
export default class TerraformState extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ name: "class_name", unique: true, nullable: false })
  public className?: string;

  @OneToMany(
    () => PlanetarySurfaceDetails,
    (planetarySurfaceDetails) => planetarySurfaceDetails.terraformState
  )
  public terraformSurfaces?: PlanetarySurfaceDetails[];
}
