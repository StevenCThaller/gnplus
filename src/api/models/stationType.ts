import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  Column,
  BaseEntity
} from "typeorm";
import Station from "./station";

@Entity("station_types")
export default class StationType extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ name: "station_type", unique: true, nullable: false })
  public stationType!: string;

  @OneToMany((type) => Station, (station) => station.stationType)
  public stationsWithThisType!: Station[];
}
