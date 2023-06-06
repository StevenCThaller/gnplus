import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import PlanetarySurfaceDetails from "./planetarySurfaceDetails.model";

@Entity("volcanisms")
export default class Volcanism extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true, nullable: false })
  public volcanism?: string;

  @OneToMany(
    () => PlanetarySurfaceDetails,
    (planetarySurfaceDetails) => planetarySurfaceDetails.volcanism
  )
  public surfaces?: PlanetarySurfaceDetails;
}
